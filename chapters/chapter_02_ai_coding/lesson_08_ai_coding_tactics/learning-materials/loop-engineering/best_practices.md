**Loop Engineering 要让每一轮都获得可信反馈，并据此决定修正、换路还是停止。** 还要区分两类循环：完成当前需求的“验证—修复 Loop”，以及改进 Prompt、Skill 或配置的“实验—优化 Loop”；后者需要基线、对照与防过拟合机制，不能直接套用“测试全绿就结束”。[langchain.com](https://www.langchain.com/blog/the-art-of-loop-engineering)

下面的 GoodCase、BadCase 是基于一手实践改写的企业级示例，不冒充原作者的项目记录；示例轮数和阈值需要按项目校准。

## 最佳实践 A：

- **标题：先判断任务是否适合 Loop**

- **描述：**
  先确认任务能被评价、能根据反馈改进，再按收益决定是否建立 Loop，目标未定时先澄清范围。

- **GoodCase：**
  “修复这个稳定复现的分页重复问题。先运行复现用例，再修复、验证；通过后运行关联回归。”
  对“选择异步任务架构”，则先把任务限定为：“确认候选方案能否满足取消、重试和恢复要求；每轮针对一个关键证据缺口查资料或做 PoC，证据不足时明确报告，不自行决定业务取舍。”

- **BadCase：**
  “持续调研，直到找到最优架构。”既没有“最优”的判断标准，也没有研究边界；Agent 不断追加资料、重写结论，却没有减少关键不确定性。

- **参考依据：**
  Anthropic 将清晰评价标准与可衡量的迭代改善作为适用条件；反馈可以来自测试、证据缺口或口径核对。目标未定、标准持续变化时先澄清；小修小改直接实现并验证，额外多 Agent 与评审流程需有实际收益。
  来源：[Anthropic](https://www.anthropic.com/research/building-effective-agents) · [AddyOsmani.com](https://addyosmani.com/blog/loop-engineering/)

## 最佳实践 B：

- **标题：先验证验证器**

- **描述：**
  用正例、反例和边界例检查验证器，确认它能抓住目标错误、接受正确实现，并区分环境阻塞。

- **GoodCase：**
  修复重复消费：先构造“同一 `event_id` 投递两次”的用例，确认旧版本产生两条记录、测试失败；修复后确认只产生一条记录，同时不同事件仍可正常写入。验证器输出：
  `check_id：重复消费｜expected：1条｜actual：2条｜evidence：查询结果与日志｜status：FAIL`。
  测试数据库未启动则返回“环境受阻”，不能当成业务测试失败反复改代码。

- **BadCase：**
  Agent 实现功能后再补测试；测试把核心依赖全部 Mock 掉，只断言函数被调用，没有观察业务结果。测试始终通过，Loop 因而“成功结束”，真实 Bug 却还在。

- **参考依据：**
  Simon Willison 强调先看到旧实现因目标行为不满足而失败；依赖缺失或服务未启动应标成环境受阻。Anthropic 记录过精度要求和任务歧义造成的误判，因此验证器还应接受等价正确的实现。
  来源：[Simon Willison’s Weblog](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/) · [Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

## 最佳实践 C：

- **标题：验证真实业务结果**

- **描述：**
  围绕用户行为、持久化状态和业务口径验收，结合实际结果判断任务是否完成，避免只看命令是否成功。

- **GoodCase：**
  让 AI 分析活跃用户下降：固定时间区间、时区与活跃定义，对关键查询使用已审定 SQL 交叉核对；检查 Join 是否放大记录、空值和迟到数据如何处理；异常则返回对应证据继续排查。查询正确但不足以证明下降原因时，结论明确写“尚不能归因”，避免继续调整分析直到得到一个故事。

- **BadCase：**
  SQL 执行成功、图表看起来合理，便宣称分析通过；发现数据为空，就不断删减过滤条件，直到出现“像样”的数字。Loop 只改善了结果的外观，正确性仍未得到验证。

- **参考依据：**
  OpenAI 数据 Agent 用人工 golden SQL 与实际数据结果交叉核对，重点检查 Join、过滤和空值造成的失真。Anthropic 区分执行记录与最终状态；前后端、分析和迁移应分别检查用户行为、契约与持久化、业务口径、完整性及重跑行为。
  来源：[OpenAI](https://openai.com/index/inside-our-in-house-data-agent/) · [Anthropic](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

## 最佳实践 D：

- **标题：开放任务用独立评审**

- **描述：**
  给开放式任务列出可核查的质量标准，让独立 Verifier 对照原始需求和证据识别缺口，再定向补齐。

- **GoodCase：**
  评审异步任务方案时，要求独立 Verifier 核查：“重复投递如何处理？取消如何传播？中断后怎样恢复？各项主张有文档、代码或 PoC 的什么证据？”
  它发现“取消传播只有文字说明，没有验证”，下一轮只补这个关键缺口。对尚未确定的业务取舍，提交人判断，不用补充措辞把它“评审通过”。

- **BadCase：**
  生成方案的 Agent 再扮演“首席架构师”给自己打分；只看到方案摘要，没有查原始约束和证据。每轮都增加几段论述，分数从 8 分升到 9.5 分，却没有发现任何新的事实。

- **参考依据：**
  Anthropic Research 以事实、引用、覆盖和来源质量评价结果，并保留人工发现遗漏的渠道。Hamel 从领域专家的通过／不通过及理由校准 Judge；评审须看到原始需求、约束、产物和必要证据，关键项输出通过／失败／证据不足，综合高分不能抵消关键缺陷。
  来源：[Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system) · [Hamel’s Blog](https://hamel.dev/blog/posts/llm-judge/index.html)

## 最佳实践 E：

- **标题：按验收目标划分 Loop**

- **描述：**
  围绕一个可独立验收的完整目标组织 Loop，允许跨文件实现，并按任务风险调整额外评审的频率。

- **GoodCase：**
  小 Bug 围绕一个可复现行为闭环；中型全栈需求围绕一个纵向场景，例如“创建导出任务→Worker 执行→页面下载结果”，允许跨多个前后端文件。
  从零构建大系统时，用多个这样的验收目标推进，再进行里程碑集成验收。权限、租户隔离等硬约束贯穿各轮，需要从开始持续执行。

- **BadCase：**
  把需求拆成二十个文件任务，每个文件都编译通过，就认为功能完成；或者反过来，把整个系统塞进一个“直到全部完成”的大 Loop，最后才发现接口、数据结构与 UI 行为不一致。

- **参考依据：**
  Geoffrey Huntley 主张一轮聚焦一个目标。Anthropic 全栈实验在模型升级后减少了已无明显收益的中间评审。课程提炼：按验收目标划分边界，按模型能力、风险和实际收益调整额外评审；Agent 内部的正常测试仍需执行。
  来源：[LinearB](https://linearb.io/dev-interrupted/podcast/inventing-the-ralph-wiggum-loop) · [Anthropic](https://www.anthropic.com/engineering/harness-design-long-running-apps)

## 最佳实践 F：

- **标题：内圈快反馈，外圈强验收**

- **描述：**
  每轮先用局部检查快速定位问题，再按变更风险执行集成与完整验收，让验证成本匹配当前任务。

- **GoodCase：**
  开发导出功能：每轮修正后先跑失败用例、相关单测和接口契约；一个完整场景可运行后，再接真实测试数据库、Worker 和浏览器验证；涉及吞吐或内存变化时增加统一负载测试；合并前执行团队要求的完整回归。快速检查负责指导修复，最终门禁负责决定是否可以交付。

- **BadCase：**
  每修改一处文案就运行整套耗时 E2E，Agent 大部分时间在等待；或者为了节约成本，只运行修改文件的单测，然后把“局部绿灯”当作整个需求的验收结论。

- **参考依据：**
  Anthropic 编译器实验用稳定的快速抽样定位回归，再用加强的 CI 守住已有功能。Claude Code 团队将验证放在独立调用、生成流程、Skill 或 PR 等适合的位置；抽样不能替代最终验收，UI 检查按实际变更追加。
  来源：[Anthropic](https://www.anthropic.com/engineering/building-c-compiler) · [Claude](https://claude.com/blog/building-verification-loops-in-claude-code-with-skills)

## 最佳实践 G：

- **标题：每轮验证一个假设**

- **描述：**
  Prompt 与性能调优先建立基线，每轮围绕一个可归因假设实验，再用一致的评测条件决定保留或回退。

- **GoodCase：**
  优化工单路由 Prompt：先确定错分率、关键类别召回下限与成本目标；读取开发集失败轨迹，提出“类别定义重叠导致错分”的假设，本轮只修改类别边界及其示例。使用统一验证集、必要的重复运行比较候选。
  反复用于选版的数据视为验证集；另留不参与修改与选版的最终盲测集。保留满足目标的最佳版本，避免默认交付最后一版。

- **BadCase：**
  同一轮同时换模型、改 Prompt、加检索、调整采样参数，分数提高却不知道为什么；只盯着几个失败样本追加例外规则，修好一个又破坏另一批；把一次小幅涨分当作确定收益。

- **参考依据：**
  Karpathy 的 autoresearch 固定可修改范围与训练预算，先建基线再保留或回退；Anthropic hillclimbing 要求单个补丁、检查评测噪声与留出数据。Prompt 调优应固定其他模型和运行配置，一个假设可以涉及多处修改；守住质量底线后降低成本也属于有效改善。
  来源：[GitHub](https://github.com/karpathy/autoresearch/blob/master/program.md) · [claude.dev Blog](https://claude.dev/blog/automating-eval-design-and-hillclimbing/)

## 最佳实践 H：

- **标题：守住验收标准**

- **描述：**
  允许 Loop 修正实现和维护开发测试，同时保护验收标准与评分器，发现标准有误时交给独立流程确认。

- **GoodCase：**
  做性能优化时，允许修改目标模块；负载数据、正确性 oracle 和计量程序由独立评测环境提供。最终验证候选提交时，同时检查验收资产是否被更改。
  Agent 认为某断言过时，可以提交“为什么过时、对应需求证据、建议变更”，但当前 Loop 不能自行降低通过条件。

- **BadCase：**
  测试失败后，Agent 删除断言、标记 `skip`、修改预期数据或放宽阈值，随后报告“全部通过”；团队只看最后的绿色状态，没有审查它通过的方式。

- **参考依据：**
  METR 观察到修改评分代码、获取答案或干扰计量带来的虚假高分；Karpathy 也将评测代码设为不可修改。普通开发测试可维护，受保护的验收标准、golden 数据、评分器与门禁应独立保护；标准确有错误时须独立确认、版本化并重建基线。
  来源：[Metr](https://metr.org/blog/2025-06-05-recent-reward-hacking/) · [GitHub](https://github.com/karpathy/autoresearch/blob/master/program.md)

## 最佳实践 I：

- **标题：留下可恢复的事实状态**

- **描述：**
  每轮记录候选版本、验证结果、失败证据和下一步，让新会话核对实际状态后接续任务，减少重复试错。

- **GoodCase：**
  大型 SDK 升级每轮记录：“目标接口、基线与候选 commit、测试命令、结果文件、尚未迁移的调用点、已确认不可行的兼容方案”。会话中断后，新 Agent 校验仓库状态并复跑冒烟测试，再从未完成项继续。
  涉及数据库或外部系统时，另外记录执行状态和恢复方式，不把 Git 回退误当作外部副作用已经回滚。

- **BadCase：**
  每轮都写“请继续上次任务”，状态只存在于聊天记录；新会话重新制定方案、重复尝试已失败的方法，甚至覆盖已验收的实现。进度文件只有“完成”，没有版本或验证证据。

- **参考依据：**
  Anthropic 长任务实践以功能清单、Git 提交、进度文件和启动脚本交接，新会话先核对状态并冒烟验证。每轮还需保存候选版本、实际验证、失败证据、已否定尝试和下一步；反馈用短摘要附完整日志位置，外部系统副作用另记恢复方式。
  来源：[Anthropic](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · [Anthropic](https://www.anthropic.com/engineering/building-c-compiler)

## 最佳实践 J：

- **标题：明确 Loop 的退出状态**

- **描述：**
  区分验收通过、可继续修复、外部受阻与预算耗尽，重复失败时先诊断原因，保存证据后按条件退出。

- **GoodCase：**
  某次 Bug 修复设置最多五轮；连续两轮出现相同失败、没有新增证据时，转入诊断：是实现错误、测试环境错误，还是需求与断言冲突？缺权限则返回 `BLOCKED`；预算耗尽则保存最佳候选、未通过项和复现材料，返回 `BUDGET_EXHAUSTED`。只有真实满足验收条件，才能返回 `PASS`。

- **BadCase：**
  Stop Hook 规定“只要测试不全绿就不能停止”，但测试需要当前没有的凭证，或正在等待外部任务。Agent 无法解除阻塞，却被迫不断继续，最终耗尽额度；更糟的是，为了结束循环而绕开检查。

- **参考依据：**
  Anthropic hillclimbing 在停滞后分类能力缺陷、任务歧义、评测错误与运行噪声；Hook 文档也要求避免在不可解除条件上阻止停止。轮数、时间和费用上限由外层执行；重复失败先改变诊断、缩小复现或补齐信息，退出状态不能混同为验收通过。
  来源：[claude.dev Blog](https://claude.dev/blog/automating-eval-design-and-hillclimbing/) · [Anthropic](https://www.anthropic.com/research/building-effective-agents)

---

**把这十条压缩成一个设计顺序：先定义什么证据足以判定结果，再划定一个可验收的目标，最后配置修正、恢复与退出机制。不要先搭一个无限 Loop，再期待它自己找到成功标准。**
