#!/bin/sh

PORT=8000

python -m SimpleHTTPServer $PORT 1>/tmp/python-simple-http.log 2>&1 &
echo --- Server started : http://localhost:$PORT/app

