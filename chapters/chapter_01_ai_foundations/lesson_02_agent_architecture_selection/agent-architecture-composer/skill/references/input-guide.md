# Session 输入约定

`template` 和 `questions` 命令提供当前完整字段与选项，不需要猜字段名称。Web 与 Skill 使用相同的 JSON。

```json
{
  "schema_version": 2,
  "name": "经营分析助手",
  "goal": "分析异常并给出经营建议",
  "existingStack": "Python API，已有指标查询服务",
  "notes": "主入口见 app/main.py；业务授权边界仍需确认",
  "scenario": "custom",
  "answers": {
    "existing": "stable",
    "language": [
      "python"
    ],
    "semantic": "yes",
    "path": [
      "open"
    ],
    "feedback": "yes",
    "planning": "long",
    "parallel": [
      "dynamic"
    ],
    "isolation": [
      "tool"
    ],
    "verifier": [
      "automatic"
    ],
    "effect": [
      "read"
    ],
    "approval": "unknown",
    "recovery": "resume",
    "team": "control",
    "priority": "control",
    "deployment": "private"
  },
  "stages": [
    {
      "name": "确认指标",
      "path": "fixed",
      "effect": "read"
    },
    {
      "name": "自主调查",
      "path": "inherit",
      "effect": "read"
    },
    {
      "name": "汇总建议",
      "path": "fixed",
      "effect": "read"
    }
  ]
}
```

所有回答允许 `unknown`；省略回答等同未知。阶段最多 12 个，按数组顺序表达主要处理阶段。阶段 `path` 为 `inherit/fixed/routing/local/open/compiled`，`effect` 为 `inherit/read/write`；`inherit` 使用整体回答。阶段的写入会激活授权问题，即使整体选择只读。

新增维度包含 `industry`、`business`、`interaction`、`current`、`change`、`bottleneck`、`dataSource`、`dataReady`、`integration`、`risk`、`autonomy`、`dataPolicy`、`oversight`、`latency`、`load`、`budget`、`horizon`。完整枚举和条件以 `node <skill-dir>/scripts/composer.mjs guide` 的 questions 为准；`questions --input` 提供当前需澄清的有效分支。

`industryDetail` 保存自定义行业，`businessDetail` 保存具体业务环节与使用者。输出 schema_version 为 2；导入支持 v1 和 v2，旧 Session 的新增问题默认为 unknown。选择新建会隐藏 current/change/bottleneck；它们的旧值可保留，内核会忽略。切换回已有系统可恢复这些回答。

行业字段只影响澄清提示；scenario 只用于示例标记。不能根据行业名称或模板名填入未经确认的数据政策、风险或授权答案。

`approval: ready` 表示用户确认已有受控执行入口，仍需按业务要求核对具体动作的授权。自由文本的目标、系统描述和 notes 随报告保留；脚本按结构化回答选择，宿主负责解释自由文本并确认关键事实。

## 多选与单选

`guide` 与 `questions` 返回 `multiple` 和 `exclusive`。多选题包括 industry、business、interaction、path、parallel、isolation、verifier、effect、current、bottleneck、dataSource、integration、latency、language；使用数组，例如 `business: ["analysis", "service"]`、`dataSource: ["documents", "structured"]`。旧字符串自动转换为单元素数组；旧 `dataSource: "mixed"` 转换为文档和结构化数据。空数组视为 unknown；重复值去重并固定顺序。

`unknown` 单独使用，不能放入已选数组。parallel/isolation 的 none、integration 的 none、verifier 的 weak 为排他项，不能与本题其他选项组合。其余题目保持单字符串：风险取范围内最高影响，数据政策取最严格边界，恢复能力取最强需求，优先级取当前首要取舍。

多路径报告的 pathVariants 表示按任务类型选用的路径，不表示阶段执行顺序。补问任务与路径的对应关系，阶段可显式覆盖整体路径。框架的 matchedLanguages 只表示该候选适用的已选语言，按服务组合，不要求单一框架覆盖全部技术栈。自动检查与人工复核可并存；只读与写入并存时，写入条件仍须满足。
