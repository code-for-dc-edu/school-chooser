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
        },

        render: function () {

        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return ResultsView;
});