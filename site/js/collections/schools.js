define(
    ['lodash',
     'backbone',
     'models/school'
    ], function (_, Backbone, School) {
    var Schools = Backbone.Collection.extend({

        model: School,

        initialize: function () {

        }

    });
    return Schools;
});