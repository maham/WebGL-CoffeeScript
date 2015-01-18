Input
=====
This class takes care of input handling.

Dependencies
------------
Input will depend on [MicroEvent](microevent.litcoffee) for telling observers about updates.

    define [
        'app/microevent'
    ], (
        MicroEvent
    ) ->

Input
-----
The Input class spits out events that can be observed and acted upon.

        class Input
            constructor: ( aCanvasElementID ) ->
                canvasElement = document.getElementById aCanvasElementID

                canvasElement.onmousedown = ( anEvent ) => @onMouseDown anEvent
                document.onmouseup = ( anEvent ) => @onMouseUp anEvent
                document.onmousemove = ( anEvent ) => @onMouseMove anEvent

onMouseDown
-----------
When a mouse button is depressed it's time to start paying attention to mouse position updates. This setup is only valid
as long as we only care about mouse moves while a button is pressed.

            onMouseDown: ( anEvent ) ->
                @mouseDown = true
                @_lastMouseX = anEvent.clientX
                @_lastMouseY = anEvent.clientY
                @emit 'MouseDown', @

onMouseUp
---------
On releasing the mouse button a `MouseUp` event is emitted.

            onMouseUp: ( anEvent ) ->
                @mouseDown = false
                @emit 'MouseUp', @

onMouseMove
-----------

            onMouseMove: ( anEvent ) ->
                return unless @mouseDown

                @mouseX = anEvent.clientX
                @mouseY = anEvent.clientY
                @deltaX = @mouseX - @_lastMouseX
                @deltaY = @mouseY - @_lastMouseY
                @_lastMouseX = @mouseX
                @_lastMouseY = @mouseY

                @emit 'MouseMove', @

Mixin
-----

        MicroEvent.Mixin Input
