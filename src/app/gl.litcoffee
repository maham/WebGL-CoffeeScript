GL
==

GL is the central object handling WebGL calls. Currently it's taking care of every function that needs the gl object.

Dependencies
------------
To wrap the data needed for drawing meshes we import the extremely simple Mesh class. For parsing .obj file data into
structures convenient for creating meshes we use the ObjParser which can parse simple .obj files.

	Mesh = require 'app/mesh'
	ObjParser = require 'app/objparser'

GL
--
First we need the class itself. I will call it GL at the moment and see if that sticks.

	module.exports = class GL

constructor
-----------

The constructor need the element id of the canvas element where we will initialize the WebGL context. The view matrix
the projection matrix and the matrix stack is also initialized here.

		constructor: ( canvasElementId ) ->
			@_pMatrix = mat4.create()
			@_mvMatrix = mat4.create()
			@_mvMatrixStack = []
			@_cubeRotation = 0.0

Fetch the element and then get the `webgl` context from it. If this fails try `experimental-webgl`. This might throw an
exception and we have to catch that. It might be better to just let the exception fall through but this way a better
error message can be shown. I will still throw the exception but now I can couple it with a console line to make sure I
know why the program halted.

			canvasElement = document.getElementById canvasElementId

			try
				@_gl = canvasElement.getContext 'webgl' || canvasElement.getContext 'experimental-webgl'
			catch error
				console.log 'Failed to initialize WebGL using the element ' + canvas + '. Error:\n' + error
				throw error

Tack the physical dimensions of the element onto the gl context. We need them to be able to specify the viewport later.

			@_gl.viewportWidth = canvasElement.width
			@_gl.viewportHeight = canvasElement.height

Clear the buffer and enable depth testing.

			@_gl.clearColor 0.0, 0.0, 0.0, 1.0
			@_gl.enable @_gl.DEPTH_TEST


fetchShaderFromElement
----------------------

Shaders can be located inside a `<script>` tag in the HTML. This method parses an element specified by its id.

		fetchShaderFromElement: ( shaderElementId ) ->
			shaderElement = document.getElementById shaderElementId

If the given element doesn't exist we stop the execution straight away. Same thing if it's not a shader element. It
should be a script tag with the type attribute set to either `x-shader/x-fragment` or `x-shader/x-vertex`.

			throw new Error 'No shader with id: ' + shaderElementId unless shaderElement
			throw new Error 'Not a shader element: ' + shaderElement unless shaderElement.type == 'x-shader/x-fragment' or shaderScript.type == 'x-shader/x-vertex'

The shader code is just text so we can just traverse through the element and glue together all nodes with nodeType 3
(text nodes) to a combined string with the shader code in it.
*NOTE:* This might not be the best way to do this. I think I can actually use the innerHTML property. I'll try that
later.

			shaderCode = ""
			currentScriptNode = shaderElement.firstChild

			while currentScriptNode
				shaderCode += currentScriptNode.textContent if currentScriptNode.nodeType == 3
				currentScriptNode = currentScriptNode.nextSibling

			return shaderCode;

compileShader
-------------

To use the shaders they will have to be compiled. The first parameter is a string containing the GLSL code and the
second parameter will give the type of shader to create. Currently there is no mechanism to match the shader code to
the shader type. Extracting a shader class from this is probably the way to go. Later...

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

initShaders
-----------

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

			@_shaderProgram.pMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uPMatrix'
			@_shaderProgram.mvMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uMVMatrix'

#### <a name="setMatrixUniforms"></a>setMatrixUniforms
Utility to set the matrix uniforms.
_NOTE:_ Not sure that we need to set the projection matrix every time that we update the view matrix.

		setMatrixUniforms: ->
			@_gl.uniformMatrix4fv @_shaderProgram.pMatrixUniform, false, @_pMatrix
			@_gl.uniformMatrix4fv @_shaderProgram.mvMatrixUniform, false, @_mvMatrix

#### <a name="createMesh"></a>createMesh
Utility to create a mesh.

		createMesh: ( vertices, vertexSize, numVertices, indices, numIndices, position ) ->
			vertexBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ARRAY_BUFFER, vertexBuffer
			@_gl.bufferData @_gl.ARRAY_BUFFER, ( new Float32Array vertices ), @_gl.STATIC_DRAW

			indexBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, indexBuffer
			@_gl.bufferData @_gl.ELEMENT_ARRAY_BUFFER, ( new Uint16Array indices ), @_gl.STATIC_DRAW

			return new Mesh vertexBuffer, vertexSize, numVertices, indexBuffer, numIndices, position

#### <a name="createMeshFromObj"></a>createMeshFromObj
Creates a mesh from a WaveFront .obj file.

		createMeshFromObj: ( objData, position ) ->
			parser = new ObjParser
			parser.parse objData
			@createMesh parser.vertices, 3, parser.vertices.length / 3, parser.faces, parser.faces.length, [0, 0, -7]

#### <a name="pushMatrix"></a>pushMatrix
I'm using the matrix stack from the tutorial here. Another method might be used later.

		pushMatrix: ->
			@_mvMatrixStack.push mat4.clone @_mvMatrix

		popMatrix: ->
			throw Error 'Invalid popMatrix' if @_mvMatrixStack.length < 1
			@_mvMatrix = @_mvMatrixStack.pop()

A conversion of degrees to radians is needed

		deg2Rad: ( degrees ) ->
			degrees * Math.PI / 180

#### <a name="drawScene"></a>drawScene
Finally it's time for rendering the scene.

		drawScene: ( meshes ) ->

Set up the viewport and clear it.

			@_gl.viewport 0, 0, @_gl.viewportWidth, @_gl.viewportHeight
			@_gl.clear @_gl.COLOR_BUFFER_BIT | @_gl.DEPTH_BUFFER_BIT

Initialize the perspective matrix.

			mat4.perspective @_pMatrix, 45, @_gl.viewportWidth / @_gl.viewportHeight, 0.1, 100.0, @_pMatrix

Initialize the view matrix.

			mat4.identity @_mvMatrix

			for mesh in meshes
				mat4.translate @_mvMatrix, mat4.create(), mesh.position
				@pushMatrix()
				mat4.rotate @_mvMatrix, @_mvMatrix, ( @deg2Rad @_cubeRotation ), [-1, 1, 1]
				debugString = @_cubeRotation.toFixed( 2 ).toString()
				( document.getElementById 'cubeRot' ).value = mat4.str @_mvMatrix
				@_gl.bindBuffer @_gl.ARRAY_BUFFER, mesh.vertexBuffer
				@_gl.vertexAttribPointer @_shaderProgram.vertexPositionAttribute, mesh.vertexSize, @_gl.FLOAT, false, 0, 0

				@_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer

				@setMatrixUniforms()
				@_gl.drawElements @_gl.TRIANGLE_FAN, mesh.numIndices, @_gl.UNSIGNED_SHORT, 0
				@popMatrix()

Lets spice tings up with some animation

		tick: ->
			@_cubeRotation += 1.5
	