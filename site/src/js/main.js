require(
    ['jquery',
     'lodash',
     'backbone',
     'router',
     'plugins/backbone-touch'
    ], function ($, _, Backbone, AppRouter) {
    $(function () {
        window.app.router = new AppRouter();
        Backbone.history.start();
    });
});