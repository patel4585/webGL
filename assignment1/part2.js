// This variable will store the WebGL rendering context
var gl;
var positions = [];

var numTimesToSubdivide = 3;

window.addEventListener("load", init);
function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext('webgl2');
   if (!gl) alert("WebGL 2.0 isn't available");

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(0.0, 0.0, 0.0, 0.0 ); 
   gl.clearDepth(1.0); //Clear to maximum distance

   //  Load shaders and initialize attribute buffers
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   gl.useProgram(program);

   // Set up data to draw
   let vertices = 
   [
    vec2(0.5, -0.5),
    vec2(0, 0.5),
    vec2(-0.5, -0.5)
   ]

   addline( vertices[1], vertices[0], numTimesToSubdivide);
   addline( vertices[0], vertices[2], numTimesToSubdivide);
   addline( vertices[2], vertices[1], numTimesToSubdivide);

   // Load the data into GPU data buffers
   var positionBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

   // Associate shader attributes with corresponding data buffers
   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.enableVertexAttribArray( vPosition );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, gl.FALSE, 0, 0 );

   // Get addresses of shader uniforms

   // Either draw as part of initialization
   render();

   // Or draw just before the next repaint event
   //requestAnimationFrame(render);
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // draw
   gl.drawArrays( gl.LINES, 0, positions.length);
};

function addline(p0, p1, numTimesToSubdivide) {

    if(numTimesToSubdivide == 0){
        positions.push(p0, p1);
    }
    else{
        let v = mult(1/3, (subtract(p1, p0)));

        let a = add(p0, v);
        let b = add(p0, mult(2, v));
        let t = vec2(-v[1], v[0]);
    
        let temp2 = add(a, mult(1/2, v));
        let temp3 = mult(0.866, t);
        let c = add(temp2, temp3);

        numTimesToSubdivide--;
        addline(p0, a, numTimesToSubdivide);
        addline(a, c, numTimesToSubdivide);
        addline(c, b, numTimesToSubdivide);
        addline(b, p1, numTimesToSubdivide);
    }
};