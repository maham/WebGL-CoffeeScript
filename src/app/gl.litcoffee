A Triangle and a Square
=======================

What is this?
-------------

This is yet another attempt to get started with WebGL programming using CoffeeScript. The choice of using
literate CoffeeScript is because I have been curious about how effective it can actually be to use prose
while formulating the software. After all the larger part of the time coding is usually taken by hammering
out the method rather then actually coding it.

The program
-----------

This is an OOP approach to the Triangle and Square tutorial. This way less stuff will have to be moved around between
the methods and hopefully it will also help in the task of putting stuff where it belongs.

### Dependencies

	Mesh = require 'app/mesh'


### <a name="the-class"></a>GL
First we need the class itself. I will call it GL at the moment and see if that sticks.

	module.exports = class GL

#### <a name="constructor"></a>Constructor
The constructor need the element id of the canvas tag where we should render our OpenGL
scene.

		constructor: ( canvasElementId ) ->

Get the element and keep a reference to it as a member. It will come in handy from time to time.

			@_canvasElement = document.getElementById canvasElementId

Get the context of the canvas using the `experimental-webgl` argument. There might be something like `webgl` that could
work but this works and will have to do for now. This might throw an exception and we have to catch that. It might be
better to just let the exception fall through but this way a better error message can be shown. I will still throw the
exception but now I can couple it with a console line to make sure I know why the program halted.

			try
				@_gl = @_canvasElement.getContext 'experimental-webgl'
			catch error
				console.log 'Failed to initialize WebGL using the element ' + canvas + '. Error:\n' + error
				throw error

I stick the width and height of the canvas element to the context object.

			@_gl.viewportWidth = @_canvasElement.width
			@_gl.viewportHeight = @_canvasElement.height

Clear the buffer and enable depth testing

			@_gl.clearColor 0.0, 0.0, 0.0, 1.0
			@_gl.enable @_gl.DEPTH_TEST


#### <a name="fetchShaderFromElement"></a>fetchShaderFromElement
The shaders are currently located in their own `<script>` tags in the HTML. To facilitate the swap to external files or
any other method of retreiving these I create a method for fetching the shaders. This can later be replaced by any
other means of loading the shader code.

		fetchShaderFromElement: ( shaderElementId ) ->
			shaderScript = document.getElementById shaderElementId

If the given element doesn't exist we stop the execution straight away. Same thing if it's not a shader element. (It
should be a script tag with the proper type.)

			throw new Error 'No shader with id: ' + shaderElementId unless shaderScript
			throw new Error 'Not a shader element: ' + shaderElement unless shaderScript.type == 'x-shader/x-fragment' or shaderScript.type == 'x-shader/x-vertex'

The shader code is just text so we can just traverse through the element and glue together all nodes with nodeType 3
(text nodes) to a combined string with the shader code in it.
_NOTE:_ This might not be the best way to do this. I think I can actually use either the
textContent or the innerHTML properties. I'll try that later.

			shaderCode = ""
			currentScriptNode = shaderScript.firstChild

			while currentScriptNode
				shaderCode += currentScriptNode.textContent if currentScriptNode.nodeType == 3
				currentScriptNode = currentScriptNode.nextSibling

			return shaderCode;

#### <a name="compileShader"></a>compileShader
To use the shaders they will have to be compiled. This utility method does just that. The second parameter will give
the type of shader to create. Currently there is no mechanism to match the shader code to the shader type. Extracting
a shader class from this is probably the way to go. Later...

		compileShader: ( shaderCode, shaderType ) ->
			shader = @_gl.createShader shaderType

			@_gl.shaderSource shader, shaderCode
			@_gl.compileShader shader

After compilation we can check the compile status parameter of the shader to make sure everything went all right.
Otherwise we throw an exception as there is currently no real point in continuing execution if a shader compilation
fails.

			unless @_gl.getShaderParameter shader, @_gl.COMPILE_STATUS
				throw new Error @_gl.getShaderInfoLog

			return shader

#### <a name="initShaders"></a>initShaders
This method takes care of loading and compiling the fragment and vertex shaders.

		initShaders: ( fragmentShaderElementId, vertexShaderElementId ) ->
			@_fragmentShader = @compileShader ( @fetchShaderFromElement fragmentShaderElementId ), @_gl.FRAGMENT_SHADER
			@_vertexShader = @compileShader ( @fetchShaderFromElement vertexShaderElementId ), @_gl.VERTEX_SHADER

#### <a name="createShaderProgram"></a>createShaderProgram
Here we combine the fragment and vertex shader to a shader program. This is done by first creating the shader program
itself and attaching the shaders to it.

		createShaderProgram: ( fragmentShaderSource, vertexShaderSource ) ->
			@_shaderProgram = @_gl.createProgram()
			@_gl.attachShader @_shaderProgram, @compileShader fragmentShaderSource, @_gl.FRAGMENT_SHADER
			@_gl.attachShader @_shaderProgram, @compileShader vertexShaderSource, @_gl.VERTEX_SHADER

Then we link the shader program. If anything goes wrong while linking we throw an exception.

			@_gl.linkProgram @_shaderProgram
			unless @_gl.getProgramParameter @_shaderProgram, @_gl.LINK_STATUS
				throw new Error 'Could not initialize shaders.'

Instruct the GL context to use the shader program.

			@_gl.useProgram @_shaderProgram

Store references to the variables in the shaders that should be available for us to manipulate later.

			@_shaderProgram.vertexPositionAttribute = @_gl.getAttribLocation @_shaderProgram, 'aVertexPosition'
			@_gl.enableVertexAttribArray @_shaderProgram.vertexPositionAttribute

			@_shaderProgram.vertexColorAttribute = @_gl.getAttribLocation @_shaderProgram, 'aVertexColor'
			@_gl.enableVertexAttribArray @_shaderProgram.vertexColorAttribute

			@_shaderProgram.pMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uPMatrix'
			@_shaderProgram.mvMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uMVMatrix'

#### <a name="setMatrixUniforms"></a>setMatrixUniforms
Utility to set the matrix uniforms.
_NOTE:_ Not sure that we need to set the projection matrix every time that we update the view matrix.

		setMatrixUniforms: ( mvMatrix, pMatrix ) ->
			@_gl.uniformMatrix4fv @_shaderProgram.pMatrixUniform, false, pMatrix
			@_gl.uniformMatrix4fv @_shaderProgram.mvMatrixUniform, false, mvMatrix

#### <a name="createMesh"></a>createMesh
Utility to create a mesh.

		createMesh: ( vertices, vertexSize, numVertices, colors, colorSize, numColors, position ) ->
			vertexBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ARRAY_BUFFER, vertexBuffer
			@_gl.bufferData @_gl.ARRAY_BUFFER, ( new Float32Array vertices ), @_gl.STATIC_DRAW

			colorBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ARRAY_BUFFER, colorBuffer
			@_gl.bufferData @_gl.ARRAY_BUFFER, ( new Float32Array colors ), @_gl.STATIC_DRAW

			return new Mesh vertexBuffer, vertexSize, numVertices, colorBuffer, colorSize, numColors, position


#### <a name="drawScene"></a>drawScene
Finally it's time for rendering the scene.

		drawScene: ( meshes ) ->

Set up the viewport and clear it.

			@_gl.viewport 0, 0, @_gl.viewportWidth, @_gl.viewportHeight
			@_gl.clear @_gl.COLOR_BUFFER_BIT | @_gl.DEPTH_BUFFER_BIT

Initialize the perspective matrix.

			@_pMatrix = mat4.create()
			mat4.perspective @_pMatrix, 45, @_gl.viewportWidth / @_gl.viewportHeight, 0.1, 100.0, @_pMatrix

Initialize the view matrix.

			@_mvMatrix = mat4.create()

			for mesh in meshes
				mat4.translate @_mvMatrix, mat4.create(), mesh.position
				@_gl.bindBuffer @_gl.ARRAY_BUFFER, mesh.vertexBuffer
				@_gl.vertexAttribPointer @_shaderProgram.vertexPositionAttribute, mesh.vertexSize, @_gl.FLOAT, false, 0, 0
				@_gl.bindBuffer @_gl.ARRAY_BUFFER, mesh.colorBuffer
				@_gl.vertexAttribPointer @_shaderProgram.vertexColorAttribute, mesh.colorSize, @_gl.FLOAT, false, 0, 0
				@setMatrixUniforms @_mvMatrix, @_pMatrix
				@_gl.drawArrays @_gl.TRIANGLES, 0, mesh.numVertices


Here is a quick and dirty function to test out the class above by setting up the GL object and render a single frame
of the scene.
