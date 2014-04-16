/// <reference path="page.ts" />
/// <reference path="column.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

interface Operation {

    name: string;
    title: string;
    expression: string;
}

interface TemplateInfo {
    element: string;
    selector: (JQuery) => JQuery;
    name: string;
}

class Grid {

    private _name: string;
    private _refreshTimer;
    private _rowCount: number;
    private _lastFilter: string;
    private _selector: JQuery;
    private _config;
    private _rows: KnockoutObservableArray<any>;
    private _page: Page;

    public columns: Column[];
    public filterExpression: KnockoutObservable<string>;

    // fake static constructor
    static init() {

        Grid.attachHtmlTemplate("Grid");
    }

    static ctor = Grid.init();

    constructor(name: string) {

        this._lastFilter = "";
        this._rowCount = -1;
        this._name = name.replace("#", "");
        this._selector = $(name);
        this._config = this.evaluate(this._selector.attr("data-config"));
        this._rows = ko.observableArray();

        this.filterExpression = ko.observable("");
        this.filterExpression.subscribe(v => this.delayRefresh());

        this._page = new Page(10, 0, this);

        this.applyGridClasses();
        this.defineColumns();
        this.buildColumnHeaderBindings();
        this.attachKnockoutBindings();

        ko.applyBindings(this, this._selector.parent()[0]);
        this.render();
    }

    private applyGridClasses() {

        var id = "#{0} ".format([this._name]);

        $(id).addClass("grid-wrapper");
        $(id + ".grid").addClass("table-responsive");
        $(id + ".grid table").addClass("table table-striped table-hover table-bordered table-condensed");
    }

    private attachKnockoutBindings() {

        var id = "#{0} ".format([this._name]);

        var templates: TemplateInfo[] = [

            { element: "colgroup", name: "grid-column-group",  selector: (s: JQuery) => s.prependTo(id + "table")   },
            { element: "tr",       name: "grid-column-editor", selector: (s: JQuery) => s.appendTo(id + "thead")    },
            { element: "tbody",    name: "grid-rows",          selector: (s: JQuery) => s.appendTo(id + "table")    },
            { element: "div",      name: "grid-pager",         selector: (s: JQuery) => s.appendTo(id + "div.grid") }
        ];

        _.each(templates, t => this.attachKnockoutBinding(t));
    }

    private attachKnockoutBinding(template: TemplateInfo) {

        var templateBinding = 'template: { name: "{0}", data: $data }'.format([template.name]);
        var $element = $("<{0}/>".format([template.element])).attr('data-bind', templateBinding);

        template.selector($element);
    }

    private columnFilterChanged = (value: string) => {

        var parts = [];

        _.each(this.columns, column => {

            var filter = column.filterExpression();
            if (filter)
                parts.push(filter);
        });

        this.filterExpression(parts.join(" AND "));
    }

    private getGridState() {

        var columns = _.map(this.columns, column => {

            return {

                name: column.name,
                sort: column.sort().toString(),
                sortIndex: column.sortIndex(),
                filter: column.filteredValue(),
                filterState: column.getFilterState(),
                width: column.width()
            }
        });

        return {

            page: { index: this._page.index(), size: this._page.size() },
            columns: columns,
            filterExpression: this.filterExpression()
        };
    }

    private evaluate(attribute) {
        
        return eval("(" + attribute + ")")
    }

    private getDefaultColumn(cell: JQuery) {

        return {
            sort: '',
            sortIndex: -1,
            name: cell.text().replace(" ", "")
        };
    }

    static attachHtmlTemplate(name: string) {

        $.ajaxSetup({ async: false });
        try {

            var temp = $("<div />");
            temp.load("/Content/Templates/{0}.html".format([name]));
            $("head").append($(temp.html()));
        }
        finally {

            $.ajaxSetup({ async: true });
        }
    }

    private defineColumns() {

        var self = this;
        this.columns = [];

        this._selector.find("thead th").each((index, headerCell) => {

            var columnData = $(headerCell).attr("data-column");

            var column = new Column(self.evaluate(columnData) || self.getDefaultColumn($(headerCell)), self);
            column.index = self.columns.length;
            column.filterExpression.subscribe(v => self.columnFilterChanged(v));

            self.columns.push(column);
        });
    }

    private applyColumnClick(event: JQueryMouseEventObject, column: Column) {

        if (!event.ctrlKey) {

            // reset all sort modes to none except the column selected
            _(this.columns)
                .without(column)
                .forEach(c => c.sort(SortMode.None));
        }
        else {

            // instead of resetting, set the sort index of the selected column to the next index
            var nextSortIndex = _
                .chain(this.columns)
                .without(column)
                .map(c => c.sortIndex())
                .max()
                .value();

            column.sortIndex(nextSortIndex + 1);
        }

        column.click();
    }

    private buildColumnHeaderBindings() {

        var self = this;
        this._selector.find("thead tr:first() th").each((index, element) => {

            $(element)
                .attr("data-bind", "attr { class: columns[{0}].sortClass, title: columns[{0}].sortClass }".format([index]))
                .mousedown(e => self.applyColumnClick(e, self.columns[index]));
        });
    }

    private bindData(gridState: any) {

        var self = this;

        $.getJSON(this._config.uri + "/GetData", gridState, response => {

            self._rows(response);
            self._lastFilter = self.filterExpression();
        });
    }

    private updateRowCount(gridState: any) {

        var self = this;

        $.get(this._config.uri + "/GetRowCount", gridState, (response: number) => {

            self._page.setRowCount(response);
            self._rowCount = response;
            self.bindData(gridState);
        });
    }

    private delayRefresh() {

        clearTimeout(this._refreshTimer);
        this._refreshTimer = setTimeout(() => this.render(), 1000);
    }

    public render() {

        var gridState = this.getGridState();

        // only need to update the row count on change of filter or on first read
        if (this._rowCount == -1 || this._lastFilter != this.filterExpression())
            this.updateRowCount(gridState);
        else
            this.bindData(gridState);
    }
};