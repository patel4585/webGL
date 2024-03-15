// This variable will store the WebGL rendering context
var gl;
var uColor; //Getting uniforms can be slow, so make this global

// var myFirstVao; //declare globally so you can configure in init() and use in render()

// myFirstVao = gl.createVertexArray();
// gl.bindVertexArray(myFirstVao); // start connecting buffers to a shader
//                                 // also bind configured VAOs before drawing with them

window.addEventListener("load", init);
function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear uColor
   //      - turn on depth testing
   gl.clearColor(0.0, 0.0, 0.0, 1.0 ); //clear colour is black
   gl.clearDepth(1.0); //Clear to maximum distance

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   //Triangle positions
   var points =
   [
       vec2( 0.0, 0.0 ),
       vec2( 0.5, 0.0 ),
       vec2( 0.5, 0.5 ),
       vec2(-0.5, 0.5 ),
       vec2(-1.0, 0.0 ),
       vec2(-0.5,-0.5 )
   
   ];

    var colors =
    [
        vec4(1.0, 0.0, 0.0, 1.0), //Red
        vec4(0.0, 1.0, 0.0, 1.0), //Green
        vec4(0.0, 0.0, 1.0, 1.0), //Blue
        vec4(1.0, 1.0, 0.0, 1.0), //Yellow
        vec4(0.0, 1.0, 1.0, 1.0), //Cyan
        vec4(1.0, 0.0, 1.0, 1.0), //Magenta
    ];

   // Load the data into GPU data buffers
    //*** Position buffer **********************
    // Create a buffer for vertex positions, make it active, and copy data to it
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );

    // Use this form for Float32Array data
    //gl.bufferData( gl.ARRAY_BUFFER, points, gl.STATIC_DRAW );

    // Use this form for arrays of arrays or of vecs
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate shader attributes with corresponding data buffers
    //Enable the shader's vertex position input and attach the active buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, gl.FALSE, 0, 0 );

    //*** Colour buffer **********************
    // Create a buffer for colour positions, make it active, and copy data to it
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
   
    //Enable the shader's vertex colour input and attach the active buffer
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( vColor );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );

   // Get addresses of shader uniforms
    uColor = gl.getUniformLocation(program, "uColor"); //And put this in init.

    var yellow = vec4( 1.0, 1.0, 0.0, 1.0 ); //Yellow
    gl.uniform4fv( uColor, flatten(yellow));

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
   // requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   // draw
    gl.clear( gl.uColor_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
}

function circle(sides, s)
{
   var vertices = []; // create empty array
   if (sides < 3)
   {
      console.log("function circle: Not enough sides to make a polygon.");
   }
   else
   {
      if (sides > 10000)
      {
         sides = 10000;
         console.log("function circle: Sides limited to 10,000.");
      }
      for (var i = sides; i >= 0; i--)
      {
         vertices.push(vec2(Math.cos(i/sides*2*Math.PI)*s+.5, 
                            Math.sin(i/sides*2*Math.PI)*s-.5));
      }
   }
   return vertices;
}