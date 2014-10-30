MicroEvent
==========

_This is my coffeescript version of Jerome Etiennes
[microevent.js](https://github.com/jeromeetienne/microevent.js "microevent.js"). It's 22 lines of code (sloc) and it is
thus actually a bit longer then it's JavaScript counterpart. But I have made some tweaks to the original and also added
the one time handler._

Based on the work of Jerome Etienne. All credits where due

TODO
----
* <strike>I'm using a class here. A mixin would maybe be more fitting.</strike>
* A usage example would maybe be in order.

MicroEvent
----------
Inherit MicroEvent for nice and clean event support

	module.exports = class MicroEvent

No constructor added as it would require a call to 'super' which would be open to errors from forgetting to call it.
<strike>If I recode as a mixin instead of a class I could do the required setup (creation of `@_events`) in the mix
function.</strike> _I decided to add `Mixin` as a class method and as it's still possible to extend from `MicroEvent` I
think it's better to do the extra checks in the methods then to make the class behave differently if used as a mixin
instead of a parent class._

---

###on
The on method binds a call to an event. `e` is the name of the event and `handler` is the function that we want to call
when the event is triggered. The method returns `this` for chaining support and because it is more logical than the
return value from `.push`.

_Make sure that `@_events` really exists before trying to add to it. Also if `@_events[e]` don't exist, create an
array there. Next push `handler` into the array and return `this`_

		on: ( e, handler ) ->
			@_events or= {}
			@_events[e] or= []
			@_events[e].push handler
			@

###once
This method is the same as `on` with the added call to `off` when the event has been triggered. As in `on` we have the
argument `e` which gives the name of the event and `handler` which is the function to call. `once` returns `this` for
chaining support.

		once: ( e, handler ) ->
			@on e, =>
				handler.apply @, arguments
				@off e, handler
			@

###off
To unbind a handler from an event `off` is used. It takes the name of the event in `e` and the handler to remove in
`handler`. It returns `this` to support chaining.

		off: ( e, handler ) ->
			return unless @_events
			@_events[e].splice ( @_events[e].indexOf handler ), 1 if @_events[e]
			@


###emit
Triggers an event and calls all handlers bound to the event with all
the arguments sent to emit.
####e
The event to emit.
####data...
Any additional data pass on to the event handler. The event will also be
passed to the handler.
####returns
@ for chaining support and it's a more logical return value then an array
with all the return values from the handlers.

		emit: ( e, data... ) ->
			return unless @_events
			handler.apply @, arguments for handler in @_events[e] if @_events[e]
			@

###Mixin
Mixes the methods of MicroEvent into the destination class.
####target
The class to be enhanced
####returns
Returns undefined

		@Mixin: ( target ) ->
			target.prototype[name] = property for own name, property of MicroEvent.prototype
			return target
