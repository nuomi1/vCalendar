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

/**
 * 根据证券代码推断所属交易所市场。
 * @param code - 证券代码
 * @returns 市场标识：'SH' 上交所、'SZ' 深交所、'BJ' 北交所
 * @throws 无法识别的证券代码时抛出 Error
 */
export function inferMarket(code: string): Market {
  // === 上交所 SH ===
  // 股票（按数字从小到大：600, 601, 603, 605, 688, 689）
  if (
    code.startsWith("600") ||
    code.startsWith("601") ||
    code.startsWith("603") ||
    code.startsWith("605") ||
    code.startsWith("688") ||
    code.startsWith("689")
  ) {
    return "SH";
  }
  // 可转债（按数字从小到大：110, 111, 113, 118）
  if (
    code.startsWith("110") ||
    code.startsWith("111") ||
    code.startsWith("113") ||
    code.startsWith("118")
  ) {
    return "SH";
  }
  // REITs（508）
  if (code.startsWith("508")) {
    return "SH";
  }

  // === 深交所 SZ ===
  // 股票（按数字从小到大：000, 001, 002, 003, 004, 300-309）
  if (
    code.startsWith("000") ||
    code.startsWith("001") ||
    code.startsWith("002") ||
    code.startsWith("003") ||
    code.startsWith("004")
  ) {
    return "SZ";
  }
  if (
    code.startsWith("300") ||
    code.startsWith("301") ||
    code.startsWith("302") ||
    code.startsWith("303") ||
    code.startsWith("304") ||
    code.startsWith("305") ||
    code.startsWith("306") ||
    code.startsWith("307") ||
    code.startsWith("308") ||
    code.startsWith("309")
  ) {
    return "SZ";
  }
  // 可转债（按数字从小到大：123, 127, 128）
  if (
    code.startsWith("123") ||
    code.startsWith("127") ||
    code.startsWith("128")
  ) {
    return "SZ";
  }
  // REITs（按数字从小到大：180, 181）
  if (code.startsWith("180") || code.startsWith("181")) {
    return "SZ";
  }

  // === 北交所 BJ ===
  // 股票（92）
  if (code.startsWith("92")) {
    return "BJ";
  }
  // 可转债（810）
  if (code.startsWith("810")) {
    return "BJ";
  }

  // ❌ 无匹配
  throw new Error(`无法识别的证券代码: ${code}`);
}

/**
 * 根据证券代码推断证券类型。
 * @param code - 证券代码
 * @returns 证券类型标识：'上' 上交所、'科' 科创板、'深' 深交所、'创' 创业板、'北' 北交所、'债' 债券、'REITs' REITs
 * @throws 无法识别的证券代码时抛出 Error
 */
export function inferInstrumentType(code: string): InstrumentType {
  // === 上交所 SH ===
  // 股票（按数字从小到大：600, 601, 603, 605 → 上；688, 689 → 科）
  if (
    code.startsWith("600") ||
    code.startsWith("601") ||
    code.startsWith("603") ||
    code.startsWith("605")
  ) {
    return "上";
  }
  if (code.startsWith("688") || code.startsWith("689")) {
    return "科";
  }
  // 可转债（按数字从小到大：110, 111, 113, 118）
  if (
    code.startsWith("110") ||
    code.startsWith("111") ||
    code.startsWith("113") ||
    code.startsWith("118")
  ) {
    return "债";
  }
  // REITs（508）
  if (code.startsWith("508")) {
    return "REITs";
  }

  // === 深交所 SZ ===
  // 股票（按数字从小到大：000, 001, 002, 003, 004 → 深；300-309 → 创）
  if (
    code.startsWith("000") ||
    code.startsWith("001") ||
    code.startsWith("002") ||
    code.startsWith("003") ||
    code.startsWith("004")
  ) {
    return "深";
  }
  if (
    code.startsWith("300") ||
    code.startsWith("301") ||
    code.startsWith("302") ||
    code.startsWith("303") ||
    code.startsWith("304") ||
    code.startsWith("305") ||
    code.startsWith("306") ||
    code.startsWith("307") ||
    code.startsWith("308") ||
    code.startsWith("309")
  ) {
    return "创";
  }
  // 可转债（按数字从小到大：123, 127, 128）
  if (
    code.startsWith("123") ||
    code.startsWith("127") ||
    code.startsWith("128")
  ) {
    return "债";
  }
  // REITs（按数字从小到大：180, 181）
  if (code.startsWith("180") || code.startsWith("181")) {
    return "REITs";
  }

  // === 北交所 BJ ===
  // 股票（92）
  if (code.startsWith("92")) {
    return "北";
  }
  // 可转债（810）
  if (code.startsWith("810")) {
    return "债";
  }

  // ❌ 无匹配
  throw new Error(`无法识别的证券代码: ${code}`);
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
 * 获取动态日期过滤起始日期：上个月第一天。
 * @returns 格式为 YYYY-MM-DD
 */
function getDateFilterStart(): string {
  return dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
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
 * @returns ICS 格式的日历字符串
 */
export function createICS(records: IPORecord[]): string {
  const calendar = new ICalCalendar();
  calendar.name("新股申购");

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
  const api_fetch = ofetch.create({
    baseURL: "https://datacenter-web.eastmoney.com/api",
    responseType: "json",
  });
  const startDate = getDateFilterStart();

  const json = await api_fetch<EastMoneyResponse<StockIPOData>>(
    "/data/v1/get",
    {
      query: {
        client: "WEB",
        columns:
          "APPLY_DATE,BALLOT_NUM_DATE,ISSUE_PRICE,LISTING_DATE,SECURITY_CODE,SECURITY_NAME",
        filter: `(APPLY_DATE>='${startDate}')`,
        pageNumber: 1,
        pageSize: 50,
        reportName: "RPTA_APP_IPOAPPLY",
        sortColumns: "APPLY_DATE,SECURITY_CODE",
        sortTypes: "-1,-1",
        source: "WEB",
      },
    },
  );

  return json.result.data.map(convertStockIPO);
}

/**
 * 从东方财富获取可转债 IPO 数据。
 * @returns IPORecord 数组
 */
export async function fetchBondIPO(): Promise<IPORecord[]> {
  const api_fetch = ofetch.create({
    baseURL: "https://datacenter-web.eastmoney.com/api",
    responseType: "json",
  });
  const startDate = getDateFilterStart();

  const json = await api_fetch<EastMoneyResponse<BondIPOData>>("/data/v1/get", {
    query: {
      client: "WEB",
      columns:
        "BOND_START_DATE,LISTING_DATE,ISSUE_PRICE,PUBLIC_START_DATE,SECURITY_CODE,SECURITY_NAME_ABBR",
      filter: `(PUBLIC_START_DATE>='${startDate}')`,
      pageNumber: 1,
      pageSize: 50,
      reportName: "RPT_BOND_CB_LIST",
      sortColumns: "PUBLIC_START_DATE,SECURITY_CODE",
      sortTypes: "-1,-1",
      source: "WEB",
    },
  });

  return json.result.data.map(convertBondIPO);
}

/**
 * 从东方财富获取 REITs IPO 数据。
 * @returns IPORecord 数组
 */
export async function fetchREITsIPO(): Promise<IPORecord[]> {
  const api_fetch = ofetch.create({
    baseURL: "https://datacenter-web.eastmoney.com/api",
    responseType: "json",
  });
  const startDate = getDateFilterStart();

  const json = await api_fetch<EastMoneyResponse<REITsIPOData>>(
    "/data/v1/get",
    {
      query: {
        client: "WEB",
        columns:
          "LISTING_DATE,RESULT_NOTICE_DATE,SALE_PRICE,SECURITY_CODE,SECURITY_NAME_ABBR,SUBSCRIBE_START_DATE",
        filter: `(SUBSCRIBE_START_DATE>='${startDate}')`,
        pageNumber: 1,
        pageSize: 50,
        quoteColumns:
          "NEW_DISCOUNT_RATIO~09~SECURITY_CODE,NEW_CHANGE_RATE~09~SECURITY_CODE,NEW_DIVIDEND_RATE_TTM~09~SECURITY_CODE",
        reportName: "RPT_CUSTOM_REITS_APPLY_LIST_MARKET",
        sortColumns: "SUBSCRIBE_START_DATE",
        sortTypes: "-1",
        source: "WEB",
      },
    },
  );

  return json.result.data.map(convertREITsIPO);
}
