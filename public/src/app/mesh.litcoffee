Mesh
====
The data to create a mesh could look something like this:

    ###
    {
        source: 'filename.obj'
        vShader: 'vShader.vert'
        fShader: 'fShader.frag'
        texture: 'image.png'
    }
    ###

	define ->
    	class Mesh
        	constructor: ( settings ) ->
            	for own key, value of settings
                	@[key] = value
