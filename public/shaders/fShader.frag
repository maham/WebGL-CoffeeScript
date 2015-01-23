precision mediump float;

varying vec3 vNormal;
varying vec2 vTexelPosition;

void main( void )
{
	gl_FragColor = vec4( vNormal.x * 1.0 / vTexelPosition.x, vNormal.y * 1.0 / vTexelPosition.y, vNormal.z, 1.0);
}
