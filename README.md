jQpage.js
=========

A simple jQuery pagination plugin —— 一个非常简单的 jQuery 的分页插件

真的非常简单：

我们把分页栏放在一个div中，如下：

    <div pages="${counts}" url="${/yourUrl}" id="myid"></div>

然后对它调用一个函数就ok了：

    <script>
        $("#myid").nPageBar();
    </script>

是不是有点太简单了，O(∩_∩)O~

在简单的同时我们还提供了两种模式，来保证足够的强大，下面分别来解释：

1. url 模式

这个模式种当你点击某个链接时，它的行为类似于普通的 a 标签

2. func 模式

这个模式下，我们认为通常你需要更加强大的功能：例如异步刷新部分页面而不是整个页面，所以我们只是帮你维护了分页栏的状态，剩下的事情都交给你自己去解决。