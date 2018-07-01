(function () {
    var rafHandle = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                return setTimeout(callback, 1)
            }
    }();
    var requestAnimationFrame = function (callback) {
        rafHandle(callback)
    };

    function Lazy(el, listenEl, event, config) {
        this.config = $.extend({
            attr: "data-lazyload",
            fade: false,
            loader: function (img, src) {
                if (src || src.length < 5)
                    img.src = src
            },
            diff: -10,
            allowAuto: false
        }, config);
        this.el = el;
        this.event = event;
        this.listenEl = listenEl;
        this.bind();
        this.noCache = this.config.noCache || false
    };
    Lazy.queue = [];
    Lazy.runQueue = function () {
        if (Lazy.queue.length) {
            var fn = Lazy.queue.shift();
            fn();
            requestAnimationFrame(Lazy.runQueue)
        }
    };
    Lazy.prototype = {
        load: function (force) {
            var self = this;
            if (!this.el) return;
            if (this.config.allowAuto && window.imageSizeType == "none") return;
            this.loadEls = $("[" + this.config.attr + "]", this.el).toArray();//[].slice.call(this.el.querySelectorAll("[" + this.config.attr + "]"));
            if (!this.loadEls.length) return;
            var screenHeight = window.innerHeight;
            var scrollY = this.iscroll ? -this.iscroll.y : window.scrollY;
            for (var i = 0, el; el = this.loadEls[i]; i++) {
                var elRect;
                var _rect = el.getBoundingClientRect();
                var _tmpRect = {
                    top: _rect.top + scrollY,
                    bottom: _rect.bottom + scrollY
                };
                elRect = _tmpRect;
                var tDiff = -Math.abs(this.config.diff),
                    bDiff = +Math.abs(this.config.diff);
                var isInViewPort = !(elRect.top > screenHeight + scrollY + bDiff || elRect.bottom < scrollY + tDiff);
                if (isInViewPort) {
                    self.config.loader(el, el.getAttribute(this.config.attr), self);
                    if (self.config.fade) {
                        var $el = $(el);
                        $el.css("opacity", 0).on("load", function () {
                            $el.animate({
                                "opacity": 1
                            })
                        })
                    }
                    el.removeAttribute(this.config.attr)
                } else;
            }
        },
        bind: function () {
            var self = this;
            var timer;
            $(this.listenEl).on(this.event + '.lazy', this.loadHandle = function (evt) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    clearTimeout(timer);
                    self.load(evt && evt.data)
                }, 100)
            });
            $(function (evt) {
                self.loadHandle(evt)
            })
        },
        dispose: function () {
            $(this.listenEl).off('.lazy', this.loadHandle);
            this.el = null;
            this.loadEls = null
        }
    };
    Lazy.tryLoadImg = function (target) {
        var url = target.getAttribute("data-lazy");
        if (!url) return;
        Lazy.feedLoad(target, url)
    };
    Lazy.feedLoad = function (img, att, that) {
        var $img = $(img);
        var tmpImg = new Image;
        var isWifi = false;
        var start = Date.now();
        tmpImg.onload = function () {
            if (img.nodeName == "IMG") img.src = att;
            else {
                img.style.backgroundImage = 'url("' + att + '")';
            }
            $img.addClass("loaded");
            tmpImg.onload = null;
            tmpImg = null;
            if (that.config.fade) {
                $img.css("opacity", 0).on("load", function () {
                    $img.animate({
                        "opacity": 1
                    })
                })
            }
        };
        tmpImg.onerror = function () {
            img.setAttribute("img_on_error", att);
            $img.addClass("failed");
        };

        tmpImg.src = att
    };

    window.Lazy = Lazy;
})();