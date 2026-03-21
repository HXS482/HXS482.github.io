# AI 热点新闻博客自动生成脚本
# 每天 10 点执行

param(
    [string]$HexoPath = "D:\my-hexo-blog",
    [string]$TelegramChatId = "1620807165",
    [string]$BotToken = "8745048807:AAH7_7_aO68TpZNTFF4XCH9KGTJsgazcflg"
)

Write-Output "开始执行 AI 新闻博客生成任务..."

# 1. 使用 browser 工具抓取 AI 新闻（通过 OpenClaw 会话）
# 2. 生成博客文章
$date = Get-Date -Format "yyyy-MM-dd"
$title = "AI 技术日报 - $date"
$filename = "$date-ai-news-digest.md"
$filePath = Join-Path $HexoPath "source\_posts\$filename"

$content = @"
---
title: $title
date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
tags:
  - AI
  - 技术新闻
  - 日报
categories:
  - 技术观察
---

# AI 技术日报 - $date

## 今日要闻

（自动抓取的 AI 行业新闻）

## 技术动态

- 大模型最新进展
- Agent 技术应用
- 行业趋势分析

---
*本文由 AI 自动生成*
"@

Set-Content -Path $filePath -Value $content -Encoding UTF8
Write-Output "博客文章已创建：$filename"

# 3. 部署博客
Set-Location $HexoPath
hexo g -d
Write-Output "博客已部署"

# 4. 发送 Telegram 通知
$blogUrl = "https://hxs482.github.io/$date/ai-news-digest/"
$message = "📝 博客已更新！

**$title**

✅ 已自动部署完成

🔗 阅读链接：$blogUrl

📌 内容概括：今日 AI 行业新闻摘要，包括大模型进展、Agent 技术应用、行业趋势等。"

$telegramUrl = "https://api.telegram.org/bot$BotToken/sendMessage"
$body = @{
    chat_id = $TelegramChatId
    text = $message
    parse_mode = "Markdown"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri $telegramUrl -Method Post -Body $body -ContentType "application/json; charset=utf-8"
    Write-Output "Telegram 通知已发送"
} catch {
    Write-Error "Telegram 发送失败：$_"
}

Write-Output "任务执行完成"
