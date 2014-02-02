define(
    ['jquery',
     'lodash',
     'backbone'
    ], function ($, _, Backbone) {
    var SchoolView = Backbone.View.extend({

        tagName: 'li',
        className: 'item school-view',

        template: _.template($('#school-view-template').html()),

        events: {

        },

        initialize: function () {
            this.$el.html(this.template({
                school: this.model.attributes
            }));
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