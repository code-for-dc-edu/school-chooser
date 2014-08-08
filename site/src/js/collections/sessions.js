define(
    ['lodash',
     'backbone',
     'models/session'
    ], function (_, Backbone, Session) {
    'use strict';

    var Sessions = Backbone.Collection.extend({

        model: Session,
        url: '/api/sessions',

        initialize: function () {

        }

    });
    return Sessions;
});