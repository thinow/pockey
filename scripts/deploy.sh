#!/bin/sh


echo -n "Check current folder     : " && [ -e firebase.json ] && echo "OK" || echo "Error!"
echo -n "Check clean working copy : " && [ `git status | grep -c 'working directory clean'` -eq 1 ] && echo "OK" || echo "Error!"

