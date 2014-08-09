require(
    ['jquery',
     'lodash',
     'backbone',
     'router',
     'utils'
    ], function ($, _, Backbone, AppRouter,utils) {
    'use strict';

    $(function () {
        window.app.router = new AppRouter();
        window.app.utils=utils;
        window.console.log(window.app.utils.fPercent);
        Backbone.history.start();
    });
});