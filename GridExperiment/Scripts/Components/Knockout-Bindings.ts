/// <reference path="../typings/jqueryui/jqueryui.d.ts" />

class KnockoutBindings {

    // fake static constructor
    static init() {

        ko.bindingHandlers["datepicker"] = {

            init: function(element, valueAccessor, allBindingsAccessor) {

                var options = allBindingsAccessor().datepickerOptions || {};
                options.dateFormat = options.dateFormat || "dd/mm/yy";
                var $el = $(element);

                //initialize datepicker with some optional options
                $el.datepicker(options);

                //handle the field changing
                ko.utils.registerEventHandler(element, "change", function() {

                    var observable = valueAccessor();
                    observable($el.datepicker("getDate"));
                });

                //handle disposal (if KO removes by the template binding)
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $el.datepicker("destroy");
                });

            },
            update: function(element, valueAccessor) {

                var value = ko.utils.unwrapObservable(valueAccessor());
                var $el = $(element);
                var current : Date = $el.datepicker("getDate");

                $el.datepicker("setDate", value);   
            }
        };
    }

    static ctor = KnockoutBindings.init();
}