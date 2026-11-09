**短 Prompt 不一定差，不 @ 文件也不一定错。** Peter Steinberger 分享的很多任务只用一两句话加截图；Cursor 团队也明确建议：知道关键文件就引用，不知道就让 Agent 搜索。需要补足的是任务信息，而不是字数。[Peter Steinberger](https://steipete.me/posts/just-talk-to-it)

以下正反例根据来源改写为企业研发场景，并非受访者原话；文件路径、Skill 名称及工具连接均为示例。

### 最佳实践 A：

- **标题：表达要清晰具体**

- **描述：**
  写清使用场景、预期行为、关键约束和本次范围，让 AI 明确要解决什么问题、做到什么程度。

- **GoodCase：**

  > 登录态过期后，点击保存会一直转圈。修复为：停止加载、提示重新登录，并保留用户尚未提交的表单内容。本次不修改登录接口，也不重构整个认证模块。

- **BadCase：**
  > 优化一下登录逻辑，保证健壮、优雅，达到企业级标准。

- **参考依据：**
  OpenAI 的 Codex 指南推荐提供目标、上下文、约束和完成条件；GitHub 强调避免指代不明的表达。[OpenAI Developers](https://developers.openai.com/codex/learn/best-practices/)

### 最佳实践 B：

- **标题：@关键上下文**

- **描述：**
  引用已知的关键文件并说明用途，不确定位置时描述业务行为，让 AI 自行检索相关上下文。

- **GoodCase：**

  > @specs/refund/requirements.md 是需求依据，@src/payments/refund.ts 是可能的修改入口，@tests/payments/cancel.spec.ts 仅供参考测试组织方式。先核实退款调用链，其他相关文件自行检索。

- **BadCase：**
  > @src @docs @tests @node_modules 把这些全部看完，再帮我实现退款功能。

- **参考依据：**
  Cursor 建议按需引用关键上下文，也支持选中代码、终端输出和 Git diff 等输入。[Cursor](https://cursor.com/blog/agent-best-practices)

### 最佳实践 C：

- **标题：给样例和截图**

- **描述：**
  用输入输出、已有实现或前后截图说明预期，并指出哪些细节需要参考、哪些不应照搬。

- **GoodCase：**

  > 图一是当前页面，图二是目标设计。只调整筛选栏的布局和间距，不修改表格功能；交互参考 @src/components/UserTable.tsx，但不要复制其中的用户业务字段。完成后用相同视口截图对照。

- **BadCase：**
  > 这个页面不够高级，重新设计一下，要简洁、大气、有科技感。

- **参考依据：**
  Simon Willison 用可工作的代码示例指导实现；Peter Steinberger 用截图配合短指令迭代界面。[Simon Willison’s Weblog](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) · [Peter Steinberger](https://steipete.me/posts/just-talk-to-it)

### 最佳实践 D：

- **标题：复杂需求先澄清**

- **描述：**
  需求模糊或涉及重要取舍时，先让 AI 查代码、追问业务上的未决问题，对齐最小方案后再实现。

- **GoodCase：**

  > 我想给企业空间增加成员邀请。先阅读现有用户和权限实现，暂不编码。只追问会影响权限边界、邀请有效期和兼容性的未决问题，再给出最小改动方案与主要风险，等我确认。

- **BadCase：**
  > 给企业空间加一套完整的邀请系统，规则你看着定，直接开始写。

- **参考依据：**
  Cat Wu 分享过主动要求 Claude 提问的做法，Boris Cherny 强调复杂开发先对齐计划；明确的小修小改无需强制规划。[Every](https://every.to/podcast/transcript-how-to-use-claude-code-like-the-people-who-built-it)

### 最佳实践 E：

- **标题：一次聚焦一个任务**

- **描述：**
  明确本轮的工作阶段和任务边界，按可独立验证的需求切片推进，每次完成一件相关且完整的事。

- **GoodCase：**

  > 按 @specs/invite/plan.md 完成第一阶段：管理员发出邀请、受邀人接受、成员权限生效，并补齐相关测试。本轮不做批量邀请和管理看板；完成后汇报变更与验证结果，再进入下一阶段。

- **BadCase：**
  > 邀请功能全部做完，顺便重构权限模块、优化首页、升级依赖，再把部署也处理一下。

- **参考依据：**
  Addy Osmani 按计划逐项实现和验证；VS Code 官方建议从边界明确、结果可观察的任务开始。[AddyOsmani.com](https://addyosmani.com/blog/ai-coding-workflow/)

### 最佳实践 F：

- **标题：重复流程调用 Skill**

- **描述：**
  对已验证有效的评审、测试、提交等重复流程，直接调用对应 Skill，并补充本次对象、范围与限制。

- **GoodCase：**

  > /architecture-review @specs/invite/design.md
  > 本轮只评审，不实现。重点检查多租户隔离、重复接受邀请和权限生效时序，按该 Skill 的格式输出问题与证据。

- **BadCase：**
  > 评审一下这份方案，按我们上次说的那套流程来，你应该记得。
  > （新会话中未提供流程，也未引用对应 Skill。）

- **参考依据：**
  Boris Cherny 把频繁执行的提交和 PR 工作封装成命令。[Thread Reader App](https://threadreaderapp.com/thread/2007179832300581177.html)
  调用方式随工具区分：Claude Code 使用 `/skill-name`，Codex CLI、IDE 扩展使用 `$skill-name`；需要采用特定团队流程时可直接点名。[Claude](https://code.claude.com/docs/en/skills)

### 最佳实践 G：

- **标题：让工具补齐事实**

- **描述：**
  提供数据源、环境、时间范围等定位条件，让 AI 在工具授权范围内读取日志、监控或设计资料后再判断。

- **GoodCase：**

  > 使用已接入的日志工具，只读查询测试环境 checkout 服务最近 30 分钟与 traceId `abc123` 相关的请求，结合仓库调用链定位 500 的原因。先给证据与修复建议，不修改远端配置；无法访问就说明缺少什么。

- **BadCase：**
  > 去看看线上哪里有问题，能用的工具都用上，直接修好。

- **参考依据：**
  Boris 的工作流包含读取 Sentry 日志和查询数据；Anthropic 数据团队强调受控访问，权限范围应落实到工具配置。[Thread Reader App](https://threadreaderapp.com/thread/2007179832300581177.html)

### 最佳实践 H：

- **标题：把验收写进 Prompt**

- **描述：**
  提前写清要验证的行为、要运行的检查和要提交的证据，让完成标准可以实际检验。

- **GoodCase：**

  > 修复过期邀请仍能被接受的问题。先新增能在旧实现上失败的回归用例，再修复并运行相关测试和类型检查。最后给出实际执行命令、结果及未验证项；不要通过删除测试或放宽断言让结果变绿。

- **BadCase：**
  > 实现后自己检查一下，确保没有 Bug，可以直接上线。

- **参考依据：**
  Steve Sewell 使用“写测试、实现、运行、修复”的指令；Claude Code 官方强调执行检查并展示结果。[Builder.io](https://www.builder.io/blog/cursor-tips)

### 最佳实践 I：

- **标题：用证据反馈问题**

- **描述：**
  反馈复现步骤、实际与预期结果及运行证据，将自己的根因判断标成待验证假设。

- **GoodCase：**

  > 仍能复现：对同一个邀请码并发发送两次接受请求，会创建两条成员记录；预期只能有一个成员关系。@artifacts/repro.log 是刚才执行的日志。先验证并发与幂等假设，再做最小修复，不要先加重试。

- **BadCase：**
  > 还是不行，肯定是缓存的问题。把缓存删掉，不行就加重试。

- **参考依据：**
  Cursor Debug Mode 采用先提出假设、再用运行日志验证、最后验证修复的流程。[Cursor](https://cursor.com/blog/debug-mode)

### 最佳实践 J：

- **标题：跑偏就停，必要时重开**

- **描述：**
  反复纠偏无效或切换任务时先停下来，整理已确认事实和有效修改，再决定继续当前会话或带着交接信息重开。

- **GoodCase：**

  > 当前会话：把已确认需求、修改文件、已排除假设、测试结果和下一步写入 `specs/invite/handoff.md`，暂不继续修改。
  > 新会话：@specs/invite/handoff.md 继续这个任务。先核对当前代码差异，保留有效修改，不再尝试交接文档中已排除的方案。

- **BadCase：**
  > 在已经混杂多个需求和多轮失败修复的会话里继续输入：“还是不对，再试一次。顺便把另一个问题也修了。”

- **参考依据：**
  Cursor 区分正常迭代与需要重开的情况；Claude Code 建议纠偏无效时用吸收新信息的 Prompt 重新开始，并支持定向压缩上下文；重开会话不等于撤销代码。[Cursor](https://cursor.com/blog/agent-best-practices)
