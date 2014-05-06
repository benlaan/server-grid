/// <reference path="singleselectfilter.ts" />

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