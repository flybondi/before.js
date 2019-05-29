# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0-development.0](https://github.com/flybondi/before.js/compare/v3.3.0...v5.0.0-development.0) (2019-05-29)


### Bug Fixes

* move script tag to the bottom of the document ([#28](https://github.com/flybondi/before.js/issues/28)) ([80ecb19](https://github.com/flybondi/before.js/commit/80ecb19))


### Features

* **refactor:** move server and client logic to their own package ([#26](https://github.com/flybondi/before.js/issues/26)) ([0100dd4](https://github.com/flybondi/before.js/commit/0100dd4))


### BREAKING CHANGES

* **refactor:** Split before.js into server and client packages

* feat(refactor): move server and client logic to their own package.

* ci: add monorepo config

* feat(refactor): build client and server with its own target

* fix: remove polyfill from bundle

* test(fix): setup jest with custom babel config

* fix(babeljs): add core-js option in config

* chore(fix): node scripts

* chore(package): change package scope

* fix(bundle): change exclude/include regexp

* fix(script): change workspace package names

* docs: add client and server initial readme files

* fix: expose only the render method

* fix: bundle cjs package also

* fix: include polyfills :(

* fix: load chunks and then route component

* test: update load current route unit test

* chore: expose unsure ready method

* chore: set package module name

* ci: prepare build steps for open public module

* ci(fix): remove pre-release dependency

* ci(fix): require health-check step to approve a release

* ci(fix): run release-approval only for develop branch

* ci(lerna): remove independant mode

* chore: change name of global package script

* chore: add flybondi badge
