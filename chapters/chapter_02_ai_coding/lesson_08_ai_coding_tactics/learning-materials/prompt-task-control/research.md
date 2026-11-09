# 高质量 Prompt 与任务控制：调研结论

调研日期：2026-10-15。用于《企业级Agent工程架构实战营》第 08 课的补充调研；整理后的讲解条目见 [best_practices.md](best_practices.md)。13 条课程版经验现已统一到 [best_practices.md](best_practices.md)；本报告保留原 10 题的调研结论与来源，供延伸阅读。

本次实际阅读了工程师亲述、公开会话记录、对应 PR 和官方实践文档。下文将来源事实、个人经验与课程归纳分开；没有开展不同 Prompt 的对照实验，不承诺具体提效比例。

## 研究结论

<a id="short-prompt"></a>

### 1. 简短 Prompt 的前提是任务信息已经有落点

**一线案例：** Simon Willison 为 newsletter 工具增加一种内容类型时，用很短的指令交代了目标文件、参考仓库、应模仿的筛选规则和浏览器核验方式。文章附有实现 PR；[PR #268](https://github.com/simonw/tools/pull/268) 可核验原始任务与合并记录。[S1、S2]

**补充经验：** Boris Tane 的执行阶段会使用一句话纠偏，原因是计划和前序会话已明确背景。[S3]

**课程归纳：** 短句适合明确对象的小改动，或已有规格上的增量反馈。新业务规则、完成条件、接口兼容要求仍须说清。输入框字数少，不能直接推导出完整上下文少，也不能证明总 Token 更省。

<a id="context-entry"></a>

### 2. 知道准确文件就引用；位置未知就给检索线索

**来源事实：** Cursor 的工程实践明确建议：知道相关文件就标记，不知道就让 Agent 搜索；无关文件会干扰重点。[S4]

**适用边界：** 该经验以 Agent 能访问仓库、调用搜索工具为前提。只有聊天框且未上传代码时，不能期待它自行读取本地项目。`@` 的具体行为取决于工具；课堂演示应确认引用对象已被读取。

**课程归纳：** “从会话模块开始检查”给的是排查入口。“只允许修改会话模块”给的是修改边界。两者需要分开表达，避免提前锁死根因位置。

<a id="behavior-contract"></a>

### 3. 用行为、接口和输入输出样例表达要求

**一线案例：** Simon Willison 写下载函数时指定函数签名、大小限制及异常条件，专门补充服务器声明长度与实际下载长度不一致的情况。这些要求把完成条件落实到可观察行为。[S5]

**课程归纳：** “健壮”“优雅”“生产可用”可以表达期望，但需要具体行为承接。补充一个边界输入及预期结果，往往比再加几个质量形容词更便于检查。已有接口契约应准确引用；未知技术细节可交给 Agent 查证。

<a id="original-evidence"></a>

### 4. 提供错误现场，保留根因判断的不确定性

**来源事实：** Anthropic 的 Prompt library 建议直接提供日志、报错、截图和已有产物，支持从构建日志等材料开始诊断。[S6]

**课程归纳：** 错误信息、复现步骤与实际结果是证据；“可能是缓存”是待验证假设。把未经验证的解释直接写成修改命令，会缩窄调查方向。本条是基于来源做出的工程归纳，未发现其对成功率的独立量化结论。

<a id="clarify"></a>

### 5. 需求不清时先做有目标的访谈；小改动可以直接执行

**一线经验：** Addy Osmani 在新项目中先与模型迭代问答，补齐需求和边界，再把结果写成规格。[S7]

**交叉核验：** Claude Code 当前官方实践同时指出，小而明确的变更可以跳过规划；复杂功能可以先访谈用户。[S8]

**课程归纳：** 应优先询问业务上的选择，例如重复提交应拒绝还是返回既有结果。代码中已有的接口和依赖让 Agent 自行查。访谈应服务于待决定的问题，不能机械地要求每个任务先问固定数量的问题。

<a id="scope-control"></a>

### 6. 说明本轮阶段，把重要决定留在可修改的规格里

**一线经验：** Boris Tane 在计划中直接批注业务约束，要求更新计划并暂缓实现；确认后再下达执行指令。他也会删掉附带功能、保护既有公开接口。[S3]

**课程归纳：** “只分析”“更新方案”“开始实现”分别对应不同动作。复杂任务可用文件承载已确认决定，输入框负责指出本轮范围。是否每次都写计划，应按任务复杂度决定；作者个人工作习惯不作为所有任务的硬性流程。

<a id="reference-pattern"></a>

### 7. 指定参考实现，并说清继承哪一部分

**一线案例：** newsletter 案例通过引用博客中已有 Atom feed 的筛选行为，传递了新内容类型的业务语义。[S1]

**反例边界：** Simon 的 GIF 工具案例中，Agent 自行加了未要求的 URL 输入；作者指出该入口受 CORS 限制，准备移除。[S9]

**课程归纳：** 参考代码能压缩说明，但仍要区分复用的交互、结构与业务规则。允许模型选择细节时，也应检查它是否额外引入功能和运行前提。

<a id="engineering-shorthand"></a>

### 8. 用明确工程术语压缩已知方法

**作者经验：** Simon Willison 将 Red/Green TDD 作为简短指令，关键步骤是先运行测试看到失败，再实现并运行到通过。他提醒，跳过失败阶段可能得到原本就会通过的测试。[S10]

**课程归纳：** 在团队与工具理解一致时，这类术语可以减少重复解释。项目自定义的简称应给定义或文档入口。术语本身不构成执行证据，仍应检查实际发生了哪些验证动作。

<a id="verification"></a>

### 9. 把验证方法写进任务，要求可查看的结果

**来源事实：** Claude Code 当前最佳实践建议提供可运行检查，并展示测试输出、命令结果或截图。[S8]

**真实边界：** Simon 的 colophon 项目虽成功上线，他仍发现旧、新部署流程同时运行，需要自己检查设置并收尾。[S5]

**课程归纳：** 验收要覆盖用户真正依赖的行为。构建通过只证明构建检查通过；页面能打开也不能覆盖部署配置、权限或数据边界。缺环境时应报告未验证项，不能以完成自述填补证据。

<a id="delta-feedback"></a>

### 10. 纠偏要给具体反例；无进展时重新整理目标与事实

**已核验会话：** colophon 原始记录中，Agent 最初只提取了 URL 域名。Simon 指出完整 URL 的边界规则；记录随后出现代码修改、重新运行和完整链接输出。之后他又指出某页面的多条提交被错误合并成一个块。[S11]

**课程归纳：** 追问中提供“当前结果—预期结果—具体样本”，可直接推动下一步检查。连续失败时先检查假设和任务定义；必要时重新开会话并交接有效事实。

**经验分歧：** Cursor 建议在反复出错或切换任务时开新会话；Boris Tane 在同一任务的长会话中保留计划与修订上下文。资料不支持统一的“达到某个固定比例就清空”规则。[S4、S3]

## 补充核验：M｜先采访，再形成独立 Spec

**来源事实（S8）：** Anthropic 的官方实践文档建议，较大功能先使用问答工具访谈用户，覆盖实现、交互、边界情况和取舍；将结果写入 SPEC.md，再开启新会话执行。可独立使用的规格应列出相关文件或接口、范围之外的内容，并包含端到端验证步骤。同页说明小而明确的任务可以省去规划。

**课程归纳：** 访谈优先补齐会影响方案的未知决策；避免让用户解释代码中可查的事实。课程将“模糊需求和跨模块变更”作为适用场景，将已经定位清楚的小修复列为无需强制访谈的边界。GoodCase 由课程负责人提供，BadCase 为教学对照；未进行效果实验。

**核验记录：** 2026-10-15 阅读 [Let Claude interview you](https://code.claude.com/docs/en/best-practices#let-claude-interview-you)。发布方 Anthropic，页面未标注发布日期，来源类型为官方实践建议；中文归纳并链接，不复制完整原文。本条保留在调研记录中。现行选编见[最佳实践 Markdown](best_practices.md)及其[离线阅读版](best_practices.html)。

## 来源登记

以下来源均于 **2026-10-15** 访问；直接消费者均为 [best_practices.md](best_practices.md)。使用范围为中文归纳和链接，不复制整篇文章、完整会话、截图或第三方代码；表中列出的网页均未在本次核验中确认可整体再分发的开放许可。

| 编号 | 作者 / 机构、标题与 URL | 发布日期 | 来源类型与证据用途 | 使用权边界 |
|---|---|---|---|---|
| S1 | Simon Willison，[Adding a new content type to my blog-to-newsletter tool](https://simonwillison.net/guides/agentic-engineering-patterns/adding-a-new-content-type/) | 正文未标明；作者于 2026-04-18 在 S2 链接该文 | 一线案例拆解；短 Prompt、参考实现 | 归纳与署名链接；不转载正文 |
| S2 | Simon Willison，[Add support for beats in newsletter generation，PR #268](https://github.com/simonw/tools/pull/268) | 2026-04-18 | 公开实现记录；核验原始任务和合并事实 | 不复制代码；复用实现前另查仓库许可证 |
| S3 | Boris Tane，[How I Use Claude Code](https://boristane.com/blog/how-i-use-claude-code/) | 2026-02-11 | 工程师本人工作流复盘；阶段、批注、范围、短反馈 | 归纳与署名链接；不转载正文 |
| S4 | Lee Robinson / Cursor，[Best practices for coding with agents](https://cursor.com/blog/agent-best-practices) | 2026-01-09 | 官方团队实践博客；按需引用、检索和会话切换 | 归纳与署名链接；不复制产品截图 |
| S5 | Simon Willison，[Here’s how I use LLMs to help me write code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) | 2025-03-11 | 一线工作流与失败复盘；函数契约、上线后的遗漏 | 归纳与署名链接；不转载原始长 Prompt |
| S6 | Anthropic，[Prompt library](https://code.claude.com/docs/en/prompt-library) | 页面未标明，持续更新 | 官方实践文档；原始日志和输入材料 | 归纳与链接；案例自行编写 |
| S7 | Addy Osmani，[My LLM coding workflow going into 2026](https://addyosmani.com/blog/ai-coding-workflow/) | 2026-01-04 | 工程师本人经验及社区综合；本报告只采用其本人需求访谈实践 | 归纳与署名链接；不把转述案例算作独立证据 |
| S8 | Anthropic，[Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) | 页面未标明，持续更新 | 官方工程实践；规划成本、访谈、完成证据 | 归纳与链接；不将旧版快捷键或模型习惯当作通用能力 |
| S9 | Simon Willison，[GIF optimization tool using WebAssembly and Gifsicle](https://simonwillison.net/guides/agentic-engineering-patterns/gif-optimization/) | 页面未标明 | 一线 Prompt 拆解及实际产物反思；额外功能的代价 | 归纳与署名链接；不复制图像和第三方实现 |
| S10 | Simon Willison，[Red/green TDD](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/) | 页面未标明 | 作者工程模式总结；简短术语与测试失败阶段 | 归纳与署名链接；教学例子自行编写 |
| S11 | Simon Willison，[claude-code.txt](https://gist.github.com/simonw/323e1b00ee4f8453c7834a7560eeafc1) | 页面显示创建于 2025-03-10 | 作者主动公开链接的原始会话；核验纠偏、修改及重跑记录 | 仅归纳与链接；不下载整份记录，不转录个人路径与身份信息 |

## 核验说明与剩余缺口

- S1 的 PR 已实际打开。其备用会话站点只返回页面外壳，本报告没有声称审查过该任务的全部工具轨迹；S2 中模型生成的代码评语也不作为独立质量证明。
- S11 的 URL 截断、纠偏与重跑片段已实际打开核验；S5 的部署遗漏属于作者复盘，本次没有复现其旧环境。
- 官方旧版 Claude Code 工程文章现已跳转到 S8；本报告按当前页面核验，并用 Context7 对访谈、规划与验证建议交叉检索，没有沿用旧文章里的提示词触发预算技巧。
- 资料以可读取的一线文章、记录与官方实践为主；未将搜索摘要、无法核验的播客转述或模型概括算作证据。
- 尚无本课程环境下的对照实验。GoodCase / BadCase 均为教学示例，应展示信息差异与适用边界，不能宣称其收益已在本仓库测得。
