/**
	* jQueryImgRotator - Image Rotator plugin - Minified
	* Designed and built by Chienyi Cheri Hung @cyhung
	* Version:  1.0
	
	* Dual licensed under the MIT and GPL licenses.
	* http://www.opensource.org/licenses/mit-license.php
	* http://www.gnu.org/licenses/gpl.html
**/
(function(d){var c={init:function(a){var g,c,h,k,l,f;return this.each(function(){function j(){var a=b.find("ul li.show")?b.find("ul li.show"):b.find("ul li:first");0==a.length&&(a=b.find("ul li:first"));(a.next().length?a.next().hasClass("show")?b.find("ul li:first"):a.next():b.find("ul li:first")).css({opacity:0}).addClass("show").animate({opacity:1},c);a.animate({opacity:0},c).removeClass("show");!0==f&&(h=setInterval(function(){j()},g),f=!1)}var b=d(this);f=!1;_settings={speed:3E3,rate:1E3,width:"300px",
height:"216px"};var e=d.extend({},e,_settings,a);g=e.speed;c=e.rate;k=e.width;l=e.height;b.css({width:k,height:l});b.find("ul").css({margin:0,padding:0});b.find("ul li").css({position:"absolute","list-style":"none"});b.find("ul li.show ").css({"z-index":500});1<b.find("ul li").length&&(b.find("ul li").css({opacity:0}),b.find("ul li:first").css({opacity:1}),h=setInterval(function(){j()},g));b.hover(function(){clearInterval(h)},function(){f=!0;j()})})},loadStyle:function(a,c){"link"==a&&d('<link rel="stylesheet" type="text/css" href="'+
c+'">').appendTo("head");"inline"==a&&d("<style type='text/css'>"+c+"</style>").appendTo("head")}};d.fn.imgRotator=function(a){if(c[a])return c[a].apply(this,Array.prototype.slice.call(arguments,1));if("object"===typeof a||!a)return c.init.apply(this,arguments);d.error("Method "+a+" does not exist on jQuery.ImageRotator")}})(jQuery);