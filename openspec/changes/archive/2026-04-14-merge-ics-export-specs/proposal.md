# 提案：合并 ics-calendar-export 和 ipo-calendar-event-generation 规格

## Why

当前 `openspec/specs/` 目录下存在两个功能高度重叠的规格文档：

- `ipo-calendar-event-generation` (55 行)
- `ics-calendar-export` (115 行)

两者都定义了几乎相同的日历事件生成规则（SUMMARY 格式、DESCRIPTION 占位符、 stream 分离、固定时间），且实现代码（`index.ts`）已经按照合并后的逻辑运行。这种重复导致维护负担和不一致风险。

合并这两个规格可以消除冗余，保持单一可信源。

## What Changes

1. **归档并移除** `openspec/specs/ipo-calendar-event-generation/spec.md`
2. **更新** `openspec/specs/ics-calendar-export/spec.md`，纳入被合并规格中的有效需求
3. 不涉及代码变更——实现已经反映了合并后的架构

## Capabilities

### Modified Capabilities

- `ics-calendar-export`: 纳入 `ipo-calendar-event-generation` 中独立的需求（"每个记录生成一个事件" 及缺失发行日验证）

合并后的规格将包含：
- ICS 导出格式（现有）
- 稳定的 UID 生成（现有）
- 重复 UID 检查（现有）
- ical-generator 使用（现有）
- 文件命名规范（现有）
- SUMMARY 格式（现有）
- DESCRIPTION 占位符（现有）
- Stream 分离（现有）
- **每个记录生成一个事件 + 缺失发行日验证**（新增自 ipo-calendar-event-generation）

## Impact

- `openspec/specs/ipo-calendar-event-generation/spec.md` → 归档至 archive
- `openspec/specs/ics-calendar-export/spec.md` → 更新内容
- 代码无变更——`index.ts` 和 `utils.ts` 无需修改