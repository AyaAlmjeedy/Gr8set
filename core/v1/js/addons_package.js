var Addon = new Class({
    Implements: [Options, Events],
    options: {
        id: null,
        admin: false,
        preview: false,
        name: '',
        short_name: ''
    },
    id: null,
    initialize: function(aId, options) {
        this.setOptions(options);
        this.element = $(aId);
        this.id = this.options.id || parseInt(aId.split('_')[1]);
        this.website = null;
        this.page = null;
        this.admin = this.options.admin;
        this.preview = this.options.preview;
        this.element.addon = this;
        this.scrollableElement = (this.admin || this.preview ? $('PageWrapper') : window);
        this.viewportElement = (this.admin || this.preview ? $('PageWrapper') : $(document.body));
        this.scrollFx = new Fx.Scroll(this.scrollableElement, {
            link: 'cancel',
            wheelStops: false,
            duration: 300
        });
        this.bound = {};
        this.initVariables();
    },
    initVariables: function() {},
    attach: function() {
        if (this.admin == true) {
            this.attachAdminUI();
        }
    },
    detach: function() {
        if (this.admin == true) {
            this.detachAdminUI();
        }
    },
    attachAdminUI: function() {},
    detachAdminUI: function() {},
    documentResized: function() {},
    elementResized: function() {},
    setBusy: function(bBusy) {
        if (bBusy) {
            this.element.getElements('input[type=submit],input[type=button],input[type=reset],button[type=submit],button[type=button],button[type=reset]').set('disabled', true);
        } else {
            this.element.getElements('input[type=submit],input[type=button],input[type=reset],button[type=submit],button[type=button],button[type=reset]').set('disabled', false);
        }
        this.bIsBusy = bBusy;
    },
    isBusy: function() {
        return (typeof(this.bIsBusy) != 'udnefined' && this.bIsBusy == true ? true : false);
    },
    setBusyForm: function(form, bBusy) {
        if (bBusy) {
            form.getElements('input[type=submit],input[type=button],input[type=reset],button[type=submit],button[type=button],button[type=reset]').set('disabled', true);
        } else {
            form.getElements('input[type=submit],input[type=button],input[type=reset],button[type=submit],button[type=button],button[type=reset]').set('disabled', false);
        }
        form.busy = bBusy;
    },
    isBusyForm: function(form) {
        return (typeof(form.busy) != 'udnefined' && form.busy == true ? true : false);
    },
    showWeirdElements: function() {},
    hideWeirdElements: function() {},
    getValidatorOptions: function(options) {
        var parentWin = (options && typeof(options.parentWin) != 'undefined' ? options.parentWin : null);
        var options = Object.merge({
            onRequestComplete: false
        }, options);
        if (parentWin) {
            options.parentWin = parentWin;
        }
        var self = this;
        return {
            classes: {
                errorsListContent: 'tpl-message-text',
                errorsListMultilineContent: 'tpl-multiline',
                errorsListItem: 'tpl-message-item'
            },
            display: {
                listErrorsAtTop: true,
                errorsLocation: 0,
                indicateErrors: 2,
                scrollableElement: (self.admin || self.preview ? $('PageWrapper') : window)
            },
            getScrollPosition: function(obj) {
                var top = -1;
                var bottom = -1;
                if (obj.tagName.toLowerCase() == 'input' && obj.get('type') == 'hidden') {
                    obj = obj.getParent();
                }
                if (self.admin || self.preview) {
                    var coords = obj.getRelativeCoordinates($('PageWrapper'));
                    top = coords.top - 10;
                    bottom = coords.bottom + 10;
                } else {
                    var coords = obj.measure(function() {
                        return this.getCoordinates()
                    });
                    top = coords.top - 10;
                    bottom = coords.bottom + 10;
                }
                return {
                    top: top,
                    bottom: bottom
                };
            },
            onFormValid: function() {
                if ((self.admin || self.preview) && Browser.ie && Math.round(Browser.version) < 8) {
                    Browser.redraw();
                }
                this.form.getElements('.tpl-form-row.tpl-invalid').removeClass('tpl-invalid');
                self.elementResized();
            },
            onFormInvalid: function() {
                if ((self.admin || self.preview) && Browser.ie && Math.round(Browser.version) < 8) {
                    Browser.redraw();
                }
                self.elementResized();
            },
            onInputValid: function(input) {
                var row = input.getParent('.tpl-form-row');
                if (row && row.hasClass('tpl-invalid')) {
                    var inputs = row.getElements('input,select').erase(input);
                    var bRemove = true;
                    inputs.each(function(i) {
                        if (this.validations.contains(i) && i.isOk == false) {
                            bRemove = false;
                        }
                    }, this);
                    if (bRemove) {
                        row.removeClass('tpl-invalid');
                    }
                }
            },
            onInputInvalid: function(input) {
                if (this.options.display.errorsListContainer && this.options.display.errorsListContainer.hasClass('tpl-success')) {
                    this.options.display.errorsListContainer.removeClass('tpl-success');
                    this.options.display.errorsListContainer.addClass('tpl-error');
                }
                var row = input.getParent('.tpl-form-row');
                if (row && !row.hasClass('tpl-invalid')) {
                    row.addClass('tpl-invalid');
                }
                var focused = $(document.body).getElement('*:focus');
                if (focused && focused != input) {
                    focused.blur();
                }
            },
            onAjaxRequest: function() {
                self.setBusy(true);
                self.website.loadingBox(true);
            },
            onAjaxFailure: function() {
                new IWindow.Error(__('core', 'Error'), __('core', 'An error has occurred while communicating with the server. Please try again.'), {
                    pin: true,
                    parent: options.parentWin,
                    onShow: function() {
                        this.element.getElement('input[type=button]').focus();
                    }
                });
                self.setBusy(false);
                self.website.loadingBox(false);
            },
            onAjaxError: function() {
                new IWindow.Error(__('core', 'Error'), __('core', 'An error has occurred while communicating with the server. Please try again.'), {
                    pin: true,
                    parent: options.parentWin,
                    onShow: function() {
                        this.element.getElement('input[type=button]').focus();
                    }
                });
                self.setBusy(false);
                self.website.loadingBox(false);
            },
            onAjaxSuccess: function(response) {
                self.setBusy(false);
                if (self.website.websiteRequestSuccess(response, {
                        parentWin: parentWin
                    }) == false) {
                    return;
                }
                if (Object.getFromPath(response, 'addon_content') && Object.getFromPath(response, 'addon_content').length > 0) {
                    if (Object.getFromPath(response, 'notifications') && response.notifications.length > 0) {
                        self.website.notifier.empty();
                        response.notifications.each(function(notification) {
                            if (Object.getFromPath(notification, 'type') && Object.getFromPath(notification, 'title') && Object.getFromPath(notification, 'msg')) {
                                var options = Object.merge(Object.clone(self.website.options.notifierOptions), {
                                    duration: 10000,
                                    hideOnClick: false,
                                    classes: {
                                        item: 'tpl-roar tpl-roar-' + notification.type
                                    }
                                });
                                self.website.notify(notification.title, notification.msg, options);
                            }
                        });
                    }
                    if (Object.getFromPath(response, 'app_error') && Object.getFromPath(response, 'app_error') == true) {
                        var title = __('core', 'Error');
                        var msg = __('core', 'An error has occurred while communicating with the server. Please try again.');
                        if (Object.getFromPath(response, 'app_title') && Object.getFromPath(response, 'app_title').length > 0) {
                            title = Object.getFromPath(response, 'app_title');
                        }
                        if (Object.getFromPath(response, 'app_msg') && Object.getFromPath(response, 'app_msg').length > 0) {
                            msg = Object.getFromPath(response, 'app_msg');
                        }
                        new IWindow.Error(title, msg, {
                            pin: true,
                            parent: options.parentWin,
                            onShow: function() {
                                this.element.getElement('input[type=button]').focus();
                            }
                        });
                    }
                    if (options.onRequestComplete) {
                        options.onRequestComplete.apply(null, [response, self]);
                    }
                } else {
                    new IWindow.Error(__('core', 'Error'), __('core', 'An error has occurred while communicating with the server. Please try again.'), {
                        pin: true,
                        parent: options.parentWin,
                        onShow: function() {
                            this.element.getElement('input[type=button]').focus();
                        }
                    });
                }
            }
        };
    },
    destroy: function() {
        this.detach();
        if (this.element) {
            this.element.destroy();
        }
    },
    set: function(name, value) {
        this[name] = value;
        return this;
    }
});
Class.refactor(ProductContentWidget, {
    attach: function() {
        this.previous();
        this.entries.each(function(entry) {
            entry.getElements('.tpl-eraty-calculator-link').each(function(link) {
                var event = this.calculatorLinkClick.bind(this, link);
                link.store('event:calculatorLinkClick', event).addEvent('click', event);
            }, this);
        }, this);
    },
    detach: function() {
        this.previous();
        this.entries.each(function(entry) {
            entry.getElements('.tpl-eraty-calculator-link').each(function(link) {
                link.removeEvent('click', link.retrieve('event:calculatorLinkClick')).eliminate('event:calculatorLinkClick');
            });
        });
    },
    calculatorLinkClick: function(link, ev) {
        ev.preventDefault();
        var options = {
            pin: true,
            positionOnResize: true,
            buttonsType: 'input',
            modal: true,
            draggable: true,
            destroyOnClose: true,
            closeOnEsc: true,
            closeOnClickOut: true,
            width: 680,
            height: 640,
            allowedClickElements: [link],
            onInitialize: function() {
                this.body.setStyle('position', 'relative');
            }
        };
        var portViewSize = $(document.body).getSize();
        if (options.width > portViewSize.x - 10) {
            options.width = portViewSize.x - 10;
        }
        if (options.width < 500) {
            options.width = 500;
        }
        if (options.height > portViewSize.y - 10) {
            options.height = portViewSize.y - 10;
        }
        if (options.height < 400) {
            options.height = 400;
        }
        new IWindow(__('addon', 'Calculate the installment'), '<div class="tpl-window-text"><iframe src="' + link.get('href').toURI() + '" class="tpl-maximized-iframe tpl-white"></iframe></div>', options);
    }
});
Class.refactor(CheckoutFormWidget, {
    attachPaymentStepForm: function(form) {
        this.previous(form);
        form.getElements('.tpl-eraty-calculator-link').each(function(link) {
            var event = this.calculatorLinkClick.bind(this, link);
            link.store('event:calculatorLinkClick', event).addEvent('click', event);
        }, this);
    },
    detachPaymentStepForm: function(form) {
        this.previous(form);
        form.getElements('.tpl-eraty-calculator-link').each(function(link) {
            link.removeEvent('click', link.retrieve('event:calculatorLinkClick')).eliminate('event:calculatorLinkClick');
        });
    },
    paymentMethodRadioChange: function(el, ev) {
        this.previous(el, ev);
        el.getParent('.tpl-section-content').getElements('input[name="data[Checkout][payment][webshop_payment_method_id]"]').each(function(pm) {
            var box = pm.getParent().getElement('.tpl-eraty-payment-method-box');
            if (box) {
                if (pm == el && box.isDisplayed() == false) {
                    box.setStyle('display', null);
                } else if (pm != el && box.isDisplayed() == true) {
                    box.hide();
                }
                this.elementResized();
            }
        }, this);
    },
    calculatorLinkClick: function(link, ev) {
        ev.preventDefault();
        var options = {
            pin: true,
            positionOnResize: true,
            buttonsType: 'input',
            modal: true,
            draggable: true,
            destroyOnClose: true,
            closeOnEsc: true,
            closeOnClickOut: true,
            width: 680,
            height: 640,
            allowedClickElements: [link],
            onInitialize: function() {
                this.body.setStyle('position', 'relative');
            }
        };
        var portViewSize = $(document.body).getSize();
        if (options.width > portViewSize.x - 10) {
            options.width = portViewSize.x - 10;
        }
        if (options.width < 500) {
            options.width = 500;
        }
        if (options.height > portViewSize.y - 10) {
            options.height = portViewSize.y - 10;
        }
        if (options.height < 400) {
            options.height = 400;
        }
        new IWindow(__('addon', 'Calculate the installment'), '<div class="tpl-window-text"><iframe src="' + link.get('href').toURI() + '" class="tpl-maximized-iframe tpl-white"></iframe></div>', options);
    }
});
var FacebookPagePluginSidebarAddon = new Class({
    Extends: Addon,
    options: {
        name: 'Facebook Like Box sidebar',
        short_name: 'facebook_page_plugin_sidebar'
    },
    initialize: function(aId, options) {
        this.parent(aId, options);
        this.scrollBarWidth = Browser.getScrollBarWidth();
        this.create();
        this.slideFx = new Fx.ExtSlide(this.element.getElement('.tpl-sidebar-box'), {
            mode: 'horizontal',
            direction: (this.element.hasClass('tpl-left') ? 'left' : 'right')
        }).hide();
    },
    initVariables: function() {
        this.mode = 'click';
        this.bound = {
            elementMouseEnter: this.elementMouseEnter.bind(this),
            elementMouseLeave: this.elementMouseLeave.bind(this),
            sidebarButtonClick: this.sidebarButtonClick.bind(this),
            documentClick: this.documentClick.bind(this),
            windowResize: this.windowResize.bind(this),
            modalLayerClick: this.modalLayerClick.bind(this)
        };
    },
    create: function() {
        var data = {};
        var box = this.element.getElement('.tpl-sidebar-box');
        if (box && box.get('data-settings')) {
            var data = JSON.decode(box.get('data-settings'));
            this.mode = data.mode;
            if (data.width == 0) {
                data.width = 200;
            }
            if (data.height == 0) {
                data.height = 250;
            }
            var bStyles = {};
            bStyles.minWidth = data.width;
            bStyles.minHeight = data.height;
            this.element.setStyle('margin-top', -Math.round(data.height / 2));
            box.setStyles(bStyles);
            this.windowResize.delay(1, this);
        }
        var container = this.element.getElement('.tpl-facebook-page-plugin-container');
        if (container) {
            var fn = (function() {
                var existing = $$('script[src]');
                var bExists = false;
                var fbScript = null;
                var fbAsset = 'https://connect.facebook.net/' + Object.getFromPath(this.page, 'options.page.language_locale').replace(/-/i, '_') + '/all.js'
                existing.each(function(a) {
                    if (bExists == false && fbAsset == a.get('src')) {
                        fbScript = a;
                        bExists = true;
                    }
                });
                var onFbLoad = function() {
                    FB.XFBML.parse(container);
                };
                if (bExists == false) {
                    fbScript = new Element('script', {
                        'id': 'facebook-jssdk',
                        'src': fbAsset,
                        'type': 'text/javascript'
                    });
                    if (typeof fbScript.onreadystatechange != 'undefined') {
                        fbScript.addEvent('readystatechange', function() {
                            if (['loaded', 'complete'].contains(this.readyState)) {
                                fbScript.set('data-loaded', 'true');
                                onFbLoad.apply();
                            }
                        });
                    } else {
                        fbScript.addEvent('load', function() {
                            fbScript.set('data-loaded', 'true');
                            onFbLoad.apply();
                        });
                    }
                    fbScript.inject(document.body);
                } else {
                    if (fbScript.get('data-loaded') == 'true') {
                        onFbLoad.apply();
                    } else {
                        if (typeof fbScript.onreadystatechange != 'undefined') {
                            fbScript.addEvent('readystatechange', function() {
                                if (['loaded', 'complete'].contains(this.readyState)) {
                                    onFbLoad.apply();
                                }
                            });
                        } else {
                            fbScript.addEvent('load', function() {
                                onFbLoad.apply();
                            });
                        }
                    }
                }
            }).bind(this);
            if (typeof(window.bLoaded) != 'undefined' && window.bLoaded == true) {
                fn.apply();
            } else {
                window.addEvent('load', fn);
            }
        }
    },
    attach: function() {
        this.parent();
        if (this.mode == 'mouse_events') {
            this.element.addEvents({
                mouseenter: this.bound.elementMouseEnter,
                mouseleave: this.bound.elementMouseLeave
            });
        } else {
            document.addEvent('click', this.bound.documentClick);
        }
        var button = this.element.getElement('.tpl-sidebar-button');
        if (button) {
            button.addEvents({
                click: this.bound.sidebarButtonClick
            });
        }
        window.addEvent('resize', this.bound.windowResize);
    },
    detach: function() {
        this.parent();
        if (this.mode == 'mouse_events') {
            this.element.removeEvents({
                mouseenter: this.bound.elementMouseEnter,
                mouseleave: this.bound.elementMouseLeave
            });
        } else {
            document.removeEvent('click', this.bound.documentClick);
        }
        var button = this.element.getElement('.tpl-sidebar-button');
        if (button) {
            button.removeEvents({
                click: this.bound.sidebarButtonClick
            });
        }
        window.removeEvent('resize', this.bound.windowResize);
    },
    attachAdminUI: function() {
        this.parent();
        var modalLayer = this.element.getElement('.tpl-addon-content-overlay');
        if (modalLayer) {
            modalLayer.addEvent('click', this.bound.modalLayerClick);
        }
    },
    detachAdminUI: function() {
        this.parent();
        var modalLayer = this.element.getElement('.tpl-addon-content-overlay');
        if (modalLayer) {
            modalLayer.removeEvent('click', this.bound.modalLayerClick);
        }
    },
    elementMouseEnter: function(ev) {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = undefined;
        }
        this.showTimer = (function() {
            this.slideFx.cancel();
            this.slideFx.slideIn();
            this.showTimer = undefined;
        }).delay(10, this);
    },
    elementMouseLeave: function(ev) {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = undefined;
        }
        this.hideTimer = (function() {
            this.slideFx.cancel();
            this.slideFx.slideOut();
            this.hideTimer = undefined;
        }).delay(300, this);
    },
    sidebarButtonClick: function(ev) {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = undefined;
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = undefined;
        }
        this.slideFx.cancel();
        this.slideFx.toggle();
        (function() {
            if (this.slideFx.open == true && this.hideTimer) {
                clearTimeout(this.hideTimer);
                this.hideTimer = undefined;
            }
        }).delay(200, this);
    },
    documentClick: function(ev) {
        ev = new DOMEvent(ev);
        if (ev.rightClick) {
            return;
        }
        try {
            var eventTarget = $(ev.target);
            if (this.slideFx.open == true && eventTarget != this.element && Element.getParent(eventTarget, '.tpl-addon') != this.element) {
                this.slideFx.cancel();
                this.slideFx.toggle();
            }
        } catch (e) {}
    },
    windowResize: function(ev) {
        var side = (this.element.hasClass('tpl-left') ? 'left' : 'right');
        if (this.admin == true) {
            switch (side) {
                case 'left':
                    {
                        if (this.website.sidebar) {
                            if (this.website.sidebar.expanded == true) {
                                this.element.setStyle('left', this.website.sidebar.element.getSize().x - 4);
                            } else {
                                this.element.setStyle('left', 5);
                            }
                        }
                        break;
                    }
                case 'right':
                    {
                        var scrollSize = this.scrollableElement.getScrollSize();
                        var viewportSize = this.viewportElement.getSize();
                        var oldPos = this.element.getStyle('right');
                        var newPos = 0;
                        if (scrollSize.y > viewportSize.y) {
                            newPos = this.scrollBarWidth;
                        }
                        if (newPos != oldPos) {
                            this.element.setStyle('right', newPos);
                        }
                        break;
                    }
            }
        } else {
            switch (side) {
                case 'left':
                    {
                        this.element.setStyle('left', 0);
                        break;
                    }
                case 'right':
                    {
                        this.element.setStyle('right', 0);
                        break;
                    }
            }
        }
    },
    modalLayerClick: function(ev) {
        this.website.hideTips();
        this.website.notifyAdmin(__('admin_core', 'Administration mode', true), __('admin_core', 'The interaction with this widget is disabled in the administration panel. Click the "Preview" button in the top toolbar, if you want to test the functionality of the widget.', true), {
            width: 450,
            duration: 10000,
            classes: {
                title: '',
                icon: 'ui-tip'
            },
            onHide: function(item, length) {
                if (this.website.tips.contains(item)) {
                    this.website.tips.erase(item);
                }
            }.bind(this)
        });
        this.website.tips.push(this.website.adminNotifier.items.getLast());
    }
});
var NewsletterPopupAddon = new Class({
    Extends: Addon,
    options: {
        name: 'Newsletter popup',
        short_name: 'newsletter_popup'
    },
    initialize: function(aId, options) {
        this.parent(aId, options);
        this.create.delay(1, this);
    },
    initVariables: function() {
        this.parent();
        this.win = null;
        this.form = this.element.getElement('form');
        this.validator = null;
        this.captchaType = (this.form && this.form.get('data-ct') ? this.form.get('data-ct') : false);
        this.captchaData = (this.form && this.form.get('data-cd') ? JSON.decode(this.form.get('data-cd')) : false);
    },
    create: function() {
        var settings = (this.element.get('data-settings') ? JSON.decode(this.element.get('data-settings')) : null);
        var width = (settings && typeof(settings.width) != 'undefined' && settings.width > 0 ? settings.width : 450);
        var height = (settings && typeof(settings.height) != 'undefined' && settings.height > 0 ? settings.height : 300);
        var self = this;
        var winSize = window.getSize();
        var delta = 40;
        if (this.website.responsive == true && (winSize.x < width + Browser.getScrollBarWidth() + delta || winSize.y < height + delta)) {
            var aId = this.element.get('id');
            this.destroy();
            if (this.page.addons[aId]) {
                Object.erase(this.page.addons, aId);
            }
            return;
        }
        var options = {
            pin: true,
            positionOnResize: true,
            modal: true,
            showNow: false,
            draggable: false,
            destroyOnClose: true,
            closeOnEsc: true,
            width: width,
            height: height,
            classes: {
                content: 'tpl-window-simple'
            },
            onShow: function() {
                if (this.modalizer && !this.modalizer.element.hasClass('tpl-light')) {
                    this.modalizer.element.addClass('tpl-light')
                }
                if (self.website.notifier && this.modalizer) {
                    self.website.notifier.body.store('style:zIndex', self.website.notifier.body.getStyle('z-index'));
                    self.website.notifier.body.setStyle('z-index', parseInt(this.modalizer.element.getStyle('z-index')) + 2);
                }
            },
            onHide: function() {
                if (this.modalizer && this.modalizer.element.hasClass('tpl-light')) {
                    this.modalizer.element.removeClass('tpl-light')
                }
                if (self.website.notifier && this.modalizer) {
                    var zIndex = self.website.notifier.body.retrieve('style:zIndex');
                    if (zIndex) {
                        self.website.notifier.body.setStyle('z-index', zIndex).eliminate('style:zIndex');
                    }
                }
                var aId = self.element.get('id');
                self.destroy();
                if (self.page.addons[aId]) {
                    Object.erase(self.page.addons, aId);
                }
                self.website.writeCookie('NewsletterPopupClosed', 1, {
                    domain: '.' + self.website.options.cookie_domain,
                    duration: 3600
                });
            }
        };
        this.win = new IWindow('', this.element, options);
        this.element.show();
        (function() {
            this.win.show();
            this.win.pin();
        }).delay(1000, this);
        if (this.captchaType) {
            switch (this.captchaType) {
                case 'rc':
                case 'irc':
                    {
                        var fn = (function() {
                            var existing = $$('script[src]');
                            var rcScript = null;
                            var rcAsset = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=renderReCaptchaElements&hl=' + Object.getFromPath(this.page, 'options.page.language_code');
                            existing.each(function(a) {
                                if (!rcScript && rcAsset == a.get('src')) {
                                    rcScript = a;
                                }
                            });
                            var onScriptLoad = function() {
                                this.form.getElements('.g-recaptcha').each(function(el) {
                                    if (typeof(grecaptcha) != 'undefined' && typeof(grecaptcha.render) != 'undefined') {
                                        var elData = {
                                            'sitekey': el.get('data-sitekey'),
                                            'callback': el.get('data-callback'),
                                            'size': el.get('data-size')
                                        };
                                        var wId = grecaptcha.render(el, elData);
                                        el.set('data-wid', wId);
                                    } else {
                                        this.page.queueReCaptchaElement(el);
                                    }
                                }, this);
                                this.elementResized();
                            }.bind(this);
                            if (!rcScript) {
                                rcScript = new Element('script', {
                                    'src': rcAsset,
                                    'type': 'text/javascript',
                                    'async': '',
                                    'defer': ''
                                });
                                if (typeof rcScript.onreadystatechange != 'undefined') {
                                    rcScript.addEvent('readystatechange', function() {
                                        if (['loaded', 'complete'].contains(this.readyState)) {
                                            rcScript.set('data-loaded', 'true');
                                            onScriptLoad.apply();
                                        }
                                    });
                                } else {
                                    rcScript.addEvent('load', function() {
                                        rcScript.set('data-loaded', 'true');
                                        onScriptLoad.apply();
                                    });
                                }
                                rcScript.inject(document.body);
                            } else {
                                if (rcScript.get('data-loaded') == 'true') {
                                    onScriptLoad.apply();
                                } else {
                                    if (typeof rcScript.onreadystatechange != 'undefined') {
                                        rcScript.addEvent('readystatechange', function() {
                                            if (['loaded', 'complete'].contains(this.readyState)) {
                                                onScriptLoad.apply();
                                            }
                                        });
                                    } else {
                                        rcScript.addEvent('load', function() {
                                            onScriptLoad.apply();
                                        });
                                    }
                                }
                            }
                        }).bind(this);
                        if (typeof(window.bLoaded) != 'undefined' && window.bLoaded == true) {
                            fn.apply();
                        } else {
                            window.addEvent('load', fn);
                        }
                        break;
                    }
                case 'rc_v3':
                    {
                        var fn = (function() {
                            if (!this.captchaData || typeof(this.captchaData.sitekey) == 'undefined' || typeof(this.captchaData.action) == 'undefined') {
                                return;
                            }
                            var existing = $$('script[src]');
                            var rcScript = null;
                            var rcAsset = 'https://www.google.com/recaptcha/api.js?render=' + this.captchaData.sitekey;
                            existing.each(function(a) {
                                if (!rcScript && rcAsset == a.get('src')) {
                                    rcScript = a;
                                }
                            });
                            if (!rcScript) {
                                rcScript = new Element('script', {
                                    'src': rcAsset,
                                    'type': 'text/javascript',
                                    'async': '',
                                    'defer': ''
                                });
                                if (typeof rcScript.onreadystatechange != 'undefined') {
                                    rcScript.addEvent('readystatechange', function() {
                                        if (['loaded', 'complete'].contains(this.readyState)) {
                                            rcScript.set('data-loaded', 'true');
                                        }
                                    });
                                } else {
                                    rcScript.addEvent('load', function() {
                                        rcScript.set('data-loaded', 'true');
                                    });
                                }
                                rcScript.inject(document.body);
                            }
                        }).bind(this);
                        if (typeof(window.bLoaded) != 'undefined' && window.bLoaded == true) {
                            fn.apply();
                        } else {
                            window.addEvent('load', fn);
                        }
                        break;
                    }
            }
        }
    },
    attach: function() {
        this.parent();
        switch (this.captchaType) {
            case 'irc':
                {
                    window['onNewsletterPopupForm' + this.id + 'Submit'] = this.manualFormSubmit.bind(this);window['onNewsletterPopupForm' + this.id + 'Error'] = this.newsletterFormError.bind(this);
                    break;
                }
        }
        if (this.validator) {
            this.validator.attach();
        } else if (this.form && typeof(window['FormCheck']) != 'undefined') {
            var customElAlerts = {};
            customElAlerts['NewsletterSubscriberName_' + this.id] = __('form_check', 'Please enter a valid name.');
            customElAlerts['NewsletterSubscriberEmail_' + this.id] = __('form_check', 'Please enter a valid e-mail.');
            customElAlerts['NewsletterCaptchaCode_' + this.id] = __('form_check', 'Please enter the text from the picture.');
            var self = this;
            var msgBox = this.element.getElement('.tpl-message');
            var options = this.getValidatorOptions({
                parentWin: this.win,
                onRequestComplete: function(response, addon) {
                    if (typeof(response.hide) != 'undefined' && response.hide == true) {
                        self.win.hide(true);
                        return;
                    }
                    var aId = self.element.get('id');
                    self.detach();
                    self.win.setContent(null, response.addon_content);
                    self.reinitialize(aId);
                    self.attach();
                }
            });
            options = Object.merge(options, {
                submitByAjax: true,
                ajaxSubmitAction: '/ajax_core_addons_ui/request/',
                ajaxData: {
                    'data[Request][addon_id]': this.id,
                    'data[Request][page_id]': Object.getFromPath(this.page, 'id'),
                    'data[Request][url]': Object.getFromPath(this.page, 'options.page.here_url'),
                    'data[Request][render]': 1,
                    'data[Request][process]': 1
                },
                display: {
                    errorsListContainer: msgBox,
                    customElAlerts: customElAlerts
                },
                onBeforeSubmit: function() {
                    this.form.getElements('input[data-placeholder]').each(function(input) {
                        if (input.get('value').toLowerCase() == input.get('data-placeholder').toLowerCase()) {
                            input.set('value', '');
                        }
                    });
                }.bind(this)
            });
            switch (this.captchaType) {
                case 'irc':
                    {
                        options = Object.merge(options, {
                            submitByAjax: false,
                            customSubmit: true,
                            onCustomSubmit: function(ev) {
                                self.website.loadingBox(true);
                                var captchaEl = this.form.getElement('.g-recaptcha[data-wid]');
                                if (captchaEl && typeof(grecaptcha) != 'undefined') {
                                    grecaptcha.execute(captchaEl.get('data-wid'));
                                } else {
                                    self.manualFormSubmit();
                                }
                            }
                        });
                        break;
                    }
                case 'rc_v3':
                    {
                        options = Object.merge(options, {
                            submitByAjax: false,
                            customSubmit: true,
                            onCustomSubmit: function(ev) {
                                self.website.loadingBox(true);
                                grecaptcha.ready(function() {
                                    if (typeof(grecaptcha) != 'undefined' && self.captchaData && typeof(self.captchaData.sitekey) != 'undefined' && typeof(self.captchaData.action) != 'undefined') {
                                        grecaptcha.execute(self.captchaData.sitekey, {
                                            action: self.captchaData.action
                                        }).then(function(token) {
                                            new Element('input', {
                                                'type': 'hidden',
                                                'name': 'g-recaptcha-response',
                                                'value': token
                                            }).inject(self.form);
                                            self.manualFormSubmit();
                                        }).catch(function() {
                                            self.newsletterFormError();
                                        });
                                    } else {
                                        self.manualFormSubmit();
                                    }
                                });
                            }
                        });
                        break;
                    }
            }
            this.validator = new FormCheck(this.form, options);
            Object.each(this.validator.options.alerts, function(msg, idx) {
                this.validator.options.alerts[idx] = __('form_check', msg);
            }, this);
        }
        if (this.form) {
            this.form.getElements('input[data-placeholder]').each(function(input) {
                ['focus', 'blur'].each(function(value) {
                    var event = this['formInput' + value.capitalize()].bind(this, input);
                    input.store('event:formInput' + value.capitalize(), event).addEvent(value, event);
                }, this);
            }, this);
            var refreshLink = this.form.getElement('.tpl-refresh-captcha');
            if (refreshLink) {
                var event = this.refreshCaptchaClick.bind(this, refreshLink);
                refreshLink.store('event:refreshCaptchaClick', event).addEvent('click', event);
            }
        }
    },
    detach: function() {
        this.parent();
        switch (this.captchaType) {
            case 'irc':
                {
                    window['onNewsletterPopupForm' + this.id + 'Submit'] = undefined;window['onNewsletterPopupForm' + this.id + 'Error'] = undefined;
                    break;
                }
        }
        if (this.validator) {
            this.validator.detach();
        }
        if (this.form) {
            this.form.getElements('input[data-placeholder]').each(function(input) {
                ['focus', 'blur'].each(function(value) {
                    input.removeEvent(value, input.retrieve('event:formInput' + value.capitalize())).eliminate('event:formInput' + value.capitalize());
                }, this);
            }, this);
            var refreshLink = this.form.getElement('.tpl-refresh-captcha');
            if (refreshLink) {
                refreshLink.removeEvent('click', refreshLink.retrieve('event:refreshCaptchaClick')).eliminate('event:refreshCaptchaClick');
            }
        }
    },
    formInputFocus: function(input, ev) {
        if (input.get('value').toLowerCase() == input.get('data-placeholder').toLowerCase()) {
            input.set('value', '');
        }
    },
    formInputBlur: function(input, ev) {
        if (input.get('value').length == 0 || input.get('value').toLowerCase() == input.get('data-placeholder').toLowerCase()) {
            input.set('value', input.get('data-placeholder'));
        }
    },
    manualFormSubmit: function() {
        this.website.loadingBox(false);
        this.validator.submitByAjax();
    },
    newsletterFormError: function() {
        this.website.loadingBox(false);
    },
    refreshCaptchaClick: function(el, ev) {
        ev.preventDefault();
        var img = el.getParent('.tpl-form-row').getElement('.tpl-captcha-code');
        var src = (img ? img.get('src') : false);
        if (src && src.length > 0) {
            img.set('src', new URI(src).setData('rnd', Date.now()).toString());
        }
    },
    reinitialize: function(aId) {
        this.element = $(aId);
        this.element.show();
        this.form = this.element.getElement('form');
        this.validator = null;
        this.captchaType = (this.form && this.form.get('data-ct') ? this.form.get('data-ct') : false);
        this.captchaData = (this.form && this.form.get('data-cd') ? JSON.decode(this.form.get('data-cd')) : false);
        switch (this.captchaType) {
            case 'rc':
            case 'irc':
                {
                    if (!this.form) {
                        break;
                    }
                    this.form.getElements('.g-recaptcha').each(function(el) {
                        if (typeof(grecaptcha) != 'undefined' && typeof(grecaptcha.render) != 'undefined') {
                            var elData = {
                                'sitekey': el.get('data-sitekey'),
                                'callback': el.get('data-callback'),
                                'size': el.get('data-size')
                            };
                            var wId = grecaptcha.render(el, elData);
                            el.set('data-wid', wId);
                        } else {
                            this.page.queueReCaptchaElement(el);
                        }
                    }, this);this.elementResized();
                    break;
                }
        }
    }
});