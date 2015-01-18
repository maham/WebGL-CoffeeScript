    define ->
        requestAnimationFrame = window['requestAnimationFrame']
        
        for vendor in ['ms', 'moz', 'webkit', 'o']
                break if requestAnimationFrame
                requestAnimationFrame = window["#{vendor}RequestAnimationFrame"]
                cancelAnimationFrame = (window["#{vendor}CancelAnimationFrame"] or
                                                                    window["#{vendor}CancelRequestAnimationFrame"])
        
        targetTime = 0
        requestAnimationFrame or= (callback) ->
                targetTime = Math.max targetTime + 16, currentTime = Date.now()
                setTimeout ( -> callback Date.now() ), targetTime - currentTime
        
        cancelAnimationFrame or= (id) -> clearTimeout id
        
        time =
            requestAnimationFrame: (callback) ->
                requestAnimationFrame.apply window, [callback]
            
            cancelAnimationFrame: (id) ->
                cancelAnimationFrame.apply window, [id]
