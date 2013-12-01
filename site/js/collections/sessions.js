define(
    ['lodash',
     'backbone',
     'models/session'
    ], function (_, Backbone, Session) {
    var Schools = Backbone.Collection.extend({

        model: Session,

        initialize: function () {

        }

    });
    return Schools;
});