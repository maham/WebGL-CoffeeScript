precision mediump float;

varying vec3 vVertexNormal;
varying vec2 vTextureCoordinate;

void main( void )
{
	gl_FragColor = vec4(
        vVertexNormal.x * 1.0 / vTextureCoordinate.x,
        vVertexNormal.y * 1.0 / vTextureCoordinate.y,
        vVertexNormal.z, 1.0 );
}
