/// <reference path="underscore.min.js" />

function Column(column, grid) {

    var self = this;

    this.grid = grid;
    this.name = column.name;
    this.url = column.url;

    this.sort = ko.observable(column.sort);
    this.sortIndex = ko.observable(column.sortIndex);
    this.filter = ko.observable();
    this.filterOperator = ko.observable(grid._operations[0].expression);
    this.width = ko.observable(column.width);

    this.formatUrl = function (data, value) {

        var $url = $("<a/>")
            .attr("href", self.url.template(data))
            .text(value);

        return $url[0].outerHTML;
    };

    // map operations to a method on the column - this is ko'ed to the click event
    $.each(grid._operations, function (index, operation) {

        self[operation.name] = function () {

            self.filterOperator(operation.expression);
        };
    })

    this.filterExpression = ko.computed(function () {

        if (!self.filter())
            return "";

        var result = self.filterOperator().format([self.name, self.filter()]);
        grid.filterExpression.notifySubscribers();

        return result;
    },
    this);
};
