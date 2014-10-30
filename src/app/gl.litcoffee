GL
==

GL is the central object handling WebGL calls. Currently it's taking care of every function that needs the gl object.

Dependencies
------------
To wrap the data needed for drawing meshes we import the extremely simple Mesh class. For parsing .obj file data into
structures convenient for creating meshes we use the ObjParser which can parse simple .obj files.

	Mesh		= require 'app/mesh'
	ObjParser 	= require 'app/objparser'
	Camera		= require 'app/camera'

GL
--
First we need the class itself. I will call it GL at the moment and see if that sticks.

	module.exports = class GL

constructor
-----------

The constructor need the element id of the canvas element where we will initialize the WebGL context. The view matrix
the projection matrix and the matrix stack are also initialized here.

		constructor: ( canvasElementId ) ->
			@_pMatrix		= mat4.create()
			@_mvMatrix		= mat4.create()
			@_mvMatrixStack	= []
			@_cubeRotation	= 0.0
			@_camera		= new Camera [0, 0, -10], [0, 0, 0]

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
			mat4.perspective @_pMatrix, 45, canvasElement.width / canvasElement.height, 0.1, 100.0, @_pMatrix
			@_gl.viewport 0, 0, canvasElement.width, canvasElement.height

Clear the buffer, enable depth testing and enable backface culling.

			@_gl.clearColor 0.0, 0.0, 0.0, 1.0
			@_gl.enable @_gl.DEPTH_TEST
			@_gl.enable @_gl.CULL_FACE


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

createShaderProgram
-------------------

Here we combine the fragment and vertex shader into a shader program. This is done by first creating the shader program
itself, attaching the shaders to it and last linking the program. Failure to link will result in an exception.

		createShaderProgram: ( fragmentShaderSource, vertexShaderSource ) ->
			shaderProgram = @_gl.createProgram()
			@_gl.attachShader shaderProgram, @compileShader fragmentShaderSource, @_gl.FRAGMENT_SHADER
			@_gl.attachShader shaderProgram, @compileShader vertexShaderSource, @_gl.VERTEX_SHADER

			@_gl.linkProgram shaderProgram
			unless @_gl.getProgramParameter shaderProgram, @_gl.LINK_STATUS
				throw new Error 'Could not initialize shaders.'

			return shaderProgram

setShader
---------

Set the shader program to use for rendering and get references to the variables that's needed to interact with the
shader. The references are stored in the shader program object.

		setShader: ( @_shaderProgram ) ->
			@_gl.useProgram @_shaderProgram

			@_shaderProgram.vertexPositionAttribute = @_gl.getAttribLocation @_shaderProgram, 'aVertexPosition'
			throw Error 'Failed to get reference to "aVertexPosition" in shader program.' unless @_shaderProgram.vertexPositionAttribute?
			@_gl.enableVertexAttribArray @_shaderProgram.vertexPositionAttribute

			#@_shaderProgram.pMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uPMatrix'
			#throw Error 'Failed to get reference to "uPMatrix" in shader program.' unless @_shaderProgram.pMatrixUniform?

			@_shaderProgram.mvMatrixUniform = @_gl.getUniformLocation @_shaderProgram, 'uMVMatrix'
			throw Error 'Failed to get reference to "uMVMatrix" in shader program.' unless @_shaderProgram.mvMatrixUniform?

createMesh
----------

Utility to create a mesh.

		createMesh: ( settings ) ->
			vertexBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ARRAY_BUFFER, vertexBuffer
			@_gl.bufferData @_gl.ARRAY_BUFFER, ( new Float32Array settings.vertices ), @_gl.STATIC_DRAW

			indexBuffer = @_gl.createBuffer()
			@_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, indexBuffer
			@_gl.bufferData @_gl.ELEMENT_ARRAY_BUFFER, ( new Uint16Array settings.indices ), @_gl.STATIC_DRAW

			return new Mesh
				vertexBuffer:	vertexBuffer
				vertexSize:		settings.vertexSize
				numVertices:	settings.vertices.length / settings.vertexSize
				indexBuffer:	indexBuffer
				numIndices:		settings.indices.length
				position:		settings.position

createMeshFromObj
-----------------

Creates a mesh from a WaveFront .obj file.

		createMeshFromObj: ( objData, position ) ->
			parser = new ObjParser
			parser.parse objData
			@createMesh
				vertices:		parser.out[0]
				vertexSize:		3
				indices:		parser.indices
				numIndices:		parser.indices.length
				position:		[0, 0, 0]

setMvMatrix
-----------------

		setMvMatrix: ( modelMatrix, viewMatrix, projectionMatrix ) ->
			mvMatrix = mat4.create()
			mat4.multiply mvMatrix, modelMatrix, viewMatrix
			mat4.multiply mvMatrix, mvMatrix, projectionMatrix
			@_gl.uniformMatrix4fv @_shaderProgram.mvMatrixUniform, false, mvMatrix

pushMatrix
----------

I'm using the matrix stack from the tutorial here. Another method might be used later.

		pushMatrix: ->
			@_mvMatrixStack.push mat4.clone @_mvMatrix

popMatrix
---------

		popMatrix: ->
			throw Error 'Invalid popMatrix' if @_mvMatrixStack.length < 1
			@_mvMatrix = @_mvMatrixStack.pop()

deg2Rad
-------

A conversion of degrees to radians is needed

		deg2Rad: ( degrees ) ->
			degrees * Math.PI / 180

drawScene
---------

To draw the scene we start by clearing the viewport and getting the view matrix from the camera.

		drawScene: ( meshes ) ->
			@_gl.clear @_gl.COLOR_BUFFER_BIT | @_gl.DEPTH_BUFFER_BIT
			viewMatrix = mat4.create()
			cameraPosition	= [0, 0, -10]
			cameraTarget	= [0, 0, 0]
			cameraRotation = mat4.create()
			mat4.rotateY cameraRotation, cameraRotation, ( @deg2Rad @_cubeRotation )
			cameraTranslation = mat4.create()
			mat4.translate cameraTranslation, cameraTranslation, cameraPosition
			cameraMatrix = mat4.create()
			mat4.multiply cameraMatrix, cameraTranslation, cameraMatrix
			mat4.multiply cameraMatrix, cameraRotation, cameraMatrix
			cameraPosition = cameraMatrix.subarray 12, 15
			mat4.lookAt viewMatrix, cameraPosition, cameraTarget, [0, 1, 0]

Then for each mesh, push the correct buffers to GL.

			for mesh in meshes
				@_gl.bindBuffer @_gl.ARRAY_BUFFER, mesh.vertexBuffer
				@_gl.vertexAttribPointer @_shaderProgram.vertexPositionAttribute, mesh.vertexSize, @_gl.FLOAT, false, 0, 0
				@_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer

Create a model matrix representing the translation and rotation of the object. Multiply the model matrix with the view
matrix. Multiply that matrix with the projectionMatrix and pass it in to the shader.

				modelMatrix = mat4.create()
				mat4.translate modelMatrix, modelMatrix, [0, 0, 0]
				#mat4.rotate modelMatrix, modelMatrix, ( @deg2Rad @_cubeRotation * 2 ), [1, 0, 0]
				mat4.multiply modelMatrix, viewMatrix, modelMatrix
				mat4.multiply modelMatrix, @_pMatrix, modelMatrix
				@_gl.uniformMatrix4fv @_shaderProgram.mvMatrixUniform, false, modelMatrix

Finally draw the mesh as a triangle fan.

				@_gl.drawElements @_gl.TRIANGLES, mesh.numIndices, @_gl.UNSIGNED_SHORT, 0

tick
----

Lets spice tings up with some animation

		tick: ->
			@_cubeRotation += 1.5
	