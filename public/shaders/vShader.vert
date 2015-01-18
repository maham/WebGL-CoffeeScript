attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;

void main( void )
{
	gl_Position = uMVMatrix * vec4( aVertexPosition, 1.0 );
}
