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
        window.app.utils={};
        window.app.utils.percentage=function(decimal){
            //Retuns a string representation of the
            //number to two decimal places with % sign
            return ''+(Math.round(decimal*10000)/100)+'%';
        };

    });
});