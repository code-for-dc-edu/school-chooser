define(
    ['jquery',
     'lodash',
     'backbone',
     'collections/schools'
    ], function ($, _, Backbone, Schools) {
    'use strict';

    var Session = Backbone.Model.extend({

        idAttribute: 'hashid',

        defaults: {
            gaVisitorID: '',
            grade: '',
            address: '',
            addressGISValid: false,
            xcoord: 0.0,
            ycoord: 0.0,
            neighborhoodCluster: 0,
            zonedSchools: [],
            rankings: {
                academicGrowth: 0,
                // collegeEnrollment: 0,
                graduationRate: 0,
                // instructionalStaffPerStudent: 0,
                racialDiversity: 0,
                schoolClimate: 0,
                studentsFromMyNeighborhood: 0
            },
            validationLevel: 0,
            levelValid: false
        },

        privateAttrs: [
            'validationLevel',
            'levelValid'
        ],

        toJSON: function() {
            return _.omit(this.attributes, this.privateAttrs);
        },

        parse: function (res, options) {
            if (!options.saved) {
                return res;
            } else {
                return {
                    hashid: res.hashid,
                    zonedSchools: res.zonedSchools
                };
            }
        },

        initialize: function () {
            this.on('change:address', this.lookupAddress);
            this.on('change:grade', this.filterRankings);
            this.on('change', function () {
                if (!this.hasChanged('levelValid')) {
                    this.validate();
                }
            });

            this.schools = new Schools();
        },

        validate: function (attrs) {
            var invalid = [];

            attrs = _.has(attrs, 'validationLevel') ? attrs : this.attributes;

            switch (attrs.validationLevel) {
            case 1:
                if (!attrs.grade) { invalid.push('grade'); }
                if (!attrs.address) {
                    invalid.push('address');
                } else if (!attrs.addressGISValid) {
                    invalid.push('addressGISValid');
                }
                break;
            case 2:
                if (!_.find(attrs.rankings, function (ranking) {
                    return ranking > 0;
                })) {
                    invalid.push('rankings');
                }
                if (attrs.zonedSchools.length === 0) { invalid.push('zonedSchools'); }
                break;
            default:
                break;
            }

            if (invalid.length > 0) {
                this.set({'levelValid': false});
                // return invalid;
            } else {
                this.set({'levelValid': true});
            }
        },

        lookupAddress: function () {
            var address = this.get('address'),
                that = this;

            this.set({'addressGISValid': false});

            if (address) {
                $.post('/api/dcgis', {address: address}, function (data) {
                    var address,
                        xcoord,
                        ycoord,
                        neighborhoodCluster,
                        returnedAddresses = $(data).find('FULLADDRESS');
                    if (returnedAddresses.length === 1) {
                        address = $(returnedAddresses[0]).text();
                        xcoord = parseFloat($($(data).find('XCOORD')[0]).text());
                        ycoord = parseFloat($($(data).find('YCOORD')[0]).text());
                        neighborhoodCluster = parseInt($($(data).find('CLUSTER_')[0]).text().split(' ')[1],10);
                        that.set({
                            'addressGISValid': true,
                            'address': address,
                            'xcoord': xcoord,
                            'ycoord': ycoord,
                            'neighborhoodCluster': neighborhoodCluster
                        });
                        that.trigger('addressGIS:valid');
                    } else {
                        that.trigger('addressGIS:invalid');
                    }
                });
            }
        },

        filterRankings: function () {
            var rankings = this.get('rankings'),
                grade = this.get('grade');

            if (_.contains(['09','10','11','12'], grade)) {
                // if (!rankings.collegeEnrollment) { rankings.collegeEnrollment = 0; }
                if (!rankings.graduationRate) { rankings.graduationRate = 0; }
            } else {
                // rankings.collegeEnrollment = -1;
                rankings.graduationRate = -1;
            }

            this.set({'rankings': rankings});
        },

        rankingItems: function () {
            var rankings = _(this.get('rankings'))
                    .pairs()
                    .sortBy(function (pair) { return pair[1]; })
                    .groupBy(function (pair) {
                        var selected = pair[1] > 0 ? 'selected' : false,
                            unselected = pair[1] === 0 ? 'unselected' : false;
                        return selected || unselected;
                    })
                    .value(),
                selected = _.map(rankings.selected, function (pair) { return pair[0]; }),
                unselected = _.map(rankings.unselected, function (pair) { return pair[0]; });

            return { 'selected': selected, 'unselected': unselected };
        },

        getResults: function () {
            if (!this.results) {
                var grade = this.get('grade'),
                    nc = this.get('neighborhoodCluster'),
                    rankings = this.get('rankings'),
                    zonedSchools = this.get('zonedSchools');

                this.results = this.schools.sorted(grade, nc, rankings);

                _.forEach(this.results, function (school, i) {
                    var zoned = _.include(zonedSchools, parseInt(school.attributes.code,10));
                    school.set({ 'rank': i + 1, 'zoned': zoned });
                });
            }

            return this.results;
        },

        getRankingArrays: function () {
            if (!this.rankingArrays) {
                var results = this.getResults(),
                    selectedItems = this.rankingItems().selected,
                    rankingArrays;

                rankingArrays = this.rankingArrays = {};

                _.forEach(selectedItems, function (item) {
                    rankingArrays[item] = [];

                    _.forEach(results, function (school) {
                        var zscore = school.attributes[item].zscore;
                        if (zscore) { rankingArrays[item].push(parseFloat(zscore)); }
                    });

                    rankingArrays[item].sort(function (a, b) { return b-a; });
                });
            }

            return this.rankingArrays;
        }

    });
    return Session;
});