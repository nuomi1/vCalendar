# fetch-ipo-from-eastmoney - Design

## 文件结构

```
types.ts   ← 新增三个 API 响应接口类型
utils.ts   ← 新增三个转换函数 + API 常量 + 获取函数
```

## 类型定义

### StockIPOData

```typescript
export interface StockIPOData {
  SECURITY_CODE: string;
  SECURITY_NAME: string;
  APPLY_DATE: string;
  ISSUE_PRICE: number | null;
  BALLOT_NUM_DATE: string | null;
  LISTING_DATE: string | null;
}
```

### BondIPOData

```typescript
export interface BondIPOData {
  SECURITY_CODE: string;
  SECURITY_NAME_ABBR: string;
  PUBLIC_START_DATE: string;
  BOND_START_DATE: string;
  ISSUE_PRICE: number;
  LISTING_DATE: string | null;
}
```

### REITsIPOData

```typescript
export interface REITsIPOData {
  SECURITY_CODE: string;
  SECURITY_NAME_ABBR: string;
  SUBSCRIBE_START_DATE: string;
  SALE_PRICE: number;
  RESULT_NOTICE_DATE: string | null;
  LISTING_DATE: string | null;
}
```

## Utils 函数

### parseDate

```typescript
function parseDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}
```

### convertStockIPO

```typescript
export function convertStockIPO(data: StockIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.APPLY_DATE),
    issuancePrice: data.ISSUE_PRICE,
    publicationDate: data.BALLOT_NUM_DATE ? parseDate(data.BALLOT_NUM_DATE) : null,
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}
```

### convertBondIPO

```typescript
export function convertBondIPO(data: BondIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME_ABBR,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.PUBLIC_START_DATE),
    issuancePrice: 100, // 可转债面值固定为100
    publicationDate: null, // 可转债无配号抽签环节
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}
```

### convertREITsIPO

```typescript
export function convertREITsIPO(data: REITsIPOData): IPORecord {
  return {
    name: data.SECURITY_NAME,
    code: data.SECURITY_CODE,
    issuanceDate: parseDate(data.SUBSCRIBE_START_DATE),
    issuancePrice: data.SALE_PRICE,
    publicationDate: data.RESULT_NOTICE_DATE ? parseDate(data.RESULT_NOTICE_DATE) : null,
    listingDate: data.LISTING_DATE ? parseDate(data.LISTING_DATE) : null,
  };
}
```

## API 常量

```typescript
const BASE_URL = "https://datacenter-web.eastmoney.com/api/data/v1/get";

const STOCK_IPO_API_OPTIONS = {
  sortColumns: "APPLY_DATE,SECURITY_CODE",
  sortTypes: "-1,-1",
  pageSize: 50,
  pageNumber: 1,
  reportName: "RPTA_APP_IPOAPPLY",
  columns: "SECURITY_CODE,SECURITY_NAME,APPLY_DATE,ISSUE_PRICE,BALLOT_NUM_DATE,LISTING_DATE",
  quoteColumns: "f2~01~SECURITY_CODE~NEWEST_PRICE",
  quoteType: 0,
  filter: "(APPLY_DATE>'2010-01-01')",
  source: "WEB",
  client: "WEB",
};

const BOND_IPO_API_OPTIONS = {
  sortColumns: "PUBLIC_START_DATE,SECURITY_CODE",
  sortTypes: "-1,-1",
  pageSize: 50,
  pageNumber: 1,
  reportName: "RPT_BOND_CB_LIST",
  columns: "SECURITY_CODE,SECURITY_NAME_ABBR,PUBLIC_START_DATE,BOND_START_DATE,ISSUE_PRICE,LISTING_DATE",
  source: "WEB",
  client: "WEB",
};

const REITS_IPO_API_OPTIONS = {
  sortColumns: "SUBSCRIBE_START_DATE",
  sortTypes: "-1",
  pageSize: 50,
  pageNumber: 1,
  reportName: "RPT_CUSTOM_REITS_APPLY_LIST_MARKET",
  columns: "SECURITY_CODE,SECURITY_NAME_ABBR,SUBSCRIBE_START_DATE,SALE_PRICE,RESULT_NOTICE_DATE,LISTING_DATE",
  quoteColumns: "NEW_DISCOUNT_RATIO~09~SECURITY_CODE,NEW_CHANGE_RATE~09~SECURITY_CODE,NEW_DIVIDEND_RATE_TTM~09~SECURITY_CODE",
  source: "WEB",
  client: "WEB",
};
```

**注意**：Columns 参数已精简为仅包含转换所需的字段。使用 ofetch 的 `query` 参数构造查询字符串，避免手动 URL 编码。

## 获取函数

```typescript
import { ofetch } from "ofetch";

interface EastMoneyResponse<T> {
  result?: {
    data: T[];
    pages: number;
    count: number;
  };
  resultCode?: number;
}

export async function fetchStockIPO(): Promise<IPORecord[]> {
  const json: EastMoneyResponse<StockIPOData> = await ofetch(BASE_URL, {
    query: STOCK_IPO_API_OPTIONS,
  });
  return json.result?.data?.map(convertStockIPO) ?? [];
}

export async function fetchBondIPO(): Promise<IPORecord[]> {
  const json: EastMoneyResponse<BondIPOData> = await ofetch(BASE_URL, {
    query: BOND_IPO_API_OPTIONS,
  });
  return json.result?.data?.map(convertBondIPO) ?? [];
}

export async function fetchREITsIPO(): Promise<IPORecord[]> {
  const json: EastMoneyResponse<REITsIPOData> = await ofetch(BASE_URL, {
    query: REITS_IPO_API_OPTIONS,
  });
  return json.result?.data?.map(convertREITsIPO) ?? [];
}

export async function fetchAllIPO(): Promise<InputData> {
  const [stocks, bonds, reits] = await Promise.all([
    fetchStockIPO(),
    fetchBondIPO(),
    fetchREITsIPO(),
  ]);
  return { stocks, bonds, reits };
}
```

**错误处理**：任一 API 请求失败时，`Promise.all` 直接抛出异常，不进行部分返回。

## 数据流

```
东方财富 API
    │
    ▼
ofetch(BASE_URL, { query: OPTIONS }) → EastMoneyResponse<T>
    │
    ▼
data[] → convertXxxIPO() → IPORecord[]
    │
    ▼
IPORecord[] → generateCalendar()
```