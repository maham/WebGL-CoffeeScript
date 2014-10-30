Camera
======

A camera is basically a position and a target position to look at.

	module.exports = class Camera
		constructor: ( @position, @target ) ->
			@_viewMatrix = mat4.create()


		getViewMatrix: ->
			mat4.lookAt @_viewMatrix, @position, @target, [0, 1, 0]
