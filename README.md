TSLint-gitdiff
======

this is a fork of [TSLint](https://www.npmjs.com/package/tslint), it does everything tslint does with 
change in behavior that this first runs a git diff only lints the lines which git claims have changed.

The intended use case for this tool is when working on large projects introducing a new linting rule can be 
too much effort. This tool will allow a stricter standard to be applied to new code than to legacy code.

tslint-gitdiff accepts all config and commandline params that tslint does. Additionally it accepts an optional
commandline param `--branch <branch>`. Not specifying a branch will cause git diff to local working copy changes to HEAD. Specifying a branch param will pass this to the git diff as the tip to compare HEAD to. An alternative format `--branch <branch>...` will cause git diff to determine the merge base from <branch> and HEAD and show changes from the merge base to HEAD. This is git diff behavior more info can be found using `git diff --help`. tslint-gitdiff does not support the format `<base-branch>...<target-branch>` as linting on any target branch other than HEAD does not make sense as the lint must run in the current working directory.

Installation & Usage
------------

Please refer to the full usage documentation on the [TSLint website](https://palantir.github.io/tslint/). 

just relplace `tslint` with `tslint-gitdiff`

Installation
Local (in your project’s working directory):

npm install tslint-gitdiff typescript --save-dev
# or
yarn add tslint-gitdiff typescript --dev
Global:

npm install tslint-gitdiff typescript -g
# or
yarn global add tslint-gitdiff typescript