## Why

`openspec validate --specs` 对 `a-share-ipo-ingestion` 报 3 个 ERROR:`## API Fetching` section 下的三个 `### Requirement:` header 不在主 `## Requirements` section 内,被解析器视为不可见。另有一个 WARNING:若干 requirement 描述缺少 MUST/SHALL 等 RFC 2119 用词。

## What Changes

- 删除 `openspec/specs/a-share-ipo-ingestion/spec.md` 中的 `## API Fetching` 标题,使 `Reuse ofetch instance`、`Shared query builder function`、`Type-safe API response wrapper` 三个 requirement 归入主 `## Requirements` section,恢复对 validate/list 的可见性。
- 为 `Reference inference rules for market/instrument type`、`Reuse ofetch instance`、`Type-safe API response wrapper` 三条 requirement 的描述补充 `MUST` 用词,消除 SHOULD/MUST WARNING。
- 实测验证(`## API Fetching` 降级为 `###` 会干扰 requirement 边界解析,不可行;删除标题可通过 validate)。

注:本变更不修改任何系统行为,是纯 OpenSpec 文档结构修复,故 `skip_specs: true`。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无(纯文档结构修复,系统行为不变)。

## Impact

- 文件:`openspec/specs/a-share-ipo-ingestion/spec.md`(文档结构调整 + 措辞补充)
- 影响面:仅 spec 文档;代码、API、依赖均不受影响
- 验证:`openspec validate --specs` 应全部通过(该 spec 从 1 failed 变为 0 ERROR / 0 WARNING)
