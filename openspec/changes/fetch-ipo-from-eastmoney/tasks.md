# fetch-ipo-from-eastmoney - Tasks

## 1. 定义类型接口

**File**: `types.ts`

- [x] 添加 `StockIPOData` 接口
- [x] 添加 `BondIPOData` 接口
- [x] 添加 `REITsIPOData` 接口

## 2. 添加工具函数

**File**: `utils.ts`

- [x] 添加 `parseDate(dateStr: string): Date` 工具函数
- [x] 添加 `convertStockIPO(data: StockIPOData): IPORecord`
- [x] 添加 `convertBondIPO(data: BondIPOData): IPORecord`
- [x] 添加 `convertREITsIPO(data: REITsIPOData): IPORecord`

## 3. 添加 API 常量

**File**: `utils.ts`

- [x] 添加 `STOCK_IPO_API` 常量
- [x] 添加 `BOND_IPO_API` 常量
- [x] 添加 `REITS_IPO_API` 常量

## 4. 添加获取函数

**File**: `utils.ts`

- [x] 添加 `fetchStockIPO(): Promise<IPORecord[]>`
- [x] 添加 `fetchBondIPO(): Promise<IPORecord[]>`
- [x] 添加 `fetchREITsIPO(): Promise<IPORecord[]>`
- [x] 添加 `fetchAllIPO(): Promise<InputData>`

## 5. 更新入口文件

**File**: `index.ts`

- [x] 在 main 中调用 `fetchAllIPO()` 并传入 `generateCalendar()`

## 6. 测试

- [x] 添加单元测试验证转换函数
- [x] 验证 API 集成（可选，需要网络）