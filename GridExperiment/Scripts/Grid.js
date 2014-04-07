/// <reference path="underscore.min.js" />

function Grid(name) {

    function Page(size, totalCount, grid) {

        var self = this;
        this.index = ko.observable(1);

        this.index.subscribe(function (newValue) {
            
            grid.render();
        });

        this.size = ko.observable(size);
        this.totalCount = ko.observable(Math.ceil(totalCount / size) || 100);

        this.first = function () {

            self.index(1);
        };

        this.previous = function () {

            var ix = self.index();
            if (ix > 0)
                self.index(ix - 1);
        };

        this.next = function () {

            var ix = self.index();
            if (ix < self.totalCount())
                self.index(ix + 1);
        };

        this.last = function () {

            self.index(self.totalCount());
        };

        this.current = ko.computed(function () {

            return self.index() + " of " + self.totalCount();
        }, this);
    };

    function Column(column) {

        var self = this;
        this.name = column.name;
        this.sort = column.sort;
        this.sortIndex = column.sortIndex;
        this.url = column.url;

        this.formatUrl = function (data, value) {

            var $url = $("<a/>")
                .attr("href", self.url.template(data))
                .text(value);

            return $url[0].outerHTML;
        };
    };

    var self = this;
    this._name = name.replace("#", "");
    this._selector = null;
    this._config = null;
    this._columns = [];
    this._rows = ko.observableArray();

    this._page = new Page(3, 5, self);

    // Private

    getGridState = function () {

        columns = $.map(self._columns, function (column) {

            return {
                name: column.name,
                sort: column.sort,
                sortIndex: column.sortIndex
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
    }

    buildGridTemplate = function (name) {

        var templateName = self._name + "-columns";

        var templateHtml = "<script type='text/template' id='" + templateName + "'><tbody data-bind='foreach: $data'><tr>";

        $.each(self._columns, function (index, column) {

            if (column.url) {

                templateHtml += "<td data-bind='html: $root._columns[" + index + "].formatUrl($data, " + column.name + ")'/>"
            }
            else
                templateHtml += "<td data-bind='text: " + column.name + "'/>"
        });

        templateHtml += "</tr></tbody></script>";

        $(templateHtml).insertAfter(_selector.find("thead"));

        var koTemplate = $("<!-- ko template: { name: '" + templateName + "', data: _rows }  --> <!-- /ko -->")
        _selector.append(koTemplate);
    };

    init = function (name) {

        _selector = $(name);
        _config = evaluate(_selector.attr("data-config"));

        _selector.find("thead th").each(function () {

            var columnData = $(this).attr("data-column");
            var column = new Column(evaluate(columnData) || getDefaultColumn($(this)));
            column.index = self._columns.length;
            self._columns.push(column);
        });

        buildGridTemplate(name);
        ko.applyBindings(self, _selector.parent()[0]);
        self.render();
    }

    // Public

    this.render = function () {

        var gridState = getGridState();

        $.getJSON(_config.uri, gridState, function (response) {

            $(_selector).find("tbody.loading").remove();
            self._rows.removeAll();

            $.each(response, function (index, row) {

                self._rows.push(row);
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