/// <reference path="underscore.min.js" />

function Grid(name) {

    var self = this;

    this._name = name.replace("#", "");
    this._selector = null;
    this._config = null;
    this._columns = [];
    this._rows = ko.observableArray();

    this.filterExpression = ko.observable("");

    this._operations = [

        { name: 'equal',      title: 'Equals',      expression: '{0} = "{1}"' },
        { name: 'notEqual',   title: 'Not Equals',  expression: '{0} != "{1}"' },
        { name: 'contains',   title: 'Contains',    expression: 'contains({0}, "{1}")' },
        { name: 'startsWith', title: 'Starts With', expression: 'startsWith({0}, "{1}")' },
        { name: 'endsWith',   title: 'Ends With',   expression: 'endsWith({0}, "{1}")' }
    ];

    this.columnFilterChanged = function (value) {

        var parts = [];

        $.each(self._columns, function (index, column) {

            var filter = column.filterExpression();
            if (filter)
                parts.push(filter);
        });

        self.filterExpression(parts.join(" AND "));
    }

    this._page = new Page(10, 0, self);

    // Private

    getGridState = function () {

        columns = $.map(self._columns, function (column) {

            return {
                name: column.name,
                sort: column.sort(),
                sortIndex: column.sortIndex(),
                filterOperator: column.filterOperator(),
                width: column.width()
            }
        });

        return {

            page: { index: self._page.index(), size: self._page.size() },
            columns: columns
        };
    }

    evaluate = function (attribute) {

        return eval("(" + attribute + ")")
    }

    getDefaultColumn = function ($td) {

        return {
            sort: '',
            sortIndex: -1,
            name: $td.text().replace(" ", "")
        };
    };

    buildGridFilterEditors = function () {

        var filterHtml = "<tr>";

        $.each(self._columns, function (index, column) {

            var indexedColumn = "_columns[" + index + "]";
            var width = column.width | 100;

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

            filterHtml += "<th>" + editor.join("\n") + "</ul></div></div></th>";
        });

        filterHtml += "</tr>";

        $(filterHtml).insertAfter(_selector.find("thead tr"));
    };

    buildGridTemplate = function (name) {

        var templateName = self._name + "-columns";

        var templateHtml = "<script type='text/template' id='" + templateName + "'><tbody style='min-height: 200px' data-bind='foreach: $data'><tr>";

        $.each(self._columns, function (index, column) {

            if (column.url)
                templateHtml += "<td data-bind='html: $root._columns[" + index + "].formatUrl($data, " + column.name + ")'/>";
            else
                templateHtml += "<td data-bind='text: " + column.name + "'/>"
        });

        templateHtml += "</tr></tbody></script>";

        $(templateHtml).insertAfter(_selector.find("thead"));

        var koTemplate = $("<!-- ko template: { name: '" + templateName + "', data: _rows }  --> <!-- /ko -->")
        _selector.find("table").append(koTemplate);
    };

    init = function (name) {

        _selector = $(name);
        self._config = evaluate(_selector.attr("data-config"));

        _selector.find("thead th").each(function () {

            var columnData = $(this).attr("data-column");

            var column = new Column(evaluate(columnData) || getDefaultColumn($(this)), self);
            column.index = self._columns.length;
            column.filterExpression.subscribe(self.columnFilterChanged);

            self._columns.push(column);
        });

        buildGridFilterEditors();
        buildGridTemplate(name);
        ko.applyBindings(self, _selector.parent()[0]);
        self.render();
    }

    // Public

    this.render = function () {

        var gridState = getGridState();

        $.get(self._config.uri + "/GetRowCount", gridState, function (response) {

            self._page.setDataCount(response);

            $.getJSON(self._config.uri + "/GetData", gridState, function (response) {

                $(_selector).find("tbody.loading").remove();
                self._rows.removeAll();

                $.each(response, function (index, row) {

                    self._rows.push(row);
                });
            });
        });
    };

    if (name)
        init(name);

    return {

        columns: self._columns,
        data: self._rows,

        render: self.render
    };
};