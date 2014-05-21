ObjParser
=========

## ObjParser
The ObjParser takes a string and parses it as a WaveFront .obj-file. It will create a list of vertices, a list of
normals, a list of texels and a list of faces. Those can then be used to create a mesh for WebGL.

	module.exports = class ObjParser

### constructor
The constructor will start the parsing immediately. Splitting this into constructor and parser might be better if the
loader should later be able to be used asynchronously but this works for now.  
**WARNING** Only a subset of the specification is supported at the moment and there is no proper handling of
unsupported lines.

		constructor: ->
			@vertices = []
			@normals = []
			@texels = []
			@faces = []

### parse
The parsing is as simple as splitting the file into it's lines and after that parse them one by one. If the line begins
with a `#` then it's a comment and will be ignored. The line is then split on every whitespace and because of the way
JavaScript objects are composed the first token can be used as the method name to call, passing in the rest of the
tokens as parameters.

		parse: ( objData ) ->
			for line in objData.split '\n'
				continue if ( line.charAt 0 ) == '#' or line.length < 1
				tokens = line.trim().split /\s+/
				@[tokens[0]].apply @, tokens[1..] if @[tokens[0]]
			@

### v
A vertex is created from three components, `x, y, z`. The .obj specification allows for a fourth `w` component which is
ignored here. All components are parsed as floats.

		v: ( x, y, z ) ->
			@vertices.push.apply @vertices,
			[
				parseFloat x
				parseFloat y
				parseFloat z
			]
			return

### vn
A normal is created from three components, `i, j, k`. All components are parsed as floats.

		vn: ( i, j, k ) ->
			@normals.push.apply @normals,
			[
				parseFloat i
				parseFloat j
				parseFloat k
			]
			return

### vt
A texel, texture coordinate, is created from two components. The .obj specification allows for a third `w` component
which is ignored here. All components are parsed as floats.

		vt: ( u, v ) ->
			@texels.push.apply @texels,
			[
				parseFloat u
				parseFloat v
			]
			return

### f
Faces are groups of indices corresponding to the vertices.  
**WARNING** To simplify things only the vertex index on `f` rows is regarded. If the index have normal and texel intermixed
those will be ignored.
**WARNING** There is no support for negative indices at the moment.

		f: ( indices... ) ->
			for currentIndex in [0...indices.length]
				components = indices[currentIndex].split '/'
				indices[currentIndex] = components[0]
				indices[currentIndex] = parseInt ( indices[currentIndex] - 1 )
			@faces.push.apply @faces, indices
			return
