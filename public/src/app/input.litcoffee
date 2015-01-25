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
                @canvasElement = document.getElementById aCanvasElementID

                @mouseMoveHandler = ( anEvent ) => @onMouseMove anEvent
                @mouseDownHandler = ( anEvent ) => @onMouseDown anEvent
                @mouseUpHandler = ( anEvent ) => @onMouseUp anEvent
                @mouseEnterHandler = ( anEvent ) =>
                    @_lastMouseX = anEvent.clientX
                    @_lastMouseY = anEvent.clientY

                    @canvasElement.removeEventListener 'mouseenter', @mouseEnterHandler

                @canvasElement.addEventListener 'mousemove', @mouseMoveHandler
                @canvasElement.addEventListener 'mousedown', @mouseDownHandler
                @canvasElement.addEventListener 'mouseenter', @mouseEnterHandler

onMouseDown
-----------
A `MouseDown` event is emitted when a mouse button is pressed while inside the canvas element. To make sure that a mouse
move can be followed outside the canvas the `mouseMoveHandler` is moved to the document. This makes sure that for
example drags can continue outside the element borders. The `mouseUpHandler` is also registered here. The reason for not
registering it until after a mouse down event is so that it won't trigger unless it happens inside the canvas element.

            onMouseDown: ( anEvent ) ->
                @canvasElement.removeEventListener 'mousemove', @mouseMoveHandler
                document.addEventListener 'mousemove', @mouseMoveHandler

                document.addEventListener 'mouseup', @mouseUpHandler

                @emit 'MouseDown', @

onMouseUp
---------
On releasing the mouse button a `MouseUp` event is emitted. The `mouseMoveHandler` is moved out from the canvas element
to the document. Finally the `mouseUpHandler` is removed since mouse up events outside the canvas isn't relevant any
more.

            onMouseUp: ( anEvent ) ->
                document.removeEventListener 'mousemove', @mouseMoveHandler
                @canvasElement.addEventListener 'mousemove', @mouseMoveHandler

                document.removeEventListener 'mouseup', @mouseUpHandler
                
                @emit 'MouseUp', @

onMouseMove
-----------
Mouse move events are sent when the mouse pass over the canvas element or, if the mouse button was pressed inside the
canvas, until the mouse button is released.

            onMouseMove: ( anEvent ) ->
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
