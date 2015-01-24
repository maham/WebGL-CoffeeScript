GL
==

GL is the central object handling WebGL calls. Currently it's taking care of every function that needs the gl object.

Dependencies
------------
To wrap the data needed for drawing meshes we import the extremely simple Mesh class. For parsing .obj file data into
structures convenient for creating meshes we use the ObjParser which can parse simple .obj files.

    define [
        'app/mesh'
        'app/objparser'
    ], (
        Mesh
        ObjParser
    ) ->
        class GL

constructor
-----------
The constructor need the element id of the canvas element where we will initialize the WebGL context. The view matrix
the projection matrix and the matrix stack are also initialized here.

            constructor: ( canvasElementId ) ->
                @_pMatrix       = mat4.create()
                @_mvMatrix      = mat4.create()
                @_mvMatrixStack = []

Fetch the element and then get the `webgl` context from it. If this fails try `experimental-webgl`. This might throw an
exception and we have to catch that. It might be better to just let the exception fall through but this way a better
error message can be shown. I will still throw the exception but now I can couple it with a console line to make sure I
know why the program halted.

                canvasElement = document.getElementById canvasElementId

                try
                    @_gl = canvasElement.getContext 'webgl' || canvasElement.getContext 'experimental-webgl'
                catch error
                    console.log "Failed to initialize WebGL using the element #{canvas}. Error:\n#{error}"
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

createTexture
-------------

            createTexture: ( anImageUrl ) ->
                newTexture = @_gl.createTexture()
                newTexture.image = new Image()
                newTexture.image.onload = =>
                    @_gl.bindTexture @_gl.TEXTURE_2D, newTexture
                    @_gl.pixelStorei @_gl.UNPACK_FLIP_Y_WEBGL, true
                    @_gl.textImage2D @_gl.TEXTURE_2D, 0, @_gl.RGBA, @_gl.RGBA, @_gl.UNSIGNED_BYTE, newTexture.image
                    @_gl.texParameteri @_gl.TEXTURE_2D, @_gl.TEXTURE_MAG_FILTER, @_gl.NEAREST
                    @_gl.texParameteri @_gl.TEXTURE_2D, @_gl.TEXTURE_MIN_FILTER, @_gl.NEAREST
                    @_gl.bindTexture @_gl.TEXTURE_2D, null

                newTexture.image.src = anImageUrl
                return newTexture

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

createShader
------------
A shader program is the 
Here we combine the fragment and vertex shader into a shader program. This is done by first creating the shader program
itself, attaching the shaders to it and last linking the program. Failure to link will result in an exception.

            createShader: ( fragmentShaderSource, vertexShaderSource ) ->
                shaderProgram = @_gl.createProgram()
                @_gl.attachShader shaderProgram, @compileShader fragmentShaderSource, @_gl.FRAGMENT_SHADER
                @_gl.attachShader shaderProgram, @compileShader vertexShaderSource, @_gl.VERTEX_SHADER

                @_gl.linkProgram shaderProgram
                unless @_gl.getProgramParameter shaderProgram, @_gl.LINK_STATUS
                    throw new Error "Failed to link shader: #{@_gl.getProgramInfoLog shaderProgram}"

                return shaderProgram

compileShader
-------------
_To use the shaders they will have to be compiled. Shaders for WebGL is written in [GLSL](https://www.khronos.org/webgl/ 
"More info found here."). Pre-compiled shaders are quite unlikely to appear in WebGL as it's really a program running on
the graphics card and it would raise some security concerns._

A new shader is created by calling `gl.createShader` while specifying what type of shader to create. The shader source
is inserted into the new shader by calling `gl.shaderSource` and the shader is compiled with `gl.compileShader`. To make
sure that the compilation was successful the `gl.COMPILE_STATUS` parameter of the shader is checked by calling
`gl.getShaderParameter`. Unless it returns true the shader didn't compile correctly and an exception containing the
shader log is thrown. If everything went fine the shader is passed back as the return value.

            compileShader: ( someShaderCode, aShaderType ) ->
                newShader = @_gl.createShader aShaderType

                @_gl.shaderSource newShader, someShaderCode
                @_gl.compileShader newShader

                unless @_gl.getShaderParameter shader, @_gl.COMPILE_STATUS
                    throw new Error "Error while compiling #{shaderType} shader: #{@_gl.getShaderInfoLog shader}"

                return shader

initShader
----------
To connect the shader and the attributes used therein `gl.getAttribLocation` is called. The shader and the name of the
attribute is passed in to the function and if the attribute is found in the shader an index to the attribute is
returned and stored as a property of the shader program. If the attribute isn't found -1 is returned. In this case the
corresponding variable is set to null so that the renderer can detect this.

            initShader: ( aShaderProgram ) ->
                aShaderProgram.vertexPositionAttribute = @_gl.getAttribLocation aShaderProgram, 'aVertexPosition'
                if aShaderProgram.vertexPositionAttribute >= 0
                    @_gl.enableVertexAttribArray aShaderProgram.vertexPositionAttribute
                else
                    aShaderProgram.vertexPositionAttribute = null

                aShaderProgram.vertexNormalAttribute = @_gl.getAttribLocation aShaderProgram, 'aVertexNormal'
                if aShaderProgram.vertexNormalAttribute >= 0
                    @_gl.enableVertexAttribArray aShaderProgram.vertexNormalAttribute
                else
                    aShaderProgram.vertexNormalAttribute = null

                aShaderProgram.textureCoordinateAttribute = @_gl.getAttribLocation aShaderProgram, 'aTextureCoordinate'
                if aShaderProgram.textureCoordinateAttribute >= 0
                    @_gl.enableVertexAttribArray aShaderProgram.textureCoordinateAttribute
                else
                    aShaderProgram.textureCoordinateAttribute = null
 
                #aShaderProgram.pMatrixUniform = @_gl.getUniformLocation aShaderProgram, 'uPMatrix'
                #throw Error 'Failed to get reference to "uPMatrix" in shader program.' unless aShaderProgram.pMatrixUniform?

                aShaderProgram.mvMatrixUniform = @_gl.getUniformLocation aShaderProgram, 'uMVMatrix'
                throw Error 'Failed to get reference to "uMVMatrix" in shader program.' unless aShaderProgram.mvMatrixUniform?

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
                    vertexBuffer:   vertexBuffer
                    vertexSize:     settings.vertexSize
                    numVertices:    settings.vertices.length / settings.vertexSize
                    indexBuffer:    indexBuffer
                    numIndices:     settings.indices.length
                    position:       settings.position
                    rotation:       [0, 0, 0]
                    shader:         @_shaderProgram

createMeshFromObj
-----------------
Creates a mesh from a WaveFront .obj file.

            createMeshFromObj: ( objData, position ) ->
                parser = new ObjParser
                parser.parse objData
                @createMesh
                    vertices:       parser.out
                    vertexSize:     3
                    indices:        parser.indices
                    numIndices:     parser.indices.length
                    position:       [0, 0, 0]

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

            drawScene: ( camera, meshes ) ->
                @_gl.clear @_gl.COLOR_BUFFER_BIT | @_gl.DEPTH_BUFFER_BIT
                viewMatrix = camera.getViewMatrix()

Then for each mesh, push the correct buffers to GL.

                for mesh in meshes
                    @_gl.useProgram mesh.shader
                    @_gl.bindBuffer @_gl.ARRAY_BUFFER, mesh.vertexBuffer
                    @_gl.vertexAttribPointer mesh.shader.vertexPositionAttribute, 3, @_gl.FLOAT, false, 32, 0 if mesh.shader.vertexPositionAttribute?
                    @_gl.vertexAttribPointer mesh.shader.vertexNormalAttribute, 3, @_gl.FLOAT, false, 32, 12 if mesh.shader.vertexNormalAttribute?
                    @_gl.vertexAttribPointer mesh.shader.textureCoordinateAttribute, 2, @_gl.FLOAT, false, 32, 24 if mesh.shader.textureCoordinateAttribute?
                    @_gl.bindBuffer @_gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer

Create a model matrix representing the translation and rotation of the object. Multiply the model matrix with the view
matrix. Multiply that matrix with the projectionMatrix and pass it in to the shader.

                    modelMatrix = mat4.create()
                    mat4.translate modelMatrix, modelMatrix, mesh.position
                    mat4.rotateX modelMatrix, modelMatrix, ( @deg2Rad mesh.rotation[0] )
                    mat4.rotateY modelMatrix, modelMatrix, ( @deg2Rad mesh.rotation[1] )
                    mat4.rotateZ modelMatrix, modelMatrix, ( @deg2Rad mesh.rotation[2] )
                    mat4.multiply modelMatrix, viewMatrix, modelMatrix
                    mat4.multiply modelMatrix, @_pMatrix, modelMatrix
                    @_gl.uniformMatrix4fv mesh.shader.mvMatrixUniform, false, modelMatrix

Finally draw the mesh as triangles.

                    @_gl.drawElements @_gl.TRIANGLES, mesh.numIndices, @_gl.UNSIGNED_SHORT, 0
    