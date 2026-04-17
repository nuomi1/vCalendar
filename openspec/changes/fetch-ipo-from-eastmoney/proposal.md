# fetch-ipo-from-eastmoney

## Summary

新增三个 API 数据获取函数，将东方财富 IPO 数据中心的三类数据（股票、可转债、REITs）抓取并转换为统一的 `IPORecord` 格式。

## Motivation

当前项目需要手动维护 IPO 数据，希望通过东方财富公开 API 自动获取最新申购信息。

## Requirements

### 数据源

| 类型 | API ReportName | 关键日期字段 |
|------|---------------|-------------|
| 股票 | `RPTA_APP_IPOAPPLY` | `APPLY_DATE` → issuanceDate, `BALLOT_NUM_DATE` → publicationDate |
| 可转债 | `RPT_BOND_CB_LIST` | `PUBLIC_START_DATE` → issuanceDate, issuancePrice 固定 100 |
| REITs | `RPT_CUSTOM_REITS_APPLY_LIST_MARKET` | `SUBSCRIBE_START_DATE` → issuanceDate, `RESULT_NOTICE_DATE` → publicationDate |

### 类型定义

新增三个接口类型，分别对应三个 API 的响应数据结构：

- `StockIPOData` - 股票 IPO 原始数据
- `BondIPOData` - 可转债原始数据
- `REITsIPOData` - REITs 原始数据

### 转换函数

新增三个转换函数，将原始数据转换为 `IPORecord`：

- `convertStockIPO(data: StockIPOData): IPORecord`
- `convertBondIPO(data: BondIPOData): IPORecord`
- `convertREITsIPO(data: REITsIPOData): IPORecord`

### 字段映射

**股票 IPO**：

- `SECURITY_CODE` → `code`
- `SECURITY_NAME` → `name`
- `APPLY_DATE` → `issuanceDate`
- `ISSUE_PRICE` → `issuancePrice`（可能为 null）
- `BALLOT_NUM_DATE` → `publicationDate`（可能为 null）
- `LISTING_DATE` → `listingDate`（可能为 null）

**可转债**：

- `SECURITY_CODE` → `code`
- `SECURITY_NAME_ABBR` → `name`
- `PUBLIC_START_DATE` → `issuanceDate`
- `issuancePrice` → 固定 `100`
- `publicationDate` → `null`（可转债无配号抽签环节）
- `LISTING_DATE` → `listingDate`

**REITs**：

- `SECURITY_CODE` → `code`
- `SECURITY_NAME` → `name`
- `SUBSCRIBE_START_DATE` → `issuanceDate`
- `SALE_PRICE` → `issuancePrice`
- `RESULT_NOTICE_DATE` → `publicationDate`
- `LISTING_DATE` → `listingDate`

## Non-Goals

- 不扩展 `IPORecord` 现有字段结构

## Status

Proposed