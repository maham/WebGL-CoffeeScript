Main
====

This app is my playground for learning both [CoffeeScript](http://www.coffeescript.org) and
[WebGL](http://khronos.org/webgl). Anything you find here is used at your own risk. As you can see all the code is
available right here on the site you are reading so feel free to have a look around.

Dependencies
------------
We have a couple of external classes to get the app running. [GL](gl.litcoffee "Utility class for WebGL") will handle
the WebGL related tasks. [Metronome](metronome.litcoffee "Time ticker class") is a good for keeping the game loop
ticking. [MicroAjax](microajax.litcoffee "Very small AJAX loader") helps with resource loading. Last out is
[Camera](camera.litcoffee "Simple look at camera class." ).

    requirejs [
        'app/gl'
        'app/metronome'
        'app/microajax'
        'app/camera'
        'app/game'
        'app/assetloader'
    ], (
        GL
        Metronome
        MicroAjax
        Camera
        Game
        AssetLoader
    ) ->

Start the application
---------------------
The app must wait for everything to be properly loaded before it can start. This is done with a simple event listener
waiting for the `DOMContentLoaded` event. There is a lot of JS-frameworks that could help with this but at the moment
this method will be sufficient.

        # document.addEventListener "DOMContentLoaded", ->

The shaders are loaded asynchronously as text. Pre-compiled shaders don't exist in WebGL yet and it's probably not high
on the list as it would be a security concern as far as I understand it. So let's create a couple of variables store
the shader code in until we are ready init GL. We will also require a couple of meshes to render and as the shader code
and the mesh data will be loaded asynchronously we need somewhere to store the mesh data too.

            fragmentShaderSource    =
            vertexShaderSource      =
            cubeData                =
            capsuleData             = null

Now it's time to start loading the shadercode. As there is two shaders that are both loaded async the app must wait
until both are loaded before there is any point in starting up WebGL. This is a good moment to start the laoding of
the meshes as well.

            # ##
            new MicroAjax './shaders/fShader.frag', ( resource ) ->
                console.log 'Fragment shader loaded.'
                fragmentShaderSource = resource

            new MicroAjax './shaders/vShader.vert', ( resource ) ->
                console.log 'Vertex shader loaded.'
                vertexShaderSource = resource

            new MicroAjax './meshes/cube.obj', ( resource ) ->
                console.log 'Cube data loaded.'
                cubeData = resource

            new MicroAjax './meshes/capsule.obj', ( resource ) ->
                console.log 'Capsule data loaded.'
                capsuleData = resource
            ###
            new AssetLoader {
                fragmentShaderSource: './shaders/fShader.frag'
                vertexShaderSource: './shaders/vShader.vert'
                cubeData: './meshes/cube.obj'
                capsuleData: './meshes/capsule.obj'
            }, ( assets ) ->
                fragmentShaderSource = assets['fragmentShaderSource']
                vertexShaderSource = assets['vertexShaderSource']
                cubeData = assets['cubeData']
                capsuleData = assets['capsuleData']

                startGL 'lesson01-canvas', fragmentShaderSource, vertexShaderSource
            # ###

waitForAssets
-------------
This method does exactly what is says. It waits for the assets to load in one second loops and when all assets are done
loading it will call [`startGL`](#startgl).

            # ##
            waitForAssets = ->
                setTimeout ->
                    if fragmentShaderSource? and vertexShaderSource? and cubeData? and capsuleData?
                        startGL 'lesson01-canvas', fragmentShaderSource, vertexShaderSource
                    else
                        waitForAssets()
                , 1000

            waitForAssets()
            # ###

startGL
-------
After GL is initialized the shader program have to be compiled and linked.

            startGL = ( canvasElementId, fragmentShaderSource, vertexShaderSource ) ->
                game = new Game 60, canvasElementId, vertexShaderSource, fragmentShaderSource
                game.start()
                capsule = game.addMesh capsuleData
                capsule.position[0] = -2
                cube = game.addMesh cubeData
                cube.position[0] = 2
                game.setCamera new Camera [0, 0, 7], [0, 0, 0]
        , false
