/**
	* jQueryImgRotator - Image Rotator plugin
	* Designed and built by Chienyi Cheri Hung <http://www.cyhung.net>
	* Version:  1.0
	
	* Licensed under the MIT licenses.
	* http://www.opensource.org/licenses/mit-license.php
**/ 

(function($){

  var ImageRotator = {
	
    init : function(o) { 

	var _s; //speed
	var _r; //rate
	var _int; //interval
	var _width; //width of wrapper
	var _height; //height of wrapper
	var _reset; //to reset interval if hovered

	return this.each(function(){
	  var $this = $(this);	
	  //default settings
		_reset = false;
		_settings = {
			 speed: 3000, 
			 rate: 1000,
			 width: '300px',
			 height: '216px'
		}
		//use user settings if any
		var settings = $.extend( {}, settings, _settings, o );
		
		_s = settings.speed; //speed
		_r = settings.rate; //rate
		_width = settings.width; //width of wrapper
		_height = settings.height; //height of wrapper	
	
		//add required styles
		$this.css({'width': _width, 'height': _height}); //set dimension for wrapper
		$this.find('ul').css({'margin':0,'padding':0});
		$this.find('ul li').css({'position':'absolute', 'list-style': 'none'});
		$this.find('ul li.show ').css({'z-index':500});

		//start rotate
		if($this.find('ul li').length > 1) {
			 $this.find('ul li').css({opacity: 0.0});
			 $this.find('ul li:first').css({opacity: 1.0});
			 _int = setInterval(function() {
					iRotate();
				 }, _s);
		};
		//hover pause
		$this.hover(function () {
			 clearInterval(_int);
		}, 
		function () {
			_reset = true;
			iRotate();
		});

		function iRotate() {
			var current = ($this.find('ul li.show') ? $this.find('ul li.show') : $this.find('ul li:first'));
			if ( current.length == 0 ) current =  $this.find('ul li:first');
			var next = ((current.next().length) ? ((current.next().hasClass('show')) ?  $this.find('ul li:first') :current.next()) : $this.find('ul li:first'));
			next.css({opacity: 0.0}).addClass('show')
			.animate({opacity: 1.0}, _r);
			current.animate({opacity: 0.0}, _r).removeClass('show');
			if(_reset == true) {
				_int = setInterval(function() {
					iRotate();
				}, _s);
					_reset = false;
			};
		}//iRotate
}); //init
    },
	loadStyle : function(t, s) { 
     //if css is a linked file, load into <head>
		if (t == "link") {
			var url = s;
				$('<link rel="stylesheet" type="text/css" href="'+url+'">').appendTo("head");
		}
		//if css is inline, write an inline block
		if (t == "inline") {
			var styles = s;
				$("<style type='text/css'>"+s+"</style>").appendTo("head");
		}
	} //loadStyle   
  };
	
  $.fn.imgRotator = function( method ) {
    
    // Method calling logic
    if ( ImageRotator[method] ) {
      return ImageRotator[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return ImageRotator.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.ImageRotator' );
    }    
  
  };

})( jQuery );