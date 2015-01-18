fs     = require 'fs'
{exec} = require 'child_process'

appFiles  = [
    # omit src/ and .coffee to make the below lines a little shorter
    'app'
    'assetloader'
    'camera'
    'game'
    'gl'
    'glmath'
    'mesh'
    'metronome'
    'microajax'
    'microevent'
    'objparser'
    'time'
]

joined_file = 'app.litcoffee'
output_directory = 'public/'

task 'build', 'Build single application file from source files', ->
    appContents = new Array remaining = appFiles.length
    for file, index in appFiles then do (file, index) ->
        fs.readFile "src/app/#{file}.litcoffee", 'utf8', (err, fileContents) ->
            if err
                console.log "Failed to read a file."
                throw err
            appContents[index] = fileContents
            process() if --remaining is 0
    process = ->
        fs.writeFile joined_file, appContents.join('\n\n'), 'utf8', (err) ->
            if err
                console.log "Failed to join files."
                throw err
            exec "coffee --output #{output_directory} --compile #{joined_file}", (err, stdout, stderr) ->
                if err
                    console.log "Failed to compile joined file."
                    throw err
                console.log stdout + stderr
                fs.unlink joined_file, (err) ->
                    if err
                        console.log "Failed to delete joined file."
                        throw err
                    console.log 'Done.'
