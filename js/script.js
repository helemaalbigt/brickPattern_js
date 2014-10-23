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
var offset = 0;//offset each row of bricks should have relative to the previous one
//Colors
var brickColors = new Array();//array containing all possible brick colors

//Joints
var jointThickness = 1;//real joint thickness in cm
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
	 * initialize canvas
	 */
	//resize
	$("#canvas").attr("width",$("#canvas_wrapper").width());
	$("#canvas").attr("height",$("#canvas_wrapper").height());
	//define variables
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");


	/*
	 * add eventlistener to all parameters and update them
	 */
	$( ".input" ).change(function() {
  		updateParameters();
	});

});

function refresh() {
	//clear canvas
	canvas.width = canvas.width;
	//update all inputparameter
	updateParameters();
	//calculate the offset to be used
	var os = offset%bw;
	var osTotal = 0;
	//generate all the bricks
	for(var h =0; h<fh; h+=bh){
		for(var w =0; w<fw; w+=bw){
			//console.log(h+" "+bh+" "+fh);
			var b = new Brick(w + osTotal, h, bw, bh, "rgb(200,100,60)");
			b.draw();
		}
		//handle offset Total
		if(osTotal+os<(bw)){
			osTotal+=os;
		}  else{
			osTotal = 0;
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
	offset = parseInt($('#offset').val());
}

/**
 * CLASS brick
 *
 * @param float
 * @param float
 * @param float
 * @param float
 * @param Color
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
	ctx.beginPath();
    ctx.rect(this.xPos,this.yPos,this.brickW,this.brickH);
    ctx.fillStyle = this.c;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.stroke();
}
