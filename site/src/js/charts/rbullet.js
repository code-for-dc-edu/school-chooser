define(
    ['jquery',
     'lodash',
     'd3',
     'i18n!nls/content'
    ], function ($, _, d3, content) {
    'use strict';

    var rubberBulletChart = function () {
        var chart,

            bgboxes = [
                { index: 0, dot: 'databg-2' },
                { index: 1, dot: 'databg-1' },
                { index: 2, dot: 'databg-0 databg-center' },
                { index: 3, dot: 'databg-0' },
                { index: 4, dot: 'databg-1' },
                { index: 5, dot: 'databg-2' }
            ],

        // Default properties
            width = 298,
            height = 28,
            barHeight = 10,
            circleRadius = 12,
            transitionDuration = 400,
            transitionDelay = 0;

        chart = function (selection, transition) {
            var myTransitionDuration,
                myTransitionDelay;

            if (transition) {
                myTransitionDuration = transitionDuration;
                myTransitionDelay = transitionDelay;
            } else {
                myTransitionDuration = 0;
                myTransitionDelay = 0;
            }

            selection.each(function (d) {
                var sel,
                    svg,
                    bg,
                    divider,
                    bar,
                    circle,
                    label;

                d.zscore = d.zscore > 3 ? 3 : d.zscore;
                d.zscore = d.zscore < -3 ? -3 : d.zscore;
                d = [d];

                sel = d3.select(this)
                    .classed({ 'rubber-bullet-chart': true });

                svg = sel.selectAll('svg');

                if (svg.empty()) {
                    svg = sel.append('svg')
                        .attr('height', height);

                    sel.selectAll('.placeholder')
                        .remove();

                    $(this).append(
                        '<div class="bg-labels">' +
                        '<span class="lt">' +
                        content.belowAvg +
                        '</span>' +
                        '<span class="gt">' +
                        content.aboveAvg +
                        '</span>' +
                        '</div>'
                    );
                }

                bg = svg.selectAll('.bgbox');

                if (bg.empty()) {
                    bg = bg.data(bgboxes)
                        .enter()
                        .append('rect')
                        .attr('y', 0)
                        .attr('height', height)
                        .attr('class', function (d) {
                            return d.dot + ' bgbox';
                        });
                }

                divider = svg.selectAll('line');

                if (divider.empty()) {
                    divider = svg.append('line')
                        .attr('y1', 0)
                        .attr('y2', height)
                        .attr('class', 'divider');
                }

                bar = svg.selectAll('.bar');

                if (bar.empty()) {
                    bar = bar.data(d)
                        .enter()
                        .append('rect')
                        .attr('x', 0)
                        .attr('y', (height - barHeight) / 2)
                        .attr('height', barHeight)
                        .attr('class', 'bar');
                }

                circle = svg.selectAll('circle');

                if (circle.empty()) {
                    circle = circle.data(d)
                        .enter()
                        .append('circle')
                        .attr('cy', height / 2)
                        .attr('r', circleRadius)
                        .attr('class', 'circle');
                }

                label = svg.selectAll('text');

                if (label.empty()) {
                    label = label.data(d)
                        .enter()
                        .append('text')
                        .attr('y', height / 2)
                        .attr('class', 'label');
                }

                if (transition) {
                    bar.attr('width', 0);
                    circle.attr('cx', 0);
                    label.attr('x', 0);
                }

                width = this.offsetWidth || width;

                svg.attr('width', width);
                bg.attr('x', function (d) {
                        return width/6 * d.index;
                    })
                    .attr('width', width/6);
                divider.attr('x1', width / 2)
                    .attr('x2', width / 2);
                bar.transition()
                    .duration(myTransitionDuration)
                    .delay(myTransitionDelay)
                    .attr('width', function (d) {
                        return (d.zscore + 3) * width/6;
                    });
                circle.transition()
                    .duration(myTransitionDuration)
                    .delay(myTransitionDelay)
                    .attr('cx', function (d) {
                        return (d.zscore + 3) * width/6;
                    });
                label.transition()
                    .duration(myTransitionDuration)
                    .delay(myTransitionDelay)
                    .attr('x', function (d) {
                        return (d.zscore + 3) * width/6;
                    })
                    .tween('text', function (d) {
                        var reversedRankArr = _.clone(d.rankArr).reverse(),
                        i = function (t) {
                            if (t === 1) {
                                return _.indexOf(d.rankArr, d.zscore) + 1;
                            } else {
                                return reversedRankArr.length - _.sortedIndex(reversedRankArr, (d.zscore + 3) * t - 3);
                            }
                        };
                        return function (t) { this.textContent = i(t); };
                    });
            });
        };

        // Get/set properties
        chart.width = function(value) {
            if (!arguments.length) { return width; }
            width = value;
            return chart;
        };

        chart.height = function(value) {
            if (!arguments.length) { return height; }
            height = value;
            return chart;
        };

        chart.barHeight = function(value) {
            if (!arguments.length) { return barHeight; }
            barHeight = value;
            return chart;
        };

        chart.circleRadius = function(value) {
            if (!arguments.length) { return circleRadius; }
            circleRadius = value;
            return chart;
        };

        chart.transitionDuration = function(value) {
            if (!arguments.length) { return transitionDuration; }
            transitionDuration = value;
            return chart;
        };

        chart.transitionDelay = function(value) {
            if (!arguments.length) { return transitionDelay; }
            transitionDelay = value;
            return chart;
        };

        return chart;
    };
    return rubberBulletChart;
});