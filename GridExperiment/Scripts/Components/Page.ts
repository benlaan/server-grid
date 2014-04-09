/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../string.ts" />

class Page
{
    private totalRows: KnockoutObservable<number>;
    private totalCount: KnockoutObservable<number>;
    private current: KnockoutComputed<string>;

    public index : KnockoutObservable<number>;
    public size: KnockoutObservable<number>;

    constructor(size: number, totalCount: number, grid: Grid)
    {
        var self = this;

        this.index = ko.observable(1);
        this.index.subscribe(v => grid.render());

        this.size = ko.observable(size);
        this.totalCount = ko.observable(0);
        this.totalRows = ko.observable(0);

        this.current = ko.computed(() =>
            "{0} of {1} (Total: {2})"
                .format([self.index(), self.totalCount(), self.totalRows()]));
    }

    first = (sender: any, event: Event) =>
    {
        this.index(1);
    }

    previous = (sender: any, event: Event) => 
    {
        var ix = this.index();
        if (ix > 0)
            this.index(ix - 1);
    }

    next = (sender: any, event: Event) => 
    {
        var ix = this.index();
        if (ix < this.totalCount())
            this.index(ix + 1);
    }

    last = (sender: any, event: Event) => 
    {
        this.index(this.totalCount());
    }

    setDataCount(count: number) 
    {
        this.totalRows(count);
        this.totalCount(Math.ceil(count / this.size()));
    }
}