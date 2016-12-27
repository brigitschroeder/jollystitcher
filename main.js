IndexController = function() {};

IndexController.prototype.start = function() {
	this._stitchers = jQuery(document).find('.stitcher');
	this._stitchers.stitcher();

	jQuery(".stitcherUI #threadpicker").change(jQuery.proxy(this._updateColor, this));
    jQuery(".stitcherUI #modepicker").change(jQuery.proxy(this._updateMode, this));
    jQuery("#modalEditSettings .saveChanges").click(jQuery.proxy(this._updateSettings, this));
    jQuery(".stitcherUI button").click(jQuery.proxy(this._onActionClick, this));
	
	this._updateColor();
};

IndexController.prototype._updateColor = function() {
	var colorValue = jQuery("#threadpicker").val();
	this._stitchers.stitcher('color', colorValue);
	return false;
};

IndexController.prototype._updateMode = function() {
    var modeValue = jQuery("#modepicker").val();
    this._stitchers.stitcher('mode', modeValue);
    return false;
};
IndexController.prototype._updateSettings = function() {
    var chartWidth = jQuery("#chartWidth").val();
    var chartHeight = jQuery("#chartHeight").val();
    this._stitchers.stitcher('resize', chartWidth, chartHeight);
    console.log(chartWidth + " x " + chartHeight);

    this._stitchers.stitcher('refresh');
    // this.xDot = chartWidth;
    // this.yDot = chartHeight;
    return false;
};
IndexController.prototype._onActionClick = function(event) {
	var action = jQuery(event.target).attr('name');	
	this._stitchers.stitcher(action);
	return false;
};

$('.saveChanges').click(function (e) {
    var modalName = $(this).parents('.modal').attr('id');
    // var c = $('#stitcher');
    //Resize room
    if (modalName == 'modalEditSettings'){
        chartWidth = $('#chartWidth').val();
        chartHeight = $('#chartHeight').val();
        $('#modalEditSettings').modal('hide');
        // console.log(chartWidth + " x " + chartHeight);
        // c.xDot = chartWidth;
        // c.yDot = chartHeight;
    }
    // stop the form from submitting the normal way and refreshing the page
    e.preventDefault();
});
/*
// Resize canvas to fit window
$(document).ready( function(){
    var c = $('#stitcher');
    var ct = c.get(0).getContext('2d');
    var container = $(c).parent();

    $(window).resize( respondCanvas);

    function respondCanvas(){ 
        c.attr('width', $(container).width() - 20 ); //max width
        var h = (($(container).width() - 20) / 1180 * 570);
        c.attr('height', h ); //max height    

        //Call a function to redraw other content (texts, images etc)
        for(var key in window) {
		  var value = window[key];
		  if (value instanceof stitcher) {
		    value.refreshReady = true;
		  }
		}
    }
    respondCanvas();
}); 
*/

/*
// device detection
var isTouchDevice = 'ontouchstart' in document.documentElement;

// enable touch (toggle)	
var touchEnabled = true;
var button = document.getElementById('touch-toggle');

if (isTouchDevice !== true)
	button.style.display = "none";

$(window).bind("load resize scroll",function(e){
    var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
	var touchToggle = document.getElementById('touch-toggle');
    touchToggle.style.height = (32 / zoomLevel) + 'px';
    touchToggle.style.width = (100 / zoomLevel) + 'px';
    touchToggle.style.top = (window.pageYOffset + window.innerHeight - (32 / zoomLevel) - 5) + 'px';
    touchToggle.style.left = (window.pageXOffset) + 'px';
    //console.log("zoomLevel = " + zoomLevel);
});

button.addEventListener('click', function (e) {
    if (touchEnabled === true){
    	touchEnabled = false;
    	//button.value = "No Touch";
    	button.style.backgroundImage = "url('touch-disabled.png')";
    } else {
    	touchEnabled = true;
    	//button.value = "Touch";
    	button.style.backgroundImage = "url('touch-enabled.png')";
    }
    //console.log("touchEnabled = " + touchEnabled);
    //console.log("isTouchDevice = " + isTouchDevice);
});
*/

// On page load, parse image id from URL and draw on canvas
(function($){
    $.getQuery = function( query ) {
        query = query.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var expr = "[\\?&]"+query+"=([^&#]*)";
        var regex = new RegExp( expr );
        var results = regex.exec( window.location.href );
        if( results !== null ) {
            //return results[1];
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        } else {
            return false;
        }
    };
})(jQuery);
/*
// Change URL
function ChangeUrl(page, url) {
    if (typeof (history.pushState) != "undefined") {
        var obj = { Page: page, Url: url };
        history.pushState(obj, obj.Page, obj.Url);
    } else {
        alert("Browser does not support HTML5.");
    }
}
*/
/*
stitcher.prototype.load = function(imageid) {
	var temp = this;
	$.ajax({
		type:"post",
		url:"process.php",
		data:"id="+imageid+"&action=loadimage",
		success:function(data){
			//$("#info").html(data);
			//console.log(data);
		    temp._grid = data.split(',');
		    temp.refresh();
		}
	});
	$('#create-your-own').show();
};*/

function stitcher(canvas) {

	this.refreshReady = true;
	self = this;
	this.refreshTimer = setInterval(function() { self.updateTimer(); }, 120);

	this.canvas = canvas;

	this._color = 'yellow';
    this._mode = 'full';
    this.xDot = 100;
    this.yDot = 100;

	this._grid = [];

	var imageid = jQuery.getQuery('imageid');
	if (imageid.length > 0){	
		this.load(imageid);
	}
	this.refreshReady = true;

    this._radius = 9;
    this._distDot = 21; // distance between midpoints of each square
	
	this.ctx = this.canvas.getContext('2d');

	// this.xDot = Math.floor((this.canvas.width) / this._distDot) -1;
	// this.yDot = Math.floor((this.canvas.height) / this._distDot) -1;
	this.dots = this.xDot * this.yDot;

    this.canvas.width = this.xDot * this._distDot;
    this.canvas.height = this.yDot * this._distDot;

    // console.log("this._radius = " + this._radius);
    // console.log("this._distDot = " + this._distDot);
    // console.log("this.xDot = " + this.xDot);
    // console.log("this.yDot = " + this.yDot);

	this.clear();

	// Initialize with default image 
	// this._grid = ['b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','w','w','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','n','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','w','w','w','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','v','b','b','v','v','b','v','v','b','b','v','v','b','v','v','b','b','v','v','b','v','w','w','b','v','v','b','v','w','w','w','w','v','b','v','v','b','b','v','v','b','v','v','b','n','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','w','w','w','v','b','b','b','b','b','v','v','b','b','b','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','w','w','v','b','b','b','b','v','b','v','b','b','n','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','w','w','w','w','w','b','w','w','w','w','b','b','b','w','w','b','b','b','b','b','b','b','b','b','b','n','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','w','w','w','w','w','w','w','w','b','b','w','w','w','v','w','w','b','b','v','b','v','b','b','b','b','v','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','w','w','w','w','w','w','w','w','w','w','b','b','w','w','w','w','b','b','b','v','v','b','b','b','b','b','v','n','v','v','b','v','v','b','b','v','v','b','v','v','b','b','v','v','b','w','w','w','w','w','w','w','w','w','w','w','v','v','w','w','w','b','b','v','v','b','v','v','b','b','v','v','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','w','v','w','w','w','w','w','w','w','w','w','w','w','w','b','v','w','w','w','b','b','b','v','v','b','b','b','b','b','v','n','b','v','b','v','b','b','b','b','v','b','v','b','b','w','w','v','w','w','w','w','w','w','w','w','w','w','w','w','w','v','w','w','w','w','b','b','v','b','v','b','b','b','b','v','b','b','b','b','b','b','b','b','b','b','b','b','b','w','w','b','b','w','w','w','w','w','w','w','w','w','w','w','w','b','w','w','w','w','w','b','b','b','b','b','b','b','b','b','b','n','b','b','b','b','b','b','b','b','b','b','b','w','w','w','b','b','w','w','w','w','w','w','w','w','w','w','w','w','w','w','w','b','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','v','b','v','b','b','b','w','w','w','v','b','b','w','w','w','w','w','w','w','w','w','w','w','w','b','b','b','w','w','w','v','b','b','b','b','v','b','v','b','b','n','b','b','b','b','b','v','v','b','b','b','b','w','w','v','b','b','b','w','w','w','w','w','w','w','w','w','w','w','b','b','b','w','w','w','v','b','b','b','b','b','v','v','b','b','b','v','b','b','v','v','b','v','v','b','b','w','w','w','v','v','b','b','w','w','w','w','w','w','w','w','w','w','v','v','b','w','w','w','b','v','v','b','b','v','v','b','v','v','b','n','b','b','b','b','b','v','v','b','b','b','b','w','w','w','b','b','b','b','w','w','w','w','w','w','w','w','w','v','b','b','w','w','w','v','v','b','b','b','b','b','v','v','b','b','b','b','b','b','b','v','b','v','b','b','b','b','w','w','w','w','w','b','b','b','w','w','w','w','w','w','v','b','v','w','w','w','b','v','b','v','b','b','b','b','v','b','v','b','b','n','b','b','b','b','b','b','b','b','b','b','b','b','b','b','w','w','w','w','w','b','b','b','b','b','b','b','b','b','w','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','w','w','w','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','n','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','w','w','w','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','w','w','w','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','n','v','v','b','v','v','b','b','v','v','b','v','v','b','b','v','v','b','v','v','b','b','v','v','w','w','w','w','b','v','v','b','v','v','b','b','v','v','b','v','v','b','b','v','v','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','w','w','w','w','w','b','b','b','b','v','v','b','b','b','b','b','v','v','b','b','b','b','b','v','n','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','w','w','w','w','w','v','b','b','b','b','v','b','v','b','b','b','b','v','b','v','b','b','b','b','v','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','b','n'];
	// $('#create-your-own').show();
	this.refreshReady = true;
	
	jQuery(this.canvas).select(function () { return false; });
	jQuery(this.canvas).mouseup(jQuery.proxy(this._onCanvasMouseUp, this));
	jQuery(this.canvas).mousedown(jQuery.proxy(this._onCanvasMouseDown, this));
	jQuery(this.canvas).mousemove(jQuery.proxy(this._onCanvasMouseMove, this));
	jQuery(this.canvas).click(jQuery.proxy(this._onCanvasMouseClick, this));

	// Set up touch events for mobile, etc
	canvas.addEventListener("touchstart", function (e) {
	  mousePos = getTouchPos(canvas, e);
	  var touch = e.touches[0];
	  var mouseEvent = new MouseEvent("mousedown", {
	    clientX: touch.clientX,
	    clientY: touch.clientY
	  });
	  canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchend", function (e) {
	  var mouseEvent = new MouseEvent("mouseup", {});
	  canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchmove", function (e) {
	  var touch = e.touches[0];
	  //var rect = GetBox();
	  var div = document.getElementById ("canvas-wrapper");
	  var scrolled = {x : 0, y : 0};
	  GetScrolled (div.parentNode, scrolled);
	  var mouseEvent = new MouseEvent("mousemove", {
	    clientX: touch.clientX + scrolled.x,
	    clientY: touch.clientY + scrolled.y
	  });
	  canvas.dispatchEvent(mouseEvent);
	}, false);

	function GetOffset (object, offset) {
        if (!object)
            return;
        offset.x += object.offsetLeft;
        offset.y += object.offsetTop;

        GetOffset (object.offsetParent, offset);
    }

    function GetScrolled (object, scrolled) {
        if (!object)
            return;
        scrolled.x += object.scrollLeft;
        scrolled.y += object.scrollTop;

        if (object.tagName.toLowerCase () != "html") {
            GetScrolled (object.parentNode, scrolled);
        }
    }

    // always return 1, except at non-default zoom levels in IE before version 8
    function GetZoomFactor () {
        var factor = 1;
        if (document.body.getBoundingClientRect) {
                // rect is only in physical pixel size in IE before version 8 
            var rect = document.body.getBoundingClientRect ();
            var physicalW = rect.right - rect.left;
            var logicalW = document.body.offsetWidth;

                // the zoom level is always an integer percent value
            factor = Math.round ((physicalW / logicalW) * 100) / 100;
        }
        return factor;
    }

    function GetBox () {
        var div = document.getElementById ("canvas-wrapper");

        if (div.getBoundingClientRect) {        // Internet Explorer, Firefox 3+, Google Chrome, Opera 9.5+, Safari 4+
            var rect = div.getBoundingClientRect ();
            x = rect.left;
            y = rect.top;
            w = rect.right - rect.left;
            h = rect.bottom - rect.top;

            if (navigator.appName.toLowerCase () == "microsoft internet explorer") {
                // the bounding rectangle include the top and left borders of the client area
                x -= document.documentElement.clientLeft;
                y -= document.documentElement.clientTop;

                var zoomFactor = GetZoomFactor ();
                if (zoomFactor != 1) {  // IE 7 at non-default zoom level
                    x = Math.round (x / zoomFactor);
                    y = Math.round (y / zoomFactor);
                    w = Math.round (w / zoomFactor);
                    h = Math.round (h / zoomFactor);
                }
            }
        }
        else {
            // older Firefox, Opera and Safari versions
            var offset = {x : 0, y : 0};
            GetOffset (div, offset);

            var scrolled = {x : 0, y : 0};
            GetScrolled (div.parentNode, scrolled);
            //scrolled.x = (window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
			//scrolled.y = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            x = offset.x - scrolled.x;
            y = offset.y - scrolled.y;
            w = div.offsetWidth;
            h = div.offsetHeight;
        }

        //alert ("Left: " + x + "\nTop: " + y + "\nWidth: " + w + "\nHeight: " + h);
        return {
		    left: x,
		    top: y
		  };
    }

	// Get the position of a touch relative to the canvas
	function getTouchPos(canvasDom, touchEvent) {
	  //var rect = canvasDom.getBoundingClientRect();
	  var rect = GetBox();
	  return {
	    x: touchEvent.touches[0].clientX - rect.left,
	    y: touchEvent.touches[0].clientY - rect.top
	  };
	}
    /*
	// Prevent scrolling when touching the canvas
	document.body.addEventListener("touchstart", function (e) {
	  if (e.target == canvas) {
	  	if (touchEnabled === true)
	    	e.preventDefault();
	  }
	}, false);
	document.body.addEventListener("touchend", function (e) {
	  if (e.target == canvas) {
	  	if (touchEnabled === true)
	    	e.preventDefault();
	  }
	}, false);
	document.body.addEventListener("touchmove", function (e) {
	  if (e.target == canvas) {
	  	if (touchEnabled === true)
	    	e.preventDefault();
	  }
	}, false);
    */
	this.refreshReady = true;
}

/*
stitcher.colors = {
	'n': 'transparent',
	'r': 'red',
	'o': 'orange', 
	'y': 'yellow',
	'g': 'green',
	'b': 'blue',
	'p': 'pink',
	'v': 'purple', 
	'w': 'white'
};*/

stitcher.prototype.picture = function(picture) {
	if (picture === undefined) {
		return {
			xDot: this.xDot, 
			yDot: this.yDot, 
			grid: this._grid 
		};
	} else {
		this._xDot = picture.xDot;
		this._yDot = picture.yDot;
		this._grid = picture.grid;
	}
	this.refreshReady = true;
};

stitcher.prototype.refresh = function() {
	// console.log('refreshing...');
	this.ctx = this.canvas.getContext('2d');
	this.ctx.clearRect(
		0, 0, 
		this.canvas.width, 
		this.canvas.height
	);
    this.dots = this.xDot * this.yDot;

    this.canvas.width = this.xDot * this._distDot;
    this.canvas.height = this.yDot * this._distDot;

    // this._radius = Math.floor(this.canvas.width / 130);
    // this._distDot = Math.floor(2 * this._radius + (0.4 * this._radius));
    this._drawGridlines();
	//draw pegs
	for(var i=0; i<this.dots; i++) {
		var x = i % this.xDot;
		var y = Math.floor(i / this.xDot) % this.yDot;
		
		this._draw(x, y, this._grid[i]);
	}

};
stitcher.prototype.color = function(a) {
	this._color = a;
};
stitcher.prototype.mode = function(a) {
    this._mode = a;
    console.log(this._mode);
};
stitcher.prototype.resize = function(x, y) {
    // console.log("x = "+ x +", y = "+y);
    var newgrid = [];
    for(var j=0; j<(x*y); j++) {
        var row = Math.ceil((j+1) / x);
        var col = (j+1) % x;
        if (col == 0){ col = x; }
        // set equal to current grid
        var currIndex = (row - 1) * this.xDot + (col - 1);
        if (currIndex <= this.dots && row <= this.yDot && col <= this.xDot) {
            newgrid[j] = this._grid[currIndex];
        } else {
            newgrid[j] = 'transparent';
        }
    }
    this.xDot = x;
    this.yDot = y;
    this._grid = newgrid;
};
stitcher.prototype.clear = function() {
	for(var i=0; i<this.dots; i++) {
		this._grid[i] = 'transparent';
	}
	// this.refreshReady = true;
    this.refresh();
	// $('#share-box').hide();
};

stitcher.prototype.create = function() {
	for(var i=0; i<this.dots; i++) {
		this._grid[i] = 'transparent';
	}
	//this.refreshReady = true;
	this.refresh();

	// ChangeUrl('Space Peg',"http://www.spacepegs.com/create/index.php");
	// $('#share-box').hide();
	// $('#create-your-own').hide();
};

stitcher.prototype.save = function() {

};

stitcher.prototype._draw = function(x, y, colorName) {
	if (colorName == 'transparent'){
		this.ctx.strokeStyle = "#00e0ff";
	} else {
		this.ctx.strokeStyle = colorName;
	}
	
	this.ctx.lineWidth = 1;
	
	this.ctx.beginPath();
	
	if (x >= this.xDot | y >= this.yDot) {
		return ;
	}

	if (x < 0 | y < 0) {
		return ;
	}
	
	this._grid[x + (y * this.xDot)] = colorName;

	this.ctx.fillStyle = colorName;

	this.ctx.rect(
		(x * this._distDot),
		(y * this._distDot),
		this._radius * 2,
		this._radius * 2
	);
	this.ctx.closePath();
	this.ctx.fill();
	this.ctx.stroke();

	// this.refreshReady = true;
};

stitcher.prototype._drawGridlines = function() {

    this.ctx.strokeStyle = "#00e0ff";
    this.ctx.lineWidth = 3;

    this.ctx.beginPath();

    this.ctx.moveTo(1, 0);
    this.ctx.lineTo(1, 21 * this.yDot);

    for(i=1; i <= this.xDot/10; i++) {
        this.ctx.moveTo(i * (21 * 10) - 2, 0);
        this.ctx.lineTo(i * (21 * 10) - 2, 21 * this.yDot);
        // console.log("i = " + i);
    }

    this.ctx.moveTo(0, 1);
    this.ctx.lineTo(21 * this.xDot, 1);

    for(j=1; j <= this.yDot/10; j++) {
        this.ctx.moveTo(0, j * (21 * 10) - 2);
        this.ctx.lineTo(21 * this.xDot, j * (21 * 10) - 2);
        // console.log("j = " + j);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    // this.refreshReady = true;
};

stitcher.prototype._onCanvasMouseUp = function(event) {
	this._mouseDown = false;
};

stitcher.prototype._onCanvasMouseDown = function(event) {
	this._mouseDown = true;
	// $('#share-box').hide();
};

stitcher.prototype._onCanvasMouseClick = function(event) {
	this._mouseDown = true;
	this._drawUsingMouseEvent(event);
	this._mouseDown = false;
}

stitcher.prototype._onCanvasMouseMove = function(event) {
	this._drawUsingMouseEvent(event);
	if(this._mouseDown == true)
	    this.refreshReady = true;
};

stitcher.prototype._drawUsingMouseEvent = function(event) {
	var relX = event.pageX - jQuery(this.canvas).offset().left;
	var relY = event.pageY - jQuery(this.canvas).offset().top;
	/*
	if (this._mouseDown === true && touchEnabled === true) {
		var x = Math.floor(relX / this._distDot);
		var y = Math.floor(relY / this._distDot);
		this._draw(x, y, this._color);
		this.refreshReady = true;
	}
	*/
    if (this._mouseDown === true) {
        var x = Math.floor(relX / this._distDot);
        var y = Math.floor(relY / this._distDot);
        this._draw(x, y, this._color);
        this.refreshReady = true;
    }
};

stitcher.prototype.updateTimer = function() {
	if(this.refreshReady == true) {
		this.refresh();
		this.refreshReady = false;
	}
};

(function($) {
  var methods = {
    init: function( options ) { 
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher', new stitcher(node));
    	});
    },
    refresh: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').refresh();
    	});
    },
    color: function(value) {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').color(value);
    	});
    },
    clear: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').clear();
    	});
    },
    create: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').create();
    	});
    },
    save: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').save();
    	});
    },
    load: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').load();
    	});
    },
    picture: function() {
    	return jQuery(this[0]).data('stitcher').picture(arguments[0]);
    },
    updateTimer: function() {
    	this.each(function(index, node) {
    		jQuery(node).data('stitcher').updateTimer();
    	});
    },
    mode: function(value) {
      this.each(function(index, node) {
          jQuery(node).data('stitcher').mode(value);
      });
    },
      resize: function(x, y) {
          this.each(function(index, node) {
              jQuery(node).data('stitcher').resize(x, y);
          });
      }
  };

  $.fn.stitcher = function( method ) {
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist' );
    }    
  };

})( jQuery );