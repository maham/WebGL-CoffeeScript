Scene
=====
This object represents the scene. The Scene helps with relative positioning of meshes and other objects that make up the
game world.

The scene graph is made up of nodes. A node has a position, a rotation, a mesh and optionally subnodes.

    ###
    root: {
        cameras: []
        lights: []
        nodes: [
            {
                mesh: "meshID"
                position: [x, y, z]
                rotation: [xRot, yRot, zRot]
                nodes: []
            }
        ]
    }
    ###