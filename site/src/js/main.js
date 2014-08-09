require(
    ['jquery',
     'lodash',
     'backbone',
     'router'
    ], function ($, _, Backbone, AppRouter) {
    'use strict';

    $(function () {
        window.app.router = new AppRouter();
        Backbone.history.start();
    });
});