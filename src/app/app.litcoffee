## Polvo test app 1

### What is this?

This is a first attempt att creating an app using Polvo. I'm not sure it's the road to go but it looks neat as hell.

### Dependencies
	GL = require 'app/gl'

### Start the application

	document.addEventListener "DOMContentLoaded", ->
		document.removeEventListener "DOMContentLoaded", this

		loadShaders = ->
			console.log 'Starting to load shaders.'
			fragmentShaderSource	=
			vertexShaderSource		= undefined;

			new microAjax './fShader.c', ( resource ) ->
				console.log 'Fragment shader loaded.'
				fragmentShaderSource = resource

			new microAjax './vShader.c', ( resource ) ->
				console.log 'Vertex shader loaded.'
				vertexShaderSource = resource

			shaderLoadingLoop = ->
				shaderLoadingTimer = setInterval ->
					if fragmentShaderSource and vertexShaderSource
						clearTimeout shaderLoadingTimer
						startGL fragmentShaderSource, vertexShaderSource
						#( gl.fetchShaderFromElement 'shader-fs' ), ( gl.fetchShaderFromElement 'shader-vs' )
					else
						shaderLoadingLoop()
						console.log 'Still no shaders loaded...'
				, 1000

			shaderLoadingLoop()

		startGL = ( fragmentShaderSource, vertexShaderSource ) ->
			gl = new GL 'lesson01-canvas'
			gl.createShaderProgram fragmentShaderSource, vertexShaderSource
			triangle = gl.createMesh [
					 0.0,  1.0,	 0.0
					-1.0, -1.0,  0.0
					 1.0, -1.0,  0.0
				], 3, 3, [
	        		1.0, 0.0, 0.0, 1.0,
	        		0.0, 1.0, 0.0, 1.0,
	        		0.0, 0.0, 1.0, 1.0
	    		], 4, 3, [-1.5,0.0,-7.0]
			square = gl.createMesh [
					 1.0,  1.0,	 0.0
					-1.0,  1.0,  0.0
					 1.0, -1.0,  0.0
					-1.0,  1.0,  0.0
					-1.0, -1.0,  0.0
					 1.0, -1.0,  0.0
				], 3, 6, [
	        		1.0, 0.0, 0.0, 1.0,
	        		0.0, 1.0, 0.0, 1.0,
	        		0.0, 0.0, 1.0, 1.0
	        		0.0, 1.0, 0.0, 1.0,
	        		1.0, 1.0, 0.0, 1.0,
	        		0.0, 0.0, 1.0, 1.0
	    		], 4, 6, [1.5, 0.0,-7.0]
			gl.drawScene [triangle, square]

		loadShaders()

	, false
