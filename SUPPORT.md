# Support

本文件说明公开仓库中的提问、反馈和安全沟通方式，避免问题进入错误渠道后被来回转移。

## 使用问题与部署交流

以下内容建议优先使用 GitHub Discussions：

- 如何部署到自己的服务器
- SMTP、GitHub OAuth、域名、HTTPS 配置问题
- SQLite / MySQL 迁移思路
- 如何导入文书、资料、院校官方源库
- 使用体验、产品思路、协作流程讨论

入口：

- [GitHub Discussions](https://github.com/wzyn20051216/postgrad-contact-manager/discussions)

## Bug 反馈

如果问题可稳定复现，请提交 Bug Report。

建议在 Issue 中提供：

- 问题描述
- 复现步骤
- 预期结果与实际结果
- 浏览器 / 操作系统 / Node.js / pnpm 版本
- 页面截图、控制台日志、后端日志
- 是否与 OAuth、SMTP、WebSocket、数据库迁移、热发布相关

入口：

- [提交 Bug Report](https://github.com/wzyn20051216/postgrad-contact-manager/issues/new/choose)

## 功能建议

如果你想提出新功能、产品优化或工程改进建议，请使用 Feature Request。

更高质量的建议通常包含：

- 你要解决的真实问题
- 当前方案为什么不够用
- 你期望达到的结果
- 是否影响现有模块边界

入口：

- [提交 Feature Request](https://github.com/wzyn20051216/postgrad-contact-manager/issues/new/choose)

## 安全问题

不要在公开 Issue 中直接披露未修复漏洞的完整细节。

请先阅读：

- [SECURITY.md](./SECURITY.md)

如果仓库已开启 GitHub 私有漏洞报告，请优先使用私有渠道；如果尚未开启，请先提交一个不含利用细节的简短 Issue，请求建立私下沟通方式。

## 其他交流方式

如果你更习惯即时沟通，也欢迎通过 QQ：`2320194668` 交流使用反馈、部署经验或产品建议，请注明来意。项目仍在持续完善中，请多指教。

为避免重要问题丢失，正式缺陷与功能建议仍建议回到 GitHub Issues / Discussions 留痕。

## 维护范围说明

当前公开仓库优先关注以下内容：

- 可复现的功能缺陷
- 文档错误与部署误导
- 与认证、权限、导入导出、实时提醒相关的问题
- 与自托管部署直接相关的高频需求

以下情况可能不会被优先处理：

- 与项目定位明显无关的定制需求
- 缺少最小复现信息的问题
- 仅适用于个人私有环境、且无法抽象为通用问题的配置差异
- 已在 Roadmap 之外、但投入产出比明显偏低的大型重构建议

## 提交前自检

在提问或提 Issue 之前，建议先检查：

- 是否已经阅读过 README、DEPLOY.md、CONTRIBUTING.md
- 是否已经搜索过现有 Issues / Discussions
- 是否移除了密码、Token、邮箱验证码、服务器地址等敏感信息
- 是否能给出最小复现步骤
