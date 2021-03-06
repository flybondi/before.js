# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 4.1.13 (2020-12-13)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.12 (2020-09-17)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.11 (2020-05-30)


### Bug Fixes

* **client:** make sure the route match is added to the context ([#42](https://github.com/flybondi/before.js/issues/42)) ([7e713c8](https://github.com/flybondi/before.js/commit/7e713c8bc40af0ea3c1f52f77395ff17e48ec7a7))





## 4.1.10 (2020-05-29)


### Bug Fixes

* use react-router match route method ([#36](https://github.com/flybondi/before.js/issues/36)) ([0d51166](https://github.com/flybondi/before.js/commit/0d51166a2cd62f489676ccbb2ffb48420fbdd17a))





## 4.1.9 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.8 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.7 (2020-05-29)


### Reverts

* change release workflow npm login ([154229a](https://github.com/flybondi/before.js/commit/154229ad01d45885d32078dad4c60d7fc1d4be0b))





## 4.1.6 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.5 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.4 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## 4.1.3 (2020-05-29)

**Note:** Version bump only for package @flybondi/before.js





## [4.1.2](https://github.com/flybondi/before.js/compare/v4.1.1...v4.1.2) (2019-12-16)


### Bug Fixes

* support latest [@loadable](https://github.com/loadable) version ([#35](https://github.com/flybondi/before.js/issues/35)) ([3a77b99](https://github.com/flybondi/before.js/commit/3a77b99dc9c3a47e26da47fb66ea0e4f6f1017f4))





## [4.1.1](https://github.com/flybondi/before.js/compare/v4.1.0...v4.1.1) (2019-10-10)


### Bug Fixes

* change extra scripts order and add style tag ([#34](https://github.com/flybondi/before.js/issues/34)) ([3ccf975](https://github.com/flybondi/before.js/commit/3ccf975))





# [4.1.0](https://github.com/flybondi/before.js/compare/v4.0.2...v4.1.0) (2019-10-07)


### Bug Fixes

* add missing flow types ([#33](https://github.com/flybondi/before.js/issues/33)) ([bdaa459](https://github.com/flybondi/before.js/commit/bdaa459))


### Features

* add prop to disable the initial props cache ([#32](https://github.com/flybondi/before.js/issues/32)) ([f7ccc21](https://github.com/flybondi/before.js/commit/f7ccc21))





## [4.0.2](https://github.com/flybondi/before.js/compare/v4.0.1...v4.0.2) (2019-05-29)

**Note:** Version bump only for package @flybondi/before.js





## [4.0.1](https://github.com/flybondi/before.js/compare/v5.0.0-development.0...v4.0.1) (2019-05-29)


### Bug Fixes

* set packages version to 4.0.0 ([#30](https://github.com/flybondi/before.js/issues/30)) ([d4c7f96](https://github.com/flybondi/before.js/commit/d4c7f96))





# [5.0.0-development.0](https://github.com/flybondi/before.js/compare/v3.3.0...v5.0.0-development.0) (2019-05-29)


### Bug Fixes

* lerna release not working ([#29](https://github.com/flybondi/before.js/issues/29)) ([34ff1ee](https://github.com/flybondi/before.js/commit/34ff1ee))
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
