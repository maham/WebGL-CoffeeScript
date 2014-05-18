User
====


	module.exports = class User
		constructor: ( @name ) ->

		hello: ->
			alert "Hello from " + @name