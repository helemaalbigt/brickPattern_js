/**
 * @author Thomas
 */

//GLOBAL VARIABLES
//General
var scaleFactor = 1;
//the factor by which we multiply to go from real dimension to pixel dimension
//Facade
var fw = 900;//real facade width in cm
var fh = 600;//real facade height in cm
//Bricks
var bricks = new Array();
var bw = 32;//real width of brick in cm
var bh = 16;//real heigth of brick in cm
var pxW = 32;//brick absolute width in pixels
var pxH = 16;//brick absolute height in pixels
//Colors
var brickColors = new Array();//array containing all possible brick colors
var c1 = new fabric.Color('rgb(10,10,10)');
var c2 = new fabric.Color('rgb(30,30,30)');
var c3 = new fabric.Color('rgb(50,50,50)');
var c4 = new fabric.Color('rgb(70,70,70)');
var c5 = new fabric.Color('rgb(90,90,90)');
var c6 = new fabric.Color('rgb(100,0,0)');
//Joints
var jointThickness = 1;//real joint thickness in cm
var jc = new fabric.Color('rgb(160,160,160)');
//Draw
var drawmode = "uniform";

//Canvas
var canvas;
var ctx;

//do everything that needs to be done when document loads
$(document).ready(function() {

	/*
	 * create the brickcolor boxes
	 */
	$('.color-box').colpick({
		colorScheme : 'dark',
		layout : 'rgbhex',
		color : 'ff8800',
		onSubmit : function(hsb, hex, rgb, el) {
			$(el).css('background-color', '#' + hex);
			$(el).colpickHide();
		}
	}).css('background-color', '#ff8800');

	/*
	 * initialize fabric canvas
	 */
	canvas = new fabric.Canvas('canvas');
	canvas.setWidth($("#canvas_wrapper").width());
	canvas.setHeight($("#canvas_wrapper").height());
	//disable renderOnAddRemove to increase performance
	canvas.renderOnAddRemove = false;

	/*
	 * add eventlistener to all parameters and update them
	 */
	$( ".input" ).change(function() {
  		updateParameters();
	});

});

function refresh() {
	canvas.clear().renderAll();
	updateParameters();
	for(var w =0; w<fw; w+=bw){
		for(var h =0; h<fh; h+=bh){
			//console.log(h+" "+bh+" "+fh);
			var b = new Brick(w, h, bw, bh, c6);
			b.draw();
		}
	}
	
}

/**
 *Updates all parameter 
 */
function updateParameters(){
	fw = parseInt($('#fw').val());
	fh = parseInt($('#fh').val());
	bw = parseInt($('#bw').val());
	bh = parseInt($('#bh').val());
}

/**
 * CLASS brick
 *
 * @param float
 * @param float
 * @param float
 * @param float
 * @param fabric.Color
 */
function Brick(xPos, yPos, brickW, brickH, c) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.brickW = brickW;
	this.brickH = brickH;
	this.c = c;
}

/**
 * draws the brick
 *
 * @param
 * @return
 */
Brick.prototype.draw = function() {

	var rect = new fabric.Rect({
		left : this.xPos,
		top : this.yPos,
		fill : 'rgb(200,0,200)',
		width : this.brickW,
		height : this.brickH,
		stroke : jc,
		strokeWidth : 1,
		hasControls : false,
		hasRotatingPoint : false,
		hasBorders : false,
		evented : false
	});

	canvas.add(rect);
	canvas.renderAll();
}
