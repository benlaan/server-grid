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

    _name;
    _selector: JQuery;
    _config;
    _columns: Column[];
    _rows: KnockoutObservableArray<any>;
    filterExpression: KnockoutObservable<string>;
    _operations: Operation[];
    _page: Page;

    constructor(name: string) {

        this._name = name.replace("#", "");
        this._selector = null;
        this._config = null;
        this._columns = [];
        this._rows = ko.observableArray();

        this.filterExpression = ko.observable(" Filter: none");

        this._operations = [

            { name: 'equal', title: 'Equals', expression: '{0} = "{1}"' },
            { name: 'notEqual', title: 'Not Equals', expression: '{0} != "{1}"' },
            { name: 'contains', title: 'Contains', expression: 'contains({0}, "{1}")' },
            { name: 'startsWith', title: 'Starts With', expression: 'startsWith({0}, "{1}")' },
            { name: 'endsWith', title: 'Ends With', expression: 'endsWith({0}, "{1}")' }
        ];

        this._page = new Page(10, 0, this);

        this.init(name);
    }

    columnFilterChanged = (value: string) => {

        var parts = [];

        $.each(this._columns, function (index, column) {

            var filter = column.filterExpression();
            if (filter)
                parts.push(filter);
        });

        this.filterExpression(" Filter: " + parts.join(" AND "));
    }

    getGridState() {

        var columns = $.map(this._columns, function (column) {

            return {

                name: column.name,
                sort: column.sort(),
                sortIndex: column.sortIndex(),
                filterOperator: column.filterOperator(),
                width: column.width()
            }
        });

        return {

            page: { index: this._page.index(), size: this._page.size() },
            columns: columns
        };
    }

    evaluate(attribute) {
        
        return eval("(" + attribute + ")")
    }

    getDefaultColumn($td) {

        return {
            sort: '',
            sortIndex: -1,
            name: $td.text().replace(" ", "")
        };
    }

    buildGridColumnDefinitions() {

        var html = "<colgroup>";

        $.each(this._columns, function (index, column) {

            var width = column.width() || 120;
            html += "<col span='1' style='width: {0}px' />\n".format([width]);
        });

        html += "</colgroup>";

        $(html).prependTo(this._selector.find("table"));
    }

    buildGridFilterEditors() {

        var filterHtml = "<tr>";
        var self: Grid = this;

        $.each(this._columns, function (index, column) {

            var indexedColumn = "_columns[" + index + "]";
            var width = column.width() || 100;

            var editor = [

                '<th>',
                '   <div class="input-group" style="width:100%">',
                '     <input type="text" class="form-control" data-bind="value: {0}.filter, valueUpdate: \'afterkeydown\'" />',
                '     <div class="input-group-btn input-small">',
                '       <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-bind="attr: { title: filterExpression }">',
                '           <span class="glyphicon glyphicon-search" /><span class="caret" />',
                '       </button>',
                '       <ul class="dropdown-menu" role="menu">{1}</ul>',
                '     </div>',
                '   </div>',
                '   <div>{2}</div>',
                '</td>'
            ];

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

    buildGridTemplate(name) {

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

    init(name) {

        var self = this;
        this._selector = $(name);
        this._config = this.evaluate(this._selector.attr("data-config"));

        this._selector.find("thead th").each(function (index, headerCell) {

            var columnData = $(headerCell).attr("data-column");

            var column = new Column(self.evaluate(columnData) || self.getDefaultColumn($(headerCell)), self);
            column.index = self._columns.length;
            column.filterExpression.subscribe(self.columnFilterChanged);

            self._columns.push(column);
        });

        this.buildGridColumnDefinitions();
        this.buildGridFilterEditors();

        this.buildGridTemplate(name);
        ko.applyBindings(this, this._selector.parent()[0]);
        this.render();
    }

    render() {

        var self = this;
        var gridState = this.getGridState();

        $.get(this._config.uri + "/GetRowCount", gridState, function (response) {

            self._page.setDataCount(response);

            $.getJSON(self._config.uri + "/GetData", gridState, function (response) {

                self._selector.find("tbody.loading").remove();
                self._rows(response);
            });
        });
    }
};