Main
====

This app is my playground for learning both [CoffeeScript](http://www.coffeescript.org) and
[WebGL](http://khronos.org/webgl). Anything you find here is used at your own risk. As you can see all the code is
available right here on the site you are reading so feel free to have a look around.

Dependencies
------------
We have a couple of external classes to get the app running. The [AssetLoader](assetloader.litcoffee) helps with async
loading of the assets needed for the game. The [Game](game.litcoffee "The game central") will be where everything
happens and finally we need to give the `Game` a [Camera](camera.litcoffee "Simple look-at camera class." ) so we know
our ingame viewpoint.

    requirejs [
        'app/assetloader'
        'app/game'
        'app/camera'
        'app/input'
    ], (
        AssetLoader
        Game
        Camera
        Input
    ) ->

Start the application
---------------------
The application will need something to show the world. Currently a cube mesh and a capsule mesh will be loaded and shown
side by side. The meshes will be loaded as .obj-data that is later decoded as a triangle list.

To render the meshes on screen a vertex shader and a fragment shader is needed. They are both loaded as text as pre
compiled shaders are not allowed by WebGL due to security concerns. After all a shader is a program running on your
hardware. If it's loaded as text it's not as easy to hide malicious stuff in there.

A couple of globals are created to hold the mesh data and then we load the shaders and the meshes using AssetLoader.
When the assets are all loaded `startGL` is called and the game is initialized. 

            cubeData                =
            capsuleData             = null

            new AssetLoader [
                './shaders/fShader.frag'
                './shaders/vShader.vert'
                './meshes/cube.obj'
                './meshes/capsule.obj'
            ], ( [
                    aFragmentShaderSource
                    aVertexShaderSource
                    aCubeData
                    aCapsuleData
            ] ) ->
                cubeData = aCubeData
                capsuleData = aCapsuleData
                startGL 'lesson01-canvas', aFragmentShaderSource, aVertexShaderSource

startGL
-------
To kick off the game a new `Game` object is created. The `Game` constructor will need the preffered FPS, a DOM element
where WebGL should be rendered and finally the shaders to use for rendering. A capsule and a cube is added to the game
scene and positioned in a pleasing manner. A camera is also created and added to the scene. And finally the game is put
in motion. 

            startGL = ( aCanvasElementId, aFragmentShaderSource, aVertexShaderSource ) ->
                game = new Game 60, aCanvasElementId, aVertexShaderSource, aFragmentShaderSource
                capsule = game.addMesh capsuleData
                capsule.position[0] = -2
                cube = game.addMesh cubeData
                cube.position[0] = 2
                camera = game.setCamera new Camera [0, 0, 7], [0, 0, 0]

                mouseDown = false
                input = new Input aCanvasElementId
                input.on 'MouseDown', ( anEvent ) ->
                    camera.position[0] += 5
                    mouseDown = true

                input.on 'MouseUp', ( anEvent ) ->
                    camera.position[0] -= 5
                    mouseDown = false

                input.on 'MouseMove', ( anEvent, data ) ->
                    if mouseDown
                        cube.rotation[1] += data.deltaX
                        cube.rotation[0] += data.deltaY
                    else
                        capsule.rotation[1] += data.deltaX
                        capsule.rotation[0] += data.deltaY

                game.start()
