Mesh
====

	define ->
    	class Mesh
        	constructor: ( settings ) ->
            	for own key, value of settings
                	@[key] = value
