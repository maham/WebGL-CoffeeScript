## App

	console.log 'app.litcoffee'

### Dependencies
Include [GL](gl.html) to handle all WebGL related tasks.

	GL = require 'app/gl'
	time = require 'app/time'


### Start the application
The app must wait for everything to be properly loaded before it can start. This is done with a simple event listener
waiting for the `OnLoaded` event. There is a lot of JS-frameworks that could help with this but at the moment
this method will be sufficient.

	document.addEventListener "DOMContentLoaded", ->

The shaders are loaded asynchronously as text. Pre-compiled shaders don't exist in WebGL yet and it's probably not high
on the list as it would be a security concern as far as I understand it. Create a couple of variables store the shader
code in until we are ready init GL.

		fragmentShaderSource	=
		vertexShaderSource		=
		cubeData				= undefined;

Start asunchronous loading of the shaders. Store the shader code when the ajax request is done.
As there is two shaders that are both loaded async the app must wait until both are loaded before continuing execution
of the app.
The .c suffix is choosen just to trick Sublime Text into giving some syntax highlighting.

		console.log 'Starting to load shaders.'
		new microAjax './fShader.frag', ( resource ) ->
			console.log 'Fragment shader loaded.'
			fragmentShaderSource = resource

		new microAjax './vShader.vert', ( resource ) ->
			console.log 'Vertex shader loaded.'
			vertexShaderSource = resource

		new microAjax './cube.obj', ( resource ) ->
			console.log 'Cube data loaded.'
			cubeData = resource

waitForShaders do just that. It waits for the shaders to load in one second loops and when both `fragmentShaderSource`
and `vertexShaderSource` are populated it will call `startGL` passing in the code for both shaders.

		waitForShaders = ->
			shaderLoadingTimer = setTimeout ->
				if fragmentShaderSource? and vertexShaderSource? and cubeData?
					startGL 'lesson01-canvas', fragmentShaderSource, vertexShaderSource
				else
					waitForShaders()
			, 1000

		waitForShaders()

To start the GL stuff we need an HTML canvas element and both a fragment shader and a vertex shader is needed. The
shaders are passed as strings containing the raw GLSL code.
		gl = null
		cube = null

		FPS = 60
		FRAME_TIME = 1 / FPS
		lastT = null
		timeAccumulator = 0

		step = ->
			# Tell the system we want to update again when convenient
			time.requestAnimationFrame step

			t = Date.now()
			timeAccumulator += (t - lastT) / 1000
			
			while timeAccumulator > FRAME_TIME
				timeAccumulator -= FRAME_TIME
				gl.tick()
			
			gl.drawScene [cube]

			# Store the last frametime
			lastT = t

		startGL = ( canvasElementId, fragmentShaderSource, vertexShaderSource ) ->
			gl = new GL canvasElementId

After GL is initialized the shader program have to be compiled and linked.

			gl.createShaderProgram fragmentShaderSource, vertexShaderSource

			cube = gl.createMeshFromObj cubeData

There is no animation or anything so a single drawn frame is all that's needed to show the rewards of this hard labor.

			lastT = Date.now()
			step()
	, false
