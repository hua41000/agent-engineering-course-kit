以下选编为 **7 条任务拆解实践**，覆盖大需求如何分层、子任务粒度如何判断，以及执行中如何验证和掌控进度。GoodCase、BadCase 均为依据来源改写的教学示例，未在本仓库执行或测量效果；拆分层级与判断方法属于教学提炼。

### 最佳实践 A：

- **标题：大需求先拆里程碑，再拆子任务**

- **描述：**

  先按可验收结果划分里程碑，再细拆近期子任务，标明依赖并据验收结果更新进度。

- **GoodCase：**

  建设集团采购平台，覆盖多子公司审批、预算、供应商和 ERP。先拆成试点采购闭环、复杂审批、供应商履约、ERP 对账四个里程碑，再展开首个里程碑的子任务，标明依赖和验收标准。

- **BadCase：**

  把集团采购平台拆成权限、预算、审批、供应商、ERP 五个模块，各自完成后统一联调，按已完成任务数汇报进度。

- **参考依据：**

  Spec Kit 的 Spec of Specs 用浅层路线图记录子功能边界、依赖和状态；Anthropic 的长任务实验用功能清单与验证结果跟踪完成情况。本文将其提炼为“需求 → 里程碑 → 子任务”，层级按实际复杂度增减。任务数量只反映待办完成情况，业务进度还需看里程碑验收与阻塞；该分层无需为每个子任务建立完整规格，也不要求启动多个 Agent。 [GitHub Spec Kit](https://github.com/github/spec-kit/blob/main/docs/concepts/spec-of-specs.md) · [Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

### 最佳实践 B：

- **标题：先验证关键未知项**

- **描述：**

  先用探索任务查清会影响方案的未知项，再据此拆分实施任务。

- **GoodCase：**

  给已有多租户账号和移动端会话的老系统接入集团 SSO。先查清账号映射、会话失效和历史数据兼容，再按结论拆实施任务。

- **BadCase：**

  直接为集团 SSO 新建用户体系，替换现有登录与退出逻辑，最后再处理旧账号和移动端兼容。

- **参考依据：**

  OpenAI 的工程复盘强调先补齐工具、环境与工程能力。探索可交付调用链、复现证据、兼容性结果、最小原型、方案取舍或无法实施的原因，完成标准是降低不确定性。Birgitta 的 SDD 实测出现过调研已有类后仍重复实现的情况，因此应明确可复用能力；探索原型需另行审查后才能进入生产。 [OpenAI](https://openai.com/index/harness-engineering/) · [martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)

### 最佳实践 C：

- **标题：按完整业务场景切片**

- **描述：**

  按完整业务场景拆分复杂需求，每个切片都能跑通真实链路并验收。

- **GoodCase：**

  建设连接订单、仓储、支付和物流的售后中心。按整单退货退款、部分退货退款、换货补发分批交付，每批跑通申请到结果回写的完整流程。

- **BadCase：**

  先建齐售后中心所有表，再写完全部接口和页面，最后统一联调退货、退款和换货流程。

- **参考依据：**

  Spec Kit 按用户故事组织模型、服务、接口和验证；Anthropic 的长任务实验强调渐进推进并通过真实端到端操作验收。业务切片可以包含多个实施任务；共享契约、必要基础设施或内部模块可独立前置并验证，无需每项子任务都跨全栈。纯前端按完整交互及加载、空态、错误、权限状态切；纯后端按接口、事件或数据可验证的业务行为切。 [GitHub](https://github.com/github/spec-kit/blob/main/templates/tasks-template.md) · [Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

### 最佳实践 D：

- **标题：任务粒度以独立验证和审查为准**

- **描述：**

  以一个能验证、能审查的完整变更为单位；依赖明确后，过大继续拆，过细则合并。

- **GoodCase：**

  实现支持租户隔离、失败重试和文件过期的大批量异步导出。拆成任务管理、文件生成、授权下载和页面集成，每项都能验证和审查；已有完整后端时，页面接入作为一个任务即可。

- **BadCase：**

  整个异步导出只设一个任务；或者按文件、函数拆成几十项，统一要求每项 30 分钟内完成。

- **参考依据：**

  Google 的 Small CLs 以自成一体的变更界定大小，要求保留相关测试和理解改动所需的上下文，并指出过细拆分也会影响理解；该指南属于通用代码审查经验。Harper Reed 的 AI Coding 工作流要求步骤足够小以便安全实施，同时足够大以形成进展。本文据此提出任务粒度判据，不规定统一时长、文件数或行数；任务、会话和提交的边界可以不同。 [Google Engineering Practices](https://google.github.io/eng-practices/review/developer/small-cls.html) · [Harper Reed](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)

### 最佳实践 E：

- **标题：先拆共享前置，再拆独立任务**

- **描述：**

  抽出多个子任务共同依赖的能力与契约，再按输入输出划分后续任务，明确串行与并行关系。

- **GoodCase：**

  开发支持多渠道接入、自动分派和 SLA 提醒的工单平台。先拆出工单状态与事件契约，再拆渠道接入、分派和提醒任务；有依赖的串行，独立的并行，最后联调。

- **BadCase：**

  把渠道接入、自动分派和 SLA 提醒同时交给 AI 开发，各自定义工单状态和事件格式，完成后再统一。

- **参考依据：**

  Spec Kit 的任务模板区分共享前置与用户故事任务，按依赖标记可并行项；Harper Reed 要求每一步接入已有结果。本文将其提炼为共享前置与后续任务的拆分方法；修改不同文件不代表没有依赖，分项完成后仍需集成验证。 [GitHub Spec Kit](https://github.com/github/spec-kit/blob/main/templates/tasks-template.md) · [Harper Reed](https://harper.blog/2025/02/16/my-llm-codegen-workflow-atm/)

### 最佳实践 F：

- **标题：大需求滚动细化**

- **描述：**

  先定全局约束和路线，只细化近期任务，再按实际反馈调整后续计划。

- **GoodCase：**

  建设集团采购平台，先定整体路线，只细拆试点采购闭环。试点新增“按采购明细重审”要求后，先确认变更并更新审批模型和受影响任务，再细拆下一阶段。

- **BadCase：**

  一次性生成整个采购平台的 300 个详细任务，试点规则变化后仍照旧清单推进，等全部做完再统一调整。

- **参考依据：**

  Thoughtworks 的 SDD 讨论强调小步实施反馈应持续影响规格与方案。全局提前明确租户边界、数据归属、权限、系统交互和重要非功能目标；里程碑定义交付结果，近期任务细化实施。OpenAI 的执行计划实践要求持续写回发现、决策和进度，尚未进入实施窗口的功能无需预定每个类和接口的步骤。 [Thoughtworks](https://www.thoughtworks.com/insights/podcasts/technology-podcasts/what-is-spec-driven-development) · [OpenAI Developers](https://cookbook.openai.com/articles/codex_exec_plans)

### 最佳实践 G：

- **标题：Bug 先复现再最小修复**

- **描述：**

  先复现并定位根因，再最小修复，同时验证原有合法行为。

- **GoodCase：**

  修复多实例支付回调偶发重复入账。先复现并发与超时重试，再做最小修复，验证重复事件不重复入账、合法重试仍能成功。

- **BadCase：**

  支付回调出现重复入账，直接加“已处理”标记，当前样例通过就算完成，顺便重构订单模块。

- **参考依据：**

  Kiro Bugfix Specs 围绕错误行为、预期行为和须保持的行为建模。明确的小 Bug 可直接定位修复，复杂、关键或反复回归的问题先复现诊断；可自动化时保留修复前失败、修复后通过的测试，环境或间歇性问题保留日志、故障注入等证据。无关重构应另开任务。 [Kiro](https://kiro.dev/docs/specs/bugfix-specs/)
