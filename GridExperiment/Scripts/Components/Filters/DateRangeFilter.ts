/// <reference path="filter.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />

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