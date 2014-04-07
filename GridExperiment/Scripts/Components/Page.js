/// <reference path="underscore.min.js" />

function Page(size, totalCount, grid) {

    var self = this;

    this.index = ko.observable(1);

    this.index.subscribe(function (newValue) {

        grid.render();
    });

    this.size = ko.observable(size);
    this.totalCount = ko.observable(0);

    this.first = function () {

        self.index(1);
    };

    this.previous = function () {

        var ix = self.index();
        if (ix > 0)
            self.index(ix - 1);
    };

    this.next = function () {

        var ix = self.index();
        if (ix < self.totalCount())
            self.index(ix + 1);
    };

    this.last = function () {

        self.index(self.totalCount());
    };

    this.current = ko.computed(function () {

        return self.index() + " of " + self.totalCount();
    }, this);

    this.setDataCount = function (count) {

        this.totalCount(Math.ceil(count / this.size()));

    };
};