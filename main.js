IndexController = function() {};

IndexController.prototype.start = function() {
	this._stitchers = jQuery(document).find('.stitcher');
	this._stitchers.stitcher();

	jQuery(".stitcherUI #threadpicker").change(jQuery.proxy(this._updateColor, this));
    jQuery(".stitcherUI #modepicker").change(jQuery.proxy(this._updateMode, this));
    jQuery("#modalEditSettings .saveChanges").click(jQuery.proxy(this._updateSettings, this));
    jQuery(".stitcherUI button").click(jQuery.proxy(this._onActionClick, this));
	
	this._updateColor();
    this._updateMode();
};

IndexController.prototype._updateColor = function() {
	var colorValue = jQuery("#threadpicker").val();
	this._stitchers.stitcher('color', colorValue);
	return false;
};

IndexController.prototype._updateMode = function() {
    var modeValue = jQuery("#modepicker").val();
    this._stitchers.stitcher('mode', modeValue);

    $('#outlines').css('z-index', 999);
    $('#stitcher').css('z-index', 0);
    if (jQuery("#modepicker").val() == 'outline') {
        // $('#outlines').css('z-index', 999);
        // $('#stitcher').css('z-index', 0);
        $('#outlines').css('pointer-events', 'all');
    } else {
        // $('#stitcher').css('z-index', 999);
        // $('#outlines').css('z-index', 0);
        $('#outlines').css('pointer-events', 'none');
    }

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
    if (modalName == 'modalEditSettings'){
        chartWidth = $('#chartWidth').val();
        chartHeight = $('#chartHeight').val();
        $('#modalEditSettings').modal('hide');
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

	this.refreshReady = false;
	self = this;
	this.refreshTimer = setInterval(function() { self.updateTimer(); }, 120);

	this.canvas = canvas;

	this._color = 'yellow';
    this._mode = 'full';
    this.xDot = 100;
    this.yDot = 100;

	$('#chartWidth').val(this.xDot);
	$('#chartHeight').val(this.yDot);

	// this._grid = [];
    this.stitches = [];

	var imageid = jQuery.getQuery('imageid');
	if (imageid.length > 0){	
		this.load(imageid);
	}
	// this.refreshReady = true;

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
	// this.refreshReady = true;
	
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
	// this.refreshReady = true;
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
			yDot: this.yDot
		};
	} else {
		this._xDot = picture.xDot;
		this._yDot = picture.yDot
	}
	this.refreshReady = true;
};

stitcher.prototype.refresh = function() {
    var self = this;
	console.log('refreshing...');
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
	//draw stitches
	for(var i=0; i<this.dots; i++) {
		var x = i % this.xDot;
		var y = Math.floor(i / this.xDot) % this.yDot;
		
		// this._draw(x, y, this._grid[i]);
        /*this._draw(x, y, this.stitches[i].full, 'full');
        this._draw(x, y, this.stitches[i].halfL, 'halfL');
        this._draw(x, y, this.stitches[i].halfR, 'halfR');
        this._draw(x, y, this.stitches[i].tqBL, 'tqBL');
        this._draw(x, y, this.stitches[i].tqBR, 'tqBR');
        this._draw(x, y, this.stitches[i].tqTL, 'tqTL');
        this._draw(x, y, this.stitches[i].tqTR, 'tqTR');
        this._draw(x, y, this.stitches[i].qBL, 'qBL');
        this._draw(x, y, this.stitches[i].qBR, 'qBR');
        this._draw(x, y, this.stitches[i].qTL, 'qTL');
        this._draw(x, y, this.stitches[i].qTR, 'qTR');*/

        var modes = ["full", "halfL", "halfR", "tqBL", "tqBR", "tqTL", "tqTR", "qBL", "qBR", "qTL", "qTR"];
        modes.forEach(function(mode) {
            if(self.stitches[i][mode] != 'transparent'){
                self._draw(x, y, self.stitches[i][mode], mode);
            }
        });
	}

};
stitcher.prototype.color = function(a) {
	this._color = a;
};
stitcher.prototype.mode = function(a) {
    this._mode = a;
    // console.log(this._mode);
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
            newgrid[j] = this.stitches[currIndex];
        } else {
            newgrid[j] = {
                full:'transparent',
                halfL:'transparent',
                halfR:'transparent',
                tqBL:'transparent',
                tqBR:'transparent',
                tqTL:'transparent',
                tqTR:'transparent',
                qBL:'transparent',
                qBR:'transparent',
                qTL:'transparent',
                qTR:'transparent'
            };
        }
    }
    this.xDot = x;
    this.yDot = y;
    this.stitches = newgrid;
	$('#chartWidth').val(x);
	$('#chartHeight').val(y);
};
stitcher.prototype.clear = function() {
	for(var i=0; i<this.dots; i++) {
		// this._grid[i] = 'transparent';
        this.stitches[i] = {
            full:'transparent',
            halfL:'transparent',
            halfR:'transparent',
            tqBL:'transparent',
            tqBR:'transparent',
            tqTL:'transparent',
            tqTR:'transparent',
            qBL:'transparent',
            qBR:'transparent',
            qTL:'transparent',
            qTR:'transparent'
        };
	}
	// this.refreshReady = true;
    this.refresh();
	// $('#share-box').hide();
};

stitcher.prototype.create = function() {
	for(var i=0; i<this.dots; i++) {
		// this._grid[i] = 'transparent';
        this.stitches[i] = {
            full:'transparent',
            halfL:'transparent',
            halfR:'transparent',
            tqBL:'transparent',
            tqBR:'transparent',
            tqTL:'transparent',
            tqTR:'transparent',
            qBL:'transparent',
            qBR:'transparent',
            qTL:'transparent',
            qTR:'transparent'
        };
	}
	//this.refreshReady = true;
	this.refresh();

	// ChangeUrl('Space Peg',"http://www.spacepegs.com/create/index.php");
	// $('#share-box').hide();
	// $('#create-your-own').hide();
};

stitcher.prototype.save = function() {

};

stitcher.prototype._draw = function(x, y, colorName, stitchType) {

	if (x >= this.xDot | y >= this.yDot) {
		return ;
	}

	if (x < 0 | y < 0) {
		return ;
	}

	// this._grid[x + (y * this.xDot)] = colorName;
    this.stitches[x + (y * this.xDot)][stitchType] = colorName;

	this.ctx.fillStyle = colorName;
    this.ctx.beginPath();

    // draw stitches
    if (stitchType == 'full'){ // Full stitch
        this.ctx.rect(x * this._distDot, y * this._distDot, this._radius * 2, this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
        this.stitches[x + (y * this.xDot)].qBL = 'transparent';
        this.stitches[x + (y * this.xDot)].qBR = 'transparent';
        this.stitches[x + (y * this.xDot)].qTL = 'transparent';
        this.stitches[x + (y * this.xDot)].qTR = 'transparent';
    }
    else if(stitchType == 'halfL'){ // Half stitch left
        this.ctx.moveTo(x * this._distDot, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot);
        this.ctx.lineTo(x * this._distDot, y * this._distDot + this._radius);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
        this.stitches[x + (y * this.xDot)].qBL = 'transparent';
        this.stitches[x + (y * this.xDot)].qTR = 'transparent';
    }
    else if(stitchType == 'halfR'){ // Half stitch right
        this.ctx.moveTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
        this.stitches[x + (y * this.xDot)].qBR = 'transparent';
        this.stitches[x + (y * this.xDot)].qTL = 'transparent';
    }
    else if(stitchType == 'tqBL'){ // Three quarter stitch bottom left
        this.ctx.moveTo(x * this._distDot, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot, y * this._distDot);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].qBL = 'transparent';
        this.stitches[x + (y * this.xDot)].qBR = 'transparent';
        this.stitches[x + (y * this.xDot)].qTL = 'transparent';
    }
    else if(stitchType == 'tqBR'){ // Three quarter stitch bottom right
        this.ctx.moveTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot);
        this.ctx.lineTo(x * this._distDot, y * this._distDot + this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
        this.stitches[x + (y * this.xDot)].qBL = 'transparent';
        this.stitches[x + (y * this.xDot)].qBR = 'transparent';
        this.stitches[x + (y * this.xDot)].qTR = 'transparent';
    }
    else if(stitchType == 'tqTL'){ // Three quarter stitch top left
        this.ctx.moveTo(x * this._distDot, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot);
        this.ctx.lineTo(x * this._distDot, y * this._distDot + this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
        this.stitches[x + (y * this.xDot)].qBL = 'transparent';
        this.stitches[x + (y * this.xDot)].qTL = 'transparent';
        this.stitches[x + (y * this.xDot)].qTR = 'transparent';
    } else if(stitchType == 'tqTR'){ // Three quarter stitch top right
        this.ctx.moveTo(x * this._distDot + this._radius * 2, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].qBR = 'transparent';
        this.stitches[x + (y * this.xDot)].qTL = 'transparent';
        this.stitches[x + (y * this.xDot)].qTR = 'transparent';
        this.ctx.lineTo(x * this._distDot, y * this._distDot);
    } else if(stitchType == 'qBL'){ // Quarter stitch bottom left
        this.ctx.moveTo(x * this._distDot, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
    } else if(stitchType == 'qBR'){ // Quarter stitch bottom right
        this.ctx.moveTo(x * this._distDot + this._radius, y * this._distDot + this._radius * 2);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius * 2);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
    } else if(stitchType == 'qTL'){ // Quarter stitch top left
        this.ctx.moveTo(x * this._distDot, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot + this._radius);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
    } else if(stitchType == 'qTR'){ // Quarter stitch top right
        this.ctx.moveTo(x * this._distDot + this._radius, y * this._distDot + this._radius);
        this.ctx.lineTo(x * this._distDot + this._radius, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot);
        this.ctx.lineTo(x * this._distDot + this._radius * 2, y * this._distDot + this._radius);
        // resolve stitch type conflicts
        this.stitches[x + (y * this.xDot)].full = 'transparent';
        this.stitches[x + (y * this.xDot)].halfL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqBR = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTL = 'transparent';
        this.stitches[x + (y * this.xDot)].tqTR = 'transparent';
    }

    this.ctx.closePath();
	this.ctx.fill();

};

stitcher.prototype._drawGridlines = function() {

    // grid
    this.ctx.strokeStyle = "#00e0ff";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for(var i=0; i<this.dots; i++) {
        var x = i % this.xDot;
        var y = Math.floor(i / this.xDot) % this.yDot;
        this.ctx.rect(
            (x * this._distDot),
            (y * this._distDot),
            this._radius * 2,
            this._radius * 2
        );
        this.ctx.closePath();
    }

    this.ctx.stroke();

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

	// mark middle of pattern
	this.ctx.beginPath();
	this.ctx.strokeStyle = "#92278f";
	this.ctx.moveTo(21*Math.floor(this.xDot/2) -2, 0);
	this.ctx.lineTo(21*Math.floor(this.xDot/2) -2, 21 * this.yDot);
	this.ctx.moveTo(0, 21*Math.floor(this.yDot/2) -2);
	this.ctx.lineTo(21 * this.xDot, 21*Math.floor(this.yDot/2) -2);
	this.ctx.closePath();
	this.ctx.stroke();

    // this.refreshReady = true;
};

stitcher.prototype._onCanvasMouseUp = function(event) {
	this._mouseDown = false;
    this.refreshReady = true;
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
	if(this._mouseDown == true){
        // this.refreshReady = true;
    }
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
        this._draw(x, y, this._color, this._mode);
        // this.refreshReady = true;
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

  // Begin outlines code
    Number.prototype.roundTo = function(num) {
        var resto = this%num;
        if (resto <= (num/2)) {
            return this-resto;
        } else {
            return this+num-resto;
        }
    };

    var outlineCanvas = document.getElementById("outlines");
    var outlineCtx = outlineCanvas.getContext("2d");
    var outlineCanvasTemp = document.getElementById("outlinesTemp");
    var outlineCtxTemp = outlineCanvasTemp.getContext("2d");
    var startX;
    var startY;
    var isDown = false;

    $("#outlinesTemp").css({
        left: -1200,
        top: 0
    });

    function drawLine(toX, toY, context) {
        context.lineWidth = 2;
        context.strokeStyle = jQuery("#threadpicker").val();
        context.beginPath();
        context.moveTo(startX.roundTo(21) - 1, startY.roundTo(21) - 1);
        context.lineTo(toX.roundTo(21) - 1, toY.roundTo(21) - 1);
        context.stroke();
    }

    function outlineMouseDown(e) {
        e.preventDefault();
        // mouseX = parseInt(e.clientX - offsetX);
        // mouseY = parseInt(e.clientY - offsetY);
        mouseX = e.pageX - $("#outlines").offset().left;
        mouseY = e.pageY - $("#outlines").offset().top;

        isDown = !isDown;

        if (isDown == true){
            startX = mouseX;
            startY = mouseY;
            outlineCtxTemp.clearRect(0, 0, outlineCanvasTemp.width, outlineCanvasTemp.height);
            $("#outlinesTemp").css({
                left: 0,
                top: 0
            });
        }
        if (isDown == false){
            // mouseX = parseInt(e.clientX - offsetX);
            // mouseY = parseInt(e.clientY - offsetY);
            mouseX = e.pageX - $("#outlines").offset().left;
            mouseY = e.pageY - $("#outlines").offset().top;
            $("#outlinesTemp").css({
                left: -1200,
                top: 0
            });
            drawLine(mouseX, mouseY, outlineCtx);
        }
    }

    function outlineMouseMove(e) {
        e.preventDefault();
        if (!isDown) {
            return;
        }
        // mouseX = parseInt(e.clientX - offsetX);
        // mouseY = parseInt(e.clientY - offsetY);
        mouseX = e.pageX - $("#outlines").offset().left;
        mouseY = e.pageY - $("#outlines").offset().top;
        outlineCtxTemp.clearRect(0, 0, outlineCanvasTemp.width, outlineCanvasTemp.height);
        drawLine(mouseX, mouseY, outlineCtxTemp);
    }

    $("#outlines").mousedown(function (e) {
        outlineMouseDown(e);
    });
    $("#outlines").mousemove(function (e) {
        outlineMouseMove(e);
    });

})( jQuery );