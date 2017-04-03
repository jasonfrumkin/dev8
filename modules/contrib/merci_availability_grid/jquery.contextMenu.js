/*!
 * jQuery contextMenu - Plugin for simple contextMenu handling
 *
 * Version: 1.6.6
 *
 * Authors: Rodney Rehm, Addy Osmani (patches for FF)
 * Web: http://medialize.github.com/jQuery-contextMenu/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *   GPL v3 http://opensource.org/licenses/GPL-3.0
 *
 */

(function(jQuery, undefined){

    // TODO: -
        // ARIA stuff: menuitem, menuitemcheckbox und menuitemradio
        // create <menu> structure if jQuery.support[htmlCommand || htmlMenuitem] and !opt.disableNative

// determine html5 compatibility
jQuery.support.htmlMenuitem = ('HTMLMenuItemElement' in window);
jQuery.support.htmlCommand = ('HTMLCommandElement' in window);
jQuery.support.eventSelectstart = ("onselectstart" in document.documentElement);
/* // should the need arise, test for css user-select
jQuery.support.cssUserSelect = (function(){
    var t = false,
        e = document.createElement('div');

    jQuery.each('Moz|Webkit|Khtml|O|ms|Icab|'.split('|'), function(i, prefix) {
        var propCC = prefix + (prefix ? 'U' : 'u') + 'serSelect',
            prop = (prefix ? ('-' + prefix.toLowerCase() + '-') : '') + 'user-select';

        e.style.cssText = prop + ': text;';
        if (e.style[propCC] == 'text') {
            t = true;
            return false;
        }

        return true;
    });

    return t;
})();
*/

if (!jQuery.ui || !jQuery.ui.widget) {
    // duck punch jQuery.cleanData like jQueryUI does to get that remove event
    // https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js#L16-24
    var _cleanData = jQuery.cleanData;
    jQuery.cleanData = function( elems ) {
        for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
            try {
                jQuery( elem ).triggerHandler( "remove" );
                // http://bugs.jquery.com/ticket/8235
            } catch( e ) {}
        }
        _cleanData( elems );
    };
}

var // currently active contextMenu trigger
    jQuerycurrentTrigger = null,
    // is contextMenu initialized with at least one menu?
    initialized = false,
    // window handle
    jQuerywin = jQuery(window),
    // number of registered menus
    counter = 0,
    // mapping selector to namespace
    namespaces = {},
    // mapping namespace to options
    menus = {},
    // custom command type handlers
    types = {},
    // default values
    defaults = {
        // selector of contextMenu trigger
        selector: null,
        // where to append the menu to
        appendTo: null,
        // method to trigger context menu ["right", "left", "hover"]
        trigger: "right",
        // hide menu when mouse leaves trigger / menu elements
        autoHide: false,
        // ms to wait before showing a hover-triggered context menu
        delay: 200,
        // flag denoting if a second trigger should simply move (true) or rebuild (false) an open menu
        // as long as the trigger happened on one of the trigger-element's child nodes
        reposition: true,
        // determine position to show menu at
        determinePosition: function(jQuerymenu) {
            // position to the lower middle of the trigger element
            if (jQuery.ui && jQuery.ui.position) {
                // .position() is provided as a jQuery UI utility
                // (...and it won't work on hidden elements)
                jQuerymenu.css('display', 'block').position({
                    my: "center top",
                    at: "center bottom",
                    of: this,
                    offset: "0 5",
                    collision: "fit"
                }).css('display', 'none');
            } else {
                // determine contextMenu position
                var offset = this.offset();
                offset.top += this.outerHeight();
                offset.left += this.outerWidth() / 2 - jQuerymenu.outerWidth() / 2;
                jQuerymenu.css(offset);
            }
        },
        // position menu
        position: function(opt, x, y) {
            var jQuerythis = this,
                offset;
            // determine contextMenu position
            if (!x && !y) {
                opt.determinePosition.call(this, opt.jQuerymenu);
                return;
            } else if (x === "maintain" && y === "maintain") {
                // x and y must not be changed (after re-show on command click)
                offset = opt.jQuerymenu.position();
            } else {
                // x and y are given (by mouse event)
                offset = {top: y, left: x};
            }

            // correct offset if viewport demands it
            var bottom = jQuerywin.scrollTop() + jQuerywin.height(),
                right = jQuerywin.scrollLeft() + jQuerywin.width(),
                height = opt.jQuerymenu.height(),
                width = opt.jQuerymenu.width();

            if (offset.top + height > bottom) {
                offset.top -= height;
            }

            if (offset.left + width > right) {
                offset.left -= width;
            }

            opt.jQuerymenu.css(offset);
        },
        // position the sub-menu
        positionSubmenu: function(jQuerymenu) {
            if (jQuery.ui && jQuery.ui.position) {
                // .position() is provided as a jQuery UI utility
                // (...and it won't work on hidden elements)
                jQuerymenu.css('display', 'block').position({
                    my: "left top",
                    at: "right top",
                    of: this,
                    collision: "flipfit fit"
                }).css('display', '');
            } else {
                // determine contextMenu position
                var offset = {
                    top: 0,
                    left: this.outerWidth()
                };
                jQuerymenu.css(offset);
            }
        },
        // offset to add to zIndex
        zIndex: 1,
        // show hide animation settings
        animation: {
            duration: 50,
            show: 'slideDown',
            hide: 'slideUp'
        },
        // events
        events: {
            show: jQuery.noop,
            hide: jQuery.noop
        },
        // default callback
        callback: null,
        // list of contextMenu items
        items: {}
    },
    // mouse position for hover activation
    hoveract = {
        timer: null,
        pageX: null,
        pageY: null
    },
    // determine zIndex
    zindex = function(jQueryt) {
        var zin = 0,
            jQuerytt = jQueryt;

        while (true) {
            zin = Math.max(zin, parseInt(jQuerytt.css('z-index'), 10) || 0);
            jQuerytt = jQuerytt.parent();
            if (!jQuerytt || !jQuerytt.length || "html body".indexOf(jQuerytt.prop('nodeName').toLowerCase()) > -1 ) {
                break;
            }
        }

        return zin;
    },
    // event handlers
    handle = {
        // abort anything
        abortevent: function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        // contextmenu show dispatcher
        contextmenu: function(e) {
            var jQuerythis = jQuery(this);

            // disable actual context-menu
            e.preventDefault();
            e.stopImmediatePropagation();

            // abort native-triggered events unless we're triggering on right click
            if (e.data.trigger != 'right' && e.originalEvent) {
                return;
            }

            // abort event if menu is visible for this trigger
            if (jQuerythis.hasClass('context-menu-active')) {
                return;
            }

            if (!jQuerythis.hasClass('context-menu-disabled')) {
                // theoretically need to fire a show event at <menu>
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#context-menus
                // var evt = jQuery.Event("show", { data: data, pageX: e.pageX, pageY: e.pageY, relatedTarget: this });
                // e.data.jQuerymenu.trigger(evt);

                jQuerycurrentTrigger = jQuerythis;
                if (e.data.build) {
                    var built = e.data.build(jQuerycurrentTrigger, e);
                    // abort if build() returned false
                    if (built === false) {
                        return;
                    }

                    // dynamically build menu on invocation
                    e.data = jQuery.extend(true, {}, defaults, e.data, built || {});

                    // abort if there are no items to display
                    if (!e.data.items || jQuery.isEmptyObject(e.data.items)) {
                        // Note: jQuery captures and ignores errors from event handlers
                        if (window.console) {
                            (console.error || console.log)("No items specified to show in contextMenu");
                        }

                        throw new Error('No Items specified');
                    }

                    // backreference for custom command type creation
                    e.data.jQuerytrigger = jQuerycurrentTrigger;

                    op.create(e.data);
                }
                // show menu
                op.show.call(jQuerythis, e.data, e.pageX, e.pageY);
            }
        },
        // contextMenu left-click trigger
        click: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            jQuery(this).trigger(jQuery.Event("contextmenu", { data: e.data, pageX: e.pageX, pageY: e.pageY }));
        },
        // contextMenu right-click trigger
        mousedown: function(e) {
            // register mouse down
            var jQuerythis = jQuery(this);

            // hide any previous menus
            if (jQuerycurrentTrigger && jQuerycurrentTrigger.length && !jQuerycurrentTrigger.is(jQuerythis)) {
                jQuerycurrentTrigger.data('contextMenu').jQuerymenu.trigger('contextmenu:hide');
            }

            // activate on right click
            if (e.button == 2) {
                jQuerycurrentTrigger = jQuerythis.data('contextMenuActive', true);
            }
        },
        // contextMenu right-click trigger
        mouseup: function(e) {
            // show menu
            var jQuerythis = jQuery(this);
            if (jQuerythis.data('contextMenuActive') && jQuerycurrentTrigger && jQuerycurrentTrigger.length && jQuerycurrentTrigger.is(jQuerythis) && !jQuerythis.hasClass('context-menu-disabled')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                jQuerycurrentTrigger = jQuerythis;
                jQuerythis.trigger(jQuery.Event("contextmenu", { data: e.data, pageX: e.pageX, pageY: e.pageY }));
            }

            jQuerythis.removeData('contextMenuActive');
        },
        // contextMenu hover trigger
        mouseenter: function(e) {
            var jQuerythis = jQuery(this),
                jQueryrelated = jQuery(e.relatedTarget),
                jQuerydocument = jQuery(document);

            // abort if we're coming from a menu
            if (jQueryrelated.is('.context-menu-list') || jQueryrelated.closest('.context-menu-list').length) {
                return;
            }

            // abort if a menu is shown
            if (jQuerycurrentTrigger && jQuerycurrentTrigger.length) {
                return;
            }

            hoveract.pageX = e.pageX;
            hoveract.pageY = e.pageY;
            hoveract.data = e.data;
            jQuerydocument.on('mousemove.contextMenuShow', handle.mousemove);
            hoveract.timer = setTimeout(function() {
                hoveract.timer = null;
                jQuerydocument.off('mousemove.contextMenuShow');
                jQuerycurrentTrigger = jQuerythis;
                jQuerythis.trigger(jQuery.Event("contextmenu", { data: hoveract.data, pageX: hoveract.pageX, pageY: hoveract.pageY }));
            }, e.data.delay );
        },
        // contextMenu hover trigger
        mousemove: function(e) {
            hoveract.pageX = e.pageX;
            hoveract.pageY = e.pageY;
        },
        // contextMenu hover trigger
        mouseleave: function(e) {
            // abort if we're leaving for a menu
            var jQueryrelated = jQuery(e.relatedTarget);
            if (jQueryrelated.is('.context-menu-list') || jQueryrelated.closest('.context-menu-list').length) {
                return;
            }

            try {
                clearTimeout(hoveract.timer);
            } catch(e) {}

            hoveract.timer = null;
        },

        // click on layer to hide contextMenu
        layerClick: function(e) {
            var jQuerythis = jQuery(this),
                root = jQuerythis.data('contextMenuRoot'),
                mouseup = false,
                button = e.button,
                x = e.pageX,
                y = e.pageY,
                target,
                offset,
                selectors;

            e.preventDefault();
            e.stopImmediatePropagation();

            setTimeout(function() {
                var jQuerywindow, hideshow, possibleTarget;
                var triggerAction = ((root.trigger == 'left' && button === 0) || (root.trigger == 'right' && button === 2));

                // find the element that would've been clicked, wasn't the layer in the way
                if (document.elementFromPoint) {
                    root.jQuerylayer.hide();
                    target = document.elementFromPoint(x - jQuerywin.scrollLeft(), y - jQuerywin.scrollTop());
                    root.jQuerylayer.show();
                }

                if (root.reposition && triggerAction) {
                    if (document.elementFromPoint) {
                        if (root.jQuerytrigger.is(target) || root.jQuerytrigger.has(target).length) {
                            root.position.call(root.jQuerytrigger, root, x, y);
                            return;
                        }
                    } else {
                        offset = root.jQuerytrigger.offset();
                        jQuerywindow = jQuery(window);
                        // while this looks kinda awful, it's the best way to avoid
                        // unnecessarily calculating any positions
                        offset.top += jQuerywindow.scrollTop();
                        if (offset.top <= e.pageY) {
                            offset.left += jQuerywindow.scrollLeft();
                            if (offset.left <= e.pageX) {
                                offset.bottom = offset.top + root.jQuerytrigger.outerHeight();
                                if (offset.bottom >= e.pageY) {
                                    offset.right = offset.left + root.jQuerytrigger.outerWidth();
                                    if (offset.right >= e.pageX) {
                                        // reposition
                                        root.position.call(root.jQuerytrigger, root, x, y);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }

                if (target && triggerAction) {
                    root.jQuerytrigger.one('contextmenu:hidden', function() {
                        jQuery(target).contextMenu({x: x, y: y});
                    });
                }

                root.jQuerymenu.trigger('contextmenu:hide');
            }, 50);
        },
        // key handled :hover
        keyStop: function(e, opt) {
            if (!opt.isInput) {
                e.preventDefault();
            }

            e.stopPropagation();
        },
        key: function(e) {
            var opt = jQuerycurrentTrigger.data('contextMenu') || {};

            switch (e.keyCode) {
                case 9:
                case 38: // up
                    handle.keyStop(e, opt);
                    // if keyCode is [38 (up)] or [9 (tab) with shift]
                    if (opt.isInput) {
                        if (e.keyCode == 9 && e.shiftKey) {
                            e.preventDefault();
                            opt.jQueryselected && opt.jQueryselected.find('input, textarea, select').blur();
                            opt.jQuerymenu.trigger('prevcommand');
                            return;
                        } else if (e.keyCode == 38 && opt.jQueryselected.find('input, textarea, select').prop('type') == 'checkbox') {
                            // checkboxes don't capture this key
                            e.preventDefault();
                            return;
                        }
                    } else if (e.keyCode != 9 || e.shiftKey) {
                        opt.jQuerymenu.trigger('prevcommand');
                        return;
                    }
                    // omitting break;

                // case 9: // tab - reached through omitted break;
                case 40: // down
                    handle.keyStop(e, opt);
                    if (opt.isInput) {
                        if (e.keyCode == 9) {
                            e.preventDefault();
                            opt.jQueryselected && opt.jQueryselected.find('input, textarea, select').blur();
                            opt.jQuerymenu.trigger('nextcommand');
                            return;
                        } else if (e.keyCode == 40 && opt.jQueryselected.find('input, textarea, select').prop('type') == 'checkbox') {
                            // checkboxes don't capture this key
                            e.preventDefault();
                            return;
                        }
                    } else {
                        opt.jQuerymenu.trigger('nextcommand');
                        return;
                    }
                    break;

                case 37: // left
                    handle.keyStop(e, opt);
                    if (opt.isInput || !opt.jQueryselected || !opt.jQueryselected.length) {
                        break;
                    }

                    if (!opt.jQueryselected.parent().hasClass('context-menu-root')) {
                        var jQueryparent = opt.jQueryselected.parent().parent();
                        opt.jQueryselected.trigger('contextmenu:blur');
                        opt.jQueryselected = jQueryparent;
                        return;
                    }
                    break;

                case 39: // right
                    handle.keyStop(e, opt);
                    if (opt.isInput || !opt.jQueryselected || !opt.jQueryselected.length) {
                        break;
                    }

                    var itemdata = opt.jQueryselected.data('contextMenu') || {};
                    if (itemdata.jQuerymenu && opt.jQueryselected.hasClass('context-menu-submenu')) {
                        opt.jQueryselected = null;
                        itemdata.jQueryselected = null;
                        itemdata.jQuerymenu.trigger('nextcommand');
                        return;
                    }
                    break;

                case 35: // end
                case 36: // home
                    if (opt.jQueryselected && opt.jQueryselected.find('input, textarea, select').length) {
                        return;
                    } else {
                        (opt.jQueryselected && opt.jQueryselected.parent() || opt.jQuerymenu)
                            .children(':not(.disabled, .not-selectable)')[e.keyCode == 36 ? 'first' : 'last']()
                            .trigger('contextmenu:focus');
                        e.preventDefault();
                        return;
                    }
                    break;

                case 13: // enter
                    handle.keyStop(e, opt);
                    if (opt.isInput) {
                        if (opt.jQueryselected && !opt.jQueryselected.is('textarea, select')) {
                            e.preventDefault();
                            return;
                        }
                        break;
                    }
                    opt.jQueryselected && opt.jQueryselected.trigger('mouseup');
                    return;

                case 32: // space
                case 33: // page up
                case 34: // page down
                    // prevent browser from scrolling down while menu is visible
                    handle.keyStop(e, opt);
                    return;

                case 27: // esc
                    handle.keyStop(e, opt);
                    opt.jQuerymenu.trigger('contextmenu:hide');
                    return;

                default: // 0-9, a-z
                    var k = (String.fromCharCode(e.keyCode)).toUpperCase();
                    if (opt.accesskeys[k]) {
                        // according to the specs accesskeys must be invoked immediately
                        opt.accesskeys[k].jQuerynode.trigger(opt.accesskeys[k].jQuerymenu
                            ? 'contextmenu:focus'
                            : 'mouseup'
                        );
                        return;
                    }
                    break;
            }
            // pass event to selected item,
            // stop propagation to avoid endless recursion
            e.stopPropagation();
            opt.jQueryselected && opt.jQueryselected.trigger(e);
        },

        // select previous possible command in menu
        prevItem: function(e) {
            e.stopPropagation();
            var opt = jQuery(this).data('contextMenu') || {};

            // obtain currently selected menu
            if (opt.jQueryselected) {
                var jQuerys = opt.jQueryselected;
                opt = opt.jQueryselected.parent().data('contextMenu') || {};
                opt.jQueryselected = jQuerys;
            }

            var jQuerychildren = opt.jQuerymenu.children(),
                jQueryprev = !opt.jQueryselected || !opt.jQueryselected.prev().length ? jQuerychildren.last() : opt.jQueryselected.prev(),
                jQueryround = jQueryprev;

            // skip disabled
            while (jQueryprev.hasClass('disabled') || jQueryprev.hasClass('not-selectable')) {
                if (jQueryprev.prev().length) {
                    jQueryprev = jQueryprev.prev();
                } else {
                    jQueryprev = jQuerychildren.last();
                }
                if (jQueryprev.is(jQueryround)) {
                    // break endless loop
                    return;
                }
            }

            // leave current
            if (opt.jQueryselected) {
                handle.itemMouseleave.call(opt.jQueryselected.get(0), e);
            }

            // activate next
            handle.itemMouseenter.call(jQueryprev.get(0), e);

            // focus input
            var jQueryinput = jQueryprev.find('input, textarea, select');
            if (jQueryinput.length) {
                jQueryinput.focus();
            }
        },
        // select next possible command in menu
        nextItem: function(e) {
            e.stopPropagation();
            var opt = jQuery(this).data('contextMenu') || {};

            // obtain currently selected menu
            if (opt.jQueryselected) {
                var jQuerys = opt.jQueryselected;
                opt = opt.jQueryselected.parent().data('contextMenu') || {};
                opt.jQueryselected = jQuerys;
            }

            var jQuerychildren = opt.jQuerymenu.children(),
                jQuerynext = !opt.jQueryselected || !opt.jQueryselected.next().length ? jQuerychildren.first() : opt.jQueryselected.next(),
                jQueryround = jQuerynext;

            // skip disabled
            while (jQuerynext.hasClass('disabled') || jQuerynext.hasClass('not-selectable')) {
                if (jQuerynext.next().length) {
                    jQuerynext = jQuerynext.next();
                } else {
                    jQuerynext = jQuerychildren.first();
                }
                if (jQuerynext.is(jQueryround)) {
                    // break endless loop
                    return;
                }
            }

            // leave current
            if (opt.jQueryselected) {
                handle.itemMouseleave.call(opt.jQueryselected.get(0), e);
            }

            // activate next
            handle.itemMouseenter.call(jQuerynext.get(0), e);

            // focus input
            var jQueryinput = jQuerynext.find('input, textarea, select');
            if (jQueryinput.length) {
                jQueryinput.focus();
            }
        },

        // flag that we're inside an input so the key handler can act accordingly
        focusInput: function(e) {
            var jQuerythis = jQuery(this).closest('.context-menu-item'),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            root.jQueryselected = opt.jQueryselected = jQuerythis;
            root.isInput = opt.isInput = true;
        },
        // flag that we're inside an input so the key handler can act accordingly
        blurInput: function(e) {
            var jQuerythis = jQuery(this).closest('.context-menu-item'),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            root.isInput = opt.isInput = false;
        },

        // :hover on menu
        menuMouseenter: function(e) {
            var root = jQuery(this).data().contextMenuRoot;
            root.hovering = true;
        },
        // :hover on menu
        menuMouseleave: function(e) {
            var root = jQuery(this).data().contextMenuRoot;
            if (root.jQuerylayer && root.jQuerylayer.is(e.relatedTarget)) {
                root.hovering = false;
            }
        },

        // :hover done manually so key handling is possible
        itemMouseenter: function(e) {
            var jQuerythis = jQuery(this),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            root.hovering = true;

            // abort if we're re-entering
            if (e && root.jQuerylayer && root.jQuerylayer.is(e.relatedTarget)) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }

            // make sure only one item is selected
            (opt.jQuerymenu ? opt : root).jQuerymenu
                .children('.hover').trigger('contextmenu:blur');

            if (jQuerythis.hasClass('disabled') || jQuerythis.hasClass('not-selectable')) {
                opt.jQueryselected = null;
                return;
            }

            jQuerythis.trigger('contextmenu:focus');
        },
        // :hover done manually so key handling is possible
        itemMouseleave: function(e) {
            var jQuerythis = jQuery(this),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            if (root !== opt && root.jQuerylayer && root.jQuerylayer.is(e.relatedTarget)) {
                root.jQueryselected && root.jQueryselected.trigger('contextmenu:blur');
                e.preventDefault();
                e.stopImmediatePropagation();
                root.jQueryselected = opt.jQueryselected = opt.jQuerynode;
                return;
            }

            jQuerythis.trigger('contextmenu:blur');
        },
        // contextMenu item click
        itemClick: function(e) {
            var jQuerythis = jQuery(this),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot,
                key = data.contextMenuKey,
                callback;

            // abort if the key is unknown or disabled or is a menu
            if (!opt.items[key] || jQuerythis.is('.disabled, .context-menu-submenu, .context-menu-separator, .not-selectable')) {
                return;
            }

            e.preventDefault();
            e.stopImmediatePropagation();

            if (jQuery.isFunction(root.callbacks[key]) && Object.prototype.hasOwnProperty.call(root.callbacks, key)) {
                // item-specific callback
                callback = root.callbacks[key];
            } else if (jQuery.isFunction(root.callback)) {
                // default callback
                callback = root.callback;
            } else {
                // no callback, no action
                return;
            }

            // hide menu if callback doesn't stop that
            if (callback.call(root.jQuerytrigger, key, root) !== false) {
                root.jQuerymenu.trigger('contextmenu:hide');
            } else if (root.jQuerymenu.parent().length) {
                op.update.call(root.jQuerytrigger, root);
            }
        },
        // ignore click events on input elements
        inputClick: function(e) {
            e.stopImmediatePropagation();
        },

        // hide <menu>
        hideMenu: function(e, data) {
            var root = jQuery(this).data('contextMenuRoot');
            op.hide.call(root.jQuerytrigger, root, data && data.force);
        },
        // focus <command>
        focusItem: function(e) {
            e.stopPropagation();
            var jQuerythis = jQuery(this),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            jQuerythis.addClass('hover')
                .siblings('.hover').trigger('contextmenu:blur');

            // remember selected
            opt.jQueryselected = root.jQueryselected = jQuerythis;

            // position sub-menu - do after show so dumb jQuery.ui.position can keep up
            if (opt.jQuerynode) {
                root.positionSubmenu.call(opt.jQuerynode, opt.jQuerymenu);
            }
        },
        // blur <command>
        blurItem: function(e) {
            e.stopPropagation();
            var jQuerythis = jQuery(this),
                data = jQuerythis.data(),
                opt = data.contextMenu,
                root = data.contextMenuRoot;

            jQuerythis.removeClass('hover');
            opt.jQueryselected = null;
        }
    },
    // operations
    op = {
        show: function(opt, x, y) {
            var jQuerytrigger = jQuery(this),
                offset,
                css = {};

            // hide any open menus
            jQuery('#context-menu-layer').trigger('mousedown');

            // backreference for callbacks
            opt.jQuerytrigger = jQuerytrigger;

            // show event
            if (opt.events.show.call(jQuerytrigger, opt) === false) {
                jQuerycurrentTrigger = null;
                return;
            }

            // create or update context menu
            op.update.call(jQuerytrigger, opt);

            // position menu
            opt.position.call(jQuerytrigger, opt, x, y);

            // make sure we're in front
            if (opt.zIndex) {
                css.zIndex = zindex(jQuerytrigger) + opt.zIndex;
            }

            // add layer
            op.layer.call(opt.jQuerymenu, opt, css.zIndex);

            // adjust sub-menu zIndexes
            opt.jQuerymenu.find('ul').css('zIndex', css.zIndex + 1);

            // position and show context menu
            opt.jQuerymenu.css( css )[opt.animation.show](opt.animation.duration, function() {
                jQuerytrigger.trigger('contextmenu:visible');
            });
            // make options available and set state
            jQuerytrigger
                .data('contextMenu', opt)
                .addClass("context-menu-active");

            // register key handler
            jQuery(document).off('keydown.contextMenu').on('keydown.contextMenu', handle.key);
            // register autoHide handler
            if (opt.autoHide) {
                // mouse position handler
                jQuery(document).on('mousemove.contextMenuAutoHide', function(e) {
                    // need to capture the offset on mousemove,
                    // since the page might've been scrolled since activation
                    var pos = jQuerytrigger.offset();
                    pos.right = pos.left + jQuerytrigger.outerWidth();
                    pos.bottom = pos.top + jQuerytrigger.outerHeight();

                    if (opt.jQuerylayer && !opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
                        // if mouse in menu...
                        opt.jQuerymenu.trigger('contextmenu:hide');
                    }
                });
            }
        },
        hide: function(opt, force) {
            var jQuerytrigger = jQuery(this);
            if (!opt) {
                opt = jQuerytrigger.data('contextMenu') || {};
            }

            // hide event
            if (!force && opt.events && opt.events.hide.call(jQuerytrigger, opt) === false) {
                return;
            }

            // remove options and revert state
            jQuerytrigger
                .removeData('contextMenu')
                .removeClass("context-menu-active");

            if (opt.jQuerylayer) {
                // keep layer for a bit so the contextmenu event can be aborted properly by opera
                setTimeout((function(jQuerylayer) {
                    return function(){
                        jQuerylayer.remove();
                    };
                })(opt.jQuerylayer), 10);

                try {
                    delete opt.jQuerylayer;
                } catch(e) {
                    opt.jQuerylayer = null;
                }
            }

            // remove handle
            jQuerycurrentTrigger = null;
            // remove selected
            opt.jQuerymenu.find('.hover').trigger('contextmenu:blur');
            opt.jQueryselected = null;
            // unregister key and mouse handlers
            //jQuery(document).off('.contextMenuAutoHide keydown.contextMenu'); // http://bugs.jquery.com/ticket/10705
            jQuery(document).off('.contextMenuAutoHide').off('keydown.contextMenu');
            // hide menu
            opt.jQuerymenu && opt.jQuerymenu[opt.animation.hide](opt.animation.duration, function (){
                // tear down dynamically built menu after animation is completed.
                if (opt.build) {
                    opt.jQuerymenu.remove();
                    jQuery.each(opt, function(key, value) {
                        switch (key) {
                            case 'ns':
                            case 'selector':
                            case 'build':
                            case 'trigger':
                                return true;

                            default:
                                opt[key] = undefined;
                                try {
                                    delete opt[key];
                                } catch (e) {}
                                return true;
                        }
                    });
                }

                setTimeout(function() {
                    jQuerytrigger.trigger('contextmenu:hidden');
                }, 10);
            });
        },
        create: function(opt, root) {
            if (root === undefined) {
                root = opt;
            }
            // create contextMenu
            opt.jQuerymenu = jQuery('<ul class="context-menu-list"></ul>').addClass(opt.className || "").data({
                'contextMenu': opt,
                'contextMenuRoot': root
            });

            jQuery.each(['callbacks', 'commands', 'inputs'], function(i,k){
                opt[k] = {};
                if (!root[k]) {
                    root[k] = {};
                }
            });

            root.accesskeys || (root.accesskeys = {});

            // create contextMenu items
            jQuery.each(opt.items, function(key, item){
                var jQueryt = jQuery('<li class="context-menu-item"></li>').addClass(item.className || ""),
                    jQuerylabel = null,
                    jQueryinput = null;

                // iOS needs to see a click-event bound to an element to actually
                // have the TouchEvents infrastructure trigger the click event
                jQueryt.on('click', jQuery.noop);

                item.jQuerynode = jQueryt.data({
                    'contextMenu': opt,
                    'contextMenuRoot': root,
                    'contextMenuKey': key
                });

                // register accesskey
                // NOTE: the accesskey attribute should be applicable to any element, but Safari5 and Chrome13 still can't do that
                if (item.accesskey) {
                    var aks = splitAccesskey(item.accesskey);
                    for (var i=0, ak; ak = aks[i]; i++) {
                        if (!root.accesskeys[ak]) {
                            root.accesskeys[ak] = item;
                            item._name = item.name.replace(new RegExp('(' + ak + ')', 'i'), '<span class="context-menu-accesskey">jQuery1</span>');
                            break;
                        }
                    }
                }

                if (typeof item == "string") {
                    jQueryt.addClass('context-menu-separator not-selectable');
                } else if (item.type && types[item.type]) {
                    // run custom type handler
                    types[item.type].call(jQueryt, item, opt, root);
                    // register commands
                    jQuery.each([opt, root], function(i,k){
                        k.commands[key] = item;
                        if (jQuery.isFunction(item.callback)) {
                            k.callbacks[key] = item.callback;
                        }
                    });
                } else {
                    // add label for input
                    if (item.type == 'html') {
                        jQueryt.addClass('context-menu-html not-selectable');
                    } else if (item.type) {
                        jQuerylabel = jQuery('<label></label>').appendTo(jQueryt);
                        jQuery('<span></span>').html(item._name || item.name).appendTo(jQuerylabel);
                        jQueryt.addClass('context-menu-input');
                        opt.hasTypes = true;
                        jQuery.each([opt, root], function(i,k){
                            k.commands[key] = item;
                            k.inputs[key] = item;
                        });
                    } else if (item.items) {
                        item.type = 'sub';
                    }

                    switch (item.type) {
                        case 'text':
                            jQueryinput = jQuery('<input type="text" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .appendTo(jQuerylabel);
                            break;

                        case 'textarea':
                            jQueryinput = jQuery('<textarea name=""></textarea>')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .appendTo(jQuerylabel);

                            if (item.height) {
                                jQueryinput.height(item.height);
                            }
                            break;

                        case 'checkbox':
                            jQueryinput = jQuery('<input type="checkbox" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + key)
                                .val(item.value || "")
                                .prop("checked", !!item.selected)
                                .prependTo(jQuerylabel);
                            break;

                        case 'radio':
                            jQueryinput = jQuery('<input type="radio" value="1" name="" value="">')
                                .attr('name', 'context-menu-input-' + item.radio)
                                .val(item.value || "")
                                .prop("checked", !!item.selected)
                                .prependTo(jQuerylabel);
                            break;

                        case 'select':
                            jQueryinput = jQuery('<select name="">')
                                .attr('name', 'context-menu-input-' + key)
                                .appendTo(jQuerylabel);
                            if (item.options) {
                                jQuery.each(item.options, function(value, text) {
                                    jQuery('<option></option>').val(value).text(text).appendTo(jQueryinput);
                                });
                                jQueryinput.val(item.selected);
                            }
                            break;

                        case 'sub':
                            // FIXME: shouldn't this .html() be a .text()?
                            jQuery('<span></span>').html(item._name || item.name).appendTo(jQueryt);
                            item.appendTo = item.jQuerynode;
                            op.create(item, root);
                            jQueryt.data('contextMenu', item).addClass('context-menu-submenu');
                            item.callback = null;
                            break;

                        case 'html':
                            jQuery(item.html).appendTo(jQueryt);
                            break;

                        default:
                            jQuery.each([opt, root], function(i,k){
                                k.commands[key] = item;
                                if (jQuery.isFunction(item.callback)) {
                                    k.callbacks[key] = item.callback;
                                }
                            });
                            // FIXME: shouldn't this .html() be a .text()?
                            jQuery('<span></span>').html(item._name || item.name || "").appendTo(jQueryt);
                            break;
                    }

                    // disable key listener in <input>
                    if (item.type && item.type != 'sub' && item.type != 'html') {
                        jQueryinput
                            .on('focus', handle.focusInput)
                            .on('blur', handle.blurInput);

                        if (item.events) {
                            jQueryinput.on(item.events, opt);
                        }
                    }

                    // add icons
                    if (item.icon) {
                        jQueryt.addClass("icon icon-" + item.icon);
                    }
                }

                // cache contained elements
                item.jQueryinput = jQueryinput;
                item.jQuerylabel = jQuerylabel;

                // attach item to menu
                jQueryt.appendTo(opt.jQuerymenu);

                // Disable text selection
                if (!opt.hasTypes && jQuery.support.eventSelectstart) {
                    // browsers support user-select: none,
                    // IE has a special event for text-selection
                    // browsers supporting neither will not be preventing text-selection
                    jQueryt.on('selectstart.disableTextSelect', handle.abortevent);
                }
            });
            // attach contextMenu to <body> (to bypass any possible overflow:hidden issues on parents of the trigger element)
            if (!opt.jQuerynode) {
                opt.jQuerymenu.css('display', 'none').addClass('context-menu-root');
            }
            opt.jQuerymenu.appendTo(opt.appendTo || document.body);
        },
        resize: function(jQuerymenu, nested) {
            // determine widths of submenus, as CSS won't grow them automatically
            // position:absolute within position:absolute; min-width:100; max-width:200; results in width: 100;
            // kinda sucks hard...

            // determine width of absolutely positioned element
            jQuerymenu.css({position: 'absolute', display: 'block'});
            // don't apply yet, because that would break nested elements' widths
            // add a pixel to circumvent word-break issue in IE9 - #80
            jQuerymenu.data('width', Math.ceil(jQuerymenu.width()) + 1);
            // reset styles so they allow nested elements to grow/shrink naturally
            jQuerymenu.css({
                position: 'static',
                minWidth: '0px',
                maxWidth: '100000px'
            });
            // identify width of nested menus
            jQuerymenu.find('> li > ul').each(function() {
                op.resize(jQuery(this), true);
            });
            // reset and apply changes in the end because nested
            // elements' widths wouldn't be calculatable otherwise
            if (!nested) {
                jQuerymenu.find('ul').andSelf().css({
                    position: '',
                    display: '',
                    minWidth: '',
                    maxWidth: ''
                }).width(function() {
                    return jQuery(this).data('width');
                });
            }
        },
        update: function(opt, root) {
            var jQuerytrigger = this;
            if (root === undefined) {
                root = opt;
                op.resize(opt.jQuerymenu);
            }
            // re-check disabled for each item
            opt.jQuerymenu.children().each(function(){
                var jQueryitem = jQuery(this),
                    key = jQueryitem.data('contextMenuKey'),
                    item = opt.items[key],
                    disabled = (jQuery.isFunction(item.disabled) && item.disabled.call(jQuerytrigger, key, root)) || item.disabled === true;

                // dis- / enable item
                jQueryitem[disabled ? 'addClass' : 'removeClass']('disabled');

                if (item.type) {
                    // dis- / enable input elements
                    jQueryitem.find('input, select, textarea').prop('disabled', disabled);

                    // update input states
                    switch (item.type) {
                        case 'text':
                        case 'textarea':
                            item.jQueryinput.val(item.value || "");
                            break;

                        case 'checkbox':
                        case 'radio':
                            item.jQueryinput.val(item.value || "").prop('checked', !!item.selected);
                            break;

                        case 'select':
                            item.jQueryinput.val(item.selected || "");
                            break;
                    }
                }

                if (item.jQuerymenu) {
                    // update sub-menu
                    op.update.call(jQuerytrigger, item, root);
                }
            });
        },
        layer: function(opt, zIndex) {
            // add transparent layer for click area
            // filter and background for Internet Explorer, Issue #23
            var jQuerylayer = opt.jQuerylayer = jQuery('<div id="context-menu-layer" style="position:fixed; z-index:' + zIndex + '; top:0; left:0; opacity: 0; filter: alpha(opacity=0); background-color: #000;"></div>')
                .css({height: jQuerywin.height(), width: jQuerywin.width(), display: 'block'})
                .data('contextMenuRoot', opt)
                .insertBefore(this)
                .on('contextmenu', handle.abortevent)
                .on('mousedown', handle.layerClick);

            // IE6 doesn't know position:fixed;
            if (!jQuery.support.fixedPosition) {
                jQuerylayer.css({
                    'position' : 'absolute',
                    'height' : jQuery(document).height()
                });
            }

            return jQuerylayer;
        }
    };

// split accesskey according to http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#assigned-access-key
function splitAccesskey(val) {
    var t = val.split(/\s+/),
        keys = [];

    for (var i=0, k; k = t[i]; i++) {
        k = k[0].toUpperCase(); // first character only
        // theoretically non-accessible characters should be ignored, but different systems, different keyboard layouts, ... screw it.
        // a map to look up already used access keys would be nice
        keys.push(k);
    }

    return keys;
}

// handle contextMenu triggers
jQuery.fn.contextMenu = function(operation) {
    if (operation === undefined) {
        this.first().trigger('contextmenu');
    } else if (operation.x && operation.y) {
        this.first().trigger(jQuery.Event("contextmenu", {pageX: operation.x, pageY: operation.y}));
    } else if (operation === "hide") {
        var jQuerymenu = this.data('contextMenu').jQuerymenu;
        jQuerymenu && jQuerymenu.trigger('contextmenu:hide');
    } else if (operation === "destroy") {
        jQuery.contextMenu("destroy", {context: this});
    } else if (jQuery.isPlainObject(operation)) {
        operation.context = this;
        jQuery.contextMenu("create", operation);
    } else if (operation) {
        this.removeClass('context-menu-disabled');
    } else if (!operation) {
        this.addClass('context-menu-disabled');
    }

    return this;
};

// manage contextMenu instances
jQuery.contextMenu = function(operation, options) {
    if (typeof operation != 'string') {
        options = operation;
        operation = 'create';
    }

    if (typeof options == 'string') {
        options = {selector: options};
    } else if (options === undefined) {
        options = {};
    }

    // merge with default options
    var o = jQuery.extend(true, {}, defaults, options || {});
    var jQuerydocument = jQuery(document);
    var jQuerycontext = jQuerydocument;
    var _hasContext = false;

    if (!o.context || !o.context.length) {
        o.context = document;
    } else {
        // you never know what they throw at you...
        jQuerycontext = jQuery(o.context).first();
        o.context = jQuerycontext.get(0);
        _hasContext = o.context !== document;
    }

    switch (operation) {
        case 'create':
            // no selector no joy
            if (!o.selector) {
                throw new Error('No selector specified');
            }
            // make sure internal classes are not bound to
            if (o.selector.match(/.context-menu-(list|item|input)(jQuery|\s)/)) {
                throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
            }
            if (!o.build && (!o.items || jQuery.isEmptyObject(o.items))) {
                throw new Error('No Items specified');
            }
            counter ++;
            o.ns = '.contextMenu' + counter;
            if (!_hasContext) {
                namespaces[o.selector] = o.ns;
            }
            menus[o.ns] = o;

            // default to right click
            if (!o.trigger) {
                o.trigger = 'right';
            }

            if (!initialized) {
                // make sure item click is registered first
                jQuerydocument
                    .on({
                        'contextmenu:hide.contextMenu': handle.hideMenu,
                        'prevcommand.contextMenu': handle.prevItem,
                        'nextcommand.contextMenu': handle.nextItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.menuMouseenter,
                        'mouseleave.contextMenu': handle.menuMouseleave
                    }, '.context-menu-list')
                    .on('mouseup.contextMenu', '.context-menu-input', handle.inputClick)
                    .on({
                        'mouseup.contextMenu': handle.itemClick,
                        'contextmenu:focus.contextMenu': handle.focusItem,
                        'contextmenu:blur.contextMenu': handle.blurItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.itemMouseenter,
                        'mouseleave.contextMenu': handle.itemMouseleave
                    }, '.context-menu-item');

                initialized = true;
            }

            // engage native contextmenu event
            jQuerycontext
                .on('contextmenu' + o.ns, o.selector, o, handle.contextmenu);

            if (_hasContext) {
                // add remove hook, just in case
                jQuerycontext.on('remove' + o.ns, function() {
                    jQuery(this).contextMenu("destroy");
                });
            }

            switch (o.trigger) {
                case 'hover':
                        jQuerycontext
                            .on('mouseenter' + o.ns, o.selector, o, handle.mouseenter)
                            .on('mouseleave' + o.ns, o.selector, o, handle.mouseleave);
                    break;

                case 'left':
                        jQuerycontext.on('click' + o.ns, o.selector, o, handle.click);
                    break;
                /*
                default:
                    // http://www.quirksmode.org/dom/events/contextmenu.html
                    jQuerydocument
                        .on('mousedown' + o.ns, o.selector, o, handle.mousedown)
                        .on('mouseup' + o.ns, o.selector, o, handle.mouseup);
                    break;
                */
            }

            // create menu
            if (!o.build) {
                op.create(o);
            }
            break;

        case 'destroy':
            var jQueryvisibleMenu;
            if (_hasContext) {
                // get proper options
                var context = o.context;
                jQuery.each(menus, function(ns, o) {
                    if (o.context !== context) {
                        return true;
                    }

                    jQueryvisibleMenu = jQuery('.context-menu-list').filter(':visible');
                    if (jQueryvisibleMenu.length && jQueryvisibleMenu.data().contextMenuRoot.jQuerytrigger.is(jQuery(o.context).find(o.selector))) {
                        jQueryvisibleMenu.trigger('contextmenu:hide', {force: true});
                    }

                    try {
                        if (menus[o.ns].jQuerymenu) {
                            menus[o.ns].jQuerymenu.remove();
                        }

                        delete menus[o.ns];
                    } catch(e) {
                        menus[o.ns] = null;
                    }

                    jQuery(o.context).off(o.ns);

                    return true;
                });
            } else if (!o.selector) {
                jQuerydocument.off('.contextMenu .contextMenuAutoHide');
                jQuery.each(menus, function(ns, o) {
                    jQuery(o.context).off(o.ns);
                });

                namespaces = {};
                menus = {};
                counter = 0;
                initialized = false;

                jQuery('#context-menu-layer, .context-menu-list').remove();
            } else if (namespaces[o.selector]) {
                jQueryvisibleMenu = jQuery('.context-menu-list').filter(':visible');
                if (jQueryvisibleMenu.length && jQueryvisibleMenu.data().contextMenuRoot.jQuerytrigger.is(o.selector)) {
                    jQueryvisibleMenu.trigger('contextmenu:hide', {force: true});
                }

                try {
                    if (menus[namespaces[o.selector]].jQuerymenu) {
                        menus[namespaces[o.selector]].jQuerymenu.remove();
                    }

                    delete menus[namespaces[o.selector]];
                } catch(e) {
                    menus[namespaces[o.selector]] = null;
                }

                jQuerydocument.off(namespaces[o.selector]);
            }
            break;

        case 'html5':
            // if <command> or <menuitem> are not handled by the browser,
            // or options was a bool true,
            // initialize jQuery.contextMenu for them
            if ((!jQuery.support.htmlCommand && !jQuery.support.htmlMenuitem) || (typeof options == "boolean" && options)) {
                jQuery('menu[type="context"]').each(function() {
                    if (this.id) {
                        jQuery.contextMenu({
                            selector: '[contextmenu=' + this.id +']',
                            items: jQuery.contextMenu.fromMenu(this)
                        });
                    }
                }).css('display', 'none');
            }
            break;

        default:
            throw new Error('Unknown operation "' + operation + '"');
    }

    return this;
};

// import values into <input> commands
jQuery.contextMenu.setInputValues = function(opt, data) {
    if (data === undefined) {
        data = {};
    }

    jQuery.each(opt.inputs, function(key, item) {
        switch (item.type) {
            case 'text':
            case 'textarea':
                item.value = data[key] || "";
                break;

            case 'checkbox':
                item.selected = data[key] ? true : false;
                break;

            case 'radio':
                item.selected = (data[item.radio] || "") == item.value ? true : false;
                break;

            case 'select':
                item.selected = data[key] || "";
                break;
        }
    });
};

// export values from <input> commands
jQuery.contextMenu.getInputValues = function(opt, data) {
    if (data === undefined) {
        data = {};
    }

    jQuery.each(opt.inputs, function(key, item) {
        switch (item.type) {
            case 'text':
            case 'textarea':
            case 'select':
                data[key] = item.jQueryinput.val();
                break;

            case 'checkbox':
                data[key] = item.jQueryinput.prop('checked');
                break;

            case 'radio':
                if (item.jQueryinput.prop('checked')) {
                    data[item.radio] = item.value;
                }
                break;
        }
    });

    return data;
};

// find <label for="xyz">
function inputLabel(node) {
    return (node.id && jQuery('label[for="'+ node.id +'"]').val()) || node.name;
}

// convert <menu> to items object
function menuChildren(items, jQuerychildren, counter) {
    if (!counter) {
        counter = 0;
    }

    jQuerychildren.each(function() {
        var jQuerynode = jQuery(this),
            node = this,
            nodeName = this.nodeName.toLowerCase(),
            label,
            item;

        // extract <label><input>
        if (nodeName == 'label' && jQuerynode.find('input, textarea, select').length) {
            label = jQuerynode.text();
            jQuerynode = jQuerynode.children().first();
            node = jQuerynode.get(0);
            nodeName = node.nodeName.toLowerCase();
        }

        /*
         * <menu> accepts flow-content as children. that means <embed>, <canvas> and such are valid menu items.
         * Not being the sadistic kind, jQuery.contextMenu only accepts:
         * <command>, <menuitem>, <hr>, <span>, <p> <input [text, radio, checkbox]>, <textarea>, <select> and of course <menu>.
         * Everything else will be imported as an html node, which is not interfaced with contextMenu.
         */

        // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#concept-command
        switch (nodeName) {
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#the-menu-element
            case 'menu':
                item = {name: jQuerynode.attr('label'), items: {}};
                counter = menuChildren(item.items, jQuerynode.children(), counter);
                break;

            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-a-element-to-define-a-command
            case 'a':
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-button-element-to-define-a-command
            case 'button':
                item = {
                    name: jQuerynode.text(),
                    disabled: !!jQuerynode.attr('disabled'),
                    callback: (function(){ return function(){ jQuerynode.click(); }; })()
                };
                break;

            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-command-element-to-define-a-command

            case 'menuitem':
            case 'command':
                switch (jQuerynode.attr('type')) {
                    case undefined:
                    case 'command':
                    case 'menuitem':
                        item = {
                            name: jQuerynode.attr('label'),
                            disabled: !!jQuerynode.attr('disabled'),
                            callback: (function(){ return function(){ jQuerynode.click(); }; })()
                        };
                        break;

                    case 'checkbox':
                        item = {
                            type: 'checkbox',
                            disabled: !!jQuerynode.attr('disabled'),
                            name: jQuerynode.attr('label'),
                            selected: !!jQuerynode.attr('checked')
                        };
                        break;

                    case 'radio':
                        item = {
                            type: 'radio',
                            disabled: !!jQuerynode.attr('disabled'),
                            name: jQuerynode.attr('label'),
                            radio: jQuerynode.attr('radiogroup'),
                            value: jQuerynode.attr('id'),
                            selected: !!jQuerynode.attr('checked')
                        };
                        break;

                    default:
                        item = undefined;
                }
                break;

            case 'hr':
                item = '-------';
                break;

            case 'input':
                switch (jQuerynode.attr('type')) {
                    case 'text':
                        item = {
                            type: 'text',
                            name: label || inputLabel(node),
                            disabled: !!jQuerynode.attr('disabled'),
                            value: jQuerynode.val()
                        };
                        break;

                    case 'checkbox':
                        item = {
                            type: 'checkbox',
                            name: label || inputLabel(node),
                            disabled: !!jQuerynode.attr('disabled'),
                            selected: !!jQuerynode.attr('checked')
                        };
                        break;

                    case 'radio':
                        item = {
                            type: 'radio',
                            name: label || inputLabel(node),
                            disabled: !!jQuerynode.attr('disabled'),
                            radio: !!jQuerynode.attr('name'),
                            value: jQuerynode.val(),
                            selected: !!jQuerynode.attr('checked')
                        };
                        break;

                    default:
                        item = undefined;
                        break;
                }
                break;

            case 'select':
                item = {
                    type: 'select',
                    name: label || inputLabel(node),
                    disabled: !!jQuerynode.attr('disabled'),
                    selected: jQuerynode.val(),
                    options: {}
                };
                jQuerynode.children().each(function(){
                    item.options[this.value] = jQuery(this).text();
                });
                break;

            case 'textarea':
                item = {
                    type: 'textarea',
                    name: label || inputLabel(node),
                    disabled: !!jQuerynode.attr('disabled'),
                    value: jQuerynode.val()
                };
                break;

            case 'label':
                break;

            default:
                item = {type: 'html', html: jQuerynode.clone(true)};
                break;
        }

        if (item) {
            counter++;
            items['key' + counter] = item;
        }
    });

    return counter;
}

// convert html5 menu
jQuery.contextMenu.fromMenu = function(element) {
    var jQuerythis = jQuery(element),
        items = {};

    menuChildren(items, jQuerythis.children());

    return items;
};

// make defaults accessible
jQuery.contextMenu.defaults = defaults;
jQuery.contextMenu.types = types;
// export internal functions - undocumented, for hacking only!
jQuery.contextMenu.handle = handle;
jQuery.contextMenu.op = op;
jQuery.contextMenu.menus = menus;

})(jQuery);
