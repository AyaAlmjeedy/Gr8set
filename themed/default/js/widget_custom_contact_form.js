/**
 * Controls the user interface elements of the custom contact form widget.
 *
 * @class
 * @author	Zielezinski Zbigniew
 */
var CustomContactFormWidget = new Class({
    Extends: LayoutWidget,
    /**
     * Widget settings.
     *
     * @type Object
     */
    options: {
        name: 'Custom contact form', //human readable widget name
        short_name: 'custom_contact_form', //underscored name used in the path to the widget
        dropdown: true //specifies if the dropdown appears after the edit button is clicked
    },
    /**
     * Constructs and initializes the CustomContactFormWidget class.
     *
     * @param {String} wId Identifier of the widget box.
     * @param {Object} options Widget settings.
     * @constructs
     */
    initialize: function(wId, options) {
        this.parent(wId, options);
        this.create.delay(1, this); //delay required to make the 'website' variable present
    },
    /**
     * Creates an additional content.
     */
    create: function() {
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
    },
    /**
     * Initializes an additional variables.
     */
    initVariables: function() {
        this.parent();

        this.form = this.element.getElement('form');
        this.validator = null;
    },
    /**
     * Adds events to the widget elements.
     */
    attach: function() {
        this.parent();

        window['onCustomContactForm' + this.id + 'Submit'] = this.manualFormSubmit.bind(this);

        if (this.validator) {
            this.validator.attach();
        } else if (this.form && typeof(window['FormCheck']) != 'undefined') {
            var customElAlerts = {};
            customElAlerts['ContactFormName_' + this.id] = __('form_check', 'Please enter a valid name.');
            customElAlerts['ContactFormEmail_' + this.id] = __('form_check', 'Please enter a valid e-mail.');
            customElAlerts['ContactFormPhone_' + this.id] = __('form_check', 'Please enter a valid phone number.');
            customElAlerts['ContactFormMessage_' + this.id] = __('form_check', 'Please enter a message.');
            customElAlerts['ContactFormCaptchaCode_' + this.id] = __('form_check', 'Please enter the text from the picture.');

            var self = this;
            var msgBox = this.element.getElement('.tpl-message');
            var options = Object.merge(this.getValidatorOptions(), {
                display: {
                    errorsListContainer: msgBox,
                    customElAlerts: customElAlerts
                },
                customSubmit: true,
                onCustomSubmit: function(ev) {
                    var captchaEl = this.form.getElement('.g-recaptcha[data-wid]');

                    if (captchaEl && typeof(grecaptcha) != 'undefined') {
                        grecaptcha.execute(captchaEl.get('data-wid'));
                    } else {
                        this.form.submit();
                    }
                }
            });
            this.validator = new FormCheck(this.form, options);
            Object.each(this.validator.options.alerts, function(msg, idx) {
                this.validator.options.alerts[idx] = __('form_check', msg);
            }, this);
        }
    },
    /**
     * Removes events from the widget elements.
     */
    detach: function() {
        this.parent();

        if (this.validator) {
            this.validator.detach();
        }
    },
    /**
     * Manually submits the contact form.
     */
    manualFormSubmit: function() {
        this.form.submit();
    }
});