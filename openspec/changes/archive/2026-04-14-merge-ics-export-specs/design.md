# 设计：合并 ics-calendar-export 和 ipo-calendar-event-generation 规格

## Context

当前 `openspec/specs/` 目录下存在两个功能重叠的规格文档：

| 规格 | 行数 | 核心定义 |
|------|------|----------|
| `ipo-calendar-event-generation` | 55 | 事件生成逻辑 |
| `ics-calendar-export` | 115 | ICS 导出格式 |

两者定义了相同的 SUMMARY 格式、DESCRIPTION 占位符、stream 分离、固定时间窗口（09:30-10:00），且 `index.ts` 实现代码已经按照合并后的单一逻辑运行。

## Goals / Non-Goals

**Goals:**
- 消除规格文档的冗余，保持单一可信源
- 将 `ipo-calendar-event-generation` 中的有效需求合并至 `ics-calendar-export`
- 归档被淘汰的规格文档

**Non-Goals:**
- 不修改任何代码实现
- 不引入新的功能能力
- 不变更 ICS 导出格式或文件命名规范

## Decisions

### D1: 保留 ics-calendar-export 作为主规格

**选择**: 保留较完整的 `ics-calendar-export` 规格，吸收 `ipo-calendar-event-generation` 中的独立需求。

**理由**:
- `ics-calendar-export` (115 行) 比 `ipo-calendar-event-generation` (55 行) 更完整
- `ics-calendar-export` 包含 ICS 格式验证、ical-generator 使用等额外需求，这些是实际导出功能必需的
- 合并后的规格更容易维护和理解

### D2: 合并方式为内容更新，非代码变更

**选择**: 仅更新规格文档内容，不涉及代码变更。

**理由**:
- 实现代码（`index.ts`、`utils.ts`）已经按照合并后的逻辑运行
- 规格文档仅是正式化现有行为
- 无需回归测试或回归验证

## Risks / Trade-offs

| 风险 | 说明 | 缓解 |
|------|------|------|
| 遗漏需求 | 可能遗漏被合并规格中的边缘需求 | 已逐行对比两个规格，确认所有需求已包含在 ics-calendar-export 中 |

### 已确认的需求覆盖

比较两个规格的唯一差异在于 `ipo-calendar-event-generation` 中的：

- "每个记录生成一个事件" + 缺失发行日验证

该需求已被 `ics-calendar-export` 的核心逻辑隐式覆盖（`index.ts:processRecords` 函数会验证发行日存在）。

## Migration Plan

1. 更新 `openspec/specs/ics-calendar-export/spec.md`（如需纳入显式需求描述）
2. 将 `openspec/specs/ipo-calendar-event-generation/` 移动至 archive
3. 验证 OpenSpec 状态正常

**无代码变更，无需回滚计划。**