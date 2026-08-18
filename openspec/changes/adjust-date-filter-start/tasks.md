## 1. 实现改动

- [x] 1.1 `utils.ts`：将 `getDateFilterStart` 中 `subtract(1, "week")` 改为 `subtract(2, "week")`，并同步更新 JSDoc 注释为「上二周的第一天」
- [x] 1.2 运行 `bun test` 确认全部测试通过（无既有测试覆盖该函数，作为回归基线）

## 2. 验证

- [x] 2.1 运行 `openspec validate --change "adjust-date-filter-start"` 确认 change 工件全部有效
- [x] 2.2 确认 `buildIPOQuery` 生成的 filter 起始日期比改动前提前一周（可用临时脚本或手动推算验证）
