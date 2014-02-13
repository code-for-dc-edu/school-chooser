define(
    ['jquery',
     'lodash',
     'backbone',
     'i18n!nls/content',
     'plugins/touch-sortable',
     'plugins/jquery-modal/jquery.modal'
    ], function ($, _, Backbone, content) {
    'use strict';

    var RankingView = Backbone.View.extend({

        tagName: 'div',
        id: 'ranking-view',
        className: 'app-view',

        order: 2,

        template: _.template($('#app-view-template').html()),
        tableViewTemplate: _.template($('#ranking-table-view-template').html()),
        modalTemplate: _.template($('#modal-template').html()),

        events: {
            'update #ranking-table-view': 'update',
            'click .item': 'modal'
        },

        initialize: function () {
            this.$el.html(this.template({
                view: 'ranking',
                content: content
            }));
            this.$tableView = $('<div id="ranking-table-view" class="table-view"></div>')
                .appendTo(this.$el);
        },

        render: function () {
            var rankings = this.model.rankingItems(),
                selectedItems = rankings.selected,
                unselectedItems = rankings.unselected;

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
                            $el.removeClass('grabbed');
                            if ($el.index() < dividerIndex) {
                                $el.addClass('selected');
                            } else {
                                $el.removeClass('selected');
                            }
                        });
                    },
                    onComplete: function () {
                        $('#ranking-table-view').trigger('update');
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

        modal: function (e) {
            var item,
                $modal,
                $el = $(e.currentTarget);

            if ($el.hasClass('grabbed')) {
                $el.removeClass('grabbed');
            } else {
                item = $el.data('name');
                $modal = $('<div class="modal" id="' + item + '"></div>')
                    .html(this.modalTemplate({
                        item: item,
                        content: content
                    }));
                $('body').append($modal);
                $modal.modal();

            }
        },

        close: function () {
            this.remove();
            this.unbind();
        }

    });
    return RankingView;
});