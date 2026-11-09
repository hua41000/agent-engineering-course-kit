# Hook、Skill 与确定性自动化组合：调研结论

调研日期：2026-10-15。用于《企业级Agent工程架构实战营》第 08 课的 Skill 实战经验；配套材料见 [最佳实践与正反案例](best_practices.md)。

本次主要读取开发者本人复盘、厂商工程团队的实践记录、公开演示源码和官方文档。经验说明值得尝试的做法；产品文档核对运行语义；课堂案例是教学推导，未在本仓库运行。具体字段以 Claude Code 为例，迁移到其他工具前须核对支持情况。

<a id="four-hook-practices"></a>

## 2026-10-18 四项 Hooks 实践重做与核验

课程负责人在本次会话提供四项内容，授权重做为「Hooks实战经验」。当前 A–D 以这份输入为准，旧选编正文已替换；下方 R1–R10 与原来源表保留研究背景，其中旧最佳实践编号不代表当前编号。

| 当前实践 | 内容依据 | 核验与编辑说明 |
|---|---|---|
| A 修改后自动格式化 | 课程负责人输入；S5 | 保留单文件格式化，明确使用项目已有工具；“无需模型推理”限定为格式化操作本身 |
| B 高风险操作执行前拦截 | 课程负责人输入；S6、R5、R7 | 保留直接推送 main 的拦截示例，明确同步检查与检查器故障处理，注明版本条件 |
| C 自动恢复长任务上下文 | 课程负责人输入；S6 | 区分任务状态持久化与恢复注入，保留跨天订单迁移案例 |
| D 每日自动复盘与记忆进化 | 课程负责人输入；S6 核对触发机制 | 五类产物与审核边界来自课程方案；补充同一作业恢复、处理位置、去重与防递归，未冒充内置能力 |

本轮仅核验事件机制；每日频率、作业锁、模型预算、记忆分类、Skill 补丁候选等是需要实现的工程设计。将“每天最多启动一次、失败可恢复”落实为每天一个作业、失败恢复同一作业，成功后推进处理位置。`UserPromptSubmit` 可频繁触发，昂贵复盘由日期与增量检查限制执行频率。

### 本轮来源与消费者

| 编号 | 作者／发布方、标题与 URL | 发布日期 | 访问日期 | 来源类型与使用权 | 消费者 |
|---|---|---|---|---|---|
| U1 | 课程负责人：本次会话提供的四项企业级 AI Coding Hook 实践；无外部 URL | 2026-10-18 | 2026-10-18 | 课程输入，获授权改写为教学资料 | 当前 A–D、五类产物、流程与汇总 |
| S5（复核） | Anthropic：[Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) | 滚动文档，未标注固定发布日期 | 2026-10-18 | 官方指南；沿用下方 W 使用边界 | 当前 A |
| S6（复核） | Anthropic：[Hooks reference](https://code.claude.com/docs/en/hooks) | 滚动文档，未标注固定发布日期 | 2026-10-18 | 官方接口参考；沿用下方 W 使用边界 | 当前 B、C、D 的事件与执行语义 |

完整教学内容唯一维护于 [best_practices.md](best_practices.md)。未安装 Hook、启动后台复盘、读取真实历史会话或写入用户记忆；案例中的日报与记忆更新均为示例。

## 调研结论

<a id="r1"></a>
### R1：从反复出现的错误提炼一个小 Skill

**一线经验。** Claude Code 工程师 Thariq Shihipar 在内部数百个 Skill 的使用复盘中，强调沉淀模型反复踩到的坑，并说明许多有效 Skill 起初只有几行文字。Jesse Vincent 也先检验历史问题是否仍会发生，再决定补充 Skill。[S1](#s1) [S9](#s9)

**教学推导。** 遇到同一个业务错误第二次发生时，记录“触发场景—正确判断—验证方式”。例如退款判断漏掉部分退款，就补充支付状态的真实含义和最小反例。先完成这一项闭环，再扩展到相邻任务。没有观察到问题时，不必先写整套流程大全。

**边界。** 作者复盘支持渐进沉淀的方向，没有提供适用于所有项目的最优 Skill 数量或长度。

<a id="r2"></a>
### R2：Skill 指路，已有脚本承接可重复操作

**来源事实。** Anthropic 的 Agent Skills 工程文章展示了真实 PDF Skill：主文件指向表单说明；预写的 Python 程序提取字段，执行时无需把程序全文和 PDF 全文都装入模型上下文。[S2](#s2)

**教学推导。** 在代码任务中，Skill 说明如何选择数据、判断异常和解释输出；格式转换、字段校验、报告生成交给已验证脚本。主文件列出“何时读哪份参考、何时执行哪个脚本”，保留输入、输出、依赖和失败信息。跨项目路径应相对 Skill 或项目根目录解析。

**边界。** 脚本执行稳定性取决于输入、依赖和环境。脚本中继续调用模型、外部服务或随机逻辑时，应另行说明这些不确定性。执行脚本前仍需审查其来源与行为。

<a id="r3"></a>
### R3：验证 Skill 被调用，再评价内容是否有用

**一线评测。** Vercel 的 Jude Gao 报告，在其 Next.js 16 专项评测中，默认 Skill 有 56% 的任务未触发。增加显式使用指令后通过率达到 79%，压缩文档索引放入 AGENTS.md 的方案达到 100%。作者还观察到，先了解项目再查文档，比一开始就强制读 Skill 更适合其测试任务。[S3](#s3)

**教学推导。** 分开检查“应调用时有没有调用”和“调用后有没有解决问题”。描述写入用户常见说法及适用场景。对本次必须采用的流程，可在任务中直接指定 Skill。跨任务都需要的短约束放在项目常驻说明中，详细程序放在按需读取的资源里。

**边界。** 上述数字属于作者特定模型、任务和评测配置，本次未复现，不能扩展为所有框架和模型的收益承诺；也不能据此判定 Skill 没有价值。

<a id="r4"></a>
### R4：把判断、触发和检查分开安排

**来源事实。** Anthropic 对扩展机制的说明将 Skill 用于流程与知识，将 Hook 用于事件触发。Hook 的触发由运行环境控制；`prompt`、`agent` 类型仍用模型判断，结果会变化。[S4](#s4)

**教学推导。** 一个实用组合是：Skill 说明修改规范和验收目标；Hook 在目标事件发生时调用程序；格式化器、类型检查器、测试负责给出可检查结果。设计质量、需求理解仍需要模型或人工判断。不要用额外一轮模型调用逐字符检查可以直接由程序检查的规则。

**边界。** “每次触发”依赖 Hook 已加载、事件确实发生且匹配器命中；“程序运行”也不保证产品满足业务目标。需要对每一层分别验证。

<a id="r5"></a>
### R5：先选对事件，再写 Hook 内容

**产品事实。** 官方指南用 `PreToolUse` 阻止尚未执行的操作，用 `PostToolUse` 在成功编辑后格式化；`Stop` 在模型结束响应时触发。参考文档明确：`PostToolUse` 已无法阻止刚刚完成的工具动作。[S5](#s5) [S6](#s6)

**教学推导。** 写入前检查目标路径，写入后处理格式和反馈，阶段结束后核对验收记录。只匹配 `Edit|Write` 的 Hook 不能覆盖所有文件变化，例如 Shell 重写文件；对这类覆盖缺口，要增加相应检查或在独立验证环节兜底。

**边界。** Stop 发生说明本轮响应结束，不证明任务完成。退出检查应识别 `stop_hook_active`、重复失败和人工介入条件，避免不断要求“继续完善”。允许停止时可以明确报告失败或未验证项。[S5](#s5)

<a id="r6"></a>
### R6：让专用约束按任务启用，并核对权限语义

**一线经验。** Shihipar 描述了 `/freeze` 一类按需启用的编辑范围 Hook，用于调试时防止顺手修改无关代码。[S1](#s1)

**产品核验。** 当前 Claude Code 的 Skill `hooks` 字段会在调用后注册 Hook，并持续到会话结束。`allowed-tools` 为列出的工具提供当前调用轮次的预授权，未列出的工具仍受原有权限设置管理；它不构成排他工具白名单。[S7](#s7)

**教学推导。** 开始故障定位时启用“只准改目标模块”的检查，切换任务时确认约束是否仍生效。要限制工具、路径或外部操作，应使用对应权限与执行环境能力，并做越界用例验证。调用 Skill、允许免确认执行、限制可用能力，分别检查。

**边界。** Skill 注册的 Hook 生命周期与工具预授权生命周期不同。上课前应以安装版本复核，不能凭字段名称解释权限。

<a id="r7"></a>
### R7：把 Hook 故障当作需要设计的结果

**产品事实。** Hook 的退出码、结构化输出和事件共同决定效果。普通错误或超时在许多事件上默认允许流程继续；当前文档提供 `onFailure: "block"`，要求 Claude Code v2.1.295 及以上，并且有事件与异步类型限制。[S6](#s6)

**教学推导。** 为检查程序区分三种结果：规则通过、规则未通过、检查器未能完成。固定输出机器可读结果，诊断日志走独立通道；在具体 Hook 适配层中映射为该事件支持的决定。用“脚本路径不存在、超时、无效 JSON、正常拒绝”验证真实行为。要作为关键约束的检查，必须实测失败时是否确实拦截。

**边界。** 不可把任意非零退出码都解释为成功拦截。也不可用 `|| true` 将失败统一改成成功后，再声称质量检查已通过。格式化失败的容忍策略与关键写入约束应分别定义。

<a id="r8"></a>
### R8：有先后依赖的步骤写进同一个顺序入口

**产品事实。** Claude Code 同一事件匹配的多个 Hook 并行运行；一个 Hook 拒绝，不会取消同批其他 Hook 已执行的副作用。[S5](#s5)

**教学推导。** “生成文件后校验生成结果”必须由同一入口顺序调用，或由编排器等待前一步完成。多个 Skill 组合也应明确前一步输出和后一步输入，例如 `generate-schema → validate-schema → report`；下游读取产物时核对任务与版本。调用任何组件前，先检查它及其依赖是否存在。

**边界。** 在数组中排在前面不能保证先完成。调用 Skill 名称也不等于获得包管理器级别的依赖安装和版本兼容保证。相同程序重复运行时，还应检查是否重复写文件、提交或创建外部资源。

<a id="r9"></a>
### R9：检查证据与当前结果的关系

**公开源码事实。** Anthropic 为 Code with Claude 2026 发布的演示中，`track-read.sh` 记录证据读取，`verify-gate.sh` 据此限制结果文件写入。代码注释主动列出漏洞：只覆盖 Write/Edit，Shell 可绕过；路径匹配有限；任意证据可解锁任意结果行。README 将仓库定位为演示材料，并声明不维护。[S8](#s8)

**教学推导。** 验收记录应关联功能项、当前代码版本、执行命令和结果文件。旧截图、别的功能的日志、上一次提交的通过结果，都需要拒绝作为本次证据。对“实际做了什么”保留程序输出；模型负责解释证据与需求的关系。

**边界。** “打开过证据”只证明读取动作，无法证明测试正确、证据新鲜或业务成立。源码中的机制适合讲解与改造，不能原样宣称已构成完整保护。

<a id="r10"></a>
### R10：用真实任务压力测试组合效果

**一线经验。** Jesse Vincent 讲述了测试 Skill 的一次误区：起初 Agent 用知识问答检查是否理解规则，成绩很好；他随后改为时间压力、已投入大量工作等真实情境，检查 Agent 是否真正采取规定动作。[S9](#s9)

**教学推导。** 同一组任务分别运行基础方案、加入 Skill、再加入 Hook/脚本的方案。观察产物正确性、误触发、漏触发、耗时、重复执行和需要人工纠正的地方。至少保留一个正常任务、一个易漏的边界任务、一个不应触发的任务、一个依赖缺失或检查器故障的任务。

**边界。** 能复述流程不代表能执行；安装次数和触发次数也不代表产物质量。没有对照运行数据时，只报告适用判断与发现的问题，不编造节省的时间或 token 比例。

## 来源与使用范围

以下来源均于 **2026-10-15** 访问。W 表示公开网页或公开文档，未发现授予整篇转载的许可；本材料仅做归纳与链接，不搬运整篇文章、截图或长代码。C 表示 Apache-2.0 代码材料；若后续复制实现，须保留许可与版权要求。来源事实与作者经验均已在上文标明。

| 来源 | 作者或机构、标题与 URL | 发布日期 | 来源类型与使用权 | 消费者 |
|---|---|---|---|---|
| <a id="s1"></a>S1 | Thariq Shihipar / Anthropic：[Lessons from building Claude Code: How we use skills](https://claude.dev/blog/lessons-from-building-claude-code-how-we-use-skills/) | 当前页面标注 2026-06-03 | 工程师内部实践复盘；W | R1、R6；最佳实践 A、F |
| <a id="s2"></a>S2 | Anthropic：[Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) | 2025-10-16；含 2025-12-18 更新说明 | 工程文章，含实际 PDF Skill 机制；W | R2；最佳实践 B |
| <a id="s3"></a>S3 | Jude Gao / Vercel：[AGENTS.md outperforms skills in our agent evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) | 2026-01-27 | 工程评测复盘，作者自报结果；W | R3；最佳实践 C |
| <a id="s4"></a>S4 | Michael Segner / Anthropic：[Steering Claude Code: when to use CLAUDE.md, skills, hooks, and subagents](https://claude.com/resources/articles/steering-claude-code-skills-hooks-rules-subagents-and-more) | 已读页面未明确标注，未知 | 厂商机制说明；W | R4；最佳实践 D |
| <a id="s5"></a>S5 | Anthropic：[Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) | 滚动文档，未见固定发布日期 | 官方操作指南；W | R5、R8；最佳实践 E、H |
| <a id="s6"></a>S6 | Anthropic：[Hooks reference](https://code.claude.com/docs/en/hooks) | 滚动文档，未见固定发布日期 | 官方接口与错误语义；W | R5、R7；最佳实践 E、G |
| <a id="s7"></a>S7 | Anthropic：[Extend Claude with skills](https://code.claude.com/docs/en/skills) | 滚动文档，未见固定发布日期 | 官方 Skill 配置语义；W | R6；最佳实践 F |
| <a id="s8"></a>S8 | Anthropic：[Harness Primitives for Long-Running Claude Agents](https://github.com/anthropics/cwc-long-running-agents/tree/ad107a974bced5244f74dd283dbf2bfd3baee3a1)；[verify-gate.sh](https://github.com/anthropics/cwc-long-running-agents/blob/ad107a974bced5244f74dd283dbf2bfd3baee3a1/claude-code-config/.claude/hooks/verify-gate.sh)；[track-read.sh](https://github.com/anthropics/cwc-long-running-agents/blob/ad107a974bced5244f74dd283dbf2bfd3baee3a1/claude-code-config/.claude/hooks/track-read.sh) | 已核对版本提交于 2026-05-13；初次发布日期未知 | 官方活动演示源码；C | R9；最佳实践 I |
| <a id="s9"></a>S9 | Jesse Vincent：[Superpowers: How I'm using coding agents in October 2025](https://blog.fsck.com/2025/10/09/superpowers/) | 2025-10-09 | 开发者本人工作流复盘；页面声明保留版权，W | R1、R10；最佳实践 A、J |

## 仍需留给课堂演示验证的部分

- 没有在本仓库安装 Skill、配置 Hook 或执行作者评测；本次交付为调研与教学案例。
- 现有证据主要来自 Claude Code 生态。跨工具共通的是方法分工与验证思路，事件名、字段、权限和生命周期需要分别适配。
- 未获得足够可核验的原始播客逐字稿支撑额外独立结论；未将搜索摘要、第三方转述或无法打开的社交帖当作证据。
- Hook 的错误处理与权限细节更新较快。演示前应记录工具版本，并实测正常、拒绝、故障、重复运行四种结果。
