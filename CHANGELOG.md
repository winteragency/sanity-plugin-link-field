<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.3.0](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.2.2...v1.3.0) (2024-06-04)

### Features

- allow hrefResolver to return UrlObject instead of string ([cdc90d9](https://github.com/winteragency/sanity-plugin-link-field/commit/cdc90d98022f15f09eb6b65ead0040573d07d255))

## [1.2.2](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.2.1...v1.2.2) (2024-06-04)

### Bug Fixes

- regression from 1.2.1 when internal links cannot be resolved ([2e0b0eb](https://github.com/winteragency/sanity-plugin-link-field/commit/2e0b0eb39ab6d52465d0d77df153f72537346156))

## [1.2.1](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.2.0...v1.2.1) (2024-06-04)

### Bug Fixes

- avoid double leading slashes in default href resolver ([b9fa67a](https://github.com/winteragency/sanity-plugin-link-field/commit/b9fa67ac94c587eac141c0a5e784d8792e2b6040))
- correct dependencies in package.json to avoid 3rd party code in bundle (=smaller Studio bundle) ([b87f200](https://github.com/winteragency/sanity-plugin-link-field/commit/b87f200b7b4512b6431caac0f8f00518fcf0e42d))
- properly include URL parameters and anchors for internal links ([7707a13](https://github.com/winteragency/sanity-plugin-link-field/commit/7707a135290896ffe5d06c5a198c55051f4db24a))

## [1.2.0](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.1.3...v1.2.0) (2024-05-31)

### Features

- allow passing filter options to the reference field, and add the option to use weak references ([2d441a7](https://github.com/winteragency/sanity-plugin-link-field/commit/2d441a7f9fcb0fd053407f242d5ed2b58813629a))

## [1.1.3](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.1.2...v1.1.3) (2024-05-06)

### Bug Fixes

- set default type to "internal" if it's somehow missing ([#10](https://github.com/winteragency/sanity-plugin-link-field/issues/10)) ([4f9ec69](https://github.com/winteragency/sanity-plugin-link-field/commit/4f9ec698d309447e99586dc887824ae0e488e601))

## [1.1.2](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.1.1...v1.1.2) (2024-05-06)

### Bug Fixes

- don't crash when interacting with empty link field ([#9](https://github.com/winteragency/sanity-plugin-link-field/issues/9)) ([cca4a6f](https://github.com/winteragency/sanity-plugin-link-field/commit/cca4a6f534ed5dd67089e27bc70970da8424af25))

## [1.1.1](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.1.0...v1.1.1) (2024-04-22)

### Bug Fixes

- adjust types throughout and add missing ones ([09cadb4](https://github.com/winteragency/sanity-plugin-link-field/commit/09cadb4c31d19f4b8d7e97e47fe6f0be53b7d1d7))
- don't crash when there's no type selected ([#6](https://github.com/winteragency/sanity-plugin-link-field/issues/6)) ([7b15fe8](https://github.com/winteragency/sanity-plugin-link-field/commit/7b15fe805d9e6dbfc3351ffc8773ae50c2681989))

## [1.1.0](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.0.1...v1.1.0) (2024-04-19)

### Features

- add option to include a "text" field for the link ([#4](https://github.com/winteragency/sanity-plugin-link-field/issues/4)) ([568df92](https://github.com/winteragency/sanity-plugin-link-field/commit/568df927779cadc67f8ed58360da755ecf2bfd26))

### Bug Fixes

- make input field as wide as its parent ([#3](https://github.com/winteragency/sanity-plugin-link-field/issues/3)) ([ce90410](https://github.com/winteragency/sanity-plugin-link-field/commit/ce90410cafcd89229189bda6a1797dfc9b832a58))
- **types:** ensure `blank` property is not available on `PhoneLink` and `EmailLink` interfaces ([2eb09f6](https://github.com/winteragency/sanity-plugin-link-field/commit/2eb09f64c422cf45cbfa7acde080dc0788dab1a0))

## [1.0.1](https://github.com/winteragency/sanity-plugin-link-field/compare/v1.0.0...v1.0.1) (2024-04-17)

### Bug Fixes

- show loading spinner while fetching custom link type options ([f9d30f2](https://github.com/winteragency/sanity-plugin-link-field/commit/f9d30f26166dba90f62a5b305264ae1280eec67f))

## 1.0.0 (2024-04-17)

### Features

- initial version ([d6b855d](https://github.com/winteragency/sanity-plugin-link-field/commit/d6b855dca442e0cb142d145fc436c281b2c9abdc))
