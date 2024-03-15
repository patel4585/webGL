/*
 * L5E.js
 * Lighting exercise.
 *
 * Adapted for WebGL by Alex Clarke, 2016, updated 2017
 * Massively overhauled for WebGL2 and new exercise by Alex Clarke March 2020
 */


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var batman;
var lamppost

var red =        vec3(255,   0,   0);
var green =      vec3(  0, 255,   0);
var blue =       vec3(  0,   0, 255);
var lightred =   vec3(255, 128, 128);
var lightgreen = vec3(128, 255, 128);
var lightblue =  vec3(128, 128, 255);
var white =      vec3(255, 255, 255);
var black =      vec3(  0,   0,   0);
var grey =       vec3(128, 128, 128);



//Variables for Transformation Matrices
var mv = new mat4();
var p = new mat4();
var mvLoc, projLoc;

//Variables for Lighting
var light;
var material;
var lighting;
var uColor;

//You will need to rebind these buffers
//and point attributes at them after calling uofrGraphics draw functions
var vertexBuffer, normalBuffer;
var program, phong, gouraud;

//sphere subdivisions
var rez = 10;


//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

window.onload = function init() {
   // Set up a WebGL Rendering Context in an HTML5 Canvas
   var canvas = document.getElementById("gl-canvas");
   gl = canvas.getContext("webgl2");
   if (!gl) {
      canvas.innerHTML = "WebGL2 isn't available";
   }

   //  Configure WebGL
   //  eg. - set a clear color
   //      - turn on depth testing
   gl.clearColor(1.0, 1.0, 1.0, 1.0);
   gl.enable(gl.DEPTH_TEST);

   //  Load shaders and initialize attribute buffers
   gouraud = initShaders(gl, "gshader.vert", "gshader.frag");

   //EXERCISE 4: uncomment this line
   phong = initShaders(gl, "pshader.vert", "pshader.frag");

   //EXERCISE 4: switch the program to phong.
	program = phong;
   gl.useProgram(program);

   // Set up data to draw
   // Done globally in this program...
   gl.clearColor(0.2, 0.2, 0.2, 1);

   // Load the data into GPU data buffers and
   // Associate shader attributes with corresponding data buffers
   //***Vertices***
   program.vPosition = gl.getAttribLocation(program, "vPosition");
   gl.enableVertexAttribArray(program.vPosition);

   //***Normals***
   program.vNormal = gl.getAttribLocation(program, "vNormal");
   gl.enableVertexAttribArray(program.vNormal);

   //** uofrGraphics setup
   // relies on position and normal arrays
   // stub is used instead of the simple diffuse colour that
   // uofrGraphics was designed for, since we will be using
   // a more complex shader
   // uofrGraphics loads and binds its own buffers, but protects yours with VAOs
   // something similar is done by drawObj()
   urgl = new uofrGraphics();
   urgl.connectShader(program, "vPosition", "vNormal", "stub");

   //** start loading objs.
   // The obj's buffers will be loaded once the file is downloaded from the net.
   // They use a special lookup array for drawing, so they need to be bound 
   // separately from you normal buffers to draw them.
   // see drawObj() function for details.
   batman = loadObj(gl, "BatmanArmoured.obj");
   lamppost = loadObj(gl, "rv_lamp_post_2.obj");


   //Set up viewport
   gl.viewportWidth = canvas.width;
   gl.viewportHeight = canvas.height;
   gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);


   //Set some initial local state
   
   ////////////////////////////
   // Initialize lights
   // array of light property locations and properties (declared globally)
   light = [];
   //EXERCISE 2: Add an attenuation property. I suggest the follosing values:
   //            quadratic: 0.5 linear: 0 constant: 0.3
   light[0] =  {diffuse: white, specular: white, ambient: vec3(50,50,50), 
                position: vec4(0,0,-2,1), coefficients: vec3(.3,0.,.3)};
   
   //EXERCISE 3: Add properties for a second light here for the lamp post.
   //            Make it any colour you like but you'll have to 
   //            adjust the lamp to match...
   //            You can set position here or in render().
   light[1] =  {diffuse: lightblue, specular: lightblue, ambient: vec3(50,50,50), 
                position: vec4(-3,4.4,0,1), coefficients: vec3(.3,0.,.3)};

   //////////////////////////
   // Initialize material object
   // and add some materials
   material = {};
   material.clay = {diffuse: grey, ambient: grey, specular: grey, 
                    shininess: 5};
   material.redPlastic = {diffuse: red, ambient: red, specular: white, 
                          shininess: 50};
   //EXERCISE 5: make and name a material for you batman or other OBJ model
   // I made material for the light bulb on the lamp
   material.lightBlue = {diffuse: lightblue, ambient: lightblue, specular: lightblue,
                         shininess: 5};

   // adds locations to light and material objects
   getAndSetShaderLocations();
   
   setLight(light[0]);
   setMaterial(material.clay);

   // ** setup event listeners and UI
   // Sphere resolution slider
   var el = document.getElementById("rez");
	el.onchange = el.oninput = function (event) {
      rez = (event.srcElement || event.target).value;
      document.getElementById("rezval").innerHTML = rez;
   };
   document.getElementById("rez").value = rez;
   document.getElementById("rezval").innerHTML = rez;

   requestAnimationFrame(animate);
};

function getAndSetShaderLocations()
{
   // ***Vertices***
   program.vPosition = gl.getAttribLocation(program, "vPosition");
   gl.enableVertexAttribArray(program.vPosition);

   // ***Normals***
   program.vNormal = gl.getAttribLocation(program, "vNormal");
   gl.enableVertexAttribArray(program.vNormal);

   // Get addresses of transformation uniforms
   projLoc = gl.getUniformLocation(program, "p");
   mvLoc = gl.getUniformLocation(program, "mv");

   //Set up projection matrix
   p = perspective(45.0, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
   gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(transpose(p)));

   // Get light uniform locations, loop if needed
   //EXERCISE 3: Loop through the lights to get all their locations.
   //            Unfortunately, there's no easy way to learn the value
   //            of a constant in a shader, and the size of an array in
   //            glsl must be constant. 
   for(let i=0; i<=1; i++)
   // var i = 0;
   {
      light[i].diffuseLoc = gl.getUniformLocation(program, "light[" + i + "].diffuse");
      light[i].specularLoc = gl.getUniformLocation(program, "light[" + i + "].specular");
      light[i].ambientLoc = gl.getUniformLocation(program, "light[" + i + "].ambient");
      light[i].positionLoc = gl.getUniformLocation(program, "light[" + i + "].position");
      //EXERCISE 2: get attenuation coefficients location
      light[i].coefficientsLoc = gl.getUniformLocation(program, "light[" + i + "].coefficients")
   }

   // Get  material uniform locations
  	material.diffuseLoc = gl.getUniformLocation(program, "material.diffuse");
   material.specularLoc = gl.getUniformLocation(program, "material.specular");
   material.ambientLoc = gl.getUniformLocation(program, "material.ambient");
   material.shininessLoc = gl.getUniformLocation(program, "material.shininess");


   // Get and set other shader state
   lighting = gl.getUniformLocation(program, "lighting");
   uColor = gl.getUniformLocation(program, "uColor");
   gl.uniform1i(lighting, 1);
   gl.uniform3fv(uColor, white);
}

// Function: drawObj
//   For use with obj objects returned from j3di.js loadOBJ function.
//    - manages obj buffer switching
//    - waits for file to load
//    - handles draw function.
function drawObj(obj)
{
   if (obj.loaded)
   {
      //Preserve old buffers
      var originalVAO = gl.getParameter(gl.VERTEX_ARRAY_BINDING);

      //Bind OBJ Buffers to Shader and manage with a Vertex Array Object
      if (!obj.hasOwnProperty('vao'))
      {
         obj.vao = gl.createVertexArray();
         gl.bindVertexArray(obj.vao)
         
         //Bind vertex positions
         gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexObject);
         gl.vertexAttribPointer(program.vPosition, 3, gl.FLOAT, gl.FALSE, 0, 0);
         gl.enableVertexAttribArray(program.vPosition);
         
         //Bind normals
         gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalObject);
         gl.vertexAttribPointer(program.vNormal, 3, gl.FLOAT, gl.FALSE, 0, 0);
         gl.enableVertexAttribArray(program.vNormal);
         
         //Bind vertex lookup array
         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexObject);
      }
      //draw obj from lookup array
      gl.bindVertexArray(obj.vao);
      gl.drawElements(gl.TRIANGLES, obj.numIndices, gl.UNSIGNED_SHORT, 0);

      //Restore original buffers
      gl.bindVertexArray(originalVAO);
   }
}

// Loads the material provided in the argument to the
// shader locations in the globally defined material location object
function setMaterial(mat)
{
   gl.uniform3fv(material.diffuseLoc, mat.diffuse);
   gl.uniform3fv(material.specularLoc, mat.specular);
   gl.uniform3fv(material.ambientLoc, mat.diffuse);
   gl.uniform1f(material.shininessLoc, mat.shininess);
}

// Loads light properties from the light to the shader
// Transforms light position according to provided matrix
// or according to the identity matrix if no matrix is provided.
//
// Light properties are expected to appear on same object as
// light locations
function setLight(light, mv = mat4())
{
   gl.uniform3fv(light.diffuseLoc, light.diffuse);
   gl.uniform3fv(light.ambientLoc, light.ambient);
   gl.uniform3fv(light.specularLoc, light.specular);
   gl.uniform4fv(light.positionLoc, mult(mv,light.position));
   //EXERCISE 2: send attenuation coefficients to shader
   gl.uniform3fv(light.coefficientsLoc, light.coefficients);
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var rx = 0,  ry = 0;

function render()
{
   gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
   
   
   //Set initial view
   var eye = vec3(0.0, 1.5, 8.0);
   var at = vec3(0.0, 1.7, 0.0);
   var up = vec3(0.0, 1.0, 0.0);
   
   mv = lookAt(eye, at, up);
   
   //Position Light 0 in View space
   setLight(light[0]);

   //Position Light 1 in World space
   //EXERCISE 3: set light[1]'s position to match the top of the lamp post
   //EXERCISE 3: send light[1] to the setLight function, and also send the
   //            the mv matrix to help place it in World space
      //position is set on line 133
   setLight(light[1], mv);
   
   var batmanTF = mult(mv, mult(translate(0, -1, 0), rotateY(ry)));
   gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(batmanTF)));
   //EXERCISE 5: replace Batman's material with one designed by you
   // I did this for light bulb on the lamp
   setMaterial(material.clay);
   drawObj(batman);
      
   //Lamp post
   var lampTF = mult(mv, translate(-3, -1, 0));
   gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(lampTF)));
   setMaterial(material.clay);
   drawObj(lamppost);

   //Light at top of lamp post
   var lightBulbTF = mult(lampTF, translate(0, 5.335, 0));
   //uofrGraphics only caches 1 sphere at a time
   //so scaling is faster than calculating a new sphere radius
   lightBulbTF = mult(lightBulbTF, scale(.5,.5,.5));
   gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(lightBulbTF)));
   // gl.uniform1f(lighting, 0);
   setMaterial(material.lightBlue);
   urgl.drawSolidSphere(1, rez, rez);
   gl.uniform1f(lighting, 1);

   //Floating light!! 
   var p = light[0].position;
   var floatingLightTF = translate(p[0],p[1],p[2]);
   floatingLightTF = mult(floatingLightTF, scale(.1,.1,.1));
   gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(floatingLightTF)));
   gl.uniform1f(lighting, 0);
   urgl.drawSolidSphere(1, rez, rez);
   gl.uniform1f(lighting, 1);

   //Sphere at right of scene.
   var sphereTF = mult(mv, translate(3, 0, 0));
   gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(transpose(sphereTF)));
   setMaterial(material.redPlastic);
   urgl.drawSolidSphere(1, rez, rez);

}




//----------------------------------------------------------------------------
// Animation and Rendering Event Functions
//----------------------------------------------------------------------------

//animate()
//updates and displays the model based on elapsed time
//sets up another animation event as soon as possible
var prevTime = 0;
function animate()
{
   requestAnimationFrame(animate);

   //Do time corrected animation
   var curTime = new Date().getTime();
   if (prevTime != 0)
   {
      //Calculate elapsed time in seconds
      var timePassed = (curTime - prevTime)/1000.0;
      ry += 30 * timePassed;
      //Update any active animations 
      handleKeys(timePassed);
   }
   prevTime = curTime;

   //Draw
   render();
}

//----------------------------------------------------------------------------
// Keyboard Event Functions
//----------------------------------------------------------------------------

//This array will hold the pressed or unpressed state of every key
var currentlyPressedKeys = [];

//Store current state of shift key
var shift;

document.onkeydown = function handleKeyDown(event) {
   currentlyPressedKeys[event.key] = true;
   shift = event.shiftKey;

   //Place key down detection code here
}

document.onkeyup = function handleKeyUp(event) {
   currentlyPressedKeys[event.key] = false;
   shift = event.shiftKey;

   //Place key up detection code here
}

//isPressed(c)
//Utility function to lookup whether a key is pressed
function isPressed(c)
{
   return currentlyPressedKeys[c];
}

//handleKeys(timePassed)
//Continuously called from animate to cause model updates based on
//any keys currently being held down
//timePassed is expected to be in seconds
function handleKeys(timePassed) 
{
   //Place continuous key actions here - anything that should continue while a key is
   //held

   //Calculate how much to move based on time since last update
   var vb = 2.0; //Base velocity for light ball
   var db = vb*timePassed; //Distance to move
   var rr = 60.0; //Batman's rotation speed
   var ar = rr*timePassed;

   //Light Updates
   if (isPressed("a") || isPressed("A")) 
   {
      light[0].position[0] -= db;
   }
   if (isPressed("d") || isPressed("D")) 
   {
      light[0].position[0] += db;
   }
   if (isPressed("w") || isPressed("W")) 
   {
      light[0].position[2] -= db;
   }
   if (isPressed("s") || isPressed("S")) 
   {
      light[0].position[2] += db;
   }
   if (isPressed("q") || isPressed("Q")) 
   {
      light[0].position[1] -= db;
   }
   if (isPressed("e") || isPressed("E")) 
   {
      light[0].position[1] += db;
   }
   if (isPressed(",") || isPressed("<"))
   {
      ry -= 1;
   }
   if (isPressed(".") || isPressed(">"))
   {
      ry += ar;
   }
}