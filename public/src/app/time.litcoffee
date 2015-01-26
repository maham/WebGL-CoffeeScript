Time
====
_The JavaScript methods requestAnimationFrame and cancelAnimationFrame are not the exact same for all browsers so this
method can bridge that._

First `requestAnimationFrame` is assigned to the `window` property with the same name. Then the different browser
namings are looped through. If `requestAnimationFrame` is already set the loop is ended.

    define ->
        requestAnimationFrame = window['requestAnimationFrame']
        cancelAnimationFrame = window['cancelAnimationFrame']
        
        for vendor in ['ms', 'moz', 'webkit', 'o']
                break if requestAnimationFrame
                requestAnimationFrame = window["#{vendor}RequestAnimationFrame"]
                cancelAnimationFrame = (window["#{vendor}CancelAnimationFrame"] or
                                                                    window["#{vendor}CancelRequestAnimationFrame"])

As a final fallback `setTimeout` is used. Here the timeout is set to current time + 16 milliseconds.

        targetTime = 0
        requestAnimationFrame or= (callback) ->
                targetTime = Math.max targetTime + 16, currentTime = Date.now()
                setTimeout ( -> callback Date.now() ), targetTime - currentTime
        
        cancelAnimationFrame or= (id) -> clearTimeout id

The methods for requesting and cancelling animation frames are finally returned as the object `time`.

        time =
            requestAnimationFrame: (callback) ->
                requestAnimationFrame.apply window, [callback]
            
            cancelAnimationFrame: (id) ->
                cancelAnimationFrame.apply window, [id]
