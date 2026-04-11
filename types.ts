export type Market = "SH" | "SZ" | "BJ";

export type InstrumentType = "上" | "科" | "深" | "创" | "北" | "债" | "REITs";

export interface IPORecord {
  name: string;
  code: string;
  issuanceDate: Date;
  issuancePrice?: number;
  publicationDate?: Date;
  listingDate?: Date;
}

export interface InputData {
  stocks: IPORecord[];
  bonds: IPORecord[];
  reits: IPORecord[];
}