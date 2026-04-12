import type { IPORecord, InputData } from "./types";
import {
  formatDate,
  formatDescription,
  formatSummary,
  getUID,
  inferInstrumentType,
  inferMarket,
  recordToICS,
  serializeJSON,
  createICS,
} from "./utils";

/**
 * 验证 IPO 记录的发行日是否存在。
 * @param record - IPO 记录
 * @param code - 证券代码（用于错误信息）
 * @throws 发行日缺失时抛出 Error
 */
function validateIssuanceDate(record: IPORecord, code: string): void {
  if (!record.issuanceDate) {
    throw new Error(`发行日缺失：${code}`);
  }
}

/**
 * 检查是否存在重复的 UID（证券代码+市场）。
 * @param records - IPO 记录数组
 * @param category - 资产类别（当前未使用，保留参数）
 * @throws 存在重复 UID 时抛出 Error
 */
function checkDuplicateUID(records: IPORecord[], category: string): void {
  const uids = records.map((r) => getUID(r.code, inferMarket(r.code)));
  const seen = new Set<string>();
  for (const uid of uids) {
    if (seen.has(uid)) {
      throw new Error(`UID 重复：${uid}`);
    }
    seen.add(uid);
  }
}

/**
 * 根据证券代码推断所属交易所市场。
 * @param code - 证券代码
 * @returns 市场标识：'SH' 沪市、'SZ' 深市、'BJ' 北交所
 * @example '688001' => 'SH', '000001' => 'SZ', '830001' => 'BJ'
 */
function inferMarket(code: string): "SH" | "SZ" | "BJ" {
  if (code.startsWith("8") || code.startsWith("4")) return "BJ";
  if (code.startsWith("6") || code.startsWith("688")) return "SH";
  return "SZ";
}

/**
 * 将 IPO 记录导出为 ICS 日历文件。
 * @param records - IPO 记录数组
 * @param filename - 输出文件路径
 * @throws UID 重复时抛出 Error
 */
async function exportICS(
  records: IPORecord[],
  filename: string,
): Promise<void> {
  checkDuplicateUID(records, "");
  const ics = createICS(records, "");
  await Bun.file(filename).write(ics);
}

/**
 * 将 IPO 记录导出为格式化 JSON 文件。
 * @param records - IPO 记录数组
 * @param filename - 输出文件路径
 * @param category - 资产类别
 */
async function exportJSON(
  records: IPORecord[],
  filename: string,
  category: string,
): Promise<void> {
  const json = serializeJSON(records, category, 2);
  await Bun.file(filename).write(json);
}

/**
 * 对 IPO 记录进行数据验证和预处理。
 * @param records - IPO 记录数组
 * @param category - 资产类别
 * @returns 验证后的记录数组
 * @throws 发行日缺失时抛出 Error
 */
function processRecords(
  records: IPORecord[],
  category: "stocks" | "bonds" | "reits",
): IPORecord[] {
  for (const r of records) {
    validateIssuanceDate(r, r.code);
  }
  return records;
}

/**
 * 生成 A 股 IPO 日历文件（ICS + JSON）。
 * 同时输出股票、债券、REITs 三个类别的日历。
 * @param data - 包含 stocks、bonds、reits 数组的输入数据
 * @param outputDir - 输出目录路径（默认当前目录）
 * @example
 * await generateCalendar(
 *   { stocks: [...], bonds: [...], reits: [...] },
 *   './output'
 * );
 */
export async function generateCalendar(
  data: InputData,
  outputDir: string,
): Promise<void> {
  const stocks = processRecords(data.stocks, "stocks");
  const bonds = processRecords(data.bonds, "bonds");
  const reits = processRecords(data.reits, "reits");

  const fullDir = outputDir || ".";

  await exportICS(stocks, `${fullDir}/zh_CN.stocks.ics`);
  await exportICS(bonds, `${fullDir}/zh_CN.bonds.ics`);
  await exportICS(reits, `${fullDir}/zh_CN.reits.ics`);

  await exportJSON(stocks, `${fullDir}/zh_CN.stocks.json`, "stocks");
  await exportJSON(bonds, `${fullDir}/zh_CN.bonds.json`, "bonds");
  await exportJSON(reits, `${fullDir}/zh_CN.reits.json`, "reits");

  console.log("Export complete: 6 files generated");
}

if (import.meta.main) {
  const sampleStocks: IPORecord[] = [
    {
      name: "测试股份",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: 10.5,
      publicationDate: new Date("2026-04-10"),
      listingDate: new Date("2026-04-20"),
    },
  ];
  const sampleBonds: IPORecord[] = [];
  const sampleREITs: IPORecord[] = [];

  generateCalendar(
    { stocks: sampleStocks, bonds: sampleBonds, reits: sampleREITs },
    ".",
  );
}
