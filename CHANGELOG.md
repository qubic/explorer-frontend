# Changelog

## v1.5.1 - v1.5.1 2024-09-24T22:19:14Z

## What's Changed
- Implemented archiver v2 api
- Migrated archiver trasnactions v1 endpoints to v2
- Implemented timestamp display on transaction items
- Updated dev proxies implementation
- Updated formatDate function to handle splitting dates
- Updated AddressPage to get latest transactions from archiver v2 api
- Optimised InfiniteScroll component


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.5.0...v1.5.1

---

## v1.5.0 - v1.5.0 2024-09-24T22:26:45Z

## What's Changed

- Removed all Fuse template code.
- Replaced MUI and Styled Components with Tailwind CSS for styling.
- Migrated the project to React using Vite and TypeScript.
- Enhanced localization functionality.
- Upgraded the search implementation and user interface.
- Improved development proxies by removing unnecessary libraries like Express and creating a proxy server with Vite.
- Improved and fixed layout of rich list page

**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.4.3...v1.5.0

---

## v1.4.3 - v1.4.3 2024-09-24T22:35:04Z

## What's Changed
* Implemented the burnedQus feature on the overview page.
* Integrated the rich list page, including full implementation.


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.4.2...v1.4.3

---

## v1.4.2 - v1.4.2 2024-09-24T22:46:09Z

## What's Changed
* Fixed transactions state cached issue


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.4.1...v1.4.2

---

## v1.4.1 - v1.4.1 2024-09-24T22:48:25Z

## What's Changed
* Switched archiver in tick page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/92
* Fix tx and tick page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/94
* Update tx item for SC many transactions by @konan-5 in https://github.com/qubic/explorer-frontend/pull/96
* Fix tx item and add archiver in address page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/99
* Update tx item for new design by @konan-5 in https://github.com/qubic/explorer-frontend/pull/100
* Update search function and fix responsive in tick page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/101
* feat: Add transactions and historic txs implementation by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/108
* refactor: Update TickPage component by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/109
* feat: Add UI improvements on AddresPage and transaction pill by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/111
* feat: Update explorer logo and add new icons on Overview page by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/114
* feat: Update ARCHIVER url and fix search modal not closing after click by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/117
* feat: Update app loader animation by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/119
* feat: Implement footer for all pages by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/120
* fix: Update footer layout implementation by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/121
* fix: Implement handling for non executed txs by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/123
* feat: Enhance Historical Transactions Handling and Fix Sorting Issues by @alexmf91 in https://github.com/qubic/explorer-frontend/pull/125


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.4.0...v1.4.1

---

## v1.3.0 - v1.3.0 2024-09-24T22:52:47Z

## What's Changed
* add: Add arabic language feature by @konan-5 in https://github.com/qubic/explorer-frontend/pull/75
* Solved below 73, 74, 76 issues by @konan-5 in https://github.com/qubic/explorer-frontend/pull/77
* Fixed automatic setting of the language by @konan-5 in https://github.com/qubic/explorer-frontend/pull/88
* Update executed in txstatus by @konan-5 in https://github.com/qubic/explorer-frontend/pull/89
* Fix executed status in tx page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/90
* Update tx item for SC many transactions by @konan-5 in https://github.com/qubic/explorer-frontend/pull/96


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.2.0...v1.3.0

---

## v1.4.0 - v1.4.0 2024-09-24T22:49:21Z

## What's Changed
* Solved 3 issues by @konan-5 in https://github.com/qubic/explorer-frontend/pull/82
* Add archiver enpoint and copy icon at the end of addresses by @konan-5 in https://github.com/qubic/explorer-frontend/pull/84
* Fixed search function and press enter event by @konan-5 in https://github.com/qubic/explorer-frontend/pull/85


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.3.0...v1.4.0

---

## v1.2.0 - v1.2.0 2024-09-24T22:51:42Z

## What's Changed
* Renamed url block-> tick by @konan-5 in https://github.com/qubic/explorer-frontend/pull/66
* Add infinite scroll in tick and address page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/67
* Update search by ID by @konan-5 in https://github.com/qubic/explorer-frontend/pull/68
* Add no transaction status in tick and address page and  fixed type of tx view. by @konan-5 in https://github.com/qubic/explorer-frontend/pull/69
* Add entries in tx by @konan-5 in https://github.com/qubic/explorer-frontend/pull/71


**Full Changelog**: https://github.com/qubic/explorer-frontend/compare/v1.1.0...v1.2.0

---

## v1.1.0 - v1.1.0 2024-09-24T22:57:49Z

## What's Changed
* Add fuse template environment by @konan-5 in https://github.com/qubic/explorer-frontend/pull/1
* Fix running errro and dev proxy by @konan-5 in https://github.com/qubic/explorer-frontend/pull/2
* Fix running error by @konan-5 in https://github.com/qubic/explorer-frontend/pull/3
* Add beta explorer page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/8
* Add beta block explorer page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/9
* Add address and transaction page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/10
* Fixed mobile responsive by @konan-5 in https://github.com/qubic/explorer-frontend/pull/11
* Add loading status in all network pages by @konan-5 in https://github.com/qubic/explorer-frontend/pull/14
* Add husky and update eslint by @konan-5 in https://github.com/qubic/explorer-frontend/pull/22
* Add pagination in past tick by @konan-5 in https://github.com/qubic/explorer-frontend/pull/24
* Update search function by @konan-5 in https://github.com/qubic/explorer-frontend/pull/25
* Add .env sample and update readme by @konan-5 in https://github.com/qubic/explorer-frontend/pull/26
* Add range in ticks of overview page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/27
* Update max width of overview page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/28
* Add breadcrumbs and update small design. by @konan-5 in https://github.com/qubic/explorer-frontend/pull/32
* Fix overview page by @konan-5 in https://github.com/qubic/explorer-frontend/pull/35
* Update 404 page and Add environment for multi language by @konan-5 in https://github.com/qubic/explorer-frontend/pull/39
* Update multilanguage feature and fix some page. by @konan-5 in https://github.com/qubic/explorer-frontend/pull/41
* Update block name and unit by @konan-5 in https://github.com/qubic/explorer-frontend/pull/45
* Add footer and update format the value of amount by @konan-5 in https://github.com/qubic/explorer-frontend/pull/49
* Update footer by @konan-5 in https://github.com/qubic/explorer-frontend/pull/51
* Add search function and turkish language by @konan-5 in https://github.com/qubic/explorer-frontend/pull/54
* Add animate and fix responsive in global search by @konan-5 in https://github.com/qubic/explorer-frontend/pull/55
* Implement autofocus in global search by @konan-5 in https://github.com/qubic/explorer-frontend/pull/58


**Full Changelog**: https://github.com/qubic/explorer-frontend/commits/v1.1.0

---

