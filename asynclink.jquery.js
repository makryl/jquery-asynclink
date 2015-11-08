/**
 * http://aeqdev.com/tools/js/asynclink/
 *
 * MIT License
 *
 * Copyright © 2015 Maksim Krylosov <aequiternus@gmail.com>
 */

(function($) {


    var id = 0;
    var all = {};
    var historyState = {asynclink:{}};
    var historyActive = false;
    var historySupport = !!(
        window.addEventListener
        && window.history
        && history.pushState
    );

    $.fn.asynclink = function(options) {
        var plugin = $.extend(true, $.fn.asynclink.defaults, options);
        var self = this;

        if (!plugin.id) {
            plugin.id = id++;
        }

        if (!plugin.state.url) {
            plugin.state.url = replaceUrl(location.pathname + location.search);
        }

        if (!plugin.state.target) {
            plugin.state.target = plugin.target;
        }

        plugin.rebind = rebind;
        plugin.unbind = unbind;

        all[plugin.id] = plugin;
        historyState.asynclink[plugin.id] = plugin.state;

        rebind();

        if (historySupport) {
            addEventListener('popstate', popstate, false);
        }

        function rebind() {
            plugin.links = self.find(plugin.selectorLinks)
                .unbind('click.asynclink')
                .bind('click.asynclink', onevent);

            plugin.forms = self.find(plugin.selectorForms)
                .unbind('submit.asynclink')
                .bind('submit.asynclink', onevent);
        }

        function unbind() {
            plugin.links.unbind('click.asynclink');
            plugin.forms.unbind('submit.asynclink');

            if (historySupport) {
                removeEventListener('popstate', popstate, false);
            }

            delete all[plugin.id];
            delete historyState[plugin.id];
        }

        function popstate(event) {
            if (event.state && event.state.asynclink) {
                var state = event.state.asynclink[plugin.id];
                if (state && plugin.state) {
                    if (isNotSameState(state, plugin.state)) {
                        if (!load(state)) {
                            location.reload();
                        }
                    }
                } else {
                    location.reload();
                }
            }
        }

        function onevent(event) {
            var $this = $(this);

            var state = {};

            state.target = $this.attr(plugin.attrTarget) || plugin.target;

            state.historyUrl = $this.attr('href')
                || $this.attr('action')
                || (location.pathname + location.search);

            state.url = $this.attr(plugin.attrHref)
                || $this.attr(plugin.attrAction)
                || replaceUrl(state.historyUrl);

            if (this.tagName.toLowerCase() == 'form') {
                state.method = $this.attr('method') || 'get';
                var enctype = $this.attr('enctype');
                switch (enctype) {
                    case "multipart/form-data":
                        state.data = new FormData(this);
                        state.contentType = enctype;
                        break;
                    default:
                        if (!state.method || state.method.toLowerCase() == 'get') {
                            var dataPart = $this.serialize();
                            state.url += (state.url.indexOf('?') == -1 ? '?' : '&') + dataPart;
                            state.historyUrl += (state.historyUrl.indexOf('?') == -1 ? '?' : '&') + dataPart;
                        } else {
                            state.data = $this.serialize();
                        }
                        break;
                }
            }

            if (load(state)) {
                event.preventDefault();
            }
        }

        function load(state) {
            if (!state.url) {
                return false;
            }

            var $target = state.target ? $(state.target) : self;

            if (!$target.length) {
                return false;
            }

            var ajaxSettings = $.extend({}, plugin.ajaxSettings, {
                url: state.url,
                method: state.method,
                data: state.data,
                contentType: state.contentType
            });

            if (!ajaxSettings.success) {
                ajaxSettings.success = done;
            } else if (typeof ajaxSettings.success == 'function') {
                ajaxSettings.success = [
                    done,
                    ajaxSettings.success
                ];
            } else {
                ajaxSettings.success.unshift(done);
            }

            if (historySupport && !historyActive) {
                history.replaceState(historyState, null, location);
                historyActive = true;
            }

            $.ajax(ajaxSettings);

            function done(html) {
                $target.html(html);
                rebind();

                var historyUrl = state.historyUrl;
                delete state.historyUrl;
                delete state.data;
                plugin.state = state;
                historyState.asynclink[plugin.id] = state;

                if (
                    historySupport
                    && historyUrl
                    && '#' !== historyUrl[0]
                    && (!state.method || state.method.toLowerCase() != 'post')
                ) {
                    history.pushState(historyState, null, historyUrl);
                }
            }

            return true;
        }

        function isNotSameState(state1, state2) {
            return state1.url != state2.url
                || state1.target != state2.target
                || state1.method != state2.method
            ;
        }

        function replaceUrl(url) {
            return plugin.replaceUrlCallback
                ? plugin.replaceUrlCallback(url)
                : url;
        }

        return this;
    };

    $.fn.asynclink.defaults = {
        id: null,
        selectorLinks: 'a[href^="/"],*[al-href^="/"]',
        selectorForms: 'form[action^="/"],form[al-action^="/"],form:not([action])',
        state: {},
        target: null,
        ajaxSettings: {},
        replaceUrlCallback: null,
        attrTarget: 'al-target',
        attrHref: 'al-href',
        attrAction: 'al-action'
    };

    $.asynclink = {
        rebind: staticOne('rebind'),
        unbind: staticOne('unbind'),
        rebindAll: staticAll('rebind'),
        unbindAll: staticAll('unbind')
    };

    function staticOne(method) {
        return function(id) {
            all[id || 0][method]();
        };
    }

    function staticAll(method) {
        return function() {
            for (id in all) {
                if (all.hasOwnProperty(id)) {
                    all[id][method]();
                }
            }
        };
    }

}(jQuery));
