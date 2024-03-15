#version 300 es
precision mediump float;

//Inputs
vec4 color;
vec3 N;
in vec4 mvPosition; 
in vec3 mvN; 

//lighting structures
struct _light
{
  vec3 diffuse;
  //EXERCISE 1: Add specular colour member here.
  vec3 specular;
  vec3 ambient;
  vec4 position;
  vec4 spotdirection;
  //EXERCISE 2: Add attenuation coefficients here
  // (tip: pack all three coefficients into a vec3)
  vec3 coefficients;
};

struct _material
{
  vec3 diffuse;
  vec3 ambient;
  //EXERCISE 1: Add specular and shininess colour members.
  vec3 specular;
  float shininess;
};

//lighting constants
//EXERCISE 3: set the number of lights to 2
const int nLights = 2; // number of lights

//lighting uniforms
uniform bool lighting;  // to enable and disable lighting
uniform vec3 uColor;    // colour to use when lighting is disabled
uniform _light light[nLights]; // properties for the n lights
uniform _material material; // material properties

//prototypes
vec3 lightCalc(in _light light);

//Output
out vec4 fragColor;

void main() 
{ 
  /// Color Calculation ///
  if (lighting == false) 
  {
    color.rgb = uColor;
    color.a = 1.0;
  }
  else
  {
    //Renormalize normal, just in case...
    N = normalize(mvN);

    //For combining colors from all lights
    color = vec4(0,0,0,1);

    //EXERCISE 3: loop through all the lights (not just light[0]
    //            and accumulate their returned rgb values in color.
    for(int i=0; i<=nLights; i++)
      color.rgb += lightCalc(light[i]);
  }
  /// End Color Calculation ///

  fragColor = color;
}

vec3 lightCalc(in _light light)
{
  //Set up light direction for positional lights
  vec3 L;

  //Set up identity attenuation. Important for directional lights.
  float attenuation = 1.;

  //If the light position is a vector, use that as the direction
  if (light.position.w == 0.0) 
    L = normalize(light.position.xyz);
  //Otherwise, the direction is a vector from the current vertex to the light
  else
  {
    L = normalize(light.position.xyz - mvPosition.xyz);
    //EXERCISE 2: Calculate distance from mvPosition to light position
    float dist = length(light.position.xyz - mvPosition.xyz);
    //EXERCISE 2: Calculate attenuation
    attenuation = 1.0/(light.coefficients.x + light.coefficients.y * dist + light.coefficients.z * dist*dist);
  }

  //EXERCISE 1: Set up eye vector
  vec3 E = -normalize(mvPosition.xyz);
  //EXERCISE 1: Set up the half vector
  vec3 H = normalize(L+E);
  //EXERCISE 1: Calculate the Specular coefficient
  float Ks = pow(max(dot(N, H),0.0), material.shininess); //fixme!!

  //Calculate diffuse coefficient
  float Kd = dot(L,N);

  //If diffuse coefficient is negative, the light is behind the surface.
  if (Kd < 0.)
  {
    Kd = 0.;
    //EXERCISE 1: Set Ks to 0.
    Ks = 0.;
  }

  //Calculate colour for this light
  //EXERCISE 1: Add specular colour calculations
  vec3 color =  Ks * material.specular * light.specular /* something, something */ +
                Kd * material.diffuse * light.diffuse +
                     material.ambient * light.ambient;

  //correct for all colors being [0,255] instead of [0,1]
  //** Stupid RGB color inspectors... **
  color = color/255./255.;

  //EXERCISE 2: multiply return by attenuation
  return color * attenuation;
}