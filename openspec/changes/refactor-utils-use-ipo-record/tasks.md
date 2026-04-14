## 1. 重构 formatSummary 函数

- [x] 1.1 修改 formatSummary 函数签名，使用 IPORecord 作为入参
- [x] 1.2 在函数内部依次使用 const 声明 name、code、market、instrumentType（不要使用解构）
- [x] 1.3 更新 createICS 中对 formatSummary 的调用方式

## 2. 重构 getUID 函数

- [x] 2.1 修改 getUID 函数签名，使用 IPORecord 作为入参
- [x] 2.2 在函数内部依次使用 const 声明 code、market（不要使用解构）
- [x] 2.3 更新 createICS 中对 getUID 的调用方式

## 3. 验证

- [x] 3.1 运行测试确保功能正常
- [x] 3.2 检查是否有其他调用方需要更新

## 4. 添加 stamp 属性

- [x] 4.1 在 utils.ts 中引入 dayjs UTC 模块
- [x] 4.2 在 createICS 的 createEvent 调用中添加 stamp 属性，使用 issuanceDate 当日 0 点（UTC）
