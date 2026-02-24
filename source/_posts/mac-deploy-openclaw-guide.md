---
title: Mac 部署 OpenClaw 完整指南：用 WhatsApp/Telegram 控制你的 Mac
date: 2026-02-13 23:00:00
tags:
  - OpenClaw
  - macOS
  - AI
  - Node.js
  - 教程
categories:
  - 技术教程
---

## 什么是 OpenClaw？

**OpenClaw**（前身为 Clawdbot/Moltbot）是一个开源的 AI 代理网关，让你可以通过 **WhatsApp**、**Telegram** 或 **终端** 发送消息来控制你的 Mac。

想象一下：你在喝咖啡时收到 Slack 消息，需要查找桌面上的季度报告。你只需要在 WhatsApp 上发送一条消息："在我的桌面上查找 Q4 报告 PDF"。30 秒后，你就能获得文件路径并告知同事。这就是 OpenClaw 的魅力！

### 核心功能

- 🔍 **文件搜索** - 快速在 Mac 上查找文件
- 🖥️ **命令执行** - 通过聊天运行 shell 命令
- 📄 **日志查看** - 读取应用日志
- 🤖 **AI 驱动** - 支持 Claude、GPT-4 等模型
- 💬 **多渠道** - WhatsApp、Telegram、终端

---

## 系统要求

在开始之前，请确保你的 Mac 满足以下要求：

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| **操作系统** | macOS 13 (Ventura) | macOS 14+ |
| **Node.js** | 20.0.0 | 22 LTS |
| **RAM** | 2 GB | 4 GB+ |
| **磁盘空间** | 1 GB | 5 GB+ |
| **网络** | 出站 HTTPS | 稳定互联网连接 |

**支持架构**：Intel 和 Apple Silicon (M1/M2/M3/M4) ✅

---

## 第一步：安装 Node.js

OpenClaw 基于 Node.js 构建，所以首先需要安装 Node.js 环境。

### 选项 A：使用 Homebrew（推荐）

如果你还没有安装 Homebrew，先运行：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后安装 Node.js：

```bash
# 安装 Node.js 22
brew install node@22

# 或者安装最新版本
brew install node
```

### 选项 B：使用官方安装包

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 **LTS 版本**（长期支持版）
3. 双击下载的 `.pkg` 文件
4. 按照安装向导完成安装

### 验证安装

安装完成后，验证 Node.js 是否正确安装：

```bash
node --version
# 应显示 v22.x.x 或更高版本

npm --version
# 应显示 10.x.x 或更高版本
```

---

## 第二步：安装 OpenClaw

安装 Node.js 后，使用 npm 全局安装 OpenClaw：

```bash
# 全局安装 OpenClaw
npm install -g openclaw@latest
```

安装完成后，验证是否成功：

```bash
openclaw --version
```

如果看到版本号（如 `1.x.x`），说明安装成功！

---

## 第三步：运行配置向导

OpenClaw 包含一个交互式配置向导，帮助你快速完成设置：

```bash
openclaw onboard
```

向导会引导你完成以下配置：

### 1. AI 提供商设置

选择你喜欢的 AI 模型：
- **Claude** (Anthropic) - 推荐，代码能力强
- **GPT-4** (OpenAI) - 通用能力强
- **其他模型** - 根据需求选择

### 2. API 密钥配置

根据选择的 AI 提供商，输入对应的 API 密钥：

**Claude 密钥获取**：
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建或登录账户
3. 进入 API 密钥页面生成新密钥

**OpenAI 密钥获取**：
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 进入 API 密钥页面
3. 创建新的密钥

### 3. 消息渠道配置

选择你想使用的消息平台：

#### WhatsApp 配置

1. 下载 **WhatsApp Business** 应用
2. 在 OpenClaw 向导中选择 WhatsApp
3. 扫描二维码完成配对
4. 设置一个专用的对话（推荐创建群组）

#### Telegram 配置

1. 在 Telegram 中搜索 **BotFather**
2. 发送 `/newbot` 创建新机器人
3. 按照提示设置名称和用户名
4. 获取 **API Token**
5. 在 OpenClaw 向导中输入 Token

#### 终端配置

如果不想使用消息应用，可以直接在终端中使用：

```bash
openclaw chat
```

---

## 第四步：启动 OpenClaw 网关

配置完成后，启动 OpenClaw 网关：

```bash
# 启动网关
openclaw start
```

你会看到类似以下的输出：

```
🦞 OpenClaw Gateway v1.x.x
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Configuration loaded
✓ AI Provider: Claude
✓ Channels: WhatsApp, Telegram
✓ Gateway running on http://localhost:3000

Ready to receive messages!
Press Ctrl+C to stop
```

**保持终端运行**，OpenClaw 网关需要一直运行才能接收消息。

---

## 第五步：测试使用

现在打开 WhatsApp 或 Telegram，向你配置好的对话发送消息测试！

### 常用命令示例

#### 文件搜索

```
在我的桌面上查找所有 PDF 文件
```

```
搜索包含 "report" 的文件
```

#### 命令执行

```
运行命令：ls -la ~/Documents
```

```
显示当前目录
```

#### 系统信息

```
显示 Mac 的存储空间使用情况
```

```
显示正在运行的进程
```

#### 日志查看

```
查看最近的系统日志
```

```
显示应用日志
```

---

## 高级配置

### 后台运行（使用 pm2）

如果你想让 OpenClaw 在后台运行，可以使用 pm2：

```bash
# 安装 pm2
npm install -g pm2

# 使用 pm2 启动 OpenClaw
pm2 start openclaw --name "openclaw-gateway"

# 查看状态
pm2 status

# 停止
pm2 stop openclaw-gateway

# 开机自启
pm2 startup
pm2 save
```

### 配置文件位置

OpenClaw 的配置文件存储在：

```
~/.config/openclaw/config.yaml
```

你可以手动编辑此文件来自定义高级设置。

### 安全配置

⚠️ **重要提示**：OpenClaw 有完全的终端访问权限，请注意：

1. **API 密钥安全** - 不要将 API 密钥提交到 Git 仓库
2. **访问控制** - 确保只有你信任的号码可以发送命令
3. **危险命令限制** - 可以配置禁止执行的命令列表

在配置文件中添加：

```yaml
security:
  blocked_commands:
    - "rm -rf /"
    - "sudo"
    - "dd"
```

---

## 常见问题

### Q: 安装时遇到权限错误？

**A**: 使用 `sudo` 或更改 npm 全局安装目录：

```bash
# 方法 1：使用 sudo
sudo npm install -g openclaw@latest

# 方法 2：更改 npm 目录（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g openclaw@latest
```

### Q: WhatsApp 连接失败？

**A**: 
1. 确保手机和 Mac 在同一网络
2. 重新扫描二维码
3. 检查 WhatsApp Web 是否正常工作

### Q: 如何更新 OpenClaw？

**A**: 
```bash
npm update -g openclaw
```

### Q: 如何完全卸载？

**A**: 
```bash
npm uninstall -g openclaw
rm -rf ~/.config/openclaw
```

### Q: Apple Silicon Mac 有兼容性问题？

**A**: OpenClaw 完全支持 M1/M2/M3/M4，如果遇到问题，尝试：

```bash
# 使用 Rosetta 2 运行
arch -x86_64 npm install -g openclaw@latest
```

---

## 使用技巧

### 1. 创建快捷命令

在 `~/.zshrc` 或 `~/.bash_profile` 中添加：

```bash
alias oc="openclaw"
alias ocs="openclaw start"
alias occ="openclaw chat"
```

### 2. 使用 Automator 创建启动应用

1. 打开 **Automator**
2. 创建新的 **应用程序**
3. 添加 **运行 Shell 脚本** 操作
4. 输入：`openclaw start`
5. 保存为 "OpenClaw Launcher"

### 3. 配合快捷指令使用

创建 iOS 快捷指令，通过 URL Scheme 快速发送命令：

```
openclaw://command?text=查找桌面文件
```

---

## 总结

恭喜！你已经成功在 Mac 上部署了 OpenClaw。现在你可以：

- 📱 通过手机随时随地控制 Mac
- 🔍 快速查找文件
- 🖥️ 执行远程命令
- 🤖 享受 AI 带来的便利

**下一步**:
- 探索更多 [OpenClaw 技能](https://openclawdoc.com/docs/skills/)
- 加入 [社区讨论](https://github.com/openclaw/openclaw/discussions)
- 贡献代码，让 OpenClaw 更强大

---

## 参考链接

- [OpenClaw 官方文档](https://openclawdoc.com/)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Node.js 官网](https://nodejs.org/)
- [Homebrew 官网](https://brew.sh/)

---

*如果你在使用过程中遇到问题，欢迎在评论区留言讨论！*
