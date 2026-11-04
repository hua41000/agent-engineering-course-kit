---
id: architecture-composer-delivery-management
title: 架构选型配套资产与方案文档管理
type: delivery-management
scope: cross-course-learner-tool
status: review
owner: guomeiqing
updated: 2026-09-22
sources:
  - https://github.com/shanggqm/geektime-course/blob/main/docs/course-repository-governance.md
  - https://github.com/shanggqm/geektime-course/blob/main/learner-kit/README.md
  - https://github.com/shanggqm/geektime-course/blob/main/.agents/README.md
---

# 架构选型配套资产与方案文档管理

[返回项目入口](../README.md) · [技术方案](technical-design.md)

## 当前实施范围

2026-09-22，按用户要求先交付本地可用网页与 Skill 下载包，采用轻量功能检查。下载包标为开发预览，不建立正式 release 快照；完整发布门禁留待正式分发阶段。

## 1. 归属决定

将 Agent Architecture Composer 提议为课程级学员工具，由第 02 课引入，并支持后续项目选型与答辩复用。2026-11-04 起，产品开发源放在独立公开仓库 `agent-engineering-course-kit` 的 `chapters/chapter_01_ai_foundations/lesson_02_agent_architecture_selection/agent-architecture-composer/`，符合仓库已有“跨课主示例项目或独立代码库引用”的职责。

Skill 执行指令、专属采集脚本与 Eval 放在 `chapters/chapter_01_ai_foundations/lesson_02_agent_architecture_selection/agent-architecture-composer/skill/`，课程仓库的 Skill 发现入口通过相对软链引用此目录。共享规则、Schema、算法与模板由产品工程统一构建；可安装 Skill 包包含生成副本，使其在学员系统中独立运行。

课程范围通过获批大纲和覆盖矩阵约束，工具发布有独立测试与版本。当前课次控制页显示 Composer 与对照实验已移出最新 PPT；本产品继续依据获批方法范围和本次需求设计，作为独立配套资产管理，不恢复或改动课件页面。

| 内容 | 唯一开发源 | 其他位置如何消费 |
|---|---|---|
| 产品需求、方法、技术与交付方案 | 本产品 `docs/` | 课次和 Skill 链接，不复制 |
| Web、共享内核、问题/模式/框架数据 | 本产品 `src/` | Web 与 CLI 共用同一构建 |
| Skill 流程与宿主行为 | `chapters/chapter_01_ai_foundations/lesson_02_agent_architecture_selection/agent-architecture-composer/skill/` | 产品打包脚本读取 |
| 课程原理与来源证据 | 第 02 课 `research/`、`design/` | 数据项引用稳定内容单元/主张 ID |
| 单课演示与课堂练习 | 相应课次 `practice/` | 引用工具和案例，保留作业教学说明 |
| 通用演示 fixture | 本产品 `examples/` | Web 示例与 Skill Eval 读取 |
| Skill 专属行为测试 | Skill 包内 `evals/` | 产品发布门禁执行 |
| 模型/框架横向实验 | 确需横向评测时进入 `benchmarks/` | 报告引用结果；产品测试留在产品工程 |
| 构建、预览、ZIP 中间包 | 本项目 `dist/` | 不进 Git |
| 已交付版本 | 新的 `releases/vX.Y.Z/` 快照 | 网站与下载入口指向同一版本 |
| 学员真实项目上下文与报告 | 学员项目自己的目录 | 仅经显式脱敏授权的教学案例才回到课程仓库 |

本轮只创建有内容的方案文档，不预建空工程目录或未完成 SKILL.md。现有试听课网页保留原位，其 V/C 阈值不继承为正式产品的选型标准。

## 2. 产品与技术文档管理

采用一个产品包、四个稳定方案文件和一个 manifest：

| 文件 | 负责的决策 | 变更触发 |
|---|---|---|
| `README.md` | 当前状态、入口、来源、使用与完成边界 | 状态或交付物变化 |
| `manifest.yml` | 路径、依赖、交付、实现与发布状态 | canonical、依赖或交付变化 |
| `docs/prd.md` | 用户、范围、流程、输出、验收 | 产品行为或范围变化 |
| `docs/methodology.md` | 课程方法、决策语义、覆盖与反例 | 方法或教学来源变化 |
| `docs/technical-design.md` | 模块、契约、执行、部署、测试、任务 | 技术边界、数据或依赖变化 |
| `docs/delivery-management.md` | 归属、评审、打包、发布 | 资产职责或交付方式变化 |

本包 README 承担产品 Brief 和上下文索引，manifest 承担状态登记。无需另在仓库根建立 `requirements/Feature-*`、第二份 BRIEF 和 ROADMAP。后续确有多个可独立排期的复杂需求时，可在本产品内部建立需求索引，指向现有 PRD，避免复制基线。

通用 PRD 与技术设计 Skill 的结构可复用；本仓库的小写文件名、统一状态和 canonical 规则优先。文件名保持稳定，Git 保存历史，不使用 `final`、`new` 或日常数字版本后缀。

### 状态与评审

当前四份方案均为 `review`，实现为 `planned`。采用仓库的 `planned → active → review → approved → released` 状态；文档获批与应用完成分别登记。

课程负责人确认范围和方法基线后，将对应文档改为 `approved`，记录批准日期与范围。实现或试用需要修订时修改 canonical 文件，并保留影响说明；不能因文件生成就自动获得批准。

重要技术取舍使用产品局部 ADR：实际产生决策时创建 `docs/decisions/adr-NNNN-<slug>.md` 及 README。记录背景、候选、决定、代价、来源和重审触发；被替代决策保留，新 ADR 指向原记录。产品局部 ADR 管理工具自身，学员报告的 `adr.md` 管理被评估系统。

### 同步规则

- 改功能：PRD 的 F 编号、技术设计、相关验收同步。
- 改方法：课程主张 → rule_id → question_id → 示例输入 → 预期行为同步；运行方法回归。
- 改 Skill：同步 Skill Eval，保留共享内核一致性。
- 改契约：Schema、迁移、CLI、Web 导入、Skill 输出与文档同步。
- 改框架信息：登记官方来源、版本、核验日期、许可、能力承担方；重算受影响候选测试。
- 改交付物：同一变更更新产品 README 与 manifest，相关课次 README 与 manifest 同步引用。
- 外部会话只作补充；学员必须可见的需求、规则和理由写入本地文档，避免依赖私人会话链接才能理解。

## 3. 课程关联与扩展

| 使用位置 | 用途 | 当前覆盖状态 |
|---|---|---|
| 第 02 课 | 任务、控制权、模式、框架和报告 | 本次完整设计范围，待实现 |
| 第 10 课 | DataAgent 立项与初始架构 | 复用目标、约束、最小充分候选；专门方法待接入 |
| 第 15 课 | Agent Runtime 核心选型 | 复用控制权与契约；深入规则待相应研究 |
| 第 19 课 | 单进程与分布式部署判断 | 首版保留否决与重选条件，部署模块待扩展 |
| 第 41 课 | 汇总证据、答辩与重选 | 复用报告和 ADR；全课程方法覆盖需逐模块验收 |

后续围绕模型执行、Context、Capability、Memory、Eval 扩充问题和规则。每个模块声明适用范围、依赖事实、来源、输出和反例，评审后进入默认规则集。总纲提供范围，详细方法由对应研究与教学设计支持。

由业务阶段、评估范围和已有事实激活模块，防止默认问卷无限增长；报告显示实际启用的方法与未覆盖范围。

## 4. 分发与版本

对学员提供在线问答地址、离线 Web 包、Skill ZIP、说明与案例包。源代码是否开放及采用何种许可由课程负责人决定；当前根工程为 `UNLICENSED`，本方案不承诺开源或自由再分发。

正式发布清单包括：

1. 已验收的 Web 静态资源与离线运行包。
2. 可独立安装的 Skill 包、运行时要求和宿主兼容说明。
3. 脱敏案例、示例报告、方法及安装说明。
4. release manifest：产品版本、课程版本、source commit、输入材料哈希、schema/method/engine/framework 版本、文件清单与 SHA-256、测试结果、许可证、维护人。
5. 已知限制、离线差异、升级方式和历史回放方法。

构建流程：检查源状态 → 在本项目 `dist/` 构建双端 → 契约与方法回归 → 跨端对齐 → 离线与宿主验收 → 确认分发许可 → 从干净、可识别的提交生成正式快照。未提交内容可生成本地预览，并记录哈希；不能冒充正式发行。

正式快照使用仓库下一个实际发布版本，不提前预占或修改已有 `releases/vX.Y.Z/`。生成物是不可变交付副本；修复回到 canonical 源后发布新版本。

5—50 MB 二进制包明确 LFS 存储选择，大于 50 MB 采用外部存储加校验和。Node.js、浏览器和大型依赖不随 Skill 源目录入库。托管平台和下载位置在发布时登记，本次不创建外部站点。

## 5. 实施里程碑

| 阶段 | 交付 | 出口标准 |
|---|---|---|
| M0：方案基线 | 本次四份方案、README、manifest、课次引用 | 范围、方法与归属可评审 |
| M1：共享内核与 Web | 契约、规则/题库、代表框架、问答、解释、报告 | 九场景和反例可判断，离线可用，理由可追踪 |
| M2：Skill | 上下文采集、澄清、CLI、打包、宿主 Eval | 示例项目完成选型，同输入双端决策一致 |
| M3：课程分发 | 覆盖检查、兼容矩阵、案例、许可、双端包 | 无阻断缺口，干净环境安装运行通过 |
| M4：后续模块 | 专题规则、实验回流、条件对比、可选 AI | 新模块有来源和回归，旧案例保持可解释 |

M1/M2 是开发拆分，首个学员正式发布同时覆盖两端。首版覆盖 C01—C23 的方法；框架资料可分批核验，页面仅推荐关键能力已核验的候选，其余明确标为待核验。

本次不修改课纲、逐页稿或 PPT，不创建运行工程。第 02 课保持原有阶段与状态，只新增产品方案依赖和入口，设计落盘不等于工具已交付。

## 6. 检查约定

本次检查相对链接、YAML 路径与状态、方法覆盖、现有变更保留及 `git diff --check`。根测试仅验证仓库工具，不证明新产品可运行。

实现阶段在产品目录运行自身测试和构建；涉及根工具再执行根 `npm test`。不连带运行第三方 benchmark 全量测试。发布记录保存实际命令、版本与结果，不填写尚未执行的成绩。
