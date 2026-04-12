import dayjs from "dayjs";
import ICAL from "ical.js";
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
 * 输出字段按字母排序，包含推断的市场和证券类型。
 * @param records - IPO 记录数组
 * @param category - 资产类别
 * @param indent - JSON 缩进空格数
 * @returns 格式化的 JSON 字符串
 */
export function serializeJSON(
  records: IPORecord[],
  category: string,
  indent: number = 2,
): string {
  const sorted = records.map((r) => {
    const obj: Record<string, unknown> = {
      name: r.name,
      code: r.code,
      market: inferMarket(r.code),
      instrumentType: inferInstrumentType(r.code, category),
      issuanceDate: formatDate(r.issuanceDate),
      issuancePrice: r.issuancePrice ?? null,
      publicationDate: r.publicationDate ? formatDate(r.publicationDate) : null,
      listingDate: r.listingDate ? formatDate(r.listingDate) : null,
    };
    const keys = Object.keys(obj).sort();
    const sortedObj: Record<string, unknown> = {};
    for (const k of keys) {
      sortedObj[k] = obj[k];
    }
    return sortedObj;
  });
  return JSON.stringify(sorted, null, indent);
}

/**
 * 将单条 IPO 记录转换为 iCalendar VEVENT 格式。
 * 使用 ical.js 构建 VEVENT 组件。
 * 事件时间固定为发行日 09:30-10:00（非全天事件）。
 * @param record - IPO 记录
 * @param category - 资产类别
 * @returns VEVENT 字符串块
 */
export function recordToICS(record: IPORecord, category: string): string {
  // 创建 VEVENT 组件
  const vevent = new ICAL.Component("vevent");

  // 使用 ICAL.Event 包装，获取便捷属性接口
  const event = new ICAL.Event(vevent);

  // 设置属性
  const market = inferMarket(record.code);
  event.uid = `${record.code}.${market}`;
  event.summary = formatSummary(
    record.name,
    record.code,
    market,
    inferInstrumentType(record.code, category),
  );
  event.description = formatDescription(record);

  // 使用 ICAL.Time 构造日期时间（不指定时区，使用系统默认）
  const dateStr = formatDate(record.issuanceDate);
  const [year, month, day] = dateStr.split("-").map(Number);
  event.startDate = new ICAL.Time({
    year,
    month,
    day,
    hour: 9,
    minute: 30,
  });
  event.endDate = new ICAL.Time({
    year,
    month,
    day,
    hour: 10,
    minute: 0,
  });

  return vevent.toString();
}

/**
 * 将 IPO 记录数组转换为 iCalendar 格式字符串。
 * 使用 ical.js 构建 VCALENDAR 组件。
 * @param records - IPO 记录数组
 * @param category - 资产类别（用于推断证券类型）
 * @returns 完整的 VCALENDAR 字符串
 */
export function createICS(records: IPORecord[], category: string): string {
  const vcalendar = new ICAL.Component("vcalendar");
  vcalendar.updatePropertyWithValue("version", "2.0");
  vcalendar.updatePropertyWithValue("prodid", "-//A-Share IPO Calendar//EN");

  for (const record of records) {
    const vevent = new ICAL.Component("vevent");
    const event = new ICAL.Event(vevent);

    const market = inferMarket(record.code);
    event.uid = `${record.code}.${market}`;
    event.summary = formatSummary(
      record.name,
      record.code,
      market,
      inferInstrumentType(record.code, category),
    );
    event.description = formatDescription(record);

    const dateStr = formatDate(record.issuanceDate);
    const [year, month, day] = dateStr.split("-").map(Number);
    event.startDate = new ICAL.Time({
      year,
      month,
      day,
      hour: 9,
      minute: 30,
    });
    event.endDate = new ICAL.Time({
      year,
      month,
      day,
      hour: 10,
      minute: 0,
    });

    vcalendar.addSubcomponent(vevent);
  }

  return vcalendar.toString();
}

/**
 * 生成日历事件的唯一标识符。
 * @param code - 证券代码
 * @param market - 市场标识
 * @returns UID 字符串，如 '688865.SH'
 */
export function getUID(code: string, market: Market): string {
  return `${code}.${market}`;
}
