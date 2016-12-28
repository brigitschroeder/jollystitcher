/**
 * Created by bschroeder on 12/28/16.
 */

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
var outlineCanvasOffset = $("#outlines").offset();
var offsetX = outlineCanvasOffset.left;
var offsetY = outlineCanvasOffset.top;

var startX;
var startY;
var isDown = false;

$("#outlinesTemp").css({
    left: -1200,
    top: 0
});

function drawLine(toX, toY, context) {
    context.beginPath();
    context.moveTo(startX.roundTo(21), startY.roundTo(21));
    context.lineTo(toX.roundTo(21), toY.roundTo(21));
    context.stroke();
}

function outlineMouseDown(e) {
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

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
        mouseX = parseInt(e.clientX - offsetX);
        mouseY = parseInt(e.clientY - offsetY);
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
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    outlineCtxTemp.clearRect(0, 0, outlineCanvasTemp.width, outlineCanvasTemp.height);
    drawLine(mouseX, mouseY, outlineCtxTemp);
}

$("#outlines").mousedown(function (e) {
    outlineMouseDown(e);
});
$("#outlines").mousemove(function (e) {
    outlineMouseMove(e);
});