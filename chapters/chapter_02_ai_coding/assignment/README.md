# 第二篇作业：用 my-ai-infra SDD 为 DSH 开发一个插件

《企业级Agent工程架构实战营》｜第二篇：底层能力篇

[返回第二篇](../README.md) · [课程配套入口](../../../README.md)

## 一、作业内容

Fork DSH（DeepSeek Harness）的官方仓库，在本地把项目跑起来。自主选择一个创意，使用 my-ai-infra 的 SDD 流程，完成一个能在 DSH 中运行的插件。选题自由，重点是熟悉配套的 SDD 工具流程。

### 1. 准备项目与工具

Fork 并克隆 [DSH 官方仓库](https://github.com/deepseek-ai/deepseek-harness)，按照 README 安装依赖、构建并启动。在自己的 DSH 项目根目录安装并初始化 [my-ai-infra](https://github.com/shanggqm/my-ai-infra)：

```bash
# my-ai-infra 需要 Node.js 22+
npm install --global @easyuseai/my-ai-infra
mai init
mai doctor
```

### 2. 按 SDD 流程完成插件

根据自己选定的需求，使用配套的 my-ai-infra SDD 流程，规范地完成设计、开发和验收。

### 3. 保留过程产物

将 SDD 流程生成的中间规格文档、评审记录和验收结果保存在 `mai-specs/` 对应的 Feature 目录中，随代码一起提交。

### 4. 社区精选 DSH 插件

| 插件 | 用途 |
|---|---|
| [dsh-market](https://github.com/dsh-market/dsh-market) | 在 DSH 中浏览、搜索和安装社区插件。 |
| [ModLens](https://github.com/liustack/modlens) | 为 DSH 接入图像理解能力。 |
| [ModSearch](https://github.com/liustack/modsearch) | 提供网页搜索与页面读取能力。 |
| [dsh-visualize](https://github.com/Nagi-ovo/dsh-visualize) | 在对话中展示交互式图表、卡片和可视化页面。 |
| [dsh-context](https://github.com/bowenliang123/dsh-context) | 查看上下文组成、变化与 Token 使用情况。 |
| [dsh-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) | 在侧栏和工作台中管理文件、Git、预览与任务。 |
| [dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams) | 组织多个 Agent 分工协作，管理任务依赖与进度。 |
| [dsh-browser](https://github.com/wqty123/dsh-browser) | 让 DSH 操作浏览器，完成网页读取、表单填写等任务。 |
| [dsh-notify-me](https://github.com/chromoany/dsh-notify-me) | 在需要人工操作或后台回复完成时提醒用户。 |

### 5. 选题建议：my-ai-infra SDD 工作台

可以为 DSH 开发一个 my-ai-infra SDD 工作台插件，提供 Feature 导航、规格文档查看、流程阶段启动或验收结果展示。选其中一个小功能完成即可，也可以自由发挥创意，选择自己喜欢的方向。

## 二、作业质量要求

1. **能通过命令跑起来**：README 写清依赖安装、配置、启动和验证命令；按说明执行后，能启动 DSH、加载插件并实际使用核心功能。
2. **过程文档符合 SDD 规范**：保留与本次需求配套的需求说明、产品规格、技术方案、评审记录、测试计划和验收结果等中间产物，按工具规范组织，并与最终实现保持一致。

## 三、作业提交方式

**提交一个自己的 DSH Fork GitHub 仓库地址即可。** 代码和 SDD 过程产物均需提交并推送，确保评审者可以访问。

在仓库根 README 中提供作业入口，写清插件用途、运行命令和 SDD 过程文档位置；作业在其他分支时标明分支名称。评审重点是插件成果与 SDD 过程产物。

提交示例：

```text
https://github.com/你的账号/deepseek-harness
```
