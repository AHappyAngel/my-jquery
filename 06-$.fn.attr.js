/**
 * Created by Administrator on 2017/2/18.
 */
(function (window) {
    var emptyArray = [];
    var push = emptyArray.push;
    var splice = emptyArray.splice;
    var toString = Object.prototype.toString;

    var types = 'String Number Boolean RegExp Function Math Date Object Null Undefined'.split(' ');
    var class2type = {};
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        class2type['[object ' + type + ']'] = type.toLowerCase();
    }

    //模拟Sizzle引擎
    var Sizzle = function (selector) {
        return document.querySelectorAll(selector);
    }

    //jQuery函数
    function jQuery(selector) {
        return new jQuery.fn.init(selector);
    }

    //jQuery的原型替换
    jQuery.fn = jQuery.prototype = {
        constructor: jQuery,
        init: function (selector) {
            splice.call(this, 0, this.length);
            var elements = Sizzle(selector);
            push.apply(this, elements);

            return this;
        }
    }

    //将F的原型 指向 jQuery的原型
    jQuery.fn.init.prototype = jQuery.fn;

    //$.extend方法
    jQuery.fn.extend = jQuery.extend = function () {
        var argLen = arguments.length;
        if (argLen === 0) return this;

        var target;
        var sources = [];

        var arg0 = arguments[0];
        //1、 1个参数 将该对象中的方法和属性绑定到this---> jQuery上和jQuery的原型上
        if (argLen === 1) {
            target = this;
            sources.push(arg0);

        } else {
            //2、 >1个参数  将第一个参数以后的对象中的方法绑定到第一个对象中
            target = arg0;
            sources.push.apply(sources, arguments);
            sources.splice(0, 1);
        }

        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            for (var key in source) {
                target[key] = source[key];
            }
        }
        return target;

    }

    //$对象上扩展的方法
    jQuery.extend({
        //判断是什么类型 返回 string number
        type: function (data) {
            //借用Object.prototype.toString方法
            return class2type[toString.call(data)];
        },
        //抛出异常对象的方法
        error: function (msg) {
            throw new Error(msg);
        },
        //判断数据是否是 string类型的数据
        isString: function (data) {
            return this.type(data) === 'string';
        },
        //判断数据是否是 function类型的数据
        isFunction: function (data) {
            return this.type(data) === 'function';
        },
        //$对象的each方法 两个参数 1:要遍历的对象，2:回调函数
        each: function (array, callback) {
            var arrLen = array.length;
            if (typeof arrLen === 'number' && arrLen >= 0) {
                for (var i = 0; i < array.length; i++) {
                    //回调函数的调用模式是上下文调用模式 内部的this指向 array[i]
                    if (callback.call(array[i], i, array[i]) === false) {
                        break;
                    }
                }
            }
            else {
                for (var key in array) {
                    if (callback.call(array[key], key, array[key]) === false) {
                        break;
                    }
                }
            }

        }

    });

    //jQuery的css方法
    jQuery.fn.extend({
        //css方法
        /*
         * 1、没有参数 返回该实例
         * 2、1个参数
         *       a、这个参数值字符串 获取样式的值并返回 （带单位）
         *       b、这个参数是对象 批量操作dom元素添加设置该参数中的属性
         * 3、两个参数arg0 arg1
         *       批量操作dom元素的样式 并添加设置样式为arg0 值为arg1
         * */
        css: function () {
            var argLen = arguments.length;
            //1、没有传递参数时 直接返回该是实例
            if (argLen === 0) return this;
            var arg0 = arguments[0];
            //2、传递一个参数时 分两种情况
            if (argLen === 1) {
                // 2.1 该参数是字符串类型 获取值
                if (jQuery.isString(arg0)) {
                    //window.getComputedStyle()方法的第一个参数是获取的哪个对象的实例
                    return window.getComputedStyle(this[0], null)[arg0];

                } else {
                    // 2.2 该参数是对象 批量设置样式
                    this.each(function () {
                        //这个回调函数中的this 是F的实例中的每个dom元素
                        var dom = this;
                        /*需要实现的功能是 将arg0中的属性和方法 绑定到dom.style中*/
//                            $.each(arg0, function (styleName,styleValue) {
//                                //这个回调函数中的this 是agr0中每个属性的值的对应的包装数据类型
//                                dom.style[styleName] = styleValue;
//                            })
                        //第二种方法
                        $.extend(dom.style, arg0);
                    })
                }
                //3、传递 >1 个参数时 分两种情况 只处理前两个
            } else {
                var arg1 = arguments[1];
                this.each(function () {
                    this.style[arg0] = arg1;
                })
            }

            //返回this
            return this;
        },

        //each方法 遍历该伪数组
        each: function (callback) {
            jQuery.each(this, callback);
            return this;
        },

        //attr获取方法
        /*
         * 1、没有参数 返回该实例
         * 2、1个参数
         *       a、这个参数值字符串 获取属性的值 并返回
         *       b、这个参数是对象 批量操作dom元素添加设置该参数中的属性
         * 3、两个参数arg0 arg1      第二个之后的参数不处理
         *       批量操作dom元素添加设置arg0属性 的值为arg1
         * */
        attr: function (arg0, arg1) {
            var argLen = arguments.length;
            //没有参数
            if (argLen === 0) return this;
            //1个参数
            if (argLen === 1) {
                //a、这个参数值字符串
                if (jQuery.isString(arg0)) {
                    return this[0].getAttribute(arg0);
                } else {
                    //b、这个参数是对象
                    return this.each(function () {
                        for (var attrName in arg0) {
                            this.setAttribute(attrName, arg0[attrName]);
                        }
                    })
                }
                //2个参数
            } else {
                return this.each(function () {
                    this[arg0] = arg1;
                })
            }
        }
    })
    //暴露两个接口
    window.$ = window.jQuery = jQuery;
})(window)