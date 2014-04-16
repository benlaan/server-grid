/// <reference path="../typings/underscore/underscore.d.ts" />

interface IFilterInfo {

    name: string;
    newInstance: () => Filter;
    isDefault: boolean;
}

class Filter {

    private static _definedFilters: IFilterInfo[];
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

    private static findFilter(predicate: (IFilterInfo) => boolean): IFilterInfo {

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

class DefaultFilter extends Filter {

    private _selectedOperation: KnockoutObservable<Operation>;
    private _data: Operation[];

    // fake static constructor
    static init() {

        Filter.registerFilter("default-filter", () => new DefaultFilter());
    }
    static ctor = DefaultFilter.init();

    constructor() {

        this._data = [

            { name: 'equal',      title: 'Equals',      expression: '{0} = "{1}"'           },
            { name: 'notEqual',   title: 'Not Equals',  expression: '{0} != "{1}"'          },
            { name: 'contains',   title: 'Contains',    expression: '{0}.Contains("{1}")'   },
            { name: 'startsWith', title: 'Starts With', expression: '{0}.StartsWith("{1}")' },
            { name: 'endsWith',   title: 'Ends With',   expression: '{0}.EndsWith("{1}")'   }
        ];

        this._selectedOperation = ko.observable(this._data[0]);
        this._selectedOperation.subscribe(v => this.recalculateFilter());

        super();
    }

    public getExpression(): string {

        if (!this.column || this.column.filteredValue().length == 0)
            return "";

        return this._selectedOperation().expression.format([
            this.column.name,
            this.column.filteredValue(),
        ]);
    }

    public getData(): any {

        return {
            filter: this,
            items: this._data
        }
    }

    public getState(): any {

        return this._selectedOperation();
    }
}

class NumericFilter extends Filter {

    private _selectedOperation: KnockoutObservable<Operation>;
    private _data: Operation[];

    // fake static constructor
    static init() {

        Filter.registerFilter("numeric-filter", () => new NumericFilter());
    }
    static ctor = NumericFilter.init();

    constructor() {

        this._data = [
            { name: 'equal',          title: 'Equals',       expression: '{0} = {1}'  },
            { name: 'notEqual',       title: 'Not Equals',   expression: '{0} != {1}' },
            { name: 'less',           title: 'Less Than',    expression: '{0} < {1}'  },
            { name: 'greater',        title: 'Greater Than', expression: '{0} > {1}'  },
            { name: 'LessOrEqual',    title: 'Contains',     expression: '{0} <= {1}' },
            { name: 'greaterOrEqual', title: 'Starts With',  expression: '{0} >= {1}' },
        ];

        this._selectedOperation = ko.observable(this._data[0]);
        this._selectedOperation.subscribe(v => this.recalculateFilter());

        super();
    }

    public getExpression(): string {

        if (!this.column || this.column.filteredValue().length == 0)
            return "";

        return this._selectedOperation().expression.format([
            this.column.name,
            this.column.filteredValue(),
        ]);
    }

    public getData(): any {

        return this._data;
    }

    public getState(): any {

        return this._selectedOperation();
    }
}

class DateRangeFilter extends Filter {

    private _startDate: KnockoutObservable<Date>;
    private _endDate: KnockoutObservable<Date>;

    // fake static constructor
    static init() {

        Filter.registerFilter("date-range-filter", () => new DateRangeFilter());
    }
    static ctor = DateRangeFilter.init();

    constructor() {

        this._startDate = ko.observable(new Date());
        this._endDate = ko.observable(new Date());

        super();
    }

    public getExpression(): string {

        if (!this.column)
            return "";

        return "{0} > '{1}' and {0} < '{2}'".format([
            this.column.name,
            this._startDate().toISOString(),
            this._endDate().toISOString()
        ]);
    }

    public getData(): any {

        return {

            startDate: this._startDate,
            endDate: this._endDate
        };
    }

    public getState(): any {

        return this.getData();
    }
}