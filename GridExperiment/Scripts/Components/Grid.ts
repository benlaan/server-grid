/// <reference path="page.ts" />
/// <reference path="column.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

interface Operation {

    name: string;
    title: string;
    expression: string;
}

class Grid {

    private _name;
    private _refreshTimer;
    private _rowCount: number;
    private _lastFilter: string;
    private _selector: JQuery;
    private _config;
    private _rows: KnockoutObservableArray<any>;
    private _page: Page;

    public _columns: Column[];
    public filterExpression: KnockoutObservable<string>;
    public _operations: Operation[];

    constructor(name: string) {

        this._lastFilter = "";
        this._rowCount = -1;
        this._name = name.replace("#", "");
        this._selector = $(name);
        this._config = this.evaluate(this._selector.attr("data-config"));
        this._rows = ko.observableArray();

        this.filterExpression = ko.observable("");
        this.filterExpression.subscribe(v => this.delayRefresh());

        this._operations = [
            { name: 'equal', title: 'Equals', expression: '{0} = "{1}"' },
            { name: 'notEqual', title: 'Not Equals', expression: '{0} != "{1}"' },
            { name: 'contains', title: 'Contains', expression: '{0}.Contains("{1}")' },
            { name: 'startsWith', title: 'Starts With', expression: '{0}.StartsWith("{1}")' },
            { name: 'endsWith', title: 'Ends With', expression: '{0}.EndsWith("{1}")' }
        ];

        this._page = new Page(10, 0, this);

        this.defineColumns();
        this.buildTableColumnGroups();
        this.buildGridFilterEditors();
        this.buildColumnHeaderBindings();
        this.buildGridTemplate(name);

        ko.applyBindings(this, this._selector.parent()[0]);
        this.render();
    }

    private columnFilterChanged = (value: string) => {

        var parts = [];

        $.each(this._columns, function (index, column) {

            var filter = column.filterExpression();
            if (filter)
                parts.push(filter);
        });

        this.filterExpression(parts.join(" AND "));
    }

    private getGridState() {

        var columns = $.map(this._columns, function (column) {

            return {

                name: column.name,
                sort: column.sort().toString(),
                sortIndex: column.sortIndex(),
                filter: column.filter(),
                filterOperator: column.filterOperator(),
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

    private buildTableColumnGroups() {

        var html = "<colgroup>";

        $.each(this._columns, function (index, column) {

            var width = column.width() || 120;
            html += "<col span='1' style='width: {0}px' />\n".format([width]);
        });

        html += "</colgroup>";

        $(html).prependTo(this._selector.find("table"));
    }

    private buildGridFilterEditors() {

        var filterHtml = "<tr>";
        var self: Grid = this;

        $.each(this._columns, function (index, column) {

            var width = column.width() || 100;

            var editor = [

                '<th>',
                '   <div class="input-group" style="width:100%">',
                '     <input type="text" class="form-control" data-bind="value: {0}.filter, valueUpdate: \'afterkeydown\'" />',
                '     <div class="input-group-btn input-small">',
                '       <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-bind="attr: { title: {0}.filterExpression }">',
                '           <span class="glyphicon glyphicon-search" /><span class="caret" />',
                '       </button>',
                '       <ul class="dropdown-menu" role="menu">{1}</ul>',
                '     </div>',
                '   </div>',
                '   <div>{2}</div>',
                '</td>'
            ];

            var indexedColumn = "_columns[{0}]".format([index]);
            var actions = [];
            $.each(self._operations, function (index, operation) {

                var operationAction = '<li><a data-bind="click: {0}.{1}">{2}</a></li>'.format([indexedColumn, operation.name, operation.title]);
                actions.push(operationAction);
            });

            var $dropdownEditor = $("<select multiple='multiple' style='position: absolute; top: inherit; width: 100%;display: none' />");
            var html = $dropdownEditor[0].outerHTML;

            filterHtml += editor.join("\n").format([indexedColumn, actions.join("\n"), html]);
        });

        filterHtml += "</tr>";

        $(filterHtml).insertAfter(this._selector.find("thead tr"));
    }

    private buildGridTemplate(name) {

        var templateName = this._name + "-columns";

        var templateHtml = "<script type='text/template' id='{0}'><tbody data-bind='foreach: $data'><tr>".format([templateName]);

        $.each(this._columns, function (index, column) {

            if (column.url)
                templateHtml += "<td data-bind='html: $root._columns[{0}].formatUrl($data, {1})'/>".format([index, column.name]);
            else
                templateHtml += "<td data-bind='text: {0}'/>".format([column.name]);
        });

        templateHtml += "</tr></tbody></script>";

        $(templateHtml).insertAfter(this._selector.find("thead"));

        var koTemplate = "<!-- ko template: { name: '{0}', data: _rows }  --> <!-- /ko -->".format([templateName]);
        this._selector.find("table").append($(koTemplate));
    }

    private defineColumns() {

        var self = this;
        this._columns = [];

        this._selector.find("thead th").each((index, headerCell) => {

            var columnData = $(headerCell).attr("data-column");

            var column = new Column(self.evaluate(columnData) || self.getDefaultColumn($(headerCell)), self);
            column.index = self._columns.length;
            column.filterExpression.subscribe(self.columnFilterChanged);

            self._columns.push(column);
        });
    }

    private applyColumnClick(event: JQueryMouseEventObject, column: Column) {

        if (!event.ctrlKey) {

            // reset all sort modes to none except the column selected
            _(this._columns)
                .without(column)
                .forEach(c => c.sort(SortMode.None));
        }
        else {

            // instead of resetting, set the sort index of the selected column to the next index
            var nextSortIndex = _
                .chain(this._columns)
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
                .attr("data-bind", "attr { class: _columns[{0}].sortClass, title: _columns[{0}].sortClass }".format([index]))
                .mousedown(e => self.applyColumnClick(e, self._columns[index]));
        });
    }

    private bindData(gridState: any) {

        var self = this;

        $.getJSON(this._config.uri + "/GetData", gridState, response => {

            self._selector.find("tbody.loading").remove();
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