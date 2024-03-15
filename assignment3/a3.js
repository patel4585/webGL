// This variable will store the WebGL rendering context
var gl, index = 0;
var matStack = [];
var xOfEye = -6.0, side = 0.0;

var eye = vec3(6.0, 8.0, 6.0);
var at =  vec3(0.0, 0.75, 0.0);
var up =  vec3(0.0, 1.0, 0.0);

//Collect shape information into neat package
var shapes = {
    solidCube_b1: {points:[], colors:[], start:0, size:0, type: 0},
    solidCube_b2: {points:[], colors:[], start:0, size:0, type: 0},
    solidCube_b3: {points:[], colors:[], start:0, size:0, type: 0},
    solidCube_b4: {points:[], colors:[], start:0, size:0, type: 0},
    floor: {points:[], colors:[], start:0, size:0, type: 0},
};

//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;

//Some colours
var red = 		   	vec4(1.0, 0.0, 0.0, 1.0);
var green = 	   	vec4(0.0, 1.0, 0.0, 1.0);
var blue = 		   	vec4(0.0, 0.0, 1.0, 1.0);
var lightred =		   vec4(1.0, 0.5, 0.5, 1.0);
var lightgreen =	   vec4(0.5, 1.0, 0.5, 1.0);
var lightblue =   	vec4(0.5, 0.5, 1.0, 1.0);
var white = 	   	vec4(1.0, 1.0, 1.0, 1.0);
var violate =        vec4(1.0, 0.047, 0.914, 1.0);
var grey =           vec4(0.8, 0.8, 0.8, 1.0);

//Generate Floor Data: use TRIANGLES to draw. Floor will be white.
shapes.floor.points = 
[ 
   vec4(  5.0,  0.0,  -5.0, 1.0), 
	vec4( -5.0,  0.0,  -5.0, 1.0),
   vec4( -5.0,  0.0,   5.0, 1.0),

   vec4( -5.0,  0.0,   5.0, 1.0),
   vec4(  5.0,  0.0,   5.0, 1.0), 
   vec4(  5.0,  0.0,  -5.0, 1.0), 
];

shapes.floor.colors = 
[
	grey, grey,
   grey, grey,
   grey, grey,
];

//Define points for a unit cube
var cubeVerts = [
	vec4( 0.5,  0.5,  0.5, 1), //0
	vec4( 0.5,  0.5, -0.5, 1), //1
	vec4( 0.5, -0.5,  0.5, 1), //2
	vec4( 0.5, -0.5, -0.5, 1), //3
	vec4(-0.5,  0.5,  0.5, 1), //4
	vec4(-0.5,  0.5, -0.5, 1), //5
	vec4(-0.5, -0.5,  0.5, 1), //6
	vec4(-0.5, -0.5, -0.5, 1), //7
];

//Solid Cube - draw with TRIANGLES, 2 triangles per face
var solidCubeLookups = [
	0,4,6,   0,6,2, //front
	1,0,2,   1,2,3, //right
	5,1,3,   5,3,7,//back
	4,5,7,   4,7,6,//left
	4,0,1,   4,1,5,//top
	6,7,3,   6,3,2,//bottom
];

//Expand Solid Cube data: each cube should have a different color
var colorr = vec4(Math.random(), Math.random(), Math.random(), 1.0);
for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube_b1.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube_b1.colors.push(colorr);
   if (i % 6 == 5) colorr = vec4(Math.random(), Math.random(), Math.random(), 1.0); //Switch color for every face. 6 vertices/face
}

for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube_b2.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube_b2.colors.push(colorr);
   if (i % 6 == 5) colorr = vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube_b3.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube_b3.colors.push(colorr);
   if (i % 6 == 5) colorr = vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

for (var i = 0; i < solidCubeLookups.length; i++)
{
   shapes.solidCube_b4.points.push(cubeVerts[solidCubeLookups[i]]);
   shapes.solidCube_b4.colors.push(colorr);
   if (i % 6 == 5) colorr = vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

//load data into points and colors arrays - runs once as page loads.
var points = [];
var colors = [];

//Convenience function:
//  - adds shape data to points and colors arrays
//  - adds primitive type to a shape
function loadShape(myShape, type)
{
   myShape.start = points.length;
   points = points.concat(myShape.points);
   colors = colors.concat(myShape.colors);
   myShape.size = points.length - myShape.start;
   myShape.type = type;
}

window.addEventListener("load", init);
function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   // gl.enable(gl.CULL_FACE);

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   var va = vec4(0.0, 0.0, -1.0, 1);
   var vb = vec4(0.0, 0.942809, 0.333333, 1);
   var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
   var vd = vec4(0.816497, -0.471405, 0.333333, 1);

   tetrahedron(va, vb, vc, vd, 5.0);

   // Set up data to draw
   loadShape(shapes.solidCube_b1, gl.TRIANGLES);
   loadShape(shapes.solidCube_b2, gl.TRIANGLES);
   loadShape(shapes.solidCube_b3, gl.TRIANGLES);
   loadShape(shapes.solidCube_b4, gl.TRIANGLES);
   loadShape(shapes.floor, gl.TRIANGLES);

   // Load the data into GPU data buffers
   //***Vertices***
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
  program.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vPosition );

  //***Colors***
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
  program.vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );

  // Get addresses of shader uniforms
  projLoc = gl.getUniformLocation(program, "p");
  mvLoc = gl.getUniformLocation(program, "mv");

   //Set up projection matrix
   p = perspective(45.0, 1, 0.1, 100.0);
   gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p))); 

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
   // requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

   // for animation one
   // animation1();

   // for animation two
   animation2();

   mv = lookAt(eye,at,up);

   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(shapes.floor.type, shapes.floor.start, shapes.floor.size);

   // Some other tried ways to ceate sphere
   // gl.drawArrays(gl.TRIANGLE_STRIP, 0, index); 

   // for( var i=0; i<index; i+=3)
   //    gl.drawArrays(gl.LINE_LOOP, i, 3);

   matStack.push(mv);
   mv = mult(mv, translate(0.0, 1.0, 0.0));
   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(gl.TRIANGLE_FAN, 0, index);
   mv = matStack.pop();

   matStack.push(mv);
   mv = mult(mv, translate(1.5, 1.5, 0));
   mv = mult(mv, scale(1.0, 3.0, 1.0));
   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(shapes.solidCube_b1.type, shapes.solidCube_b1.start, shapes.solidCube_b1.size);
   mv = matStack.pop();

   matStack.push(mv);
   mv = mult(mv, translate(-1.5, 0.75, 0));
   mv = mult(mv, scale(1.0, 1.5, 1.0));
   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(shapes.solidCube_b2.type, shapes.solidCube_b2.start, shapes.solidCube_b2.size);
   mv = matStack.pop();

   matStack.push(mv);
   mv = mult(mv, translate(0.0, 0.5, 1.5));
   mv = mult(mv, scale(2.0, 1.0, 1.0));
   mv = mult(mv, rotateX(90));
   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(shapes.solidCube_b3.type, shapes.solidCube_b3.start, shapes.solidCube_b3.size);
   mv = matStack.pop();

   matStack.push(mv);
   mv = mult(mv, translate(0.0, 0.5, -1.5));
   mv = mult(mv, scale(2.0, 1.0, 1.0));
   mv = mult(mv, rotateX(90));
   gl.uniformMatrix4fv(mvLoc, gl.TRUE, flatten(transpose(mv)));
   gl.drawArrays(shapes.solidCube_b4.type, shapes.solidCube_b4.start, shapes.solidCube_b4.size);
   mv = matStack.pop();

   requestAnimationFrame(render);
}

function animation1(){
   eye = vec3(xOfEye, 8.0, 6.0);
   at =  vec3(0.0, 0.75, 0.0);
   up =  vec3(0.0, 1.0, 0.0);

   //animation1: “flying” the camera from point L0 to L1 along a linear path.

   //The following commented logic moves camera form Lo to L1 and then from L1 to L0. Repeats this process. 
   // if(xOfEye < 6.0 && side == 0.0)
   //    xOfEye += .05;
   // else if(xOfEye > -6.0 && side == 1.0)
   //    xOfEye -= .05;
   // else if(xOfEye >= 6.0 && side == 0.0)
   //    side = 1.0;
   // else if(xOfEye <= -6.0 && side == 1.0)
   //    side = 0.0;
   // else{
   //    console.log("x: ", xOfEye);
   //    console.log("side: ", side);
   // }

   if(xOfEye < 6.0 && side == 0.0)
      xOfEye += .05;
}

// Logic for choosing yofEye = 5 - (angle / (2 * Math.PI)) * 5
//    angle is in radians. it ranges from 0 to 2 * PI.
//    we want y from 5 to 0. so we want to minus something like (ranges from 0 to 1) * 5.
var angle = 0;
function animation2(){
   if(angle <= 2*Math.PI)  // 6.28 radians = (2 * Math.PI) radians= 360 degrees 
      eye = vec3(Math.sin(angle)*10, 5 - (angle / (2 * Math.PI)) * 5 , Math.cos(angle)*10);

   at =  vec3(0.0, 0.75, 0.0);
   up =  vec3(0.0, 1.0, 0.0);
   angle += 0.01;
}

var color0 = vec4(0, 0, 0, 1);
while(color0 == vec4(0, 0, 0, 1) || color0 == grey);
   color0 = vec4(Math.random(), Math.random(), Math.random(), 1.0);

function triangle(a, b, c) {
   points.push(a);
   points.push(b);
   points.push(c);

   for(let i=0; i<3; i++)
      colors.push(color0);

   index += 3;
}

function divideTriangle(a, b, c, count) {
   if (count > 0) {

       var ab = normalize(mix( a, b, 0.5), true);
       var ac = normalize(mix( a, c, 0.5), true);
       var bc = normalize(mix( b, c, 0.5), true);


       divideTriangle(a, ab, ac, count - 1);
       divideTriangle(ab, b, bc, count - 1);
       divideTriangle(bc, c, ac, count - 1);
       divideTriangle(ab, bc, ac, count - 1);
   }
   else { // draw tetrahedron at end of recursion
       triangle(a, b, c);
   }
}

function tetrahedron(a, b, c, d, n) {
   divideTriangle(a, b, c, n);
   divideTriangle(d, c, b, n);
   divideTriangle(a, d, b, n);
   divideTriangle(a, c, d, n);
}
