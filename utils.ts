import stringify from "canonical-json";
import dayjs from "dayjs";
import { ICalCalendar } from "ical-generator";
import type { InstrumentType, IPORecord, Market } from "./types";

/**
 * 根据证券代码推断所属交易所市场。
 * @param code - 证券代码
 * @returns 市场标识：'SH' 沪市、'SZ' 深市、'BJ' 北交所
 */
export function inferMarket(code: string): Market {
  if (code.startsWith("8") || code.startsWith("4")) return "BJ";
  if (code.startsWith("6") || code.startsWith("688")) return "SH";
  return "SZ";
}

/**
 * 根据证券代码和资产类别推断证券类型。
 * @param code - 证券代码
 * @param category - 资产类别（stocks/bonds/reits）
 * @returns 证券类型标识：'上' 沪市、'科' 科创板、'深' 深市、'创' 创业板、'北' 北交所、'债' 债券、'REITs' REITs
 */
export function inferInstrumentType(
  code: string,
  category: string,
): InstrumentType {
  if (category === "bonds") return "债";
  if (category === "reits") return "REITs";
  if (code.startsWith("688")) return "科";
  if (code.startsWith("300")) return "创";
  if (code.startsWith("8") || code.startsWith("4")) return "北";
  if (code.startsWith("6")) return "上";
  if (code.startsWith("000") || code.startsWith("001")) return "深";
  return "深";
}

/**
 * 格式化日期为 YYYY-MM-DD 字符串。
 * @param date - Date 对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * 生成日历事件的摘要标题。
 * @param name - 证券名称
 * @param code - 证券代码
 * @param market - 市场标识
 * @param instrumentType - 证券类型
 * @returns 格式化的摘要，如【科】海光信息 688865.SH
 */
export function formatSummary(
  name: string,
  code: string,
  market: Market,
  instrumentType: InstrumentType,
): string {
  return `【${instrumentType}】${name} ${code}.${market}`;
}

/**
 * 生成日历事件的详细描述。
 * @param record - IPO 记录
 * @returns 多行描述字符串，包含发行价、公布日、上市日
 */
export function formatDescription(record: IPORecord): string {
  const price =
    record.issuancePrice !== undefined ? `${record.issuancePrice} 元` : "--";
  const pubDate = record.publicationDate
    ? formatDate(record.publicationDate)
    : "--";
  const listDate = record.listingDate ? formatDate(record.listingDate) : "--";
  return `发行价：${price}\n公布日：${pubDate}\n上市日：${listDate}`;
}

/**
 * 将 IPO 记录数组序列化为格式化的 JSON 字符串。
 * 使用 canonical-json 库输出 RFC 8785 兼容的确定性 JSON。
 * 输出字段按字母排序，包含推断的市场和证券类型。
 * @param records - IPO 记录数组
 * @param category - 资产类别
 * @returns 格式化的 JSON 字符串（2 空格缩进）
 */
export function createJSON(records: IPORecord[], category: string): string {
  return stringify(records, undefined, 2) || "";
}

export function createICS(records: IPORecord[], category: string): string {
  const calendar = new ICalCalendar();
  calendar.name("新股申购");

  for (const record of records) {
    const market = inferMarket(record.code);
    const uid = getUID(record.code, market);

    const startDate = dayjs(record.issuanceDate).hour(9).minute(30).second(0);
    const endDate = dayjs(record.issuanceDate).hour(10).minute(0).second(0);
    const summary = formatSummary(
      record.name,
      record.code,
      market,
      inferInstrumentType(record.code, category),
    );
    const description = formatDescription(record);

    calendar.createEvent({
      id: uid,
      start: startDate,
      end: endDate,
      floating: true,
      summary: summary,
      description: description,
    });
  }

  return calendar.toString();
}

export function getUID(code: string, market: Market): string {
  return `${code}.${market}`;
}
