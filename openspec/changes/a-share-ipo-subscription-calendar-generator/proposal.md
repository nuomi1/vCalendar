## Why

当前目标是尽快产出可订阅的打新日历文件，不在本阶段处理交易所抓取与解析。已有上游数据可直接提供 `stocks` / `bonds` / `reits` 三组记录，因此本次收敛到"把输入数据稳定映射为 ICS/JSON 导出"。

市场与标的类型通过代码自动推断，简化输入契约。

## What Changes

- 输入约束：仅接收 `stocks` / `bonds` / `reits` 三个数组，分别处理，不做合并。
- 市场推断：由代码前缀自动推断市场（SH/SZ/BJ）和类型简称（上/科/深/创/北/债/REITs）。
- 事件约束：每条记录仅生成一个发行事件；发行价、公布日、上市日写入 `DESCRIPTION`。
- 时间约束：事件固定为非全天 `09:30-10:00`，使用系统时区（运行环境保证 `Asia/Shanghai`）。
- 校验约束：发行日缺失抛异常；同一导出流中 UID 重复抛异常。
- UID 规则：`UID = 证券代码.市场`。
- 缺失字段展示：描述中任一缺失字段统一填 `--`。
- SUMMARY 格式：`【类型简称】名称 代码.市场`，如 `【深】福恩股份 001312.SZ`。
- 导出能力：生成 `zh_CN.(stocks|bonds|reits).(ics|json)` 六个文件。

## Capabilities

### New Capabilities

- `a-share-ipo-ingestion`: 接收并校验上游提供的三类输入数组（stocks/bonds/reits），并从代码推断市场与类型。
- `ipo-calendar-event-generation`: 按"每条记录一个发行事件"规则生成事件，固定时间窗口与描述补位，SUMMARY 包含类型前缀。
- `ics-calendar-export`: 使用 `ical.js` 导出三类 ICS 与 JSON 文件，并执行 UID 唯一性校验。

### Modified Capabilities

- 无

## Impact

- Affected code: 输入模型、事件映射器、ICS/JSON 导出器、导出任务入口。
- APIs: 导出入口接收三类数组输入并分别产出文件。
- Dependencies: 仅强依赖 `ical.js` 进行 ICS 结构编辑与序列化。
- Systems: 错误处理重点为"发行日缺失"和"UID 重复"两类硬失败。