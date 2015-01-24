attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoordinate;

uniform mat4 uMVMatrix;

varying vec3 vVertexNormal;
varying vec2 vTextureCoordinate;

void main( void )
{
	gl_Position = uMVMatrix * vec4( aVertexPosition, 1.0 );
	vVertexNormal = aVertexNormal;
	vTextureCoordinate = aTextureCoordinate;
}
