ObjParser
=========

ObjParser
---------
The ObjParser takes a string and parses it as a WaveFront .obj-file. It will create a list of vertices, a list of
normals, a list of texels and a list of faces. Those can then be used to create a mesh for WebGL.

_**WARNING** Only a subset of the specification is supported at the moment and there is no proper handling of
unsupported lines._

    define ->
        class ObjParser


constructor
-----------
The constructor sets up a few storages for the parsed data. `parsed` is an array of arrays. The arrays will contain the
vertices, the texels and the normals. `out` is an array of arrays. The arrays will contain the processed vertices,
texels and normals. `indices` is an array containing the indices for the index list sent to WebGL. Currently we don't
try to reuse any vertices so the indices will each point to its own vertex.

            constructor: ->
                @parsed         = [[],[],[]]
                @out            = []
                @indices        = []

parse
-----
The parse method takes the contents of a .obj file as its only in parameter. The parsing is as simple as splitting the
file on every linebreak and then parse the lines one by one. If the line is empty or begins with a '#' we skip that
line. After trimming the whitespace from the beginning and the end of the line it's split on every whitespace. The
first token can then be used as the method name to call because of how JavaScript objects works. The remainder of the
array is then passed in as the methods arguments.

            parse: ( objData ) ->
                for line in objData.split '\n'
                    continue if ( line.charAt 0 ) == '#' or line.length < 1
                    tokens = line.trim().split /\s+/

                    @[tokens[0]].apply @, tokens[1..] if @[tokens[0]]
                return

v &nbsp;
--------
A vertex is created from three components, `x, y, z`. The .obj specification allows for a fourth `w` component which is
ignored here. The arguments are parsed as floats, packed into an array and pushed into the first `parsed` array.

            v: ( x, y, z ) ->
                @parsed[0].push [
                    parseFloat x
                    parseFloat y
                    parseFloat z
                ]
                return

vt &nbsp;
---------
A texel, texture coordinate, is created from two components, `u, v`. The .obj specification allows for a third `w`
component which is ignored here. The arguments are parsed as floats, packed into an array and pushed into the third
`parsed` array.

            vt: ( u, v ) ->
                @parsed[2].push [
                    parseFloat u
                    parseFloat v
                ]
                return

vn &nbsp;
---------
A normal is created from three components, `i, j, k`. The arguments are parsed as floats, packed into an array and
pushed into the second `parsed` array.

            vn: ( i, j, k ) ->
                @parsed[1].push [
                    parseFloat i
                    parseFloat j
                    parseFloat k
                ]
                return

f &nbsp;
--------
_To render a mesh with OpenGL we usually use a list of vertices and indices. Each vertex as it is sent to the
shader is usually a combination of the position, the normal and the texel. Ex: `[X, Y, Z, Nx, Ny, Nz, Tu, Tv]`. This is
a vertex of size 8 (eight components in total). When we look at a .obj file it can be very well optimized and a lot of
vertices, texels, normals etc. might be shared between different faces etc. The problem is that with the vertices
packed as shown above each vertex must have all information that is needed for that vertex so we have to combine the
different aspects of the vertex some way. The way we do it here is by letting the f(aces) tell us what parts to combine
into each vertex. If we encounter an f row we will receive an array of indices that in their turn gives the indices of
the v(ertex), the v(ertex)t(exel) and the v(ertex)n(ormal). If we just take those and combine into an array we should
be fine._

__TODO: Currently we skip all components except the vertex index.__

---

A face is created from an array of indices. We use a splat `...` to merge all incoming indices into a single array. To
parse the faces we iterate through all indices. Each index is then split on `/` to get the indices for the v(ertex),
the v(ertex)t(exel) and the v(ertex)n(ormal). We then continue to loop through the components of the index. The
component is parsed as an int and indicates which v(ertex), v(ertex)t(exel) or v(ertex)n(ormal) that the face point
should use. An index is either absolute and starts with 1 as the first defined v/vn/vt or relative where -1 is the last
defined v/vn/vt. Now we push the indicated v/vt or vn to the `out` array. We use the push->apply method to unpack the
vertex data. The `out` array needs to be a flat array to play well with the WebGL calls. At the moment we just create a
new vertex for every vertex and thus the index will always point to the last vertex. If we add code to reuse vertices
then this will have to be changed to indicate the index of the 'reused' vertex if one is found.

            f: ( indices... ) ->
                for currentIndex in [0...indices.length]
                    components = indices[currentIndex].split '/'
                    for currentComponentIndex in [0...components.length]
                        continue if currentComponentIndex > 0
                        index = parseInt components[currentComponentIndex]
                        if index > 0
                            parsedIndex = index - 1
                        else
                            parsedIndex = @parsed[currentComponentIndex].length + index
                        @out.push.apply @out, @parsed[currentComponentIndex][parsedIndex]
                    @indices.push @indices.length
                return

<!-- Sorry for the non breaking spaces I have added to some of the method headers. They are there as the markdown parser
really don't like one char headers if I'm using the hyphen H2 markdown. But I still want it instead of the hash version
as it's a lot better for the readability. -->
