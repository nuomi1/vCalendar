## Context

`openspec/specs/a-share-ipo-ingestion/spec.md` 是唯一未能通过 `openspec validate --specs` 的 spec(其余 4 个均通过)。问题源于历史结构调整:原 `## API Fetching` section 将三个 `### Requirement:` 放出了主 `## Requirements` section,解析器据此判定它们不可见。动机详见 proposal.md - Why。

## Goals / Non-Goals

**Goals:**

- 让 3 个被隐藏的 requirement 进入 `## Requirements`,恢复 validate 可见性
- 消除 3 个 SHOULD/MUST WARNING
- 保持既有 requirement 内容与场景不变

**Non-Goals:**

- 不改系统行为(纯文档结构修复,skip_specs 已声明)
- 不新增/删除/修改任何 requirement 的语义
- 不动其他 4 个已通过验证的 spec

## Decisions

**决策 1:删除 `## API Fetching` 标题,而非降级为 `###`**

- 方案:直接删除 `## API Fetching` 一行,6 个 requirement 全部归入 `## Requirements`。
- 理由:实测证明——降级为 `### API Fetching` 会插入一个非 requirement 的 3 级标题到 `### Requirement:` 序列中,干扰解析器对 requirement 边界的判定,即使补全 Scenario 仍报 ERROR;删除标题则 validate 全绿。
- 备选:把 3 条改写为普通章节(去掉 `Requirement:` 前缀)——会丢失 requirement 语义与 SHOULD/MUST 规范力,不采纳。

**决策 2:补充 MUST 措辞消除 WARNING**

- 方案:对 `Reference inference rules for market/instrument type`、`Reuse ofetch instance`、`Type-safe API response wrapper` 的描述补 `MUST`(其中 Reuse ofetch 与 Type-safe 原文用 SHOULD,一并改为 MUST 或重构句式含 MUST)。
- 理由:WARNING 提示应为 RFC 2119 规范用词;实测确认 `SHOULD` 也会触发此警告,故统一用 `MUST`。
- 备选:维持 SHOULD 并接受 WARNING——validate 不失败但报告不干净,不采纳。

**决策 3:skip_specs 保证零 delta 校验通过**

- 本 change 无 spec delta(纯文档结构修复),已在 `.openspec.yaml` 声明 `skip_specs: true`。

## Risks / Trade-offs

- [删除标题后 `## Requirements` 内出现一个"API 相关"requirement 集合,缺少语义分组标题] → 通过 requirement 标题本身(`Reuse ofetch instance` / `Shared query builder function` / `Type-safe API response wrapper`)已足够自明;未来如需分组,应使用带 `MUST` 语义的 requirement 而非裸 section 标题。
- [`#### Implementation` block 与 scenario 混排] → 现状保留,不扩大范围;实测删除标题后不再触发 ERROR。

## Migration Plan

单文件文档修改,无迁移。修改后运行 `openspec validate --specs` 验证。

## Open Questions

无。
