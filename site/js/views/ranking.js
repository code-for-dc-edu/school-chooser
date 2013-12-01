define(
    ['jquery',
     'lodash',
     'backbone',
     'i18n!nls/content',
     'plugins/touch-sortable'
    ], function ($, _, Backbone, content) {
    var RankingView = Backbone.View.extend({

        tagName: 'div',
        id: 'ranking-view',
        className: 'app-view',

        order: 2,

        template: _.template($('#app-view-template').html()),
        tableViewTemplate: _.template($('#ranking-table-view-template').html()),

        events: {
            'update #ranking-table-view': 'update'
        },

        initialize: function () {
            this.$el.html(this.template({
                view: 'ranking',
                content: content
            }));
            this.$tableView = $('<div id="ranking-table-view"></div>')
                .appendTo(this.$el);
        },

        render: function () {
            var rankings = _(this.model.get('rankings'))
                    .pairs()
                    .sortBy(function (pair) { return pair[1]; })
                    .groupBy(function (pair) {
                        var selected = pair[1] > 0 ? 'selected' : false,
                            unselected = pair[1] === 0 ? 'unselected' : false;
                        return selected || unselected;
                    })
                    .value(),
                selectedItems = _.map(rankings.selected, function (pair) { return pair[0]; }),
                unselectedItems = _.map(rankings.unselected, function (pair) { return pair[0]; });

            this.$tableView
                .html(this.tableViewTemplate({
                    selectedItems: selectedItems,
                    unselectedItems: unselectedItems,
                    content: content
                }))
                .children('ul').sortable({
                    onReorder: function () {
                        var dividerIndex = $('#ranking-table-view-divider').index();
                        $('#ranking-table-view li.item').each( function () {
                            var $el = $(this);
                            if ($el.index() < dividerIndex) {
                                $el.addClass('selected');
                            } else {
                                $el.removeClass('selected');
                            }
                        });
                    },
                    onComplete: function () {
                        $('#ranking-table-view').trigger("update");
                    }
                });
        },

        update: function () {
            var rankings = this.model.get('rankings');

            this.$tableView.find('.item').each(function () {
                var $el = $(this),
                    name = $el.data('name'),
                    index = $el.index() + 1;
                if ($el.hasClass('selected')) {
                    rankings[name] = index;
                } else {
                    rankings[name] = 0;
                }
            });

            this.model.set({'rankings': rankings}, { validate:true });
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return RankingView;
});