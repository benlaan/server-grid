﻿/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="filters/filter.ts" />

enum SortMode {
    None,
    Asc,
    Desc
}

interface ColumnDefinition {

    url: string;
    name: string;
    sort: string;
    sortIndex: number;
    index: number;
    width: number;
    filterTemplate: string;
}

class Column {

    private _grid: Grid;
    private _filter: Filter;

    public sort: KnockoutObservable<SortMode>;
    public sortIndex: KnockoutObservable<number>;
    public sortClass: KnockoutComputed<string>;

    public width: KnockoutObservable<number>;

    public filteredValue: KnockoutObservable<string>;
    public filterExpression: KnockoutObservable<string>;

    public url: string;
    public name: string;
    public index: number;
    public filterTemplate: string;

    constructor(column: ColumnDefinition, grid: Grid) {

        this._grid = grid;
        this.name = column.name;
        this.url = column.url;
        this.filterTemplate = column.filterTemplate;

        var self = this;

        this.sort = ko.observable(column.sort != undefined ? SortMode[column.sort] : SortMode.None);
        this.sort.subscribe(v => grid.render());

        this.sortIndex = ko.observable(column.sortIndex || -1);
        this.sortIndex.subscribe(v => grid.render());

        this.filteredValue = ko.observable("");
        this.width = ko.observable(column.width || 120);

        this.sortClass = ko.computed(() => self.sort() != SortMode.None ? SortMode[self.sort()] : "");

        this.filterExpression = ko.observable<string>();

        this._filter = Filter.getByName(this.filterTemplate, this);

        this._filter.expression.subscribe(v => this.filterExpression(v));

        this.filteredValue.subscribe(() => {

            this._filter.recalculateFilter();
            this.filterExpression(this._filter.expression());
        });
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

        return "<a href='{0}'>{1}</a>".format([this.url.template(data), value]);
    }

    public getTemplate(): string {

        var templateName = "grid-{0}".format([this.filterTemplate]);
        if ($("#" + templateName).length > 0)
            return templateName;

        console.log("failed to find template: " + this.filterTemplate);
        return "grid-default-filter";
    }

    public getData(): any {

        return this._filter.getData();
    }

    public getFilterState(): string {

        return this._filter.getState();
    }
}