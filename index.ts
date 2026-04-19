import type { IPORecord, InputData } from "./types";
import {
  createICS,
  createJSON,
  fetchBondIPO,
  fetchREITsIPO,
  fetchStockIPO,
  getUID,
} from "./utils";

/**
 * 验证 IPO 记录的发行日是否存在。
 * @param record - IPO 记录
 * @param code - 证券代码（用于错误信息）
 * @throws 发行日缺失时抛出 Error
 */
function validateIssuanceDate(record: IPORecord): void {
  if (!record.issuanceDate) {
    throw new Error(`发行日缺失：${record.code}`);
  }
}

/**
 * 检查是否存在重复的 UID（证券代码+市场）。
 * @param records - IPO 记录数组
 * @throws 存在重复 UID 时抛出 Error
 */
function checkDuplicateUID(records: IPORecord[]): void {
  const seen = new Set<string>();
  for (const r of records) {
    const uid = getUID(r);
    if (seen.has(uid)) {
      throw new Error(`UID 重复：${uid}`);
    }
    seen.add(uid);
  }
}

/**
 * 将 IPO 记录导出为 ICS 日历文件。
 * @param records - IPO 记录数组
 * @param filename - 输出文件路径
 * @param category - 证券类型标识（股票/可转债/REITs）
 * @throws UID 重复时抛出 Error
 */
async function exportICS(
  records: IPORecord[],
  filename: string,
  category: string,
): Promise<void> {
  checkDuplicateUID(records);
  const ics = createICS(records, category);
  await Bun.file(filename).write(ics);
}

/**
 * 将 IPO 记录导出为格式化 JSON 文件。
 * @param records - IPO 记录数组
 * @param filename - 输出文件路径
 */
async function exportJSON(
  records: IPORecord[],
  filename: string,
): Promise<void> {
  const json = createJSON(records);
  await Bun.file(filename).write(json);
}

/**
 * 对 IPO 记录进行数据验证和预处理。
 * @param records - IPO 记录数组
 * @returns 验证后的记录数组
 * @throws 发行日缺失时抛出 Error
 */
function processRecords(records: IPORecord[]): IPORecord[] {
  for (const r of records) {
    validateIssuanceDate(r);
  }
  return records;
}

/**
 * 生成 A 股 IPO 日历文件（ICS + JSON）。
 * 同时输出股票、债券、REITs 三个类别的日历。
 * @param data - 包含 stocks、bonds、reits 数组的输入数据
 * @example
 * await generateCalendar(
 *   { stocks: [...], bonds: [...], reits: [...] }
 * );
 */
export async function generateCalendar(data: InputData): Promise<void> {
  const stocks = processRecords(data.stocks);
  const bonds = processRecords(data.bonds);
  const reits = processRecords(data.reits);

  const fullDir = ".";

  await exportICS(stocks, `${fullDir}/zh_CN.stocks.ics`, "股票");
  await exportICS(bonds, `${fullDir}/zh_CN.bonds.ics`, "可转债");
  await exportICS(reits, `${fullDir}/zh_CN.reits.ics`, "REITs");

  await exportJSON(stocks, `${fullDir}/zh_CN.stocks.json`);
  await exportJSON(bonds, `${fullDir}/zh_CN.bonds.json`);
  await exportJSON(reits, `${fullDir}/zh_CN.reits.json`);

  console.log("Export complete: 6 files generated");
}

async function main() {
  const stocks = await fetchStockIPO();
  const bonds = await fetchBondIPO();
  const reits = await fetchREITsIPO();

  const data: InputData = {
    stocks,
    bonds,
    reits,
  };

  await generateCalendar(data);
}

if (import.meta.main) {
  await main();
}
