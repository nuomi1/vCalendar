# auto-update-ipo-calendar Design

## 文件结构

```
.github/
├── actions/
│   └── run_ts/
│       └── action.yaml          # 复用模板（精简版）
└── workflows/
    └── update_ipo_calendar.yaml  # 主 workflow
```

## 详细设计

### 1. `.github/actions/run_ts/action.yaml`

复用参考项目结构，支持矩阵变量：

```yaml
name: Run TS
description: 执行 TypeScript 应用（Bun 环境）
runs:
  using: "composite"
  steps:
    - uses: szenius/set-timezone@v2.0
      with:
        timezoneLinux: "Asia/Shanghai"
        timezoneMacos: "Asia/Shanghai"
    - uses: oven-sh/setup-bun@v2
      with:
        bun-version: ${{ matrix.bun }}  # 来自 STRATEGY_MATRIX
    - uses: actions/cache@v5
      with:
        path: |
          ~/.bun/install/cache
        key: ${{ runner.os }}-bun-dependencies-${{ hashFiles('**/bun.lock', '**/bun.lockb') }}
        restore-keys: |
          ${{ runner.os }}-bun-dependencies
    - name: Install dependencies
      run: bun install
      shell: bash
    - name: Run application
      uses: nick-fields/retry@v4
      with:
        command: bun run index.ts
        max_attempts: 2
        timeout_minutes: 15
```

### 2. `.github/workflows/update_ipo_calendar.yaml`

主 workflow，使用 `git-auto-commit-action` 自动提交：

```yaml
name: Update IPO Calendar

on:
  schedule:
    - cron: "0 14 * * *"  # 每天 14:00 UTC = 22:00 北京时间
  workflow_dispatch:       # 手动触发

permissions:
  contents: write          # 显式声明写权限

jobs:
  update_ipo_calendar:
    runs-on: ${{ matrix.os }}  # 来自 STRATEGY_MATRIX
    strategy:
      matrix: ${{ fromJSON(vars.STRATEGY_MATRIX) }}
    steps:
      - name: Checkout
        uses: actions/checkout@v6
        with:
          persist-credentials: false  # 防止 credentials 写回，避免触发 cascade

      - name: Run TS
        uses: ./.github/actions/run_ts

      - name: Set commit message with date
        run: |
          echo "msg=chore: auto-update ipo calendar $(date +%Y-%m-%d)" >> $GITHUB_OUTPUT
        shell: bash

      - name: Commit and push changes
        uses: stefanzweifel/git-auto-commit-action@v7
        with:
          commit_message: ${{ steps.commit_msg.outputs.msg }}
          file_pattern: "zh_CN.*.json zh_CN.*.ics"
```

### STRATEGY_MATRIX 配置

需要在 GitHub Repository Variables 中配置：

```json
{"os": ["ubuntu-latest"], "bun": ["1.x"]}
```

## 实现要点

### persist-credentials: false

```
不添加此配置 → checkout 默认将 credentials 写回 .git/config
             → git push 时会携带这些 credentials
             → 可能触发 downstream workflows（如果配置了 on:push 触发器）
             → 形成无限循环或意外行为
添加此配置   → 不写入 credentials，git push 依赖 GITHUB_TOKEN
             → 安全且可控
```

### permissions: contents: write

```
GitHub Actions 默认权限可能为 contents: read
显式声明 write 权限确保 token 有足够权限 push
此配置仅影响本次 workflow，不影响其他 workflow
```

### GITHUB_OUTPUT 设置 commit message 日期

`git-auto-commit-action` 的 `commit_message` 参数不过 shell，无法直接使用 `$(date)`。
正确做法是先通过 `GITHUB_OUTPUT` 设置输出变量，再在 action 中引用：

```yaml
- name: Set commit message with date
  run: echo "msg=chore: auto-update ipo calendar $(date +%Y-%m-%d)" >> $GITHUB_OUTPUT
- uses: stefanzweifel/git-auto-commit-action@v7
  with:
    commit_message: ${{ steps.commit_msg.outputs.msg }}
```

直接写 `commit_message: "chore: auto-update ipo calendar $(date +%Y-%m-%d)"` 会导致 literal 文本。

### nick-fields/retry@v4 重试机制

脚本执行可能因网络波动等原因失败，添加 2 次重试，15 分钟超时：
```yaml
- uses: nick-fields/retry@v4
  with:
    command: bun run index.ts
    max_attempts: 2
    timeout_minutes: 15
```

### git-auto-commit-action 自动检测变化

该 action 会自动检测 `file_pattern` 匹配的文件是否有变化：
- 有变化 → commit + push
- 无变化 → skip（不产生 commit）

## 风险与注意事项

1. **连续多日变化**：IPO 数据更新后可能连续几天都有变化，导致连续 commit，这是预期行为
2. **周末/节假日**：东方财富可能不更新数据，但 Action 仍会运行（无变化则 skip）
3. **API 失败**：脚本抛异常 → Action 失败 → 不会产生空 commit，符合预期
4. **GitHub Actions 超时**：默认 6 小时，重试机制下最多 30 分钟，足够

## Status

Designed
