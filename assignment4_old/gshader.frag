#version 300 es
precision mediump float;

in vec4 color;

out vec4 fragColor;

void main()
{ 
    //Copy color to canvas
    fragColor = color;
}