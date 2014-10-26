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
var c1 = "#32201e";
var c2 = "#3f403b";
var c3 = "#9c9777";
var c4 = "#d52b1e";
var c5 = "#d52b1e";
var c6 = "#d52b1e";
//Joints
var jointThickness = 1;//real joint thickness in cm
//Draw
var drawmode = "random";

//Canvas
var canvas;
var ctx;

//do everything that needs to be done when document loads
$(document).ready(function() {

	/*
	 * Put all colors in array
	 */
	brickColors = [c1,c2,c3,c4,c5,c6];
	

	/*
	 * append hidden input with hex value behind brickcolor boxes
	 */
	var colorboxcounter = 0;
	$('.color-box').each(function() {
		//append hidden input
    	$(this).after("<input id=\"c"+(colorboxcounter+1)+"\" type=\"hidden\" value=\""+brickColors[colorboxcounter]+"\"></input>");
    	//create brickcolor boxes
    	$(this).colpick({
			colorScheme : 'dark',
			layout : 'rgbhex',
			color : brickColors[colorboxcounter],
			onSubmit : function(hsb, hex, rgb, el) {
				$(el).css('background-color', '#' + hex);
				$(el).colpickHide();
				$(el).next().attr("value",'#' + hex);
				updateParameters();
			}
		}).css('background-color', brickColors[colorboxcounter]);
		
		colorboxcounter++;
	});
	
	/*
	 * create the brickcolor boxes
	 */
	/*$('.color-box').colpick({
		colorScheme : 'dark',
		layout : 'rgbhex',
		color : '#c95d38',
		onSubmit : function(hsb, hex, rgb, el) {
			$(el).css('background-color', '#' + hex);
			$(el).colpickHide();
			$(el).next().attr("value",'#' + hex);
			updateParameters();
		}
	}).css('background-color', '#c95d38');*/

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
	
	/*
	 * Downloads
	 */
	var link = document.getElementById('download_png');
	link.addEventListener('click', downloadImage, false);
	
	function downloadImage() {
		//reset and redraw canvas to full size
		prepareCanvas();
		drawBricks();
		
		var canvas = document.getElementById("canvas");
		var fileName = "brickpattern";
		link.download = fileName + ".png";
		var dt = canvas.toDataURL('image/png');
		this.href = dt;
		
		//redraw back to small size
		refresh();
	};
	
	refresh();
});


/**
 *Main Refresh function, used to generate and draw the bricks 
 */
function refresh() {
	//updateParameters();
	prepareCanvas();
	fitCanvasToScreen();	
	drawBricks();	
}

/**
 * Prepare Canvas for drawing
 */
function prepareCanvas(){
	//clear canvas
	canvas.width = canvas.width;
	//resize canvas to facade size
	$("#canvas").attr("width",fw);
	$("#canvas").attr("height",fh);
}

/**
 *Rescales the canvas to fit the screen 
 */
function fitCanvasToScreen(){
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
}

/**
 *Calculates and draws all bricks 
 */
function drawBricks(){
	console.log("----------------");
	//Calculate brick positions
	//calculate the offset to be used
	var os = offset%bw;
	var osTotal = 0;
	//generate all the bricks
	for(var h =0; h<fh; h+=bh){
		for(var w =0; w<fw+bw; w+=bw){
			var b = new Brick(w - osTotal, h, bw, bh, pickColor(w-osTotal,h));
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
	
	refresh();
}

/**
 * Hides unused pickcolors
 */
function updateColorpickers(){
	var numItems = $('.yourclass').length
	
	var c = 0;
	$('.color-box').each(function() {
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
function pickColor(w,h){
	var returnString = "";
	
	switch (drawmode) { 
	    case 'random': 
	        returnString = brickColors[Math.floor(Math.random() * (nc))];
	        break;
	        
	    case 'perlin noise' :
	    	//generate value between 0 and 1 with perlin noise
	    	var x = w/fw; // normalize w
	    	var y = h/fh; // normalize h
			var size = 5;  // pick a scaling value
			var n = PerlinNoise.noise( size*x, size*y, .8 );
			returnString = gradientGetColor(1,n);
	    	break;
	    
	    case 'gradient vertical':
	    	returnString = gradientGetColor(fh,h);
	    	break;
	        
	    case 'gradient horizontal':
	    	returnString = gradientGetColor(fw,w);
	    	break;
	    	
	   	case 'gradient diagonal down':
	    	returnString = gradientGetColor(Math.sqrt(Math.pow(fw, 2) + Math.pow(fh, 2)),Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)));
	    	break;
	    
	    case 'gradient diagonal up':
	    	returnString = gradientGetColor(Math.sqrt(Math.pow(fw, 2) + Math.pow(fh, 2)),Math.sqrt(Math.pow(w, 2) + Math.pow((fh-h), 2)));
	    	break;
	    	
	    default:
	        returnString = brickColors[0];
	        break;
	}
	
	return returnString;
}

/**
 *Gets color for gradient over a given length L for the current position w 
 *
 * @param
 * @param
 * @return
 */
function gradientGetColor(L,w,cutoffPoints){
	//only calculate if more than 1 color is selected; otherwise always select color 1
	if(nc>1 && w > 0){
		//equal distance interval between which we switch colors
		var gradientInterval = (nc>1) ? L/(nc-1) : L;
			    	
		//array with weights per color
		var colorWeights = new Array();
		//array with cutoffpoints  (x1---x2-------x3)
		var cutoffPoints = new Array();
		//populate arrays
		for(var i = 0; i<(nc); i++){
			var weight = (i>0) ? 0 : 100;
			colorWeights.push(weight);
			cutoffPoints.unshift(L-i*gradientInterval);
		}
		
		var cutoffPoints = new Array();
		for(var i = 0; i<(nc); i++){
			cutoffPoints.unshift(L-i*gradientInterval);
		}
		
		for(var j = 0; j+1<colorWeights.length; j++){
			if(cutoffPoints[j] <= w && w < cutoffPoints[j+1]){
				//value of current position remapped as value between 0 and 100
				var weightedValue = ((100*(w-cutoffPoints[j]))/(cutoffPoints[j+1] - cutoffPoints[j]));
				colorWeights[j] = 100 - weightedValue;
				colorWeights[j+1] = weightedValue;
				//if(j==0) console.log(cutoffPoints[j]+" "+cutoffPoints[j+1]+" "+w+" "+weightedValue+" - "+colorWeights[j]+" "+colorWeights[j+1]);
			} else{
				//only set weight to 0 if the previous loop didnt affect this value (to avoid overriding it)
				if(!(cutoffPoints[j-1] <= w && w < cutoffPoints[j])) colorWeights[j] = 0;
				//console.log(cutoffPoints[j]+" "+cutoffPoints[j+1]+" "+w+" - "+colorWeights[j]+" "+colorWeights[j+1]);
			}
		}
		
		return brickColors[pickWeightedRandom(colorWeights)];
	} else{
		return brickColors[0];
	}
}

/**
 *Weighted Random Picker 
 * 
 * @param
 * @return
 */
function pickWeightedRandom(weigths){
	var returnValue = 0;
	
	//get sum of all weights
	var weightTotal = 0;
	for(var l = 0; l< weigths.length; l++){
		 weightTotal += weigths[l];
	}		
	//random number based on sum
	var rand = Math.floor((Math.random() * weightTotal) + 1);
	//find color the rand. belongs to
	var totalWeightChecked = weigths[0];
	for(var k = 0; k < weigths.length; k++){
		if(totalWeightChecked>=rand){
			returnValue = k;
			break;
		} else{
			totalWeightChecked += weigths[k+1];
		}
	}
	return returnValue;
}


/********************************************
 * CLASS brick								*
 *											*
 * @param float								*	
 * @param float								*
 * @param float								*	
 * @param float								*	
 * @param Color								*
 ********************************************/
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

/*
 *Saving images 
 */

/**
 *Saves a png 
 */
function downloadCanvas() {

}
