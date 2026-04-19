import stringify from "canonical-json";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ICalCalendar } from "ical-generator";
import { ofetch } from "ofetch";
import type {
  BondIPOData,
  InstrumentType,
  IPORecord,
  Market,
  REITsIPOData,
  StockIPOData,
} from "./types";

dayjs.extend(utc);

// ============================================================================
// 代码前缀查找表
// ============================================================================

/**
 * 代码前缀规则
 */
interface CodePrefixRule {
  /** 代码前缀 */
  prefix: string;
  /** 所属市场 */
  market: Market;
  /** 证券类型 */
  instrumentType: InstrumentType;
}

/**
 * 代码前缀查找表
 * 按前缀长度降序排列，确保匹配时优先使用更长的前缀
 */
const CODE_PREFIX_RULES: CodePrefixRule[] = [
  // 上交所 - 主板 (600, 601, 603, 605)
  { prefix: "600", market: "SH", instrumentType: "上" },
  { prefix: "601", market: "SH", instrumentType: "上" },
  { prefix: "603", market: "SH", instrumentType: "上" },
  { prefix: "605", market: "SH", instrumentType: "上" },
  // 上交所 - 科创板 (688, 689)
  { prefix: "688", market: "SH", instrumentType: "科" },
  { prefix: "689", market: "SH", instrumentType: "科" },
  // 上交所 - 可转债 (110, 111, 113, 118)
  { prefix: "110", market: "SH", instrumentType: "债" },
  { prefix: "111", market: "SH", instrumentType: "债" },
  { prefix: "113", market: "SH", instrumentType: "债" },
  { prefix: "118", market: "SH", instrumentType: "债" },
  // 上交所 - REITs (508)
  { prefix: "508", market: "SH", instrumentType: "REITs" },
  // 深交所 - 主板 (000, 001, 002, 003, 004)
  { prefix: "000", market: "SZ", instrumentType: "深" },
  { prefix: "001", market: "SZ", instrumentType: "深" },
  { prefix: "002", market: "SZ", instrumentType: "深" },
  { prefix: "003", market: "SZ", instrumentType: "深" },
  { prefix: "004", market: "SZ", instrumentType: "深" },
  // 深交所 - 创业板 (300-309)
  { prefix: "300", market: "SZ", instrumentType: "创" },
  { prefix: "301", market: "SZ", instrumentType: "创" },
  { prefix: "302", market: "SZ", instrumentType: "创" },
  { prefix: "303", market: "SZ", instrumentType: "创" },
  { prefix: "304", market: "SZ", instrumentType: "创" },
  { prefix: "305", market: "SZ", instrumentType: "创" },
  { prefix: "306", market: "SZ", instrumentType: "创" },
  { prefix: "307", market: "SZ", instrumentType: "创" },
  { prefix: "308", market: "SZ", instrumentType: "创" },
  { prefix: "309", market: "SZ", instrumentType: "创" },
  // 深交所 - 可转债 (123, 127, 128)
  { prefix: "123", market: "SZ", instrumentType: "债" },
  { prefix: "127", market: "SZ", instrumentType: "债" },
  { prefix: "128", market: "SZ", instrumentType: "债" },
  // 深交所 - REITs (180, 181)
  { prefix: "180", market: "SZ", instrumentType: "REITs" },
  { prefix: "181", market: "SZ", instrumentType: "REITs" },
  // 北交所 - 股票 (92)
  { prefix: "92", market: "BJ", instrumentType: "北" },
  // 北交所 - 可转债 (810)
  { prefix: "810", market: "BJ", instrumentType: "债" },
];

/**
 * 根据证券代码推断所属交易所市场。
 * @param code - 证券代码
 * @returns 市场标识：'SH' 上交所、'SZ' 深交所、'BJ' 北交所
 * @throws 无法识别的证券代码时抛出 Error
 */
export function inferMarket(code: string): Market {
  const rule = CODE_PREFIX_RULES.find((r) => code.startsWith(r.prefix));
  if (!rule) {
    throw new Error(`无法识别的证券代码: ${code}`);
  }
  return rule.market;
}

/**
 * 根据证券代码推断证券类型。
 * @param code - 证券代码
 * @returns 证券类型标识：'上' 上交所、'科' 科创板、'深' 深交所、'创' 创业板、'北' 北交所、'债' 债券、'REITs' REITs
 * @throws 无法识别的证券代码时抛出 Error
 */
export function inferInstrumentType(code: string): InstrumentType {
  const rule = CODE_PREFIX_RULES.find((r) => code.startsWith(r.prefix));
  if (!rule) {
    throw new Error(`无法识别的证券代码: ${code}`);
  }
  return rule.instrumentType;
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
 * 解析日期字符串为 Date 对象。
 * @param dateStr - 日期字符串
 * @returns Date 对象
 */
function parseDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

/**
 * 获取动态日期过滤起始日期：上一周的第一天（周日为第一天）。
 * @returns 格式为 YYYY-MM-DD
 */
function getDateFilterStart(): string {
  return dayjs().subtract(1, "week").startOf("week").format("YYYY-MM-DD");
}

/**
 * 生成日历事件的摘要标题。
 * @param record - IPO 记录
 * @returns 格式化的摘要，如【科】海光信息 688865.SH
 */
export function formatSummary(record: IPORecord): string {
  const name = record.name;
  const code = record.code;
  const market = inferMarket(code);
  const instrumentType = inferInstrumentType(code);
  return `【${instrumentType}】${name} ${code}.${market}`;
}

/**
 * 生成日历事件的详细描述。
 * @param record - IPO 记录
 * @returns 多行描述字符串，包含发行价、公布日、上市日
 */
export function formatDescription(record: IPORecord): string {
  const price =
    record.issuancePrice != null ? `${record.issuancePrice} 元` : "--";
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
 * @returns 格式化的 JSON 字符串（2 空格缩进）
 */
export function createJSON(records: IPORecord[]): string {
  const mapped = records.map((r) => {
    const obj: Record<string, unknown> = {
      name: r.name,
      code: r.code,
      market: inferMarket(r.code),
      instrumentType: inferInstrumentType(r.code),
      issuanceDate: formatDate(r.issuanceDate),
      issuancePrice: r.issuancePrice ?? null,
      publicationDate: r.publicationDate ? formatDate(r.publicationDate) : null,
      listingDate: r.listingDate ? formatDate(r.listingDate) : null,
    };
    return obj;
  });
  return stringify(mapped, undefined, 2) || "";
}

/**
 * 将 IPO 记录数组序列化为 ICS 日历字符串。
 * 使用 ical-generator 库生成 RFC 5545 兼容的日历。
 * 事件时间固定为 09:30-10:00（非全天事件）。
 * @param records - IPO 记录数组
 * @param category - 证券类型标识（股票/可转债/REITs），用于日历名称
 * @returns ICS 格式的日历字符串
 */
export function createICS(records: IPORecord[], category: string): string {
  const calendar = new ICalCalendar();
  calendar.name(`新股申购 - ${category}`);

  for (const record of records) {
    const id = getUID(record);
    const start = dayjs(record.issuanceDate).hour(9).minute(30).second(0);
    const end = dayjs(record.issuanceDate).hour(10).minute(0).second(0);
    const stamp = dayjs(record.issuanceDate).utc().hour(0).minute(0).second(0);
    const summary = formatSummary(record);
    const description = formatDescription(record);

    calendar.createEvent({
      id: id,
      start: start,
      end: end,
      stamp: stamp,
      floating: true,
      summary: summary,
      description: description,
    });
  }

  return calendar.toString();
}

/**
 * 生成唯一标识符（证券代码+市场）。
 * @param record - IPO 记录
 * @returns 唯一标识符，如 '600000.SH'
 */
export function getUID(record: IPORecord): string {
  const code = record.code;
  const market = inferMarket(code);
  return `${code}.${market}`;
}

// ============================================================================
// 东方财富 API 配置
// ============================================================================

/**
 * IPO API 查询配置
 */
interface IPOQueryConfig {
  reportName: string;
  columns: string;
  filterField: string;
  sortColumns: string;
  sortTypes: string;
  /** REITs 专用字段，可选 */
  quoteColumns?: string;
}

/** 股票 IPO API 配置 */
const STOCK_IPO_CONFIG: IPOQueryConfig = {
  reportName: "RPTA_APP_IPOAPPLY",
  columns:
    "APPLY_DATE,BALLOT_NUM_DATE,ISSUE_PRICE,LISTING_DATE,SECURITY_CODE,SECURITY_NAME",
  filterField: "APPLY_DATE",
  sortColumns: "APPLY_DATE,SECURITY_CODE",
  sortTypes: "-1,-1",
};

/** 可转债 IPO API 配置 */
const BOND_IPO_CONFIG: IPOQueryConfig = {
  reportName: "RPT_BOND_CB_LIST",
  columns:
    "BOND_START_DATE,LISTING_DATE,ISSUE_PRICE,PUBLIC_START_DATE,SECURITY_CODE,SECURITY_NAME_ABBR",
  filterField: "PUBLIC_START_DATE",
  sortColumns: "PUBLIC_START_DATE,SECURITY_CODE",
  sortTypes: "-1,-1",
};

/** REITs IPO API 配置 */
const REITS_IPO_CONFIG: IPOQueryConfig = {
  reportName: "RPT_CUSTOM_REITS_APPLY_LIST_MARKET",
  columns:
    "LISTING_DATE,RESULT_NOTICE_DATE,SALE_PRICE,SECURITY_CODE,SECURITY_NAME_ABBR,SUBSCRIBE_START_DATE",
  filterField: "SUBSCRIBE_START_DATE",
  sortColumns: "SUBSCRIBE_START_DATE",
  sortTypes: "-1",
  quoteColumns:
    "NEW_DISCOUNT_RATIO~09~SECURITY_CODE,NEW_CHANGE_RATE~09~SECURITY_CODE,NEW_DIVIDEND_RATE_TTM~09~SECURITY_CODE",
};

/**
 * 复用的 ofetch 实例
 */
const eastMoneyAPI = ofetch.create({
  baseURL: "https://datacenter-web.eastmoney.com/api",
  responseType: "json",
});

/**
 * 构建东方财富 API 查询参数
 * @param config - IPO 类型特定的配置
 * @returns 完整的 query 对象
 */
function buildIPOQuery(config: IPOQueryConfig): Record<string, unknown> {
  const startDate = getDateFilterStart();
  const query: Record<string, unknown> = {
    client: "WEB",
    columns: config.columns,
    filter: `(${config.filterField}>='${startDate}')`,
    pageNumber: 1,
    pageSize: 50,
    reportName: config.reportName,
    sortColumns: config.sortColumns,
    sortTypes: config.sortTypes,
    source: "WEB",
  };
  if (config.quoteColumns) {
    query.quoteColumns = config.quoteColumns;
  }
  return query;
}

// ============================================================================
// 数据转换函数
// ============================================================================

/**
 * 将股票 IPO 原始数据转换为 IPORecord。
 * @param data - 股票 IPO 原始数据
 * @returns IPORecord
 */
function convertStockIPO(data: StockIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.APPLY_DATE),
    issuancePrice: data.ISSUE_PRICE,
    publicationDate: parseDate(data.BALLOT_NUM_DATE),
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}

/**
 * 将可转债 IPO 原始数据转换为 IPORecord。
 * @param data - 可转债 IPO 原始数据
 * @returns IPORecord
 */
function convertBondIPO(data: BondIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME_ABBR,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.PUBLIC_START_DATE),
    issuancePrice: data.ISSUE_PRICE,
    publicationDate: parseDate(data.BOND_START_DATE),
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}

/**
 * 将 REITs IPO 原始数据转换为 IPORecord。
 * @param data - REITs IPO 原始数据
 * @returns IPORecord
 */
function convertREITsIPO(data: REITsIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME_ABBR,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.SUBSCRIBE_START_DATE),
    issuancePrice: data.SALE_PRICE,
    publicationDate: data.RESULT_NOTICE_DATE
      ? parseDate(data.RESULT_NOTICE_DATE)
      : null,
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}

// ============================================================================
// API 获取函数
// ============================================================================

interface EastMoneyResponse<T> {
  result: {
    data: T[];
  };
}

/**
 * 从东方财富获取股票 IPO 数据。
 * @returns IPORecord 数组
 */
export async function fetchStockIPO(): Promise<IPORecord[]> {
  const json = await eastMoneyAPI<EastMoneyResponse<StockIPOData>>(
    "/data/v1/get",
    { query: buildIPOQuery(STOCK_IPO_CONFIG) },
  );
  return json.result.data.map(convertStockIPO);
}

/**
 * 从东方财富获取可转债 IPO 数据。
 * @returns IPORecord 数组
 */
export async function fetchBondIPO(): Promise<IPORecord[]> {
  const json = await eastMoneyAPI<EastMoneyResponse<BondIPOData>>(
    "/data/v1/get",
    { query: buildIPOQuery(BOND_IPO_CONFIG) },
  );
  return json.result.data.map(convertBondIPO);
}

/**
 * 从东方财富获取 REITs IPO 数据。
 * @returns IPORecord 数组
 */
export async function fetchREITsIPO(): Promise<IPORecord[]> {
  const json = await eastMoneyAPI<EastMoneyResponse<REITsIPOData>>(
    "/data/v1/get",
    { query: buildIPOQuery(REITS_IPO_CONFIG) },
  );
  return json.result.data.map(convertREITsIPO);
}
