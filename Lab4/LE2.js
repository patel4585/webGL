/*
 * LE2.js
 * Demonstrate lighting.
 *
 * Adapted for WebGL by Alex Clarke, 2016.
 * Adapted for WebGL2 by Alex Clarke, Feb 2020.
*/


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var canvas;
var vao;
var program;

//Collect shape information into neat package
var shapes = {
    solidCube: { points: [], normals: [], start: 0, size: 0, type: 0 },
};

//Define points for
var cubeVerts = [
    [ 0.5,  0.5,  0.5, 1], //0
    [ 0.5,  0.5, -0.5, 1], //1
    [ 0.5, -0.5,  0.5, 1], //2
    [ 0.5, -0.5, -0.5, 1], //3
    [-0.5,  0.5,  0.5, 1], //4
    [-0.5,  0.5, -0.5, 1], //5
    [-0.5, -0.5,  0.5, 1], //6
    [-0.5, -0.5, -0.5, 1], //7
];


//Solid Cube - draw with TRIANGLES, 2 triangles per face
var solidCubeLookups = [
    0, 4, 6, 0, 6, 2, //front
    1, 0, 2, 1, 2, 3, //right
    5, 1, 3, 5, 3, 7,//back
    4, 5, 7, 4, 7, 6,//left
    4, 0, 1, 4, 1, 5,//top
    6, 7, 3, 6, 3, 2,//bottom
];

//Expand Solid Cube data: 
//  Uses cross product as shown in lab demo.
for (var i = 0; i < solidCubeLookups.length; i++) {
    shapes.solidCube.points.push(cubeVerts[solidCubeLookups[i]]);
    shapes.solidCube.normals.push(vec3(0, 0, 0));
}
makeFlatNormals(shapes.solidCube.points, //array full of vertices for gl.TRIANGLES
                0, //index of where those vertices start
                shapes.solidCube.points.length, //number of vertices
                shapes.solidCube.normals //destination array for normals
                );

//Convenience function:
//  - adds shape data to global points array
//  - adds primitive type to a shape
var points = [];
var normals = [];
function loadShape(myShape, type) {
    myShape.start = points.length;
    points = points.concat(myShape.points);
    normals = normals.concat(myShape.normals);
    myShape.size = myShape.points.length;
    myShape.type = type;
}

var red =       vec4(1.0, 0.0, 0.0, 1.0);
var green =     vec4(0.0, 1.0, 0.0, 1.0);
var blue =      vec4(0.0, 0.0, 1.0, 1.0);
var lightred =  vec4(1.0, 0.5, 0.5, 1.0);
var lightgreen= vec4(0.5, 1.0, 0.5, 1.0);
var lightblue = vec4(0.5, 0.5, 1.0, 1.0);
var white =     vec4(1.0, 1.0, 1.0, 1.0);
var black =     vec4(0.0, 0.0, 0.0, 1.0);
var darkred =   vec4(0.502, 0.047, 0.047, 1.0);
var darkgreen = vec4(0.031, 0.541, 0.059, 1.0);


//Variables for Transformation Matrices
var mv = new mat4();
var p = new mat4();
var mvLoc, projLoc;


//Interaction support variables
var myX, myY, motion = false, animate = true;
var cubeRot = mat4();

//Variables for Lighting
var light;
var material;
var lighting;
var uColor;



//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------
window.onload = function init() {
    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl2"); // basic webGL2 context
    if (!gl) {
        canvas.parentNode.innerHTML("Cannot get WebGL2 Rendering Context");
    }

    //  Configure WebGL
    //  eg. - set a clear color
    //      - turn on depth testing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "Shaders/diffuse.vert", "Shaders/diffuse.frag");
    gl.useProgram(program);

    // Set up local data buffers
    // Mostly done globally or with urgl in this program...
    loadShape(shapes.solidCube, gl.TRIANGLES);


    //Create a vertex array object to allow us to switch back to local
    //data buffers after using uofrGraphics calls.
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);


    // Load the data into GPU data buffers and
    // Associate shader attributes with corresponding data buffers
    //***Vertices***
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    program.vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(program.vPosition);


    //***Normals***
    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    program.vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(program.vNormal, 3, gl.FLOAT, gl.FALSE, 0, 0);
    gl.enableVertexAttribArray(program.vNormal);


    // Get addresses of transformation uniforms
    projLoc = gl.getUniformLocation(program, "p");
    mvLoc = gl.getUniformLocation(program, "mv");

    //Set up viewport
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    //Set up projection matrix
    p = perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p)));


    // Get  light uniforms
    light = {};   // initialize this light object
    light.diffuse = gl.getUniformLocation(program, "light.diffuse");
    light.ambient = gl.getUniformLocation(program, "light.ambient");
    light.position = gl.getUniformLocation(program, "light.position");


    // Get material uniforms
    material = {};
    material.diffuse = gl.getUniformLocation(program, "material.diffuse");
    material.ambient = gl.getUniformLocation(program, "material.ambient");

    // Get and set other lighting state
    // Enable Lighting
    lighting = gl.getUniformLocation(program, "lighting");
    gl.uniform1i(lighting, 1);

    //Set color to use when lighting is disabled
    uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform4fv(uColor, white);

    //Set up uofrGraphics
    urgl = new uofrGraphics(gl);
    urgl.connectShader(program, "vPosition", "vNormal", "stub");

    //Set up some mouse interaction
    canvas.onmousedown = startDrag;
    canvas.onmousemove = moveDrag;
    canvas.onmouseup = endDrag;
    canvas.ondblclick = resetCube;

    requestAnimationFrame(render);
};



//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var rx = 0, ry = 0;
function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);


    //Set initial view
    var eye = vec3(0.0, 0.0, 10.0);
    var at =  vec3(0.0, 0.0, 0.0);
    var up =  vec3(0.0, 1.0, 0.0);

    mv = lookAt(eye, at, up);

    ///////////////////
    //Set up light properties here

    //Defaults:
    // gl.uniform4fv(light.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    // gl.uniform4fv(light.ambient, vec4(0.2, 0.2, 0.2, 1.0));
    // var lpos = vec4(0.0, 1.0, 0.0, 0.0);
    // gl.uniform4fv(light.position, lpos);

    //EXERCISE: put Positional light position settings here
    var lpos = vec4(0.0, 1.0, 0.0, 1.0);
    gl.uniform4fv(light.position, mult(mv, lpos));

    //EXERCISE: put Directional light position settings here
    var lpos = vec4(0.0, 1.0, 0.0, 0.0);
    gl.uniform4fv(light.position, mult(mv, lpos));

    //EXERCISE: put Diffuse and ambient light color settings here
    gl.uniform4fv(light.diffuse, green);
    gl.uniform4fv(light.ambient, black);

    //set cube materials to white
    gl.uniform4fv(material.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    gl.uniform4fv(material.ambient, vec4(0.4, 0.4, 0.4, 1.0));


    var cubeTF = mult(mv, cubeRot);
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(cubeTF)));
    gl.drawArrays(shapes.solidCube.type, shapes.solidCube.start, shapes.solidCube.size);

    //////////
    //EXERCISE: set left sphere materials to red as instructed in exercise
    gl.uniform4fv(material.diffuse, red);
    gl.uniform4fv(material.ambient, darkred);

    var sphereTF = mult(mv, translate(-2, 0, 0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(sphereTF)));
    urgl.drawSolidSphere(1, 50, 50);

    ///////////
    //EXERCISE: set right sphere materials to green as instructed in exercise
    gl.uniform4fv(material.diffuse, green);
    gl.uniform4fv(material.ambient, darkgreen);

    sphereTF = mult(mv, translate(2, 0, 0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(sphereTF)));
    urgl.drawSolidSphere(1, 50, 50);

    if (animate == true) {
        requestAnimationFrame(render);
        cubeRot = rotateX(rx);
        cubeRot = mult(cubeRot, rotateY(ry));
        rx += .8;
        ry += 2.;
    }
}


//Mouse motion handlers
function startDrag(e) {
    myX = e.clientX;
    myY = e.clientY;
    motion = true;
    animate = false;
}

function moveDrag(e) {
    if (motion) {
        var dX = e.clientX - myX;
        var dY = (e.clientY) - myY;
        myX = e.clientX;
        myY = e.clientY;
        var s = 1;
        cubeRot = mult(rotateX(dY * s), cubeRot);
        cubeRot = mult(rotateY(dX * s), cubeRot);
        requestAnimationFrame(render);

    }
}

function endDrag(e) {
    motion = false;
}

function resetCube(e) {
    //cubeRot = mat4();
    animate = true;
    requestAnimationFrame(render);
}