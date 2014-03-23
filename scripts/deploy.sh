#!/bin/sh


PHASE=$1
if [ "$PHASE" = "production" ]; then
	VERSION=$2
	BRANCH_PATTERN="^master$"
	TAG=stable/$VERSION
	OVERRIDE_TAG=false
	HTML_VERSION="version $VERSION"
	HTML_STYLE=""
	HOST="pockey"
elif [ "$PHASE" = "staging" ]; then
	VERSION="staging"
	BRANCH_PATTERN="^.*$"
	TAG=$VERSION
	OVERRIDE_TAG=true
	HTML_VERSION="Environnement de recette"
	HTML_STYLE="staging"
	HOST="pockey-dev"
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
if [ $OVERRIDE_TAG ] || [ `git tag --list | grep -c "^$TAG$"` -eq 1 ]; then
	echo "OK"
else
	echo "Error!"
	exit
fi



echo "--- Tag version"
git tag  --force $TAG
git push --force origin $TAG



echo "--- Inject version in application"
sed -i "s/@@VERSION@@/$HTML_VERSION/g" app/index.html
sed -i "s/@@STYLE@@/$HTML_STYLE/g" app/index.html



echo "--- Deploy on host"
sed -i "s/@@HOST@@/$HOST/g" firebase.json
sed -i "s/pockey-dev.firebaseio.com/$HOST.firebaseio.com/g" app/js/app.js
firebase deploy



echo "--- Clean modifications"
git reset --hard

