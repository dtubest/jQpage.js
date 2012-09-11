/**
 * a simple jQuery pagination plugin
 * author: tding
 */
(function ($) {

    var defaults = {
        // 下面所有的参数只在 url 模式下起作用，在 func 模式下会被忽略
        indexParamName:'pageIndex',
        sizeParamName:'pageSize',
        indexParamValue:0,
        sizeParamValue:10,
        target:'_self',
        method:'post'
    };

    var PageBar = function ($this, options) {

        var barSelf = this, tdom = $this.get(0);

        // 覆盖默认 settings，进行初始化
        barSelf.settings = defaults;
        if (undefined != options) barSelf.settings = $.extend(defaults, options);

        // 确定模式
        if (tdom.getAttribute('url')) barSelf.actionMode = 'link';
        else barSelf.actionMode = 'func';

        // 模式下检查
        if (hasModeError[barSelf.actionMode](tdom)) return;

        // 模式下设置
        modeSet[barSelf.actionMode]($this, barSelf);

        // 进行构造
        constructs($this, barSelf);
    };

    PageBar.prototype.events = {
        pageStatusChanged:'pageStatusChanged',
        linkClicked:'linkClicked'
    };

    PageBar.prototype.defaultHandlers = {

        pageStatusChanged:function (e, params) {

            var barSelf = params.barSelf, $this = params.$this, links = [];
            var tdom = $this.get(0);

            // 清理掉旧的元素
            tdom.innerHTML = '';            // 没想到删除旧元素竟然采取了这种方式，真是不可思议，哎~~

            var current = barSelf.current, pages = barSelf.pages;

            // 1> 构造向前链接
            links.push(buildLink('&lt;', current - 1 >= 0 ? current - 1 : 0, 'step'));

            // 2> 构造中间链接
            var pageLinks = buildsBarLinks['type1'](barSelf);
            for (var i = 0; i < pageLinks.length; i++)
                links.push(pageLinks[i]);

            // 3> 构造向后链接
            links.push(buildLink('&gt;', current + 1 < pages ? current + 1 : pages - 1, 'step'));

            for (i = 0; i < links.length; i++) {
                links[i].appendTo(tdom);
                $('<span> </span>').appendTo(tdom);
            }
        },

        linkClicked:function (e, params) {
            var barSelf = params.barSelf, $this = params.$this, link = params.link;
            var tdom = $this.get(0);
            barSelf.linkAction(tdom, link);

            trigger.pageStatusChanged($this, barSelf);
        }
    };

    var Link = function () {
    };

    var trigger = {
        pageStatusChanged:function ($this, barSelf) {
            $this.trigger(barSelf.events.pageStatusChanged, {barSelf:barSelf, $this:$this});
        },
        linkClicked:function ($this, barSelf, link) {
            $this.trigger(barSelf.events.linkClicked, {barSelf:barSelf, $this:$this, link:link});
        }
    };

    var hasAttrError = function (tdom) {
        // url 和 func 都没有值
        if (!tdom.getAttribute('url') && !tdom.getAttribute('func')) return true;
        // 都有值
        if (tdom.getAttribute('url') && tdom.getAttribute('func')) return true;

        // pages 总页数必须指定
        if (!tdom.getAttribute('pages') || isNaN(tdom.getAttribute('pages'))) return true;

        return false;
    }

    var buildLink = function (name, page, type) {
        return $('<a page="' + page + '" linkType="' + type + '">' + name + '</a>');
    }

    var hasModeError = {
        link:function (tdom) {
            return false;
        },
        func:function (tdom) {
            if (undefined == window[tdom.getAttribute('func')]) return true;
            return false;
        }
    }

    var modeSet = {

        link:function ($this, barSelf) {
            PageBar.prototype.linkAction = function (tdom, link) {
                var form = $('<form action="' + tdom.getAttribute('url') + '" target="' + barSelf.settings.target + '"></form>');
                var formDom = form.get(0);

                $('<input type="hidden" name="' + barSelf.settings.indexParamName + '" value="' + link.page + '">').appendTo(formDom);
                $('<input type="hidden" name="' + barSelf.settings.sizeParamName + '" value="' + barSelf.settings.sizeParamValue + '">').appendTo(formDom);

//                debug(formDom);
//                form.appendTo(document.body);
                form.submit();

                if (barSelf.target !== '_self') {
                    barSelf.current = link.page;
                    trigger.pageStatusChanged($this, barSelf);
                }
            };
        },
        func:function ($this, barSelf) {

            var tdom = $this.get(0);

            barSelf.userFunc = window[tdom.getAttribute('func')];

            PageBar.prototype.linkAction = function (tdom, link) {
                tdom.setAttribute('current', link.page);

                var barSelf = this;
                barSelf.userFunc(barSelf, link);
                barSelf.current = +tdom.getAttribute('current');
            }
        }
    }

    var buildsBarLinks = {

        type1:function (barSelf) {

            var pages = barSelf.pages, current = barSelf.current;
            var link, links = [];

            if (pages <= 9) {
                for (var i = 0; i < pages; i++) {
                    link = buildLink(i + 1, i, 'pages');
                    if (i == current) link.addClass('curr');
                    links.push(link);
                }

            } else {
                if (current < 4) {

                    for (var i = 0; i <= 5; i++) {
                        link = buildLink(i + 1, i, 'pages');
                        if (i == current) link.addClass('curr');
                        links.push(link);
                    }

                    links.push($('<span>...</span>'));
                    links.push(buildLink(pages - 1, pages - 2, 'pages'));
                    links.push(buildLink(pages, pages - 1, 'pages'));

                } else if (current >= 4 && current <= pages - 4) {
                    links.push($('<span>...</span>'));

                    for (var i = current - 3, k = i + 7; i < k; i++) {
                        link = buildLink(i + 1, i, 'pages');
                        if (i == current)
                            link.addClass('curr');
                        links.push(link);
                    }

                    links.push($('<span>...</span>'));

                } else {
                    links.push(buildLink(1, 0, 'pages'));
                    links.push(buildLink(2, 1, 'pages'));
                    links.push($('<span>...</span>'));

                    for (var i = pages - 6; i < pages; i++) {
                        link = buildLink(i + 1, i, 'pages');
                        if (i == current) link.addClass('curr');
                        links.push(link);
                    }
                }
            }

            return links;
        }
    }

    var constructs = function ($this, barSelf) {
        var tdom = $this.get(0);

        barSelf.pages = +tdom.getAttribute('pages');

        var current = +tdom.getAttribute('current');
        barSelf.current = current;

        if (!current || isNaN(current) || current >= barSelf.pages)
            barSelf.current = 0;

        // 绑定所有的事件
        for (var event in barSelf.events) {
            $this.bind(barSelf.events[event], barSelf.defaultHandlers[barSelf.events[event]]);
        }

        // 将 linkClicked 的触发 绑定到 a 标签的点击事件
        $this.find('a').live('click', function (e) {
            var link = new Link();
            link.name = this.innerText;
            link.page = +this.getAttribute('page');
            link.type = this.getAttribute('linktype');
            trigger.linkClicked($this, barSelf, link);
        });

        trigger.pageStatusChanged($this, barSelf);
    }

    var methods = {
        init:function (options) {
            var $this = this, tdom = this.get(0);

            if (hasAttrError(tdom)) return;
            new PageBar($this, options);

            return $this;
        }
    };

    $.fn.nPageBar = function (method) {

        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));

        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);

        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    }

})(jQuery);
