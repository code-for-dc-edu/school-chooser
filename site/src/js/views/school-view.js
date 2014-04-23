define(
    ['jquery',
     'lodash',
     'backbone',
     'd3',
     'charts/rbullet',
     'charts/pie',
     'utils',
     'i18n!nls/content',
     'plugins/jquery-quickfit',
    ], function ($, _, Backbone, d3, rubberBulletChart, pie, utils, content) {
    'use strict';

    var SchoolView = Backbone.View.extend({

        tagName: 'li',
        className: 'item school-view',

        template: _.template($('#school-view-template').html()),

        expanded: false,
        detailViewShown: false,

        events: {
            'click .summary-view': 'summaryViewClick',
            'click .item-title': 'itemDetailClick',
            'click .item-rank': 'itemDetailClick'
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
            this.listenTo(this.parent, 'toggleItemDetailView', this.toggleItemDetailView);
            this.listenTo(this.parent, 'compareItem', this.compareItem);
        },

        render: function () {
            var schoolAttrs = this.model.attributes,
                rankingArrays = this.rankingArrays;

            $(window).off('resize.' + this.id);

            this.$el.html(this.template({
                school: schoolAttrs,
                selectedItems: this.selectedItems,
                rankingArrays: this.rankingArrays,
                content: content
            }));
            

            this.rbChart = rubberBulletChart()
                .width($('#app').width() - 22)
                .transitionDuration(900)
                .transitionDelay(100);
            var rbChart = this.rbChart;

            var sel = d3.select(this.el);
            _.forEach(this.selectedItems, function (item) {
                sel.select('.' + item + '-rank')
                    .datum({
                        zscore: schoolAttrs[item].zscore,
                        rankArr: rankingArrays[item]
                    })
                    .call(rbChart);
            });
            var racialDiversityData=utils.valsObjToArr(schoolAttrs.racialDiversity.val);
            sel.select('#race-pie-container').call(pie, racialDiversityData);
            var fittext = this.fittext();
            setTimeout(fittext,0);

            $(window).on('resize.' + this.id, fittext);
            $(window).on('resize.' + this.id, function () {
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
            this.parent.trigger('toggleDetailView', this.id);
        },

        toggleDetailView: function (id) {
            if (id === this.id) {
                if (this.expanded) {

                    // The user has asked to close our detail view.

                    this.expanded = false;
                    this.$el.removeClass('expanded');

                    this.detailViewShown = false;
                    this.$('.detail-view').slideUp();
                } else {

                    // The user wants to open our detail view.

                    this.expanded = true;
                    this.$el.addClass('expanded');

                    if (this.detailViewShown) {

                        // Some parts of our detail view are already showing.

                        d3.select(this.el)
                            .selectAll('.rubber-bullet-chart:not(.compare-target)')
                            .call(this.rbChart, true);

                        $(this.$compareTarget
                            .prevAll()
                            .get().reverse())
                            .wrapAll('<div class="expander"></div>')
                            .parent()
                            .hide();

                        this.$compareTarget
                            .next()
                            .nextAll()
                            .wrapAll('<div class="expander"></div>')
                            .parent()
                            .hide();

                        this.$('.expander .item-title').show();
                        this.$('.expander .item-rank').show();
                        this.$('.expander .item-detail').hide();

                        this.$('.expander')
                            .slideDown(function () {
                                $(this).children().unwrap();
                            });

                        this.$compareTarget.removeClass('compare-target');
                        this.$compareTarget = null;
                    } else {

                        // Our detail view is closed, so opening it is simple.

                        d3.select(this.el)
                            .selectAll('.rubber-bullet-chart')
                            .call(this.rbChart, true);

                        this.$('.item-title').show();
                        this.$('.item-rank').show();
                        this.$('.item-detail').hide();

                        this.detailViewShown = true;
                        this.$('.detail-view').slideDown();
                    }
                }
            } else {

                // The user has opened another school's detail view, so we should close ours.

                this.expanded = false;
                this.$el.removeClass('expanded');

                this.detailViewShown = false;
                this.$('.detail-view').slideUp();
            }
        },

        compareItem: function (item) {
            if (item !== '') {
                if (this.expanded) {

                    // Our school is currently expanded, so we need to hide everything but the compare item.

                    this.expanded = false;
                    this.$el.removeClass('expanded');

                    this.$compareTarget = this.$('.' + item + '-rank')
                        .addClass('compare-target');

                    $(this.$compareTarget
                        .prevAll()
                        .get().reverse())
                        .wrapAll('<div class="expander"></div>');

                    this.$compareTarget
                        .next()
                        .nextAll()
                        .wrapAll('<div class="expander"></div>');

                    this.$('.expander')
                        .slideUp(function () {
                            $(this).children().hide().unwrap();
                        });
                } else {
                    if (this.detailViewShown) {

                        // Something is already being compared, so we need to hide it.

                        this.$compareTarget
                            .removeClass('compare-target')
                            .next()
                            .addBack()
                            .hide();

                        this.$compareTarget = this.$('.' + item + '-rank')
                            .addClass('compare-target');

                        d3.select(this.el)
                            .selectAll('.rubber-bullet-chart.compare-target')
                            .call(this.rbChart, true);

                        this.$compareTarget.show();
                    } else {

                        // We have a clean slate. We'll show our item and then reveal the detail view.

                        this.$('.detail-view').children().hide();
                        this.$compareTarget = this.$('.' + item + '-rank')
                            .show()
                            .addClass('compare-target');

                        d3.select(this.el)
                            .selectAll('.rubber-bullet-chart.compare-target')
                            .call(this.rbChart, true);

                        this.detailViewShown = true;
                        this.$('.detail-view').slideDown();
                    }
                }
            } else {

                // We're no longer comparing things, so let's clean up.

                this.detailViewShown = false;
                this.$('.detail-view').slideUp();

                if (this.$compareTarget) {
                    this.$compareTarget.removeClass('compare-target');
                    this.$compareTarget = null;
                }
            }
        },

        itemDetailClick: function (e) {
            var targetID = e.currentTarget.id.split('-'),
                detailID = targetID[0] + '-' + targetID[1] + '-detail';

            this.parent.trigger('toggleItemDetailView', detailID);
        },

        toggleItemDetailView: function (id) {
            var idComponents = id.split('-'),
                code = idComponents[0],
                item = idComponents[1];
            if (code === this.model.get('code')) {
                this.$('.item-detail:not(.' + item + '-detail)').slideUp();
                this.$('#' + id).slideToggle();
            } else {
                this.$('.item-detail').slideUp();
            }
        },

        close: function () {
            $(window).off('resize.' + this.id);
            this.remove();
            this.unbind();
        }

    });
    return SchoolView;
});