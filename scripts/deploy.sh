#!/bin/sh


PHASE=$1
if [ "$PHASE" = "production" ]; then
	VERSION=$2
	BRANCH_PATTERN="^master$"
elif [ "$PHASE" = "staging" ]; then
	VERSION="staging"
	BRANCH_PATTERN="^.*$"
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

echo -n "Expected current branch    : "
if [ `git branch | sed -n -e 's/^\* \(.*\)/\1/p' | grep -c $BRANCH_PATTERN $CURRENT_BRANCH` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi


