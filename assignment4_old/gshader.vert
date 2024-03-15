#version 300 es

//inputs
in vec3 vPosition;
in vec3 vNormal;
in vec4 vColor;

//transform uniforms
uniform mat4 p, mv;

//lighting structures
struct _light
{
    vec3 diffuse;
    vec3 specular;
    vec3 ambient;
    vec4 position;
    vec4 spotdirection;
    vec3 coefficients;
};

struct _material
{
  vec3 diffuse;
  vec3 ambient;
  vec3 specular;
  float shininess;
};

//lighting constants
const int nLights = 1;

//lighting uniforms
uniform bool lighting;  // to enable and disable lighting
uniform _light light[nLights]; // properties for the n lights
uniform _material material; // material properties

//outputs
out vec4 color;

//globals
vec4 mvPosition; // unprojected vertex position
mat4 Nm; // normal matrix
vec3 mvN; // transformed normal
vec3 N; // renormalized normal

//prototypes
vec3 lightCalc(in _light light);

void main()
{
  //Transform the point
  mvPosition = mv*vec4(vPosition,1);  //mvPosition is used often

  gl_Position = p*mvPosition; 

  //Construct a normal matrix to fix non-uniform scaling issues
  Nm = transpose(inverse(mv));
  //Transform the normal
  mvN = (Nm*vec4(vNormal,0.0)).xyz;

  /// Color Calculation ///
  if (lighting == false) 
  {
    color = vColor;
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