// Modified version of touch-sortable.js | MIT License | docubuzz.github.io/touch-sortable.js

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    $.fn.sortable = function (options) {
        options = options || {};
        options.itemHeight = options.itemHeight || 44;
        options.selector = options.selector || '.item';
        options.touchTarget = options.touchTarget || '.touch-target';
        options.onReorder = options.onReorder || function () {};

        var startEvent = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'mousedown';

        return this.each(function () {
            var parent = $(this);
            var els = parent.children()
                .css({ 'user-select': 'none' })
                .attr('unselectable', 'on')
                .on('selectstart', false);

            var selectables = parent.children(options.selector).children(options.touchTarget)
                .on(startEvent, onStart);

            /* If only one element we do nothing */
            if (els.length < 2) {
                return;
            }

            /* assumes the distance between the first and second element is the same as 
               the distance between each other element and the next element */
            // var elDistance = els.filter(':nth-child(2)').offset().top - els.filter(':first').offset().top;

            var elDistance = options.itemHeight;

            /* Set with each onStart and updated on move if necessary */
            var el, parentTop, parentBtm, positionAtStart, hasQueuedAni;

            function onStart(e) {
                e = e.originalEvent.touches ? e.originalEvent : e;
                el = $(e.touches ? e.touches[0].target : e.target);
                if (!el.is('li')) el = el.closest('li');
                parentTop = parent.position().top;
                parentBtm = parentTop + parent.innerHeight() + el.height();

                els.css('position','relative');
                el.addClass('in-motion').css( 'z-index', 1000);
                parent.addClass('in-motion');
                hasQueuedAni = false;

                // Prevent scroll on mobile, prevent text cursor on desktop
                e.preventDefault();

                /* Bind respective events based on start trigger */
                if (e.touches) {
                    positionAtStart = e.touches[0].pageY;
                    $('body').on('touchmove.sortable', onMove).on('touchend.sortable', onEnd).on('touchcancel.sortable', onEnd);
                } else {
                    positionAtStart = e.pageY;
                    $('body').on('mousemove.sortable', onMove).on('mouseup.sortable', onEnd).on('mouseleave.sortable', onEnd);
                }
            }

            function onMove(e) {
                var positionDelta;
                if (e) {
                    e = e.originalEvent.touches ? e.originalEvent : e;
                    var positionNow = (e.touches) ? e.touches[0].pageY : e.pageY;

                    /* Constrain dragging to limits of parent */
                    positionNow = Math.min(Math.max(parentTop, positionNow), parentBtm);

                    /* If the cursor is near document boundary, scroll the page */
                    if (50 >= (positionNow - $(window).scrollTop())) {
                        window.scrollBy(0, -5);
                    } else if (50 >= $(window).height() + $(window).scrollTop()) {
                        window.scrollBy(0, 5);
                    }

                    /* Move item  */
                    positionDelta = positionNow - positionAtStart;
                    el.css('top', positionDelta);
                } else {
                    positionDelta = el.css('top').split('px')[0];
                }

                // The real height of the neighboring element in case it's a header row
                var elHeight = positionDelta > 0 ? el.next().outerHeight(true) : el.prev().outerHeight(true);

                // Any additional rows remaining to move?
                var additionalRows = Math.abs(positionDelta) - elHeight > 0 ? Math.floor((Math.abs(positionDelta) - elHeight) / elDistance) : 0;

                /* Distance remaining to move, as a number of elDistances */
                // var mvUnits = Math.floor(Math.abs(positionDelta / elDistance));

                var sel;

                /* Re-order the list once item crosses over the neighboring elements */
                if (positionDelta < -elHeight && el.prev().length) {

                    if (!els.filter(':animated').length) {
                        hasQueuedAni = true;
                        
                        /* Animate and swap */
                        sel = el.prevAll().slice(0, 1 + additionalRows);
                        sel.animate({
                            'top': el.outerHeight(true)
                        }, 150).promise().done(function () {
                            positionAtStart = positionAtStart - (elHeight + (elDistance * additionalRows));
                            el.insertBefore(sel.last()).css('top', '+=' + (elHeight + (elDistance * additionalRows)));
                            sel.css('top','');
                            options.onReorder();
                            onMove();
                        });
                    }
                } else if (positionDelta > elHeight && el.next().length) {

                    if (!els.filter(':animated').length) {
                        hasQueuedAni = true;
                        
                        /* Animate and swap */
                        sel = el.nextAll().slice(0, 1 + additionalRows);
                        sel.animate({
                            'top': -el.outerHeight(true)
                        }, 150).promise().done(function () {
                            positionAtStart = positionAtStart + (elHeight + (elDistance * additionalRows));
                            el.insertAfter(sel.last()).css('top', '-=' + (elHeight + (elDistance * additionalRows)));
                            sel.css('top','');
                            options.onReorder();
                            onMove();
                        });
                    }

                } else {
                    hasQueuedAni = false;
                }

                if (e) {
                    e.preventDefault();
                }
            }

            function onEnd() {
                $('body').off('.sortable');
                parent.removeClass('in-motion');
                
                function complete() {
                    el.animate({
                        'top': "-=" + el.css('top')
                    }, 150, function () {
                        el.css({'top':'', 'z-index':''}).removeClass('in-motion');
                        els.css('position','');                        
                        if (options.onComplete) {
                            options.onComplete(el);
                        }
                    });
                }
                /* Ensures all animations are complete, and the item is in it's
                final position before completing. The promise() waits for the 
                current animation to complete. setTimeout(x, 1) allows any remaning 
                animation to be queued up */
                var aniEls = els.filter(':animated');
                if (aniEls.length || hasQueuedAni) {
                    setTimeout(function () {
                        aniEls.promise().done(onEnd);
                    }, 1);
                } else {
                    complete();
                }
            }
        });
    };  
}));