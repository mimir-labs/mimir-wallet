# Changelog

## [3.1.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v3.0.0...polkadot-core-v3.1.0) (2025-12-11)


### Features

* add NetworkErrorAlert component for chain connection errors ([#362](https://github.com/mimir-labs/mimir-wallet/issues/362)) ([ffd15f2](https://github.com/mimir-labs/mimir-wallet/commit/ffd15f25769463a973af48b24d7ac54a8c3ff888))
* **input-token-amount:** add new token selector component with context-based data fetching ([#364](https://github.com/mimir-labs/mimir-wallet/issues/364)) ([180ee9c](https://github.com/mimir-labs/mimir-wallet/commit/180ee9c4ea0da216f7902053188df6322c6b13e8))
* migrate all ui component from heroui and optimize build output ([#357](https://github.com/mimir-labs/mimir-wallet/issues/357)) ([1f13ad0](https://github.com/mimir-labs/mimir-wallet/commit/1f13ad0ad698dccfaae57f0d097e42c501a6d480))
* **params:** add call-based component overrides for balance display ([#359](https://github.com/mimir-labs/mimir-wallet/issues/359)) ([6a7a511](https://github.com/mimir-labs/mimir-wallet/commit/6a7a5116988179fba475e7e9586c96721c06a9a3))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 3.1.0

## [3.0.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.39.0...polkadot-core-v3.0.0) (2025-12-03)


### ⚠ BREAKING CHANGES

* **polkadot-core:** API access pattern changed from useApi() hook to ApiManager.getInstance().getApi(network) async method

### Code Refactoring

* **polkadot-core:** migrate to ApiManager singleton architecture ([#354](https://github.com/mimir-labs/mimir-wallet/issues/354)) ([51650e8](https://github.com/mimir-labs/mimir-wallet/commit/51650e839ae102ee57a175b6abdf5def6b465281))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 3.0.0

## [2.39.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.38.1...polkadot-core-v2.39.0) (2025-11-30)


### Features

* Add acurast mainnet supported ([#353](https://github.com/mimir-labs/mimir-wallet/issues/353)) ([6727cd0](https://github.com/mimir-labs/mimir-wallet/commit/6727cd048b1050e1d31dfece35d8e8d0f6ca0da4))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.39.0

## [2.38.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.38.0...polkadot-core-v2.38.1) (2025-11-27)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.38.1

## [2.38.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.37.2...polkadot-core-v2.38.0) (2025-11-24)


### Features

* **ui:** add Combobox component and use it in network setting ([#348](https://github.com/mimir-labs/mimir-wallet/issues/348)) ([14cc440](https://github.com/mimir-labs/mimir-wallet/commit/14cc440c88037d3f126067290f92f4a76b4b3fcd))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.38.0

## [2.37.2](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.37.1...polkadot-core-v2.37.2) (2025-11-21)


### Bug Fixes

* fix some ui issues ([#346](https://github.com/mimir-labs/mimir-wallet/issues/346)) ([dff358e](https://github.com/mimir-labs/mimir-wallet/commit/dff358e98c711b6b424e7a361f1cd202fc7f6fc6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.37.2

## [2.37.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.37.0...polkadot-core-v2.37.1) (2025-11-19)


### Bug Fixes

* Fixed the issue where the wallet connection pop-up would not appear in welcome page. ([#344](https://github.com/mimir-labs/mimir-wallet/issues/344)) ([ac575c9](https://github.com/mimir-labs/mimir-wallet/commit/ac575c97862927dead3d207e9d3a8ff08e5a31fb))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.37.1

## [2.37.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.36.0...polkadot-core-v2.37.0) (2025-11-14)


### Features

* Add submit transaction support for eoa account ([#342](https://github.com/mimir-labs/mimir-wallet/issues/342)) ([ac7738c](https://github.com/mimir-labs/mimir-wallet/commit/ac7738c32dbff36e179869bc3748fa41197f7b93))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.37.0

## [2.36.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.35.0...polkadot-core-v2.36.0) (2025-11-10)


### Features

* upgrade react to 19 ([#340](https://github.com/mimir-labs/mimir-wallet/issues/340)) ([91d6d6f](https://github.com/mimir-labs/mimir-wallet/commit/91d6d6f588472fddc835070dca8114e6fb09bd83))


### Bug Fixes

* fix some bugs ([#341](https://github.com/mimir-labs/mimir-wallet/issues/341)) ([dd1770d](https://github.com/mimir-labs/mimir-wallet/commit/dd1770d8a88f53a15a9a663fbafb6c02deb05831))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.36.0

## [2.35.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.34.0...polkadot-core-v2.35.0) (2025-11-05)


### Features

* update pjs version to 16.4.9 ([#336](https://github.com/mimir-labs/mimir-wallet/issues/336)) ([c0f4274](https://github.com/mimir-labs/mimir-wallet/commit/c0f42746b91fce24ad1a00675fab1aec4102f6af))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.35.0

## [2.34.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.33.0...polkadot-core-v2.34.0) (2025-11-04)


### Features

* update some feature for assethub migration ([#334](https://github.com/mimir-labs/mimir-wallet/issues/334)) ([f02f185](https://github.com/mimir-labs/mimir-wallet/commit/f02f18567620ee1e56739409a489cc808b7b6914))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.34.0

## [2.33.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.32.1...polkadot-core-v2.33.0) (2025-10-28)


### Features

* add '⌘K' on macOS, 'Ctrl+K' on Windows/Linux for ai window ([#332](https://github.com/mimir-labs/mimir-wallet/issues/332)) ([41a35d0](https://github.com/mimir-labs/mimir-wallet/commit/41a35d006f4983a4030ae247ca7a8c628b0c1178))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.33.0

## [2.32.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.32.0...polkadot-core-v2.32.1) (2025-10-27)


### Bug Fixes

* fix ai assistant bugs ([#330](https://github.com/mimir-labs/mimir-wallet/issues/330)) ([6db8afe](https://github.com/mimir-labs/mimir-wallet/commit/6db8afe26ed44459928e9284a722ce4c68529043))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.32.1

## [2.32.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.31.0...polkadot-core-v2.32.0) (2025-10-14)


### Features

* Add Acurast Canary network support ([#323](https://github.com/mimir-labs/mimir-wallet/issues/323)) ([06fa926](https://github.com/mimir-labs/mimir-wallet/commit/06fa926df5c6b55ab36fa35fb5ecf6d392deceff))
* Add moonbeam and tanssi network support ([#327](https://github.com/mimir-labs/mimir-wallet/issues/327)) ([1d85e2a](https://github.com/mimir-labs/mimir-wallet/commit/1d85e2a98ae59bcaf5eb4dd4b40fd0ab0dfdd066))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.32.0

## [2.31.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.30.0...polkadot-core-v2.31.0) (2025-10-08)


### Features

* add relay chain auto-dependency for all parachains ([#321](https://github.com/mimir-labs/mimir-wallet/issues/321)) ([094ba22](https://github.com/mimir-labs/mimir-wallet/commit/094ba2253f04f7d4d7fa72155a8cb52c27f001c0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.31.0

## [2.30.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.29.0...polkadot-core-v2.30.0) (2025-09-30)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.30.0

## [2.29.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.28.0...polkadot-core-v2.29.0) (2025-09-26)


### Features

* Add zkverify mainnet support ([#312](https://github.com/mimir-labs/mimir-wallet/issues/312)) ([39d5d37](https://github.com/mimir-labs/mimir-wallet/commit/39d5d373775fb66ee73f50a41c8aefb639f7e955))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.29.0

## [2.28.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.27.0...polkadot-core-v2.28.0) (2025-09-21)


### Features

* Add ErrorBoundary for submit transaction ([#309](https://github.com/mimir-labs/mimir-wallet/issues/309)) ([4bf4fcd](https://github.com/mimir-labs/mimir-wallet/commit/4bf4fcd42120d0d2b1d51b253839cbd6aa5f137a))
* Optimize balance retrieval logic ([#311](https://github.com/mimir-labs/mimir-wallet/issues/311)) ([a5e767d](https://github.com/mimir-labs/mimir-wallet/commit/a5e767d4db9bdf7d29d3545272137e4e3feab57d))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.28.0

## [2.27.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.26.0...polkadot-core-v2.27.0) (2025-09-08)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.27.0

## [2.26.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.25.1...polkadot-core-v2.26.0) (2025-09-08)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.26.0

## [2.25.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.25.0...polkadot-core-v2.25.1) (2025-09-03)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.25.1

## [2.25.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.24.1...polkadot-core-v2.25.0) (2025-09-03)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.25.0

## [2.24.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.24.0...polkadot-core-v2.24.1) (2025-08-27)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.24.1

## [2.24.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.23.1...polkadot-core-v2.24.0) (2025-08-27)


### Features

* Add cross-chain calldata display component ([#291](https://github.com/mimir-labs/mimir-wallet/issues/291)) ([5610b9d](https://github.com/mimir-labs/mimir-wallet/commit/5610b9de902d564f0af34e960d5cec225ae347f2))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.24.0

## [2.23.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.23.0...polkadot-core-v2.23.1) (2025-08-25)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.23.1

## [2.23.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.22.1...polkadot-core-v2.23.0) (2025-08-25)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.23.0

## [2.22.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.22.0...polkadot-core-v2.22.1) (2025-08-18)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.22.1

## [2.22.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.21.1...polkadot-core-v2.22.0) (2025-08-18)


### Features

* Add cross-chain simulation support with XCM integration ([#285](https://github.com/mimir-labs/mimir-wallet/issues/285)) ([12f837d](https://github.com/mimir-labs/mimir-wallet/commit/12f837deb5b3eea26a59721916fc6fe769622348))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.22.0

## [2.21.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.21.0...polkadot-core-v2.21.1) (2025-08-18)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.21.1

## [2.21.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.20.0...polkadot-core-v2.21.0) (2025-08-13)


### Features

* Add notification center feature ([#282](https://github.com/mimir-labs/mimir-wallet/issues/282)) ([dbeb85c](https://github.com/mimir-labs/mimir-wallet/commit/dbeb85c86712264d3ff6d24f259d1adf893a8663))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.21.0

## [2.20.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.19.0...polkadot-core-v2.20.0) (2025-08-07)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.20.0

## [2.19.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.18.0...polkadot-core-v2.19.0) (2025-08-05)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.19.0

## [2.18.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.17.0...polkadot-core-v2.18.0) (2025-08-04)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.18.0

## [2.17.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.16.0...polkadot-core-v2.17.0) (2025-07-29)


### Features

* **ui:** refactor add proxy UX with responsive design and step wizard ([#268](https://github.com/mimir-labs/mimir-wallet/issues/268)) ([af683b2](https://github.com/mimir-labs/mimir-wallet/commit/af683b276cd9f4559a5b711615800bbc81312084))
* **ui:** refactor create multisig UX with responsive design and step wizard ([#267](https://github.com/mimir-labs/mimir-wallet/issues/267)) ([e66378f](https://github.com/mimir-labs/mimir-wallet/commit/e66378fd1fc800075c0aa33caae5e4992bb83b79))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.17.0

## [2.16.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.15.0...polkadot-core-v2.16.0) (2025-07-22)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.16.0

## [2.15.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.14.0...polkadot-core-v2.15.0) (2025-07-22)


### Features

* **ui:** enhance transaction components and improve user experience ([#261](https://github.com/mimir-labs/mimir-wallet/issues/261)) ([efd6aea](https://github.com/mimir-labs/mimir-wallet/commit/efd6aea05d7bf46853ec058dde786a4cab08cdb1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.15.0

## [2.14.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.13.1...polkadot-core-v2.14.0) (2025-07-21)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.14.0

## [2.13.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.13.0...polkadot-core-v2.13.1) (2025-07-16)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.13.1

## [2.13.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.12.0...polkadot-core-v2.13.0) (2025-07-10)


### Features

* Fee payment with any sufficient asset on AssetHub ([#254](https://github.com/mimir-labs/mimir-wallet/issues/254)) ([711c138](https://github.com/mimir-labs/mimir-wallet/commit/711c13818f1de8abad8966bb0d3de26ed3743568))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.13.0

## [2.12.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.11.0...polkadot-core-v2.12.0) (2025-07-08)


### Features

* Add zkVerify testnet supported ([#251](https://github.com/mimir-labs/mimir-wallet/issues/251)) ([bc59e4b](https://github.com/mimir-labs/mimir-wallet/commit/bc59e4b7e94a742bd3773afe7bc47eae70c72aa6))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.12.0

## [2.11.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.10.0...polkadot-core-v2.11.0) (2025-06-21)


### Features

* Upgrade polkadotjs to 16.2.2 to support ExtrinsicV5 ([#247](https://github.com/mimir-labs/mimir-wallet/issues/247)) ([420894f](https://github.com/mimir-labs/mimir-wallet/commit/420894fba030f10db557e92f98db99a732e657ba))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.11.0

## [2.10.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.9.0...polkadot-core-v2.10.0) (2025-06-17)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.10.0

## [2.9.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.8.1...polkadot-core-v2.9.0) (2025-06-12)


### Features

* Add remote proxy support ([#236](https://github.com/mimir-labs/mimir-wallet/issues/236)) ([91d4170](https://github.com/mimir-labs/mimir-wallet/commit/91d41705e25efd2b6e66553b03af59b833809a47))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.9.0

## [2.8.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.8.0...polkadot-core-v2.8.1) (2025-06-09)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.8.1

## [2.8.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.7.0...polkadot-core-v2.8.0) (2025-06-06)


### Features

* Add PAssetHub network support ([#239](https://github.com/mimir-labs/mimir-wallet/issues/239)) ([c5488e1](https://github.com/mimir-labs/mimir-wallet/commit/c5488e14eeaa26db378358bed763f42b417164be))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.8.0

## [2.7.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.6.0...polkadot-core-v2.7.0) (2025-06-06)


### Features

* Add xcavate network support ([#237](https://github.com/mimir-labs/mimir-wallet/issues/237)) ([e14871f](https://github.com/mimir-labs/mimir-wallet/commit/e14871f5fe789eec4871e40a5a57bec82aa94286))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.7.0

## [2.6.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.5.0...polkadot-core-v2.6.0) (2025-06-03)


### Features

* Support eth address transfer on westend ([#234](https://github.com/mimir-labs/mimir-wallet/issues/234)) ([8333b36](https://github.com/mimir-labs/mimir-wallet/commit/8333b36dab3cc254213ff5fd78a023f64ff0adf1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.6.0

## [2.5.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.4.0...polkadot-core-v2.5.0) (2025-05-29)


### Features

* remove assethub next westend network ([#232](https://github.com/mimir-labs/mimir-wallet/issues/232)) ([b297f96](https://github.com/mimir-labs/mimir-wallet/commit/b297f9631e551a51404e800f85f1ad3b49c7742a))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.5.0

## [2.4.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.3.2...polkadot-core-v2.4.0) (2025-05-29)


### Features

* Add astar network support ([#230](https://github.com/mimir-labs/mimir-wallet/issues/230)) ([74577f5](https://github.com/mimir-labs/mimir-wallet/commit/74577f560a1b97dae19f3166c0857bd674e45a2b))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.4.0

## [2.3.2](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.3.1...polkadot-core-v2.3.2) (2025-05-28)


### Bug Fixes

* optimize balance fetching performance ([#228](https://github.com/mimir-labs/mimir-wallet/issues/228)) ([b9d51f4](https://github.com/mimir-labs/mimir-wallet/commit/b9d51f479058ca5c9636439c9670da25f14de0f1))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.3.2

## [2.3.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.3.0...polkadot-core-v2.3.1) (2025-05-28)


### Bug Fixes

* optimize user experience and fix some bugs ([#226](https://github.com/mimir-labs/mimir-wallet/issues/226)) ([558a245](https://github.com/mimir-labs/mimir-wallet/commit/558a24518d18bc28a263c419222d805db03ba04f))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.3.1

## [2.3.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.2.2...polkadot-core-v2.3.0) (2025-05-27)


### Features

* support eth address trasfer on westend assethub ([#224](https://github.com/mimir-labs/mimir-wallet/issues/224)) ([a223545](https://github.com/mimir-labs/mimir-wallet/commit/a22354576955048c0cbeb437e5adbcfe07c8d61c))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.3.0

## [2.2.2](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.2.1...polkadot-core-v2.2.2) (2025-05-26)


### Bug Fixes

* improve user experience and fix bugs ([#222](https://github.com/mimir-labs/mimir-wallet/issues/222)) ([19457c5](https://github.com/mimir-labs/mimir-wallet/commit/19457c52d78dfbcf00c3ea9172b1e18492fbf885))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.2.2

## [2.2.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.2.0...polkadot-core-v2.2.1) (2025-05-22)


### Bug Fixes

* Fix some issues while connect wallet ([#220](https://github.com/mimir-labs/mimir-wallet/issues/220)) ([75f69b2](https://github.com/mimir-labs/mimir-wallet/commit/75f69b257896b0fccf014c90ba87620c172706c8))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.2.1

## [2.2.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.1.0...polkadot-core-v2.2.0) (2025-05-22)


### Features

* Improve UI display and user experience ([#218](https://github.com/mimir-labs/mimir-wallet/issues/218)) ([13de26d](https://github.com/mimir-labs/mimir-wallet/commit/13de26d1abeac6ffe94fccfc297a16a35d8262c4))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.2.0

## [2.1.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.0.1...polkadot-core-v2.1.0) (2025-05-09)


### Features

* add transaction subscription functionality ([#213](https://github.com/mimir-labs/mimir-wallet/issues/213)) ([f9f3cf4](https://github.com/mimir-labs/mimir-wallet/commit/f9f3cf4d40fb4259b89d6364536b6ed24df6b7f0))
* Add walletconnect in dapp page ([#217](https://github.com/mimir-labs/mimir-wallet/issues/217)) ([0c01e06](https://github.com/mimir-labs/mimir-wallet/commit/0c01e063b0613c3a5ae99100638039909d76e1ef))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.1.0

## [2.0.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v2.0.0...polkadot-core-v2.0.1) (2025-05-07)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.0.1

## [2.0.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.31.0...polkadot-core-v2.0.0) (2025-05-06)


### Features

* Add dry run API support for transaction simulation ([#207](https://github.com/mimir-labs/mimir-wallet/issues/207)) ([3a649ca](https://github.com/mimir-labs/mimir-wallet/commit/3a649ca17a642753c4002e24d1844ec4f2662059))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 2.0.0

## [1.31.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.30.0...polkadot-core-v1.31.0) (2025-04-24)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.31.0

## [1.30.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.29.0...polkadot-core-v1.30.0) (2025-04-22)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.30.0

## [1.29.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.28.2...polkadot-core-v1.29.0) (2025-04-17)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.29.0

## [1.28.2](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.28.1...polkadot-core-v1.28.2) (2025-04-08)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.28.2

## [1.28.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.28.0...polkadot-core-v1.28.1) (2025-03-31)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.28.1

## [1.28.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.27.1...polkadot-core-v1.28.0) (2025-03-26)


### Features

* optimize rpc connection and improve network stability ([#193](https://github.com/mimir-labs/mimir-wallet/issues/193)) ([4c59ddc](https://github.com/mimir-labs/mimir-wallet/commit/4c59ddcc86574df1fa271f5fa28e7e1b4f11aec0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.28.0

## [1.27.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.27.0...polkadot-core-v1.27.1) (2025-03-26)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.27.1

## [1.27.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.26.3...polkadot-core-v1.27.0) (2025-03-25)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.27.0

## [1.26.3](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.26.2...polkadot-core-v1.26.3) (2025-03-25)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.26.3

## [1.26.2](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.26.1...polkadot-core-v1.26.2) (2025-03-25)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.26.2

## [1.26.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.26.0...polkadot-core-v1.26.1) (2025-03-24)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.26.1

## [1.26.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.25.1...polkadot-core-v1.26.0) (2025-03-21)


### Miscellaneous Chores

* **polkadot-core:** Synchronize main group versions


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.26.0

## [1.25.1](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.25.0...polkadot-core-v1.25.1) (2025-03-19)


### Bug Fixes

* fix nexu hash calculation in polkadot-core tx module ([#178](https://github.com/mimir-labs/mimir-wallet/issues/178)) ([5521900](https://github.com/mimir-labs/mimir-wallet/commit/5521900be510e28c942bb72b4e9624f40be1b066))

## [1.25.0](https://github.com/mimir-labs/mimir-wallet/compare/polkadot-core-v1.24.0...polkadot-core-v1.25.0) (2025-03-18)


### Features

* subscribe wallet accounts changed ([#176](https://github.com/mimir-labs/mimir-wallet/issues/176)) ([c26d322](https://github.com/mimir-labs/mimir-wallet/commit/c26d322512137966b04dc488820bebae03083f96))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @mimir-wallet/service bumped to 1.25.0
