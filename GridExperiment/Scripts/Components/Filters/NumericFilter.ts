/// <reference path="singleselectfilter.ts" />

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