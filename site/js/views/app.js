define(
    ['jquery',
     'lodash',
     'backbone',
     'models/session',
     'i18n!nls/ui-strings'
    ], function ($, _, Backbone, Session, uiStrings) {
    var AppView = Backbone.View.extend({

        el: '#app',

        progressViewTemplate: _.template($('#app-progress-view-template').html()),

        events: {
            'click #app-progress-view a': 'progressTouch'
        },

        initialize: function (options) {
            options = options || {};
            if (options.router) {
                this.router = options.router;
            }

            this.$progressView = $('<div id="app-progress-view"></div>')
                .html(this.progressViewTemplate({ uiStrings: uiStrings }))
                .appendTo(this.$el);
            this.$progressViewLinks = this.$('#app-progress-view a');
        },

        setModel: function (model) {
            if (this.model) { this.stopListening(model); }
            this.model = model;
            this.listenTo(model, 'change:levelValid', this.render);
        },

        render: function () {
            var currentViewIndex = this.currentView.order,
                nextViewReady = this.model.get('levelValid');
            this.$progressViewLinks.each(function () {
                var $el = $(this),
                    index = parseInt($el.attr('id').charAt(18), 10);

                if (index < currentViewIndex) {
                    $el.attr('class','complete');
                } else if (index === currentViewIndex) {
                    $el.attr('class','active');
                } else if (index === currentViewIndex + 1 ) {
                    if (nextViewReady) {
                        $el.attr('class','next');
                    } else {
                        $el.attr('class','next disabled');
                    }
                } else {
                    $el.attr('class','');
                }
            });
        },

        presentView: function (newView) {

            newView.render();

            $newView = newView.$el;
            $newView.addClass('app-view');

            if (this.currentView) {
                if (newView.order < this.currentView.order) {
                    this.transition($newView, 'right');
                } else {
                    this.transition($newView, 'left');
                }
                
            } else {
                this.$el.prepend($newView);
            }

            this.currentView = newView;
            this.model.set('validationLevel', this.currentView.order);
            this.render();
        },

        transition: function ($newView, direction) {
            var currentView = this.currentView
                $currentView = currentView.$el,
                width = $currentView.width();

            $newView.css('position', 'absolute');
            $newView.css(direction, width);
            $currentView.css(direction, '0');

            this.$el.prepend($newView);

            var newProps = {}, currentProps = {};
            newProps[direction] = '0';
            currentProps[direction] = -width;

            $newView.animate(newProps, 400);
            $currentView.animate(currentProps, 400, function () {
                currentView.close();
                $newView.css('position', 'relative');
                $newView.css(direction, '');
            });
        },

        progressTouch: function (e) {
            var currentViewIndex = this.currentView.order,
                target = e.currentTarget,
                className = target.className,
                index = parseInt(target.id.charAt(18), 10);
            if (className === "complete" || className === "next") {
                this.router.navigateToView(index);
            }
        }

    });
    return AppView;
});