define(
    ['jquery',
     'lodash',
     'backbone',
     'i18n!nls/content'
    ], function ($, _, Backbone, content) {
    var ResultsView = Backbone.View.extend({

        tagName: 'div',
        id: 'results-view',
        className: 'app-view',

        order: 3,

        template: _.template($('#app-view-template').html()),

        events: {

        },

        initialize: function () {
            this.$el.html(this.template({
                view: 'results',
                content: content
            }));
            this.$schoolList = $('<ol id="school-list"></ol>')
                .appendTo(this.$el);
        },

        render: function () {
            var schools = this.model.results(),
                $schoolList = this.$schoolList;

            _.forEach(schools, function (school) {
                $schoolList.append('<li>' + school.attributes.name + '</li>');
            });
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return ResultsView;
});