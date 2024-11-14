window.addEvent('domready', function() {
    var scrollElement;

    if (typeof(website.options.admin) == 'undefined' || website.options.admin == false) {
        scrollElement = window;
    } else {
        scrollElement = $('PageWrapper');
    }

    updatePageHeader();

    scrollElement.addEvent('scroll', function(e) {
        updatePageHeader();
    });

    function updatePageHeader() {
        if (scrollElement.getScroll().y > 200) {
            if (!$(document.body).hasClass('tpl-header-collapsed')) {
                $(document.body).addClass('tpl-header-collapsed');
            }
        } else {
            if ($(document.body).hasClass('tpl-header-collapsed')) {
                $(document.body).removeClass('tpl-header-collapsed');
            }
        }
    }
});