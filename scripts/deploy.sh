#!/bin/sh

echo -n "Current folder is root     : "
if [ -e firebase.json ]; then
	echo "OK"
else
	echo "Error!"
	exit 1
fi

echo -n "Clean working copy         : "
if [ `git status | grep -c 'working directory clean'` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit 1
fi

