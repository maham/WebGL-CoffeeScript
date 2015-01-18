Game
====
Some kind of central point of orgainization will be needed. It's game technology we are doing so let us call what we
are doing a game. We will need a couple of helpers for this. We will need the [Metronome](metronome.litcoffee) to keep
the pace going.

    define [
        'app/metronome'
        'app/gl'
    ], (
        Metronome
        GL
    ) ->

We will create game as a class. The class won't have any instances but it's still a very nice way of organizing data
and methods.

        class Game

Before starting the game loop we need to know a few things about the game. The FPS is the number of frames that we will
lock the game to and we will need a couple of shaders for the rendering.

            constructor: ( FPS, canvasElementID, vertexShaderSource, fragmentShaderSource ) ->
                @metronome = new Metronome FPS
                @metronome.on "Tick", @loop
                @gl = new GL canvasElementID

                shader = @gl.createShaderProgram fragmentShaderSource, vertexShaderSource
                @gl.setShader shader

If we want to render something we will also need to know from what viewpoint we should render it. This is done using a
[Camera](camera.litcoffee).

            setCamera: ( @camera ) ->

We also need something to render. Let us add a method of adding meshes to the game. This will change into some kind of
scene in the future but just an array of meshes will have to do for now.

            addMesh: ( meshData ) ->
                newMesh = @gl.createMeshFromObj meshData
                @meshes or= []
                @meshes.push newMesh
                return newMesh

This is the main game loop

            loop: =>
                return unless @meshes and @camera
                @gl.drawScene @camera, @meshes
                return

And here we start the game

            start: ->
                @metronome.start()