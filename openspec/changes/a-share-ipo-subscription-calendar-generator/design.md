## Context

当前变更聚焦于简化代码结构，主要针对以下方面：

1. 类型定义冗余：三个重复的记录类型
2. 日期类型处理：需要从字符串改为 Date，仅在输出时格式化
3. 中间类型简化：移除不必要的 CalendarEvent
4. 配置简化：移除 ExportConfig，固定输出格式
5. 文件写入：使用 Bun 原生 API

## Goals / Non-Goals

**Goals:**

- 合并 `StockRecord`、`BondRecord`、`REITsRecord` 为单一的 `IPORecord` 接口
- 日期字段（`issuanceDate`、`publicationDate`、`listingDate`）改为 `Date` 类型
- 输出 ICS/JSON 时使用 `YYYY-MM-DD` 格式化为字符串
- 移除 `CalendarEvent` 中间类型，事件创建时直接通过 `IPORecord` 处理
- 移除 `ExportConfig` 配置类型，内联固定配置（JSON 2 空格，根目录输出）
- 使用 `Bun.file().write()` API 写入文件

**Non-Goals:**

- 不修改核心业务逻辑（市场推断、类型推断、事件生成规则）
- 不修改 SUMMARY/DESCRIPTION 格式
- 不修改文件命名规范

## Decisions

1. 统一记录类型
   ```
   interface IPORecord {
     name: string;
     code: string;
     issuanceDate: Date;
     issuancePrice?: number;
     publicationDate?: Date;
     listingDate?: Date;
   }
   ```

   Rationale: 三个类型的字段完全相同，合并可以减少代码冗余。

2. 日期类型为 Date，输出时格式化
   - 内部存储使用 `Date` 类型，获得更强的类型检查
   - 输出 ICS/JSON 时使用 `YYYY-MM-DD` 格式化为字符串

   Rationale: Date 类型可以避免输入格式不一致的问题，输出时统一格式化。

3. 移除 CalendarEvent 中间类型
   - 事件创建时直接通过 IPORecord 生成 ICS/JSON
   - 不再需要 CalendarEvent 作为中间转换层

   Rationale: CalendarEvent 与 IPORecord 字段几乎一致，可以简化处理流程。

4. 移除 ExportConfig，内联固定配置
   - JSON 固定输出 2 空格缩进
   - 文件固定输出到根目录

   Rationale: 当前需求固定，无需配置灵活性。

5. 使用 Bun API 写入文件
   ```typescript
   Bun.write(Bun.file(filename), content)
   // 或
   Bun.file(filename).write(content)
   ```

   Rationale: Bun 原生 API 性能更好，且项目已使用 Bun。

## Code Organization

```
根目录/
├── index.ts         # 主要流程：入口、编排、导出（使用 Bun API）
├── types.ts        # 模型定义：单一 IPORecord 接口
└── utils.ts       # 工具函数：代码推断、格式化、日期处理
```

## Migration Plan

1. 修改 types.ts：合并记录类型，日期改为 Date
2. 修改 utils.ts：添加日期格式化函数，更新 recordToEvent
3. 修改 index.ts：使用 Bun API 写入，移除 config 参数
4. 验证导出结果与修改前一致