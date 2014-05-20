ObjLoader
=========

The ObjLoader takes a string and parses it as a WaveFront .obj-file. It will create a list of vertices, a list of
normals, a list of texels and a list of faces. Those can then be used to create a mesh for WebGL.

	module.exports = class ObjLoader

The constructor will start the parsing immediately. Splitting this into constructor and parser might be better if the
loader should later be able to be used asynchronously but this works for now.  
**WARNING** Only a subset of the specification is supported at the moment and there is no proper handling of
unsupported lines.

		constructor: ( objData ) ->
			@vertices = []
			@normals = []
			@texels = []
			@faces = []

The parsing is as simple as splitting the file into it's lines and after that parse them one by one. If the line begins
with a `#` then it's a comment and will be ignored. The line is then split on every whitespace and because of the way
JavaScript objects are composed the first token can be used as the method name to call, passing in the rest of the
tokens as parameters.

			for line in objData.split '\n'
				continue if ( line.charAt 0 ) == '#'
				tokens = line.trim().split /\s+/
				@[tokens[0]].apply @, tokens[1..]

A vertex is created from three components, [x, y, z]. The .obj specification allows for a fourth w component which is
ignored here. All components are parsed as floats.

		v: ( x, y, z ) ->
			@vertices.push [
				parseFloat x
				parseFloat y
				parseFloat z
			]

A normal is created from three components, [i, j, k]. All components are parsed as floats.

		vn: ( i, j, k ) ->
			@normals.push [
				parseFloat i
				parseFloat j
				parseFloat k
			]

A texel, texture coordinate, is created from two components. The .obj specification allows for a third w component
which is ignored here. All components are parsed as floats.

		vt: ( u, v ) ->
			@texels.push [
				parseFloat u
				parseFloat v
			]

Faces are groups of indices corresponding to the vertices.  
**IMPORTANT** Support for v/vt/vn must be added. I have to look at how index lists for texels and normals looks like in
WebGL to do this properly but I think I remember that usually the vertex is expanded with the extra data. Something
like [x, y, z, u, v] for a textured vertex.  
**WARNING** There is no support for negative indices at the moment.

		f: ( indices... ) ->
			for currentIndex in [0...indices.length]
				indices[currentIndex] = parseFloat indices[currentIndex]
			@faces.push indices
