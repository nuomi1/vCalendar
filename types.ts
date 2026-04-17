/**
 * 交易所市场标识
 * - SH: 上交所
 * - SZ: 深交所
 * - BJ: 北交所
 */
export type Market = "SH" | "SZ" | "BJ";

/**
 * 证券类型标识（用于日历事件摘要）
 * - 上: 上交所
 * - 科: 科创板
 * - 深: 深交所
 * - 创: 创业板
 * - 北: 北交所
 * - 债: 债券
 * - REITs: REITs
 */
export type InstrumentType = "上" | "科" | "深" | "创" | "北" | "债" | "REITs";

/**
 * IPO 记录（股票/债券/REITs 发行信息）
 */
export interface IPORecord {
  /** 证券名称 */
  name: string;
  /** 证券代码 */
  code: string;
  /** 发行日（申购日） */
  issuanceDate: Date;
  /** 发行价（元） */
  issuancePrice: number | null;
  /** 公布日（中签结果公布日） */
  publicationDate: Date | null;
  /** 上市日 */
  listingDate: Date | null;
}

/**
 * 输入数据容器
 */
export interface InputData {
  /** 股票 IPO 记录 */
  stocks: IPORecord[];
  /** 债券 IPO 记录 */
  bonds: IPORecord[];
  /** REITs IPO 记录 */
  reits: IPORecord[];
}

/**
 * 股票 IPO 原始数据（东方财富 RPTA_APP_IPOAPPLY）
 */
export interface StockIPOData {
  /** 申购日期 */
  APPLY_DATE: string;
  /** 中签号公布日 */
  BALLOT_NUM_DATE: string;
  /** 发行价格 */
  ISSUE_PRICE: number | null;
  /** 上市日期 */
  LISTING_DATE: string | null;
  /** 股票代码 */
  SECURITY_CODE: string;
  /** 股票简称 */
  SECURITY_NAME: string;
}

/**
 * 可转债 IPO 原始数据（东方财富 RPT_BOND_CB_LIST）
 */
export interface BondIPOData {
  /** 中签号发布日 */
  BOND_START_DATE: string;
  /** 上市时间 */
  LISTING_DATE: string | null;
  /** 发行价格 */
  ISSUE_PRICE: number;
  /** 申购日期 */
  PUBLIC_START_DATE: string;
  /** 债券代码 */
  SECURITY_CODE: string;
  /** 债券简称 */
  SECURITY_NAME_ABBR: string;
}

/**
 * REITs IPO 原始数据（东方财富 RPT_CUSTOM_REITS_APPLY_LIST_MARKET）
 */
export interface REITsIPOData {
  /** 上市日 */
  LISTING_DATE: string | null;
  /** 发行结果公告日期 */
  RESULT_NOTICE_DATE: string | null;
  /** 认购价格(元/份) */
  SALE_PRICE: number | null;
  /** 代码 */
  SECURITY_CODE: string;
  /** 简称 */
  SECURITY_NAME_ABBR: string;
  /** 发售起始日 */
  SUBSCRIBE_START_DATE: string;
}
