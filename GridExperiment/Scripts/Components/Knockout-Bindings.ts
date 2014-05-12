/// <reference path="../typings/jqueryui/jqueryui.d.ts" />

class KnockoutBindings {

    // fake static constructor
    static init() {

        ko.bindingHandlers["datepicker"] = {

            init: (element, valueAccessor, allBindingsAccessor) => {

                // the options commented below don't work due to the filter drop down
                // closing when anything is selected on the datepicker... need to review
                var options = {

                    dateFormat: "dd/mm/yy",
                    //showButtonPanel: true,
                    //changeMonth: true,
                    //changeYear: true
                };
                var $el = $(element);

                // initialize datepicker with some optional options
                $el.datepicker(options);

                // handle the field changing
                ko.utils.registerEventHandler(element, "change", () => {

                    var observable = valueAccessor();
                    observable($el.datepicker("getDate"));
                });

                // handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, () => $el.datepicker("destroy"));

            },
            update: (element, valueAccessor) => {

                var value = ko.utils.unwrapObservable(valueAccessor());
                var $el = $(element);
                var current: Date = $el.datepicker("getDate");

                $el.datepicker("setDate", value);
            }
        };
    }

    static ctor = KnockoutBindings.init();
}