require.config({
    paths: {
        'backbone': 'lib/backbone-1.1.0.min',
        'jquery': 'lib/jquery-1.10.2.min',
        'lodash': 'lib/lodash-2.4.0.min'
    },
    map: {
        '*': {
            'underscore': 'lodash'
        }
    },
    shim: {
        'backbone': {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        }
    },
    urlArgs: 'bust=' + (new Date()).getTime()
});

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