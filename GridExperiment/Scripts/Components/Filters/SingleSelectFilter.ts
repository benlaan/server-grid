/// <reference path="filter.ts" />

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