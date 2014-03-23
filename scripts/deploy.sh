#!/bin/sh


PHASE=$1
if [ "$PHASE" = "production" ]; then
	VERSION=$2
elif [ "$PHASE" = "staging" ]; then
	VERSION="staging"
fi

if [ "$VERSION" = "" ]; then
	echo "Error! Missing or wrong arguments."
	echo "Usage : $0 staging|production <version>"
	exit
fi



echo "--- Pre-conditions"

echo -n "Current folder is root     : "
if [ -e firebase.json ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi

echo -n "Clean working copy         : "
if [ `git status | grep -c 'working directory clean'` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi

