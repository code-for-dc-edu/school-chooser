define(
    ['lodash',
     'backbone',
     'collections/schools'
    ], function (_, Backbone, Schools) {
    var Session = Backbone.Model.extend({

        defaults: {
            grade: '',
            address: '',
            addressGISValid: false,
            neighborhoodCluster: 0,
            zonedSchools: [],
            rankings: {
                academicGrowth: 0,
                collegeEnrollment: 0,
                graduationRate: 0,
                instructionalStaffPerStudent: 0,
                racialDiversity: 0,
                schoolCulture: 0,
                studentsFromMyNeighborhood: 0
            },
            results: new Schools(),
            validationLevel: 0,
            levelValid: false
        },

        initialize: function () {
            this.on('change:address', this.lookupAddress);
            this.on('change:grade', this.filterRankings);
            this.on('change', function () {
                if (!this.hasChanged('levelValid')) {
                    this.validate();
                }
            });
        },

        validate: function (attrs) {
            var invalid = [];

            attrs = _.has(attrs, 'validationLevel') ? attrs : this.attributes;

            switch (attrs.validationLevel) {
            case 1:
                if (!attrs.grade) { invalid.push("grade") };
                if (!attrs.address) {
                    invalid.push("address");
                } else if (!attrs.addressGISValid) {
                    invalid.push("addressGISValid");
                }
                break;
            case 2:
                if (!_.find(attrs.rankings, function (ranking) {
                    return ranking > 0;
                })) {
                    invalid.push("rankings");
                }
                break;
            default:
                break;
            }

            if (invalid.length > 0) {
                this.set({'levelValid': false});
                return invalid;
            } else {
                this.set({'levelValid': true});
            }
        },

        save: function(attrs, options) {
            options = options || {};

            attrs = _.omit(attrs,
                'results',
                'validationLevel',
                'levelValid'
            );

            options.data = JSON.stringify(attrs);

            return Backbone.Model.prototype.save.call(this, attrs, options);
        },

        lookupAddress: function () {
            this.set({'addressGISValid': false});

            // Until we have a POST proxy set up.
            if (this.get('address')) {
                this.set({'addressGISValid': true});
                this.trigger('addressGIS:valid');
            }
        },

        filterRankings: function () {
            var rankings = this.get('rankings'),
                grade = this.get('grade');

            if (_.contains(['9','10','11','12'], grade)) {
                if (!rankings.collegeEnrollment) { rankings.collegeEnrollment = 0; }
                if (!rankings.graduationRate) { rankings.graduationRate = 0; }
            } else {
                rankings.collegeEnrollment = false;
                rankings.graduationRate = false;
            }

            this.set({'rankings': rankings});
        }

    });
    return Session;
});