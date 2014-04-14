/// <reference path="../typings/underscore/underscore.d.ts" />

interface IFilterInfo {

    name: string;
    templateInstance: Filter;
    isDefault: boolean;
}

class Filter {

    private static _filters: IFilterInfo[];

    public column: Column;

    // fake static constructor
    static init() {

        Filter._filters = [];
    }
    static ctor = Filter.init();

    constructor() {

        this.expression = ko.computed(() => this.getExpression());
    }

    public getExpression(): string {

        throw "abstract: must be overriden in the descendant";
    }

    public static registerFilter(name: string, filter: Filter) {

        Filter._filters.push({ name: name, templateInstance: filter, isDefault: Filter._filters.length == 0 });
    }

    public static getByName(name: string, column: Column): Filter {

        var filter = _(Filter._filters).find(f => f.name == name);
        if (!filter)
            filter = _(Filter._filters).find(f => f.isDefault);

        var clone = _.clone(filter.templateInstance);
        clone.column = column;

        return clone;
    }

    public getData(): any {

        throw "abstract: must be overriden in the descendant";
    }

    public expression: KnockoutObservable<string>
}

class DefaultFilter extends Filter {

    private _selectedOperation: KnockoutObservable<Operation>;
    private _data: Operation[];

    // fake static constructor
    static init() {

        Filter.registerFilter("default-filter", new DefaultFilter());
    }
    static ctor = DefaultFilter.init();

    constructor() {

        this._data = [
            { name: 'equal',      title: 'Equals',      expression: '{0} = "{1}"' },
            { name: 'notEqual',   title: 'Not Equals',  expression: '{0} != "{1}"' },
            { name: 'contains',   title: 'Contains',    expression: '{0}.Contains("{1}")' },
            { name: 'startsWith', title: 'Starts With', expression: '{0}.StartsWith("{1}")' },
            { name: 'endsWith',   title: 'Ends With',   expression: '{0}.EndsWith("{1}")' }
        ];

        this._selectedOperation = ko.observable(this._data[0]);
        this._selectedOperation.subscribe(v => {

            console.log(v);
        });

        super();
    }

    public getExpression(): string {

        if (!this.column)
            return "";

        return this._selectedOperation().expression.format([
            this.column.name,
            this.column.filteredValue,
        ]);
    }

    public getData(): any {

        return {
            filter: this,
            items: this._data
        }
    }
}

class NumericFilter extends Filter {

    private _selectedOperation: KnockoutObservable<Operation>;
    private _data: Operation[];

    // fake static constructor
    static init() {

        Filter.registerFilter("numeric-filter", new NumericFilter());
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

        super();
    }

    public getExpression(): string {

        if (!this.column)
            return "";

        return this._selectedOperation().expression.format([
            this.column.name,
            this.column.filteredValue,
        ]);
    }

    public getData(): any {

        return this._data;
    }
}

class DateRangeFilter extends Filter {

    private _startDate: KnockoutObservable<Date>;
    private _endDate: KnockoutObservable<Date>;

    // fake static constructor
    static init() {

        Filter.registerFilter("date-range-filter", new DateRangeFilter());
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
}