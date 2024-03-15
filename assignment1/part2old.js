// This variable will store the WebGL rendering context
var gl;
var positions1 = [];
var positions2 = [];

var numTimesToSubdivide = 2;

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
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5),
    vec2(0, 0.5)
   ]

   divideTriangle( vertices[0], vertices[1], vertices[2], numTimesToSubdivide);

    // addline(vertices[0], vertices[2]);

    console.log("print: ", positions2);


   // Load the data into GPU data buffers
   var positionBuffer = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
   gl.bufferData( gl.ARRAY_BUFFER, flatten(positions2), gl.STATIC_DRAW );

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
   gl.drawArrays( gl.LINE_LOOP, 0, positions2.length);
};

function divideTriangle(a, b, c, count) {

    positions2.push(a);
    positions2.push(b);
    // addline();

    positions2.push(c);
    // addline();

    // positions2.push(a);
    // addline();

        while(count != 0) {
            for(let i=0; i<(positions2.length-1); i++){
                addline(positions2[i], positions2[i+1]);
            }
            // addline(positions2[positions2.length-1], positions2[0]);
            
            positions2 = positions1;
            count--;
        }
};

function addline(p0 = positions2[positions2.length-2], p1 = positions2[positions2.length-1]) {
    let v = mult(1/3, (subtract(p1, p0)));

    let a = add(p0, v);
    let b = add(p0, mult(2, v));
    let t = vec2(v[1], -v[0]);

    let temp2 = add(a, mult(1/2, v));
    let temp3 = mult((Math.sin(60 * Math.PI / 180)), t);
    let c = add(temp2, temp3);

    positions1.push(p0);
    positions1.push(a);
    positions1.push(c);
    positions1.push(b);
    positions1.push(p1);
};