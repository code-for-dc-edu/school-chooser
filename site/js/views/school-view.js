define(
    ['jquery',
     'lodash',
     'backbone',
     'plugins/jquery-quickfit'
    ], function ($, _, Backbone) {
    var SchoolView = Backbone.View.extend({

        tagName: 'li',
        className: 'item school-view',

        template: _.template($('#school-view-template').html()),

        events: {

        },

        initialize: function () {
            this.id = 'school' + this.model.get('code');
            this.$el.attr('id', this.id);

            this.$el.html(this.template({
                school: this.model.attributes
            }));

            if (this.model.get('zoned')) {
                this.$el.addClass('zoned');
            }

            var fittext = this.fittext();
            $(window).on("resize.school" + this.id, fittext);
            setTimeout(fittext,0);
        },

        render: function () {
        },

        fittext: function () {
            var $schoolName = this.$('span.name');
            return function () {
                $schoolName.quickfit({ min: 8, max: 14, tolerance: 0.05, truncate: true });
            };
        },

        close: function () {
            $(window).off("resize." + this.id)
            this.remove();
            this.unbind();
        }

    });
    return SchoolView;
});