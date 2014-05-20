## App

### Dependencies
Include [GL](gl.html) to handle all WebGL related tasks.

	GL = require 'app/gl'


### Start the application
The app must wait for everything to be properly loaded before it can start. This is done with a simple event listener
waiting for the `OnLoaded` event. There is a lot of JS-frameworks that could help with this but at the moment
this method will be sufficient.

	document.addEventListener "OnLoaded", ->

The shaders are loaded asynchronously as text. Pre-compiled shaders don't exist in WebGL yet and it's probably not high
on the list as it would be a security concern as far as I understand it. Create a couple of variables store the shader
code in until we are ready init GL.

		fragmentShaderSource	=
		vertexShaderSource		= undefined;

Start asunchronous loading of the shaders. Store the shader code when the ajax request is done.
As there is two shaders that are both loaded async the app must wait until both are loaded before continuing execution
of the app.
The .c suffix is choosen just to trick Sublime Text into giving some syntax highlighting.

		console.log 'Starting to load shaders.'
		new microAjax './fShader.c', ( resource ) ->
			console.log 'Fragment shader loaded.'
			fragmentShaderSource = resource

		new microAjax './vShader.c', ( resource ) ->
			console.log 'Vertex shader loaded.'
			vertexShaderSource = resource

waitForShaders do just that. It waits for the shaders to load in one second loops and when both `fragmentShaderSource`
and `vertexShaderSource` are populated it will call `startGL` passing in the code for both shaders.

		waitForShaders = ->
			shaderLoadingTimer = setInterval ->
				if fragmentShaderSource? and vertexShaderSource?
					startGL 'lesson01-canvas', fragmentShaderSource, vertexShaderSource
				else
					waitForShaders()
			, 1000

		waitForShaders()

To start the GL stuff we need an HTML canvas element and both a fragment shader and a vertex shader is needed. The
shaders are passed as strings containing the raw GLSL code.

		startGL = ( canvasElementId, fragmentShaderSource, vertexShaderSource ) ->
			gl = new GL canvasElementId

After GL is initialized the shader program have to be compiled and linked.

			gl.createShaderProgram fragmentShaderSource, vertexShaderSource

A 3D program without something drawn on screen would be pretty dull so it's spiced up with a couple of meshes. Some
kind of mesh loader should probably be next on the list of things to do. Not sure what file format to use but .obj
or maybe shapefiles could work.

First create a triangle...

			triangle = gl.createMesh [
					 0.0,  1.0,  0.0
					-1.0, -1.0,  0.0
					 1.0, -1.0,  0.0
				], 3, 3, [
					1.0, 0.0, 0.0, 1.0,
					0.0, 1.0, 0.0, 1.0,
					0.0, 0.0, 1.0, 1.0
				], 4, 3, [-1.5,0.0,-7.0]

...and then a square. Both in pleasing primal colors.

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

There is no animation or anything so a single drawn frame is all that's needed to show the rewards of this hard labor.

			gl.drawScene [triangle, square]
	, false
