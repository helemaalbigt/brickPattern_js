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
//Joints
var jt = 1; //joint thickness
var jc = "#424242"; //joint color
//Colors
var brickColors = new Array();//array containing all possible brick colors
var nc = 6;
var c1 = "#e0e0e0";
var c2 = "#b8b8b8";
var c3 = "#909090";
var c4 = "#d52b1e";
var c5 = "#d52b1e";
var c6 = "#d52b1e";
//Color Weights
var brickColorWeights = new Array();//array containing all brick color weights
var cw1 = 100;
var cw2 = 100;
var cw3 = 100;
var cw4 = 100;
var cw5 = 100;
var cw6 = 100;
//Joints
var jointThickness = 1;//real joint thickness in cm
//Draw
var drawmode = "random";
var pScale = 5;
var gradientDirection = "horizontal";
var em = 0; //GRADIENT: edge margin
//Image
var imageUploaded = false;
var img = null;
var imgW = 0;
var imgH = 0;

//Canvas
var canvas;
var ctx;

//do everything that needs to be done when document loads
$(document).ready(function() {
	
	/*
	 * JOINTS
	 */
	//create joint color box and hidden color value
	$('.color-box-joints').each(function() {
		//append hidden input
    	$(this).after("<input id=\"jc\" type=\"hidden\" value=\""+jc+"\"></input>");
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
		}).css('background-color', jc);
		
	});

	/*
	 * BRICKS
	 */
	brickColors = [c1,c2,c3,c4,c5,c6];
	brickColorWeights = [cw1,cw2,cw3,cw4,cw5,cw6];

	//append hidden input with hex value behind brickcolor boxes, also create them boxes
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
	 * CANVAS
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
	
	/*
	 * Add event listener to sliders and colorweightinput
	 */
	$('.vertical').each(function() {
		//change the inputvalue when handeling slider
  		$(this).on('input', function() {
 			$(this).next().attr( "value", $(this).val() );
			$(this).next().val( $(this).val() );
		});
		
		//update once slider is released
		$(this).change(function(){
			updateParameters();
			refresh();
		});
	});
	
	/*
	 * Add event listeners to each colorweightinput
	 */
	$(".smallinput_weight").each(function(){
		$(this).change(function(){
			$(this).prev().val($(this).val());
			updateParameters();
			refresh();
		});
	});
	
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
	/*
	 *INPUT DATA 
	 */
	
	//if handeling images, preserve aspect ration
	if(imageUploaded && drawmode == "photo reference"){
		//check whether width or height was adjusted
		if(fw!=$('#fw').val()){
			fh = fh*(parseInt($('#fw').val())/fw);
			fw = parseInt($('#fw').val());
			//change input box value
			$( "#fh" ).attr( "value", fh );
			$( "#fh" ).val( fh );
		} 
		//if not set dilmensions to given input
		else if(fh!=$('#fh').val()){
			fw = fw*(parseInt($('#fh').val())/fh);
			fh = parseInt($('#fh').val());
			//change input box value
			$( "#fw" ).attr( "value", fw );
			$( "#fw" ).val( fw );
		}	
	} else{
		fw = parseInt($('#fw').val());
		fh = parseInt($('#fh').val());
	}
	
	bw = parseInt($('#bw').val());
	bh = parseInt($('#bh').val());
	offset = parseInt($('#offset').val());
	
	//joints
	jt = parseInt($('#jt').val());
	jc = $('#jc').val();
	
	//brick colors
	nc = parseInt($('#nc').val());
	brickColors[0] = $('#c1').val();
	brickColors[1] = $('#c2').val();
	brickColors[2] = $('#c3').val();
	brickColors[3] = $('#c4').val();
	brickColors[4] = $('#c5').val();
	brickColors[5] = $('#c6').val();
	
	drawmode = $('#drawmode').val();
	
	brickColorWeights[0] = parseInt($('#cw1').val());
	brickColorWeights[1] = parseInt($('#cw2').val());
	brickColorWeights[2] = parseInt($('#cw3').val());
	brickColorWeights[3] = parseInt($('#cw4').val());
	brickColorWeights[4] = parseInt($('#cw5').val());
	brickColorWeights[5] = parseInt($('#cw6').val());
	pScale = parseInt($('#pScale').val());
	em = parseInt($('#em').val());
	gradientDirection = $('#gradientDirection').val()
	
	/*
	 * VISIBILITY
	 */
	
	//handke visibility for drawmode options
	$('.drawmode_options').each(function() {
		$(this).hide();
	});
	//make elements visible based on selected
	switch (drawmode) { 
		case 'random':
			$("#random_options").show();
			break;
		
	    case 'gradient': 
	    	$("#gradient_direction").show();
	    	$("#gradient_margin").show();
	    	break;
	    	
	    case 'perlin noise': 
	    	$("#perlin_scale").show();
	    	//$("#gradient_margin").show();
	    	break;
	    	
	   	case 'photo reference': 
	    	$("#image_upload").show();
	    	break;
	    	
	}
	//updates colors of the weight boxes in the random option
	updateColorWeightBoxes();
	
	refresh();
}

/*
 * Updates colors of all color weight boxes
 */
function updateColorWeightBoxes(){
	var counter = 0;
	$('.color-box-weights_preview').each(function() {
		$(this).css('background-color', brickColors[counter]);
		counter++;
	});
}

/**
 * Hides unused pickcolors (and the random weight counterpart)
 */
function updateColorpickers(){
	var numItems = $('.yourclass').length
	
	var c = 0;
	$('.color-box').each(function() {
		var display = (c<nc) ? "block" : "none";
		$(this).css("display", display);
		c++;	
	});
	
	c = 0;
	$('.color-box-weights').each(function() {
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
	    	//create a new array with only the weights of the selected colors
	    	var reducedWeightsArray = new Array();
	    	for(var i = 0; i<nc; i++){
	    		reducedWeightsArray.push(brickColorWeights[i]); 
	    	}
	    	returnString = brickColors[pickWeightedRandom(reducedWeightsArray)];
	        //returnString = brickColors[Math.floor(Math.random() * (nc))];
	        break;
	        
	    case 'perlin noise' :
	    	//generate value between 0 and 1 with perlin noise
	    	var x = w/fw; // normalize w
	    	var y = h/fh; // normalize h
			var size = pScale;  // pick a scaling value
			var n = PerlinNoise.noise( size*x, size*y, .8 );
			returnString = gradientGetColor(1,n,em);
	    	break;
	    	
	    case 'gradient':
	    	//check direction
	    	switch(gradientDirection) {
	    		case 'vertical':
	    			returnString = gradientGetColor(fh,h,em);
	    			break;
	    			
	    		case 'diagonal down':
	    			returnString = gradientGetColor(Math.sqrt(Math.pow(fw, 2) + Math.pow(fh, 2)),Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)),em);
	    			break;
	    		
	    		case 'diagonal up':
	    			returnString = gradientGetColor(Math.sqrt(Math.pow(fw, 2) + Math.pow(fh, 2)),Math.sqrt(Math.pow(w, 2) + Math.pow((fh-h), 2)),em);
	    			break;
	    		
	    		default:
	    			//horizontal gradient by default
	    			returnString = gradientGetColor(fw,w,em);
	    			break;
	    	}
	    	break;
	    	
	    default:
	    	//uniform by default
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
 * @param float edgeMargin
 * @return
 */
function gradientGetColor(L,w,edgeMargin){
	//only calculate if more than 1 color is selected; otherwise always select color 1
	if(nc>1 && w > 0){
		//equal distance interval between which we switch colors
		var gradientInterval = (nc>1) ? (L-(edgeMargin*2))/(nc-1) : L;
			    	
		//array with weights per color
		var colorWeights = new Array();
		//array with cutoffpoints  (x1---x2-------x3)
		var cutoffPoints = new Array();
		//populate arrays
		for(var i = 0; i<(nc); i++){
			var weight = (i>0) ? 0 : 100;
			colorWeights.push(weight);
			cutoffPoints.unshift((L-edgeMargin)-i*gradientInterval);
		}
		
		for(var j = 0; j+1<colorWeights.length; j++){
			console.log(colorWeights.length);
			//positioned within the edgemargins with constant color
			if(w<=edgeMargin){
				if(j==0){
					colorWeights[j]=100;
				}else{
					colorWeights[j]=0;
				}
			} else if(w>=(L-edgeMargin)){
				//console.log(j+" - "+(nc-1));
				if((j+1)==(nc-1)){
					colorWeights[j+1]=100;
					colorWeights[j]=0;
				}else{
					colorWeights[j]=0;
				}
				//alert("ok "+w+" "+(fw-em));
			} 
			//positioned within the gradient area
			else if(cutoffPoints[j] <= w && w < cutoffPoints[j+1]){
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

/*
 * Handles uploaded images
 */
//activate fileselect
function onFileSelected(event) {
	var selectedFile = event.target.files[0];
	var reader = new FileReader();
	imgInputFocus = true;

	//changethe miniature image seen in the sidebar
	var imgtag = document.getElementById("input_img");
	imgtag.title = selectedFile.name;
	//create an offscreen image the same size as the orignal image
	//this is done bcs the sidebar image will be made smaller to fit in the sidebar
	//this image will be used by the canvas to generate the pattern
	var canvasImage = $('<img id="canvasImage">').addClass("canvasImage")[0];
	//canvasImage.addClass("canvasImage");
	canvasImage.title = selectedFile.name;

	reader.onload = function(event) {
		imgtag.src = event.target.result;
		canvasImage.src = event.target.result;
		//as soon as the image has loaded completely, assign it to 'img' and refresh the canvas
		canvasImage.onload = function(event) {
			img = canvasImage;
			//change fw and fh to image dimensions
			imgW = img.width;
			fw = imgW ;
			imageUploaded = true;
			$( "#fw" ).attr( "value", fw );
			$( "#fw" ).val( fw );
			imgH = img.height;
			fh = imgH;
			$( "#fh" ).attr( "value", fh );
			$( "#fh" ).val( fh );
			
			refresh();
		}
	};
	reader.readAsDataURL(selectedFile);
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
    if(jt>0){
	    ctx.lineWidth = jt;
	    ctx.strokeStyle = jc;
	    ctx.stroke();
    }
}