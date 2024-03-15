// This variable will store the WebGL rendering context
var gl;
var uColor;

window.addEventListener("load", init);
function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(0.0, 0.0, 0.0, 0.0 ); //clear colour is black
   gl.clearDepth(1.0); //Clear to maximum distance

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   var points = 
   [
    vec2((translateX(464)), translateY(0)),
    vec2((translateX(465)), translateY(21)),
    vec2((translateX(466)), translateY(38)),
    vec2((translateX(471)), translateY(55)),
    vec2((translateX(473)), translateY(63)),
    vec2((translateX(483)), translateY(84)),
    vec2((translateX(493)), translateY(104)),
    vec2((translateX(505)), translateY(117)),
    vec2((translateX(509)), translateY(123)),
    vec2((translateX(511)), translateY(0)),

    vec2((translateX(464)), translateY(0)),
    vec2((translateX(402)), translateY(0)),
    vec2((translateX(402)), translateY(36)),
    vec2((translateX(465)), translateY(21)),

    vec2((translateX(337)), translateY(0)),
    vec2((translateX(339)), translateY(50)),
    vec2((translateX(402)), translateY(36)),
    vec2((translateX(402)), translateY(0)),

    vec2((translateX(250)), translateY(0)),
    vec2((translateX(251)), translateY(69)),
    vec2((translateX(339)), translateY(50)),
    vec2((translateX(337)), translateY(0)),

    vec2((translateX(143)), translateY(0)),
    vec2((translateX(149)), translateY(96)),
    vec2((translateX(251)), translateY(69)),
    vec2((translateX(250)), translateY(0)),

    vec2((translateX(5)), translateY(0)),
    vec2((translateX(27)), translateY(129)),
    vec2((translateX(149)), translateY(96)),
    vec2((translateX(143)), translateY(0)),

    vec2((translateX(0)), translateY(0)),
    vec2((translateX(0)), translateY(136)),
    vec2((translateX(27)), translateY(129)),
    vec2((translateX(5)), translateY(0)),

    vec2( 1, 1),
    vec2(-1, 1),
    vec2(-1,-1),
    vec2( 1,-1),

    vec2((translateX(301)), translateY(308)),
    vec2((translateX(301)), translateY(508)),
    vec2((translateX(506)), translateY(508)),
    vec2((translateX(506)), translateY(308)),

    vec2((translateX(404)), translateY(154)),
    vec2((translateX(301)), translateY(308)),   
    
    vec2((translateX(404)), translateY(154)),
    vec2((translateX(506)), translateY(308)),

    vec2((translateX(352)), translateY(357)), 

    vec2((translateX(20)), translateY(483)),

    vec2((translateX(327)), translateY(308)),
    vec2((translateX(417)), translateY(176))
   ];

   // Load the data into GPU data buffers
   var positionBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

   // Associate shader attributes with corresponding data buffers
   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.enableVertexAttribArray( vPosition );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, gl.FALSE, 0, 0 );

   // Get addresses of shader uniforms
   uColor = gl.getUniformLocation(program, "uColor");
   pSize = gl.getUniformLocation(program, "pSize");

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
//    requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // draw
   gl.uniform4f(uColor, 0.961, 0.961, 0.145, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 0, 10 );

   gl.uniform4f(uColor, 0.871, 0.267, 0.478, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 10, 4 );

   gl.uniform4f(uColor, 0.89, 0.745, 0.224, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 14, 4 );

   gl.uniform4f(uColor, 0.184, 0.784, 0.878, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 18, 4 );

   gl.uniform4f(uColor, 0.831, 0.353, 0.2, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 22, 4 );

   gl.uniform4f(uColor, 0.216, 0.325, 0.529, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 26, 4 );

   gl.uniform4f(uColor, 0.38, 0.31, 0.949, 1);
   gl.drawArrays( gl.TRIANGLE_FAN, 30, 4 );

   gl.lineWidth(5); //Works on my computer - OS = Windows, Graphics card = Intel(R) UHD Graphics 620
   gl.uniform4f(uColor, 0.0, 0.0, 0.0, 1);
   gl.drawArrays(gl.LINE_LOOP, 34, 4);

   gl.drawArrays(gl.LINE_LOOP, 38, 4);
   gl.drawArrays(gl.LINES, 42, 2);
   gl.drawArrays(gl.LINES, 44, 2);

   gl.uniform1f(pSize, 25);
   gl.uniform4f(uColor, 0.271, 0.941, 0.949, 1);
   gl.drawArrays(gl.POINTS, 46, 1);

   gl.uniform1f(pSize, 10);
   gl.drawArrays(gl.POINTS, 47, 1);

   gl.lineWidth(3);
   gl.uniform4f(uColor, 0.0, 0.0, 0.0, 1);
   gl.drawArrays(gl.LINES, 48, 2);
}

function translateX(a){
    let temp = (a/512) * 2 - 1;

    return temp;
}

function translateY(a){
    let temp = 1 - (a/512) * 2;

    return temp;
}