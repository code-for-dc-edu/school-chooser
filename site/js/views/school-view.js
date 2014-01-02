define(
    ['jquery',
     'lodash',
     'backbone'
    ], function ($, _, Backbone) {
    var SchoolView = Backbone.View.extend({

        tagName: 'div',
        className: 'school-view',

        // template: _.template($('').html()),

        events: {

        },

        initialize: function () {
        },

        render: function () {
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return SchoolView;
});