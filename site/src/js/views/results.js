define(
    ['jquery',
     'lodash',
     'backbone',
     'views/school-view',
     'i18n!nls/content',
     'i18n!nls/ui-strings'
    ], function ($, _, Backbone, schoolView, content, uiStrings) {
    var ResultsView = Backbone.View.extend({

        tagName: 'div',
        id: 'results-view',
        className: 'app-view',

        order: 3,

        template: _.template($('#app-view-template').html()),
        compareControlsTemplate: _.template($('#compare-controls-template').html()),

        page: 0,
        itemsPerPage: 10,

        events: {
            'click #compare-controls-toggle': 'toggleCompareControls',
            'change #compare-item': 'compareItem'
        },

        initialize: function () {
            this.$el.html(this.template({
                view: 'results',
                content: content
            }));
            this.$compareControls = $('<div id="compare-controls" class="collapsed"></div>')
                .html(this.compareControlsTemplate({
                    selectedItems: this.model.rankingItems().selected,
                    content: content,
                    uiStrings: uiStrings
                }))
                .appendTo(this.$el);
            this.$tableView = $('<div id="results-table-view" class="table-view"></div>')
                .appendTo(this.$el);
            this.$schoolList = $('<ul></ul>')
                .appendTo(this.$tableView);

            this.on('toggleDetailView', this.closeCompareControls);
        },

        render: function () {
            var results = this.model.getResults(),
                schools = _.at(results, _.range(this.page * this.itemsPerPage, (this.page + 1) * this.itemsPerPage)),
                $schoolList = this.$schoolList,
                that = this;

            // Pull all zoned schools onto the first page of results

            if (this.page === 0) {
                schools = schools.concat(_(results).rest(this.itemsPerPage).filter(function (school) {
                    return school.attributes.zoned;
                }).value());
            }

            _.forEach(schools, function (school) {
                var subview = new schoolView({
                    model: school,
                    parent: that,
                    selectedItems: that.model.rankingItems().selected,
                    rankingArrays: that.model.getRankingArrays()
                });
                $schoolList.append(subview.render().el);
            });
        },

        toggleCompareControls: function () {
            var collapsed = $('#compare-controls').hasClass('collapsed');
            if (!collapsed) {
                $('#compare-item').val('').change();
            }

            $('#compare-controls .hidden-controls').slideToggle(150, function () {
                $('#compare-controls').toggleClass('collapsed');

                if (!collapsed) {
                    $('#compare-controls-toggle').text(uiStrings.showCompare);
                } else {
                    $('#compare-controls-toggle').text(uiStrings.hideCompare);
                    $('#compare-item').focus();
                }
            });
        },

        closeCompareControls: function () {
            var collapsed = $('#compare-controls').hasClass('collapsed');
            if (!collapsed) {
                $('#compare-item').val('');
                $('#compare-controls .hidden-controls').slideUp(150, function () {
                    $('#compare-controls').addClass('collapsed');
                    $('#compare-controls-toggle').text(uiStrings.showCompare);
                });
            }
        },

        compareItem: function (e) {
            var item = $(e.target).children(':selected').attr('value');
            this.trigger('compareItem', item);
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return ResultsView;
});