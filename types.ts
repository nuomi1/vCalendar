/**
 * 交易所市场标识
 * - SH: 沪市（上交所）
 * - SZ: 深市（深交所）
 * - BJ: 北交所
 */
export type Market = "SH" | "SZ" | "BJ";

/**
 * 证券类型标识（用于日历事件摘要）
 * - 上: 沪市主板
 * - 科: 科创板
 * - 深: 深市主板
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