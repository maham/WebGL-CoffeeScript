Game
====
Some kind of central point of orgainization will be needed. It's game technology we are doing so let us call what we
are doing a game.

Dependencies
------------
We will need a couple of helpers for this. We will need the [Metronome](metronome.litcoffee) to keep
the pace going. Then we use [GL](gl.litcoffee) as the interface towards WebGL.

    define [
        'app/metronome'
        'app/gl'
    ], (
        Metronome
        GL
    ) ->
        class Game

constructor
-----------
Before starting the game loop we need to know a few things about the game and its environment. The FPS is the number of
frames that we will lock the game to. The ID of the element where the game should be rendered. And we will need a couple
of shaders for the rendering.

The `@metronome` will take care of keeping the pace of the game. Every `Tick` it emits will result in a call to `@loop`.
`@gl` will hold an instance of the WebGL interface class. After setting it up with a reference to the DOM element ID
given earlier the vertex- and fragment shader are compiled into a shader program and set initialized.

_NOTE: Each material or mesh or something will later have it's own reference to the shader it wishes to be rendered
with._

            constructor: ( FPS, canvasElementID, vertexShaderSource, fragmentShaderSource ) ->
                @metronome = new Metronome FPS
                @metronome.on "Tick", @loop

                @gl = new GL canvasElementID
                @shader = @gl.createShader fragmentShaderSource, vertexShaderSource
                @gl.initShader @shader

setCamera
---------
If we want to render something we will also need to know from what viewpoint we should render it. This is done using a
[Camera](camera.litcoffee).

            setCamera: ( @camera ) ->
                return @camera

addMesh
-------
We also need something to render. Let us add a method of adding meshes to the game. This will change into some kind of
scene in the future but just an array of meshes will have to do for now.

            addMesh: ( meshData ) ->
                newMesh = @gl.createMeshFromObj meshData
                newMesh.shader = @shader
                @meshes or= []
                @meshes.push newMesh
                return newMesh

loop
----
This is the main game loop

            loop: =>
                return unless @meshes and @camera
                @gl.drawScene @camera, @meshes
                return

start
-----
And here we start the game

            start: ->
                @metronome.start()

                window.onblur = =>
                    @metronome.stop()

                window.onfocus = =>
                    @metronome.start()
