#!/bin/sh


PHASE=$1
if [ "$PHASE" = "production" ]; then
	VERSION=stable/$2
	BRANCH_PATTERN="^master$"
	OVERRIDE_TAG=false
elif [ "$PHASE" = "staging" ]; then
	VERSION="staging"
	BRANCH_PATTERN="^.*$"
	OVERRIDE_TAG=true
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
if [ `git branch | sed -n -e 's/^\* \(.*\)/\1/p' | grep -c $BRANCH_PATTERN` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi

echo -n "New version                : "
if [ $OVERRIDE_TAG ] || [ `git tag --list | grep -c "^$VERSION$"` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi



echo "--- Tag version"
git tag  --force $VERSION
git push --force origin $VERSION


