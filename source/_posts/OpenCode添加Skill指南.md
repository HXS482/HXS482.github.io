---
title: OpenCode添加Skill指南
date: 2026-02-13 22:06:03
tags:
  - OpenCode
  - Skill
categories:
  - 教程
---

## 什么是 Skill？

Skill 是 OpenCode 平台的扩展功能模块，它能为你的工作空间提供特定领域的专业能力。通过加载不同的 Skill，你可以让 OpenCode 具备代码审查、数据分析、文档生成等专业功能。

## 添加 Skill 的步骤

### 方法一：通过界面添加

1. 打开 OpenCode 工作空间
2. 进入 **Settings** 或 **Skill Store**
3. 浏览可用的 Skill 列表
4. 点击 **Add** 按钮添加所需 Skill
5. 等待 Skill 加载完成

### 方法二：配置文件添加

在项目配置文件中声明需要使用的 Skill：

```json
{
  "skills": [
    {
      "name": "code-reviewer",
      "version": "1.0.0"
    },
    {
      "name": "document-generator",
      "version": "1.2.0"
    }
  ]
}
```

## 常用 Skill 推荐

| Skill 名称 | 功能描述 |
|------------|----------|
| code-reviewer | 自动审查代码质量和潜在问题 |
| document-generator | 根据代码自动生成文档 |
| test-generator | 自动生成单元测试用例 |
| api-designer | API 设计和文档生成 |

## 验证 Skill 是否生效

添加 Skill 后，你可以通过以下方式验证：

- 在聊天中调用 Skill 功能
- 检查 Settings 中的已加载列表
- 尝试使用 Skill 提供的命令

## 注意事项

- 确保网络连接正常
- 部分 Skill 可能需要 API Key 配置
- 定期更新 Skill 以获得最新功能

## 总结

通过添加合适的 Skill，可以大幅提升开发效率。建议根据自己的项目需求选择性地加载 Skill，避免加载过多用不到的功能。

---

*Happy Coding! 🚀*

