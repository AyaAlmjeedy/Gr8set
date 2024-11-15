/*
---
description:     ScrollSpy

authors:
  - David Walsh (http://davidwalsh.name)

license:
  - MIT-style license

requires:
  core/1.2.1:   '*'

provides:
  - ScrollSpy
...
*/
var ScrollSpy = new Class({

    /* implements */
    Implements: [Options, Events],

    /* options */
    options: {
        container: window,
        max: 0,
        min: 0,
        item: '',
        mode: 'vertical'
        /*,
        		onEnter: $empty,
        		onLeave: $empty,
        		onScroll: $empty,
        		onTick: $empty
        		*/
    },

    /* initialization */
    initialize: function(options) {
        /* set options */
        this.setOptions(options);
        this.container = document.id(this.options.container);
        this.item = this.options.item;
        this.enters = this.leaves = 0;
        this.inside = false;

        /* listener */
        var self = this;
        this.listener = function(e) {
            var pos = self.item.getCoordinates();
            var min = self.options.min + pos.top;
            var max = self.options.max + pos.bottom;
            /* if it has reached the level */
            var position = self.container.getScroll(),
                xy = position[self.options.mode == 'vertical' ? 'y' : 'x'];
            /* if we reach the minimum and are still below the max... */
            if (xy >= min && (max == 0 || xy <= max)) {
                /* trigger enter event if necessary */
                if (!self.inside) {
                    /* record as inside */
                    self.inside = true;
                    self.enters++;
                    /* fire enter event */
                    self.fireEvent('enter', [position, self.enters, e]);
                }
                /* trigger the "tick", always */
                self.fireEvent('tick', [position, self.inside, self.enters, self.leaves, e]);
            }
            /* trigger leave */
            else if (self.inside) {
                self.inside = false;
                self.leaves++;
                self.fireEvent('leave', [position, self.leaves, e]);
            }
            /* fire scroll event */
            self.fireEvent('scroll', [position, self.inside, self.enters, self.leaves, e]);
        };

        /* make it happen */
        this.addListener();
    },

    /* starts the listener */
    start: function() {
        this.container.addEvent('scroll', this.listener);
        this.listener();
    },

    /* stops the listener */
    stop: function() {
        this.container.removeEvent('scroll', this.listener);
    },

    /* legacy */
    addListener: function() {
        this.start();
    }
});