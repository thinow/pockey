#!/bin/sh

echo -n "Check current folder : " && [ -e firebase.json ] && echo "OK" || echo "Error!"
