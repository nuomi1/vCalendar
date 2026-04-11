## 1. 主入口 (index.ts)

- [x] 1.1 搭建 index.ts 骨架：导入、类型声明、入口函数
- [x] 1.2 实现参数解析与环境校验

## 2. 输入与校验

- [x] 2.1 定义三路输入契约：`stocks` / `bonds` / `reits`，并明确独立处理边界
- [x] 2.2 定义必填字段与校验规则（ issuanceDate 必填）
- [x] 2.3 实现发行日缺失即抛异常的失败路径与错误信息规范
- [x] 2.4 实现代码推断市场与类型逻辑（代码 → 市场 + 类型简称）

## 3. 模型定义 (types.ts)

- [x] 3.1 定义输入接口：`StockRecord`、`BondRecord`、`REITsRecord`
- [x] 3.2 定义输出接口：`CalendarEvent`、`ExportConfig`
- [x] 3.3 定义工具类型：`Market`、`InstrumentType`

## 4. 工具函数 (utils.ts)

- [x] 4.1 市场推断函数：`inferMarket(code: string): Market`
- [x] 4.2 类型推断函数：`inferInstrumentType(code: string, category: string): InstrumentType`
- [x] 4.3 SUMMARY 格式化：`formatSummary(name, code, market, instrumentType): string`
- [x] 4.4 DESCRIPTION 格式化：`formatDescription(record): string`
- [x] 4.5 JSON 序列化：`serializeJSON(events, indent): string`（字母排序 + 2 空格）

## 5. 发行事件映射

- [x] 5.1 设计单事件模型：每条记录仅生成一个发行 `VEVENT`
- [x] 5.2 固定事件时间窗口为 `09:30-10:00`（非全天，系统时区）
- [x] 5.3 实现 `SUMMARY` 模板：`【类型简称】名称 代码.市场`
- [x] 5.4 实现 `DESCRIPTION` 模板：发行价、公布日、上市日，缺失值统一替换为 `--`

## 6. 导出能力

- [x] 6.1 基于 `ical.js` 生成并序列化 ICS（VCALENDAR/VEVENT）
- [x] 6.2 实现 UID 规则：`UID = 代码.市场`
- [x] 6.3 实现 ICS 三路文件导出：`zh_CN.stocks|bonds|reits.ics`
- [x] 6.4 实现 JSON 三路文件导出：`zh_CN.stocks|bonds|reits.json`
- [x] 6.5 确保空数组场景仍产出对应空内容文件

## 7. 测试与文档

- [x] 7.1 增加校验测试：发行日缺失、代码推断逻辑
- [x] 7.2 增加事件测试：SUMMARY 格式、DESCRIPTION 占位符
- [x] 7.3 增加导出测试：文件命名、三路独立输出、空输入输出
- [x] 7.4 增加 JSON 测试：字母排序、2 空格缩进
- [x] 7.5 更新 README/变更说明，明确本阶段"不含抓取与解析"