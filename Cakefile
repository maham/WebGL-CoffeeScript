colors = require 'colors'
fs     = require 'fs'
{exec} = require 'child_process'

source_directory = 'public/src/app'
output_directory = 'public/js/app'

# compile
# -----
#
# This will compile the source.
task 'compile', 'Compile the source.', ->
    console.log "Compiling '#{source_directory}'."
    compile_process = exec "coffee --map --output #{output_directory} --compile #{source_directory}", (err, stdout, stderr) ->
        if err
            console.log 'Something went wrong...'.red
            throw err

    compile_process.stdout.on 'data', ( data ) ->
        console.log "stdout: #{data}".green

    compile_process.stderr.on 'data', ( data ) ->
        console.log "stderr: #{data}".red

    compile_process.on 'close', ( code ) ->
        console.log "Exited with code: #{code}".green

# watch
# -----
#
# This will compile the source and start watching for changes until cancelled.
task 'watch', 'Compile the source and start watching for changes.', ->
    console.log "Watching '#{source_directory}' for changes."
    watch_process = exec "coffee --map --output #{output_directory} --watch #{source_directory}", (err, stdout, stderr) ->
        if err
            console.log 'Something went wrong...'.red
            throw err

    watch_process.stdout.on 'data', ( data ) ->
        console.log "stdout: #{data}".green

    watch_process.stderr.on 'data', ( data ) ->
        console.log "stderr: #{data}".red

    watch_process.on 'close', ( code ) ->
        console.log "Exited with code: #{code}".green

# server
# ------
#
# This will start a really simple web server serving the contents of the public/ directory.
task 'server', 'Start a simple web server.', ->
    console.log 'Starting server'.green
    server_process = exec 'coffee server/server.litcoffee', (err, stdout, stderr) ->
        if err
            console.log 'Something went wrong...'.red
            throw err

    server_process.stdout.on 'data', ( data ) ->
        console.log "stdout: #{data}".green

    server_process.stderr.on 'data', ( data ) ->
        console.log "stderr: #{data}".red

    server_process.on 'close', ( code ) ->
        console.log "Exited with code: #{code}".green
