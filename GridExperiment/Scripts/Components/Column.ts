/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />

class Column {

    private grid: Grid;
    private filter: KnockoutObservable<string>;

    public sort: KnockoutObservable<string>;
    public sortIndex: KnockoutObservable<number>;
    public filterOperator: KnockoutObservable<string>;
    public width: KnockoutObservable<number>;
    public filterExpression: KnockoutObservable<string>;

    public url: string;
    public name: string;
    public index: number;

    constructor(column: any, grid: Grid) {

        this.grid = grid;
        this.name = column.name;
        this.url = column.url;

        this.sort = ko.observable(column.sort);
        this.sortIndex = ko.observable(column.sortIndex);
        this.filter = ko.observable("");
        this.filterOperator = ko.observable(grid._operations[0].expression);
        this.width = ko.observable(column.width);

        var self = this;

        // map operations to a method on the column - this is ko'ed to the click event
        $.each(grid._operations, function (index, operation) {

            self[operation.name] = function () {

                self.filterOperator(operation.expression);
            };
        });

        this.filterExpression = ko.computed(
            function () { return self.calculateFilter(); },
            this
        );
    }

    calculateFilter() {

        if (!this.filter())
            return "";

        var result = this.filterOperator().format([this.name, this.filter()]);
        this.grid.filterExpression.notifySubscribers();

        return result;
    }

    formatUrl(data, value) {

        var $url = $("<a/>")
            .attr("href", this.url.template(data))
            .text(value);

        return $url[0].outerHTML;
    }
}