Server
======
Super simple server to serve static content from a given directory.

Dependencies
------------
Express is an easy to use http server. Lets use this for our super simple server.

    express = require 'express'

The server
----------
Create an instance of express called server. Tell the server to use the middleware `static` initialized with the
directory `public` from the root of the project. Then tell the server to start listening to connections on the given
port. 

    server = express()
    server.use ( express.static "#{__dirname}/../public" )

    port = 8080
    server.listen port, ->
        console.log "Server listening on port #{port}"
