/// <reference path="../../typings/underscore/underscore.d.ts" />

interface Operation {

    name: string;
    title: string;
    expression: string;
}

interface FilterInfo {

    name: string;
    newInstance: () => Filter;
    isDefault: boolean;
}

class Filter {

    private static _definedFilters: FilterInfo[];
    private _recalc: KnockoutObservable<any>;

    public column: Column;
    public expression: KnockoutComputed<string>;

    // fake static constructor
    static init() {

        Filter._definedFilters = [];
    }
    static ctor = Filter.init();

    constructor() {

        this._recalc = ko.observable({});

        this.expression = ko.computed(() => {

            this._recalc();
            return this.getExpression();
        });
    }

    private static findFilter(predicate: (IFilterInfo) => boolean): FilterInfo {

        return _(Filter._definedFilters).find(predicate);
    }

    public static registerFilter(name: string, filter: () => Filter) {

        Filter._definedFilters.push({ name: name, newInstance: filter, isDefault: Filter._definedFilters.length == 0 });
    }

    public static getByName(name: string, column: Column): Filter {

        var filter = this.findFilter(f => f.name == name) || this.findFilter(f => f.isDefault);

        var clonedFilter = filter.newInstance();
        clonedFilter.column = column;

        return clonedFilter;
    }

    public recalculateFilter(): void {

        this._recalc.notifySubscribers();
    }

    public getExpression(): string {

        throw "abstract: must be overriden in the descendant";
    }

    public getData(): any {

        throw "abstract: must be overriden in the descendant";
    }

    public getState(): any {

        throw "abstract: must be overriden in the descendant";
    }
}
