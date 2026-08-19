## 1. 修改 spec 文档

- [x] 1.1 打开 `openspec/specs/a-share-ipo-ingestion/spec.md`,删除 `## API Fetching` 标题行,使 `Reuse ofetch instance`、`Shared query builder function`、`Type-safe API response wrapper` 三个 requirement 直接归入 `## Requirements`
- [x] 1.2 为 `Reference inference rules for market/instrument type` 描述补充 RFC 2119 用词 `MUST`(保持现有场景语义不变)
- [x] 1.3 为 `Reuse ofetch instance` 描述补充 `MUST`(原用 SHOULD,改为 MUST 句式)
- [x] 1.4 为 `Type-safe API response wrapper` 描述补充 `MUST`(原用 SHOULD,改为 MUST 句式)

## 2. 验证

- [x] 2.1 运行 `openspec validate --specs`,确认 `a-share-ipo-ingestion` 从 failed 变为全部通过,且不再出现该 spec 的 SHOULD/MUST WARNING
- [x] 2.2 运行 `openspec validate`(全量),确认 0 失败、0 警告
