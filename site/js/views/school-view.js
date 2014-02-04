define(
    ['jquery',
     'lodash',
     'backbone',
     'i18n!nls/content',
     'i18n!nls/ui-strings',
     'plugins/jquery-quickfit'
    ], function ($, _, Backbone, content, uiStrings) {
    var SchoolView = Backbone.View.extend({

        tagName: 'li',
        className: 'item school-view',

        template: _.template($('#school-view-template').html()),

        events: {
            'click .summary-view': 'summaryViewClick'
        },

        initialize: function (options) {
            this.parent = options.parent;
            this.selectedItems = options.selectedItems;
            this.rankingArrays = options.rankingArrays;

            this.id = 'school' + this.model.get('code');
            this.$el.attr('id', this.id);

            if (this.model.get('zoned')) {
                this.$el.addClass('zoned');
            }

            this.listenTo(this.parent, 'toggleDetailView', this.toggleDetailView);
        },

        render: function () {
            $(window).off("resize." + this.id)

            this.$el.html(this.template({
                school: this.model.attributes,
                selectedItems: this.selectedItems,
                rankingArrays: this.rankingArrays,
                content: content,
                uiStrings: uiStrings
            }));

            var fittext = this.fittext();
            $(window).on("resize." + this.id, fittext);
            setTimeout(fittext,0);

            return this;
        },

        fittext: function () {
            var $schoolName = this.$('span.name');
            return function () {
                $schoolName.quickfit({ min: 8, max: 14, tolerance: 0.05, truncate: true });
            };
        },

        summaryViewClick: function () {
            this.parent.trigger('toggleDetailView', this.id)
        },

        toggleDetailView: function (id) {
            if (id === this.id) {
                this.$el.toggleClass('expanded');
                this.$('.detail-view').slideToggle();
            } else {
                this.$el.removeClass('expanded');
                this.$('.detail-view').slideUp();
            }
        },

        close: function () {
            $(window).off("resize." + this.id)
            this.remove();
            this.unbind();
        }

    });
    return SchoolView;
});