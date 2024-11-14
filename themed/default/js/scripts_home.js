window.addEvent('domready', function() {
    var scrollElement;

    if (typeof(website.options.admin) == 'undefined' || website.options.admin == false) {
        scrollElement = window;
    } else {
        scrollElement = $('PageWrapper');
    }

    $$('.tpl-top-menu-widget li a, .tpl-smooth-scroll').addEvent("click", function(event) {
        var url = $(this).get('href').replace('/#', "").replace('#', "");
        if ($(url)) {
            event.preventDefault();
            new Fx.Scroll(scrollElement, {
                onComplete: function() {
                    if (!website.options.admin) {
                        if (url != 'Home') {
                            window.location.hash = url;
                        } else {
                            if (!history.pushState) {
                                window.location.hash = url;
                            }
                        }
                    }
                }
            }).toElement(url);
        }
    });

    var solutionsAccordion = new Fx.Accordion($$('.tpl-solutions-links .tpl-solution-toggler'), $$('.tpl-solutions-details-box'), {
        opacity: 1,
        alwaysHide: true,
        display: -1,
        initialDisplayFx: false,
        onActive: function(toggler) {
            toggler.addClass('tpl-expanded');
            new Fx.Scroll(scrollElement).toElement('SolutionsDetails');
        },
        onBackground: function(toggler) {
            toggler.removeClass('tpl-expanded');
        }
    });

    $$('.tpl-solutions-accordion').show();

    $$('.tpl-collapse-accordion a').addEvent("click", function(event) {
        event.preventDefault();
        new Fx.Scroll(scrollElement).toElement('Solutions');
        solutionsAccordion.display(-1);
    });
});

var scrollBars;

window.addEvent('load', function() {
    var scrollElement;

    if (typeof(website.options.admin) == 'undefined' || website.options.admin == false) {
        scrollElement = window;
    } else {
        scrollElement = $('PageWrapper');
    }

    $$('.tpl-follow-scroll').each(function(section, i) {
        var pos = section.getCoordinates();
        var ss = new ScrollSpy({
            container: scrollElement,
            item: section,
            min: -100,
            max: 200,
            onEnter: function() {
                var selectors = ['#FixedHeader .tpl-top-menu-widget ul li', '#Header .tpl-main-menu ul li'];
                selectors.each(function(selector, index) {
                    $$(selector).removeClass('tpl-active');
                    if ($$(selector)[i]) {
                        $$(selector)[i].addClass('tpl-active');
                    }
                });

                url = section.get('id');
                if (history.pushState && !website.options.admin) {
                    hash = '#' + section.get('id');
                    if (url == 'Home') {
                        hash = '/';
                    }
                    window.history.pushState('', '', hash);
                }
            }
        });
    });
});