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
var nc = 6;
var c1 = "#c95d38";
var c2 = "#c95d38";
var c3 = "#c95d38";
var c4 = "#c95d38";
var c5 = "#c95d38";
var c6 = "#c95d38";
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
	 * append hidden input with hex value behind brickcolor boxes
	 */
	var colorboxcounter = 1;
	$('.color-box').each(function() {
    	$(this).after("<input id=\"c"+colorboxcounter+"\" type=\"hidden\" value=\"#c95d38\"></input>");
		colorboxcounter++;
	});
	
	/*
	 * create the brickcolor boxes
	 */
	$('.color-box').colpick({
		colorScheme : 'dark',
		layout : 'rgbhex',
		color : '#c95d38',
		onSubmit : function(hsb, hex, rgb, el) {
			$(el).css('background-color', '#' + hex);
			$(el).colpickHide();
			$(el).next().attr("value",'#' + hex);
			updateParameters();
		}
	}).css('background-color', '#c95d38');
	
	/*
	 * Put all colors in array
	 */
	brickColors = [c1,c2,c3,c4,c5,c6];
	

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
	updateParameters();
	
	/*
	 * Hide unused colors
	 */
	$("#nc").change(function() {
		updateColorpickers();
	});
	updateColorpickers();

});


/**
 *Main Refresh function, used to generate and draw the bricks 
 */
function refresh() {
	//clear canvas
	canvas.width = canvas.width;
	//update all inputparameter
	updateParameters();
	//resize canvas to facade size
	$("#canvas").attr("width",fw);
	$("#canvas").attr("height",fh);
	
	//rescale canvas to screen size
	//if one of the borders crosses the screen, resize
	if(fw>$("#canvas_wrapper").width() || fh>$("#canvas_wrapper").height()){
		//determine scalefactor
		scaleFactor = Math.min($("#canvas_wrapper").width()/fw, $("#canvas_wrapper").height()/fh);

		//correctcanvas border
		$("#canvas").attr("width",fw*scaleFactor);
	} else{
		scaleFactor = 1;
	} 
	ctx.scale(scaleFactor,scaleFactor);
		
	//Calculate brick positions
	//calculate the offset to be used
	var os = offset%bw;
	var osTotal = 0;
	//generate all the bricks
	for(var h =0; h<fh; h+=bh){
		for(var w =0; w<fw+bw; w+=bw){
			var b = new Brick(w - osTotal, h, bw, bh, pickColor());
			b.draw();
		}
		//handle offset Total counter
		osTotal = (osTotal+os<(bw)) ? (osTotal+os) : 0;
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
	
	nc = parseInt($('#nc').val());
	brickColors[0] = $('#c1').val();
	brickColors[1] = $('#c2').val();
	brickColors[2] = $('#c3').val();
	brickColors[3] = $('#c4').val();
	brickColors[4] = $('#c5').val();
	brickColors[5] = $('#c6').val();
	
	drawmode = $('#drawmode').val();
}

/**
 * Hides unused pickcolors
 */
function updateColorpickers(){
	var numItems = $('.yourclass').length
	
	var c = 0;
	$('.color-box').each(function() {
		console.log(c+" "+nc);
		var display = (c<nc) ? "block" : "none";
		$(this).css("display", display);
		c++;	
	});
}


/**
 *Updates all parameter s
 * 
 * @return String Color in hex format
 */
function pickColor(){
	var returnString = "";
	
	switch (drawmode) { 
	    case 'random': 
	        returnString = brickColors[Math.floor(Math.random() * (nc))];
	        break;
	    default:
	        returnString = brickColors[0];
	        break;
	}
	
	return returnString;
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
