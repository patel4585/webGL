#version 300 es

//inputs
in vec4 vPosition;
in vec3 vNormal;

//transform uniforms
uniform mat4 p;     // perspective matrix
uniform mat4 mv;    // modelview matrix

//outputs
out vec4 mvPosition; // unprojected vertex position;
out vec3 mvN; // transformed normal

//globals
mat4 Nm; // normal matrix

void main() 
{
  //Transform the point
  mvPosition = mv*vPosition;  //mvPosition is used often
  gl_Position = p*mvPosition; 
  //Construct a normal matrix to fix non-uniform scaling issues
  Nm = transpose(inverse(mv));
  //Transform the normal
  mvN = (Nm*vec4(vNormal,0.0)).xyz;
}

