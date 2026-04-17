# auto-update-ipo-calendar

## Summary

新建 GitHub Action，每日自动执行 `bun run index.ts` 抓取最新 IPO 数据，当输出的 ICS/JSON 文件有变化时，自动 commit 并 push 到仓库。

## Motivation

当前 IPO 数据需要手动运行 `bun run index.ts` 更新。配置 GitHub Action 后可实现自动化，确保日历文件始终保持最新。

## Requirements

### 文件结构

```
.github/
├── actions/
│   └── run_ts/
│       └── action.yaml          # 复用模板步骤
└── workflows/
    └── update_ipo_calendar.yaml  # 主 workflow
```

### GitHub Action 触发策略

- **定时触发**：每天 01:05 UTC（即 09:05 北京时间）
- **手动触发**：`workflow_dispatch` 允许手动执行

```yaml
on:
  schedule:
    - cron: "5 1 * * *"
  workflow_dispatch:
```

### 执行步骤

1. `actions/checkout@v6` — 检出代码
   - `persist-credentials: false` — 防止 credentials 写回，避免触发 cascade

2. `./.github/actions/run_ts` — 复用模板
   - 设置时区 Asia/Shanghai
   - 安装 Bun 及依赖
   - 执行 `bun run index.ts`

3. 检测文件变化并提交

   ```bash
   # 设置 git 用户信息
   git config user.name "github-actions[bot]"
   git config user.email "github-actions[bot]@users.noreply.github.com"

   # 检测文件变化（git diff 退出码 1 表示有变化）
   if git diff --exit-code; then
     echo "No changes detected, skip commit"
     exit 0
   fi

   # 有变化时提交
   git add zh_CN.stocks.json zh_CN.bonds.json zh_CN.reits.json \
          zh_CN.stocks.ics zh_CN.bonds.ics zh_CN.reits.ics
   git commit -m "chore: auto-update ipo calendar $(date +%Y-%m-%d)"
   git push
   ```

### Commit Message 格式

```
chore: auto-update ipo calendar 2026-04-17
```

### 失败策略

- `bun run index.ts` 执行失败 → Action 失败，不做额外处理
- API 获取失败时脚本抛异常，符合预期行为

## Non-Goals

- 不实现 PR 或 Code Review 流程
- 不实现通知机制（Slack/Email 等）
- 不支持自定义触发时间（固定每天 01:05 UTC）

## Status

Proposed
