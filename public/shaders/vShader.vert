attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTexelPosition;

uniform mat4 uMVMatrix;

varying vec3 vNormal;
varying vec2 vTexelPosition;

void main( void )
{
	gl_Position = uMVMatrix * vec4( aVertexPosition, 1.0 );
	vNormal = aNormal;
	vTexelPosition = aTexelPosition;
}
