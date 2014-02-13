require(
    ['jquery',
     'lodash',
     'backbone',
     'router',
     'plugins/backbone-touch'
    ], function ($, _, Backbone, AppRouter) {
    'use strict';

    $(function () {
        window.app.router = new AppRouter();
        Backbone.history.start();
    });
});