// This variable will store the WebGL rendering context
var gl;
var pSize;
var uColor;

window.addEventListener("load", init);
function init() {
    // Set up a WebGL Rendering Context in an HTML5 Canvas
    //find canvas by id name
    var canvas = document.getElementById("gl-canvas");

    //get webgl RC and do some minimal error checking
    gl = canvas.getContext("webgl2"); // basic webGL2 context
    //gl = canvas.getContext("webgl2", {antialias:false}); // WebGL2 context with an option
    if (!gl)
    {
    //This is friendlier than an alert dialog like we use in the template
    canvas.parentNode.replaceChild(
        document.createTextNode("Cannot get WebGL2 Rendering Context"),
        canvas
        );
    }

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   gl.clearColor(0,0,0,1);

   //Triangle positions
    var points =
    [
        vec2( 0.9,  0.9),
        vec2( 0.9,  0.0),
        vec2( 0.0,  0.9)
    ];

    points = points.concat(circle(10));

   // Load the data into GPU data buffers
   var positionBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

   // Associate shader attributes with corresponding data buffers
   var myFirstVao; //declare globally so you can configure in init() and use in render()

   myFirstVao = gl.createVertexArray();
   gl.bindVertexArray(myFirstVao); // start connecting buffers to a shader
                                   // also bind configured VAOs before drawing with them

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, gl.FALSE, 0, 0)
   
    // Get addresses of shader uniforms
    pSize = gl.getUniformLocation(program, "pSize");
    uColor = gl.getUniformLocation(program, "uColor"); //And put this in init.
    gl.uniform1f(pSize, 10);

   // Either draw as part of initialization
   //render();

   // Or draw just before the next repaint event
   requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);
   // draw
   gl.uniform4f(uColor, .5, 0, 1, 1);
   gl.drawArrays( gl.TRIANGLES, 0, 3 );
   gl.uniform1f(pSize, 10);
   gl.uniform4f(uColor, 1, 1, 0, 1);
   gl.drawArrays( gl.POINTS, 3, 6 );
   gl.uniform1f(pSize, 20);
   gl.drawArrays( gl.POINTS, 9, 5 );
   gl.uniform4f(uColor, .5, .5, 1, 1);
   gl.drawArrays(gl.LINE_STRIP, 3, 11);
   gl.lineWidth(5);     //Does not work for most systems 

}

function circle(sides)
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
         vertices.push(vec2(Math.cos(i/sides*2*Math.PI), Math.sin(i/sides*2*Math.PI)));
      }
   }
   return vertices;
}