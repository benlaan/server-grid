/// <reference path="../typings/underscore/underscore.d.ts" />

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

class SingleSelectFilter extends Filter {

    public _selectedOperation: KnockoutObservable<Operation>;
    public _data: Operation[];

    constructor() {

        this._data = this.registerOperations();

        this._selectedOperation = ko.observable(this._data[0]);
        this._selectedOperation.subscribe(v => this.recalculateFilter());

        super();
    }

    public registerOperations(): Operation[] {

        throw "abstract: must be overriden in the descendant";
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

    public getSelectedClass(operation: Operation): boolean {

        return operation == this._selectedOperation();
    }
}

class DefaultFilter extends SingleSelectFilter {

    // fake static constructor
    static init() {

        Filter.registerFilter("default-filter", () => new DefaultFilter());
    }
    static ctor = DefaultFilter.init();

    public registerOperations(): Operation[] {

        return [

            { name: 'equal',      title: 'Equals',      expression: '{0} = "{1}"' },
            { name: 'notEqual',   title: 'Not Equals',  expression: '{0} != "{1}"' },
            { name: 'contains',   title: 'Contains',    expression: '{0}.Contains("{1}")' },
            { name: 'startsWith', title: 'Starts With', expression: '{0}.StartsWith("{1}")' },
            { name: 'endsWith',   title: 'Ends With',   expression: '{0}.EndsWith("{1}")' }
        ];
    }
}

class NumericFilter extends SingleSelectFilter {

    // fake static constructor
    static init() {

        Filter.registerFilter("numeric-filter", () => new NumericFilter());
    }
    static ctor = NumericFilter.init();

    public registerOperations(): Operation[] {

        return [
            { name: 'equal',          title: 'Equals',           expression: '{0} = {1}'  },
            { name: 'notEqual',       title: 'Not Equals',       expression: '{0} != {1}' },
            { name: 'less',           title: 'Less Than',        expression: '{0} < {1}'  },
            { name: 'greater',        title: 'Greater Than',     expression: '{0} > {1}'  },
            { name: 'LessOrEqual',    title: 'Less Or Equal',    expression: '{0} <= {1}' },
            { name: 'greaterOrEqual', title: 'Greater or Equal', expression: '{0} >= {1}' },
        ];
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

        super();

        this._startDate = ko.observable(new Date());
        this._endDate = ko.observable(new Date());
    }

    public getExpression(): string {

        if (!this.column)
            return "";

        return "{0} > DateTime.Parse(\"{1}\") and {0} < DateTime.Parse(\"{2}\")".format([
            this.column.name,
            this._startDate().toLocaleDateString(),
            this._endDate().toLocaleDateString()
        ]);
    }

    public getData(): any {

        return {

            startDate:   this._startDate,
            endDate:     this._endDate,
            applyFilter: this.applyFilter
        }
    }

    public getState(): any {

        return {

            startDate: this._startDate,
            endDate: this._endDate,
        }
    }

    public applyFilter = (sender: any, e: Event) => {

        this.recalculateFilter();

        $(e.currentTarget).closest(".dropdown").removeClass("open");
    }
}