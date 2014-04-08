/// <reference path="page.ts" />
/// <reference path="column.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

interface Operation
{
    name: string;
    title: string;
    expression: string;
}

class Grid
{
    _name;
    _selector: JQuery;
    _config;
    _columns: Column[];
    _rows: KnockoutObservableArray<any>;
    filterExpression;
    _operations: Operation[];
    _page: Page;

    constructor(name: string) {

        this._name = name.replace("#", "");
        this._selector = null;
        this._config = null;
        this._columns = [];
        this._rows = ko.observableArray();

        this.filterExpression = ko.observable("");

        this._operations =
        [
            { name: 'equal', title: 'Equals', expression: '{0} = "{1}"' },
            { name: 'notEqual', title: 'Not Equals', expression: '{0} != "{1}"' },
            { name: 'contains', title: 'Contains', expression: 'contains({0}, "{1}")' },
            { name: 'startsWith', title: 'Starts With', expression: 'startsWith({0}, "{1}")' },
            { name: 'endsWith', title: 'Ends With', expression: 'endsWith({0}, "{1}")' }
        ];

        this._page = new Page(10, 0, this);

        this.init(name);
    }

    columnFilterChanged = (value: string) =>
    {
        var parts = [];

        $.each(this._columns, function (index, column) {

            var filter = column.filterExpression();
            if (filter)
                parts.push(filter);
        });

        this.filterExpression(parts.join(" AND "));
    }

    getGridState()
    {
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

    evaluate(attribute)
    {
        return eval("(" + attribute + ")")
    }

    getDefaultColumn($td)
    {
        return {
            sort: '',
            sortIndex: -1,
            name: $td.text().replace(" ", "")
        };
    }

    buildGridFilterEditors() 
    {
        var filterHtml = "<tr>";
        var self: Grid = this;

        $.each(this._columns, function (index, column) {

            var indexedColumn = "_columns[" + index + "]";
            var width = column.width() | 100;

            var $dropdownEditor = $("<select multiple='multiple' style='position: absolute; top: inherit; width: 100%;display: none' />");
            
            var editor = [

                '<div class="input-group">',
                '  <input type="text" class="form-control" style="min-width:' + width + 'px" data-bind="value: ' + indexedColumn + '.filter, valueUpdate: \'afterkeydown\'" />',
                '  <div class="input-group-btn input-small">',
                '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-bind="attr: { title: filterExpression }">',
                '        <span class="glyphicon glyphicon-search" /><span class="caret" />',
                '    </button>',
                '    <ul class="dropdown-menu" role="menu">'
            ];

            $.each(self._operations, function (index, operation) {

                editor.push('<li><a data-bind="click: ' + indexedColumn + '.' + operation.name + '">' + operation.title + '</a></li>');
            });

            filterHtml += "<th>" + editor.join("\n") + "</ul></div></div><div>" + $dropdownEditor[0].outerHTML + "</div></th>";
        });

        filterHtml += "</tr>";

        $(filterHtml).insertAfter(this._selector.find("thead tr"));
    }

    buildGridTemplate(name)
    {
        var templateName = this._name + "-columns";

        var templateHtml = "<script type='text/template' id='" + templateName + "'><tbody style='min-height: 200px' data-bind='foreach: $data'><tr>";

        $.each(this._columns, function (index, column)
        {
            if (column.url)
                templateHtml += "<td data-bind='html: $root._columns[" + index + "].formatUrl($data, " + column.name + ")'/>";
            else
                templateHtml += "<td data-bind='text: " + column.name + "'/>"
        });

        templateHtml += "</tr></tbody></script>";

        $(templateHtml).insertAfter(this._selector.find("thead"));

        var koTemplate = $("<!-- ko template: { name: '" + templateName + "', data: _rows }  --> <!-- /ko -->")
        this._selector.find("table").append(koTemplate);
    }

    init(name)
    {
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

        this.buildGridFilterEditors();
        this.buildGridTemplate(name);
        ko.applyBindings(this, this._selector.parent()[0]);
        this.render();
    }

    render() 
    {
        var self = this;
        var gridState = this.getGridState();

        $.get(this._config.uri + "/GetRowCount", gridState, function (response) {

            self._page.setDataCount(response);

            $.getJSON(self._config.uri + "/GetData", gridState, function (response) {

                self._selector.find("tbody.loading").remove();
                self._rows.removeAll();

                $.each(response, function (index, row) {

                    self._rows.push(row);
                });
            });
        });
    }
};