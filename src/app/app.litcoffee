App
===

This app is my playground for learning both [CoffeeScript](http://www.coffeescript.org) and
[WebGL](http://khronos.org/webgl). Anything you find here is used at your own risk. As you can see all the code is
available right here on the site you are reading so feel free to have a look around.

Dependencies
------------
We have a couple of external classes to get the app running. We need [GL](gl.litcoffee "Utility class for WebGL") to handle
the WebGL related tasks. And we will need [time](time.litcoffee "High performance timer functions") for the game loop timer.

	GL			= require 'app/gl'
	Metronome	= require 'app/metronome'
	microAjax	= require 'app/microajax'

Start the application
---------------------
The app must wait for everything to be properly loaded before it can start. This is done with a simple event listener
waiting for the `DOMContentLoaded` event. There is a lot of JS-frameworks that could help with this but at the moment
this method will be sufficient.

	document.addEventListener "DOMContentLoaded", ->

The shaders are loaded asynchronously as text. Pre-compiled shaders don't exist in WebGL yet and it's probably not high
on the list as it would be a security concern as far as I understand it. So let's create a couple of variables store
the shader code in until we are ready init GL.

		fragmentShaderSource	=
		vertexShaderSource		=
		cubeData				= undefined;

Now it's time to start the asynchronous loading of the shaders. Store the shader code when the ajax request is done.
As there is two shaders that are both loaded async the app must wait until both are loaded before continuing execution
of the app.

		console.log 'Starting to load shaders.'
		new microAjax './fShader.frag', ( resource ) ->
			console.log 'Fragment shader loaded.'
			fragmentShaderSource = resource

		new microAjax './vShader.vert', ( resource ) ->
			console.log 'Vertex shader loaded.'
			vertexShaderSource = resource

		new microAjax './capsule.obj', ( resource ) ->
			console.log 'Cube data loaded.'
			cubeData = resource

#### waitForAssets
This method does exactly what is says. It waits for the assets to load in one second loops and when all assets are done
loading it will call [`startGL`](#startgl).

		waitForAssets = ->
			setTimeout ->
				if fragmentShaderSource? and vertexShaderSource? and cubeData?
					startGL 'lesson01-canvas', fragmentShaderSource, vertexShaderSource
				else
					waitForAssets()
			, 1000

		waitForAssets()

We need another couple of globals to store the mesh we are going to draw, and to store the gl object that will take
care of the 3D rendering.

		gl = null
		cube = null
		metronome = new Metronome 60
		metronome.on "Tick", ->
			gl.tick()
			gl.drawScene [cube]
			return

### startGL

		startGL = ( canvasElementId, fragmentShaderSource, vertexShaderSource ) ->
			gl = new GL canvasElementId

After GL is initialized the shader program have to be compiled and linked.

			shader = gl.createShaderProgram fragmentShaderSource, vertexShaderSource
			gl.setShader shader

			cube = gl.createMeshFromObj cubeData

			metronome.start()
	, false
