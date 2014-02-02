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

            if (this.model.get('zoned')) {
                this.$el.addClass('zoned');
            }
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