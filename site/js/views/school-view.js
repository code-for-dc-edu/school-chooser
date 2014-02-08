define(
    ['jquery',
     'lodash',
     'backbone',
     'd3',
     'charts/rbullet',
     'i18n!nls/content',
     'i18n!nls/ui-strings',
     'plugins/jquery-quickfit'
    ], function ($, _, Backbone, d3, RubberBulletChart, content, uiStrings) {
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
            var schoolAttrs = this.model.attributes,
                rankingArrays = this.rankingArrays;

            $(window).off("resize." + this.id)

            this.$el.html(this.template({
                school: schoolAttrs,
                selectedItems: this.selectedItems,
                rankingArrays: this.rankingArrays,
                content: content,
                uiStrings: uiStrings
            }));

            this.rbChart = RubberBulletChart()
                .width($('#app').width() - 22)
                .transitionDuration(1000)
                .transitionDelay(200);
            var rbChart = this.rbChart;

            var sel = d3.select(this.el);
            _.forEach(this.selectedItems, function (item) {
                sel.select('.' + item + '-rank')
                    .datum(parseFloat(schoolAttrs[item].sd))
                    .call(rbChart, rankingArrays[item]);
            });

            var fittext = this.fittext();
            setTimeout(fittext,0);

            $(window).on("resize." + this.id, fittext);
            $(window).on("resize." + this.id, function () {
                sel.selectAll('.rubber-bullet-chart')
                    .call(rbChart);
            });

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
            var rbChart = this.rbChart;

            if (id === this.id) {
                if (this.$el.hasClass('expanded')) {
                    this.$el.removeClass('expanded');
                    this.$('.detail-view').slideUp();
                } else {
                    this.$el.addClass('expanded');

                    d3.select(this.el)
                        .selectAll('.rubber-bullet-chart')
                        .call(rbChart, true);

                    this.$('.detail-view').slideDown();
                }
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