export type Market = "SH" | "SZ" | "BJ";

export type InstrumentType = "上" | "科" | "深" | "创" | "北" | "债" | "REITs";

export interface StockRecord {
  name: string;
  code: string;
  issuanceDate: string;
  issuancePrice?: number;
  publicationDate?: string;
  listingDate?: string;
}

export interface BondRecord {
  name: string;
  code: string;
  issuanceDate: string;
  issuancePrice?: number;
  publicationDate?: string;
  listingDate?: string;
}

export interface REITsRecord {
  name: string;
  code: string;
  issuanceDate: string;
  issuancePrice?: number;
  publicationDate?: string;
  listingDate?: string;
}

export interface CalendarEvent {
  name: string;
  code: string;
  market: Market;
  instrumentType: InstrumentType;
  issuanceDate: string;
  issuancePrice: number | null;
  publicationDate: string | null;
  listingDate: string | null;
}

export interface ExportConfig {
  outputDir: string;
  jsonIndent: number;
}

export interface InputData {
  stocks: StockRecord[];
  bonds: BondRecord[];
  reits: REITsRecord[];
}