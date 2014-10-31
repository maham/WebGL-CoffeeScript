MicroAjax
=========

MicroAjax
---------
MicroAjax is a very small AJAX utility used for async loading of resources.

    module.exports = class MicroAjax

constructor
-----------
To create an AJAX request we need the `url` to request the resource from and a `callbackFunction` to call when the
request is done. Optionally we can supply a third argument with a POST body.

As the name of the request differs between systems we us `getRequest` to find an appropriate request object and create
an instance of it. Only if such an object is found can we go on and make the actual request.

Now we can bind `stateChange` to the request objects onreadystatechange event. Then we set up the request as a POST
request with a body if `postBody` contains anything. Otherwise we set the request up as a GET request.

Finally we send the request.

        constructor:  ( @url, @callbackFunction ) ->
            @postBody = arguments[2] || ""
            @request = @getRequest()

            if @request
                @request.onreadystatechange = @stateChange

                if @postBody isnt ""
                    @request.open "POST", @url, true
                    @request.setRequestHeader 'X-Requested-With', 'XMLHttpRequest'
                    @request.setRequestHeader 'Content-type', 'application/x-www-form-urlencoded'
                    @request.setRequestHeader 'Connection', 'close'
                else
                    @request.open "GET", @url, true

                @request.send @postBody

stateChange
-----------
The only state we are interested in here is when `readyState` is `DONE` which is indicated by the value 4. When this
state is reached we call the `callbackFunction` and passes the requests response text.

        stateChange: ( object ) =>
            @callbackFunction @request.responseText if @request.readyState == 4

getRequest
----------
Different browsers have differently named objects for HTTP requests. MS us `ActiveXObject` and the other browsers that
we care about use `XMLHttpRequest`. If neither is found we return false to indicate that we can't do a remote request.
When the correct request object is found we create an instance of it and returns it.

        getRequest: ->
            return new ActiveXObject 'Microsoft.XMLHTTP' if window.ActiveXObject
            return new XMLHttpRequest if window.XMLHttpRequest
            return false

Copyright
---------
_As this is just a CoffeeScript rewrite of [microajax](https://code.google.com/p/microajax/) I stick the original
copyright notice here._

Copyright (c) 2008 Stefan Lange-Hegermann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
