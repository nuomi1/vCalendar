## 1. 类型定义修改 (types.ts)

- [x] 1.1 合并 `StockRecord`、`BondRecord`、`REITsRecord` 为单一的 `IPORecord` 接口
- [x] 1.2 将 `issuanceDate`、`publicationDate`、`listingDate` 字段类型从 `string` 改为 `Date`
- [x] 1.3 移除 `CalendarEvent` 类型定义
- [x] 1.4 移除 `ExportConfig` 类型定义
- [x] 1.5 更新 `InputData` 使用统一的 `IPORecord` 类型

## 2. 工具函数修改 (utils.ts)

- [x] 2.1 添加日期格式化函数 `formatDate(date: Date): string`，输出格式为 `YYYY-MM-DD`，使用 day.js
- [x] 2.2 更新 `formatDescription` 函数，接受 `Date` 类型并格式化为字符串
- [x] 2.3 更新 `recordToEvent` 返回类型，直接处理记录而非通过中间类型
- [x] 2.4 更新类型导入，移除不再使用的类型

## 3. 主入口修改 (index.ts)

- [x] 3.1 移除 `fs` 导入，改为使用 Bun API
- [x] 3.2 更新 `generateCalendar` 函数签名，移除 `config` 参数
- [x] 3.3 使用 `Bun.file(filename).write(content)` 写入 ICS 和 JSON 文件
- [x] 3.4 更新示例数据，使用 `Date` 对象

## 4. 测试验证

- [x] 4.1 运行 `bun test` 确保现有测试通过
- [x] 4.2 验证输出文件格式与修改前一致
- [x] 4.3 验证日期格式为 `YYYY-MM-DD`