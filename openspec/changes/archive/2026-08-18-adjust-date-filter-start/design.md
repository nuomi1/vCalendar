## Context

改动动机见 proposal.md - Why。当前实现（`utils.ts:146-148`）为 `dayjs().subtract(1, "week").startOf("week")`，取上一周第一天（周日）作为东方财富 API 的 `SUBSCRIBE_START_DATE` 过滤起点。dayjs 未设置 locale，`startOf("week")` 默认周日为每周第一天，行为与注释一致。

## Goals / Non-Goals

**Goals:**

- 将过滤起始日期从「上一周第一天」改为「上二周的第一天（周日）」
- 保持 `buildIPOQuery` 的调用结构与 `pageSize: 50` 不变

**Non-Goals:**

- 不调整 `pageSize`（用户明确确认无需改动）
- 不引入 timezone 或 locale 显式配置（沿用 dayjs 默认周日为一周之首）
- 不改变三类 IPO（股票/债券/REITs）各自的 query 配置差异

## Decisions

**决策 1：偏移量从 1 周改为 2 周**

- 方案：`dayjs().subtract(2, "week").startOf("week").format("YYYY-MM-DD")`。
- 理由：`subtract(n, "week").startOf("week")` 与 `startOf("week").subtract(n, "week")` 在周日为一周之首时结果一致，两种对"上二周的第一天"的理解（按今天回推两周取周首 / 本周周首回推两周）等价，无歧义。
- 备选：`startOf("week").subtract(2, "week")` —— 语义相同，但改动最小原则下仅替换 `subtract` 的入参，diff 最小。

**决策 2：同步更新 JSDoc 注释与 OpenSpec spec**

- 方案：`utils.ts` 中 `getDateFilterStart` 的注释从「上一周的第一天」改为「上二周的第一天」，spec delta 同步 MODIFIED `a-share-ipo-ingestion` 的 Shared query builder function 块。
- 理由：注释与 spec 均显式记录当前行为，不更新会留下过期文档。
- 备选：不改注释 —— 会导致文档与行为漂移，不采纳。

## Risks / Trade-offs

- [查询窗口从 1 周扩到约 3 周，单次查询记录数可能增多，`pageSize: 50` 存在截断风险] → 用户明确 pageSize 无需改动；按预算职责记录，若后续出现漏数据再评估分页或排序调整。
- [spec 中 Implementation 为代码快照，与实现可能再次漂移] → 本变更已同步 delta；该风险为既有文档风格问题，不在本次范围内解决。

## Migration Plan

单一行为改动，无数据迁移。发布后首次运行即生效。

## Open Questions

无。
