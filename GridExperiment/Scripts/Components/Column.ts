/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />

enum SortMode {
    None,
    Asc,
    Desc
}

class Column {

    private grid: Grid;

    public sort: KnockoutObservable<SortMode>;
    public sortIndex: KnockoutObservable<number>;
    public sortClass: KnockoutComputed<string>;

    public width: KnockoutObservable<number>;

    public filterOperator: KnockoutObservable<string>;
    public filter: KnockoutObservable<string>;
    public filterExpression: KnockoutObservable<string>;

    public url: string;
    public name: string;
    public index: number;

    constructor(column: any, grid: Grid) {

        this.grid = grid;
        this.name = column.name;
        this.url = column.url;

        var self = this;

        this.sort = ko.observable(column.sort != undefined ? SortMode[column.sort] : SortMode.None);
        this.sort.subscribe(v => grid.render());

        this.sortIndex = ko.observable(column.sortIndex || -1);
        this.sortIndex.subscribe(v => grid.render());

        this.filter = ko.observable("");
        this.filterOperator = ko.observable(grid._operations[0].expression);
        this.width = ko.observable(column.width);

        this.sortClass = ko.computed(() => self.sort() != SortMode.None ? SortMode[self.sort()] : "");

        // map operations to a method on the column - this is ko'ed to the click event
        $.each(grid._operations, (index, operation) => 
            self[operation.name] = () => self.filterOperator(operation.expression)
        );

        this.filterExpression = ko.computed(() => self.calculateFilter());
    }
    
    calculateFilter() {

        if (!this.filter())
            return "";

        var result = this.filterOperator().format([this.name, this.filter()]);
        this.grid.filterExpression.notifySubscribers();

        return result;
    }

    click() {

        switch (this.sort())
        {
            case SortMode.None:
            case SortMode.Desc:
                this.sort(SortMode.Asc);
                break;

            case SortMode.Asc:
                this.sort(SortMode.Desc);
                break;
        }
    }

    formatUrl(data, value) {

        var $url = $("<a/>")
            .attr("href", this.url.template(data))
            .text(value);

        return $url[0].outerHTML;
    }
}