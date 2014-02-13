define(
    ['lodash',
     'backbone',
     'models/session'
    ], function (_, Backbone, Session) {
    var Schools = Backbone.Collection.extend({

        model: Session,
        url: '/api/sessions',

        initialize: function () {

        }

    });
    return Schools;
});