## Why

当前代码存在以下问题需要优化：

1. `StockRecord`、`BondRecord`、`REITsRecord` 三个类型字段完全相同，存在重复
2. 日期字段当前为 `string` 类型，应该改为 `Date` 类型以获得更强的类型检查，仅在输出时格式化为字符串
3. `CalendarEvent` 类型与输入记录字段几乎一致，可以简化处理流程
4. `ExportConfig` 的 `outputDir` 固定为根目录，`jsonIndent` 固定为 2，无需配置
5. 当前使用 Node.js `fs.writeFileSync`，应改用 Bun 原生 API (`Bun.file().write()`)

## What Changes

### 类型简化

- 合并 `StockRecord`、`BondRecord`、`REITsRecord` 为单一的 `IPORecord` 接口
- 日期字段（`issuanceDate`、`publicationDate`、`listingDate`）改为 `Date` 类型
- 移除 `CalendarEvent` 类型，事件创建时直接通过 `IPORecord` 处理
- 移除 `ExportConfig` 类型，导出配置直接内联

### 导出配置

- JSON 输出固定使用 2 空格缩进
- 导出文件固定放在项目根目录（`./zh_CN.{stocks,bonds,reits}.{ics,json}`）

### 文件写入

- 使用 Bun 原生 API `Bun.file(path).write(content)` 替代 `fs.writeFileSync`

## Capabilities

### Modified Capabilities

- `a-share-ipo-ingestion`: 输入模型简化为单一 `IPORecord` 接口
- `ipo-calendar-event-generation`: 事件创建时直接处理 `IPORecord`，无需中间 `CalendarEvent` 类型
- `ics-calendar-export`: 使用 Bun API 写入文件，内联固定配置

## Impact

- Affected code: `types.ts`、`index.ts`、`utils.ts`
- APIs: 入口函数签名可能略微调整（移除 config 参数）
- Dependencies: 移除 `fs` 依赖，改用 Bun API