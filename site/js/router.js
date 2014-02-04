define(
    ['lodash',
     'backbone',
     'views/app',
     'models/session',
     'collections/sessions'
    ], function (_, Backbone, AppView, Session, Sessions) {
    var AppRouter = Backbone.Router.extend({

        routes: {
            "": "newSession",
            "results/:id": "getSession"
        },

        initialize: function (options) {
            options = options || {};

            this.appView = new AppView({ router: this });
            this.sessions = new Sessions();
        },

        newSession: function () {
            this.session = new Session();
            this.sessions.add(this.session);
            this.appView.setModel(this.session);
            this.showBasicInfoView(this.session);
        },

        getSession: function (id) {
            this.session = this.sessions.get(id);
            if (!this.session) {
                this.session = new Session({ hashid: id });
                this.sessions.add(this.session);
                this.session.fetch();
            }
            this.appView.setModel(this.session);
            this.showResultsView(this.session);
        },

        cloneSession: function () {
            var attributes = _.omit(this.session.attributes, 'hashid');
            this.session = this.sessions.create(attributes);
        },

        navigateToView: function (index, currentIndex) {
            if (currentIndex === 3) {
                this.cloneSession();
                this.navigate('', {replace: true});
            } else {
                this.session.save(null, { saved: true });
            }
            switch (index) {
            case 2:
                this.showRankingView(this.session);
                break;
            case 3:
                this.showResultsView(this.session);
                this.navigate('results/' + this.session.id, {replace: true});
                break;
            default:
                this.showBasicInfoView(this.session);
                break;
            }
        },

        showBasicInfoView: function (session) {
            var router = this;
            require(['views/basic-info'],
                function (BasicInfoView) {
                    var view = new BasicInfoView({ model: session });
                    router.appView.presentView(view);
                }
            );
        },

        showRankingView: function (session) {
            var router = this;
            require(['views/ranking'],
                function (RankingView) {
                    var view = new RankingView({ model: session });
                    router.appView.presentView(view);
                }
            );
        },

        showResultsView: function (session) {
            var router = this;
            require(['views/results'],
                function (ResultsView) {
                    var view = new ResultsView({ model: session });
                    router.appView.presentView(view);
                }
            );
        }

    });
    return AppRouter;
});