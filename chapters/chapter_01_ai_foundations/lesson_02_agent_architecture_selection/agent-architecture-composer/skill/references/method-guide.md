# 方法要点

从业务终态开始，分解任务阶段，再确定控制权、模式和技术承载。候选包括传统软件、单次 LLM Feature、Workflow、Autonomous 与 Hybrid。Graph 描述状态和路径表达，多 Agent 描述协作拓扑。

稳定路径使用 Chain 或有限 Router；独立子任务才并行；运行时才明确的子任务使用 Orchestrator-Workers。Evaluator 要有可操作反馈和停止条件。开放策略选择用 ReAct，长程依赖加 Plan，里程碑失败触发 Replan。Reflection 依赖新信息，不能只重复自评。

外层流程固定且局部开放，采用 Workflow-first；开放调查主导、稳定能力可工具化，采用 Autonomous-first；计划需要校验后执行时采用 Dynamic Hybrid。专业子任务返回使用 Agent-as-Tool；持续接管使用 Handoff；协商需要最终汇总者。完整 Harness 用于工作环境、计划、上下文与工具的组合需求。

交接写清输入、权限、允许工具、状态所有权、预算、完成标准、结果、失败处理和返回对象。真实业务动作通过受控执行接口，必要时增加人工审批；保存运行状态不等于补偿业务动作。

按 Model SDK、Agent Loop、Workflow/Graph、协作、Harness、Runtime 六层比较承载责任。团队有维护能力且主控高度定制时可自研薄层；优先复用数据库、计算、身份与持久执行等成熟组件。现有方案能满足需求时先保留。

方案至少包含：业务目标与现状、推荐与理由、各阶段控制权、模式组合、框架路线和代价、备选、实施顺序与待澄清项。提供足够具体的结论，不主动扩展为复杂证据审计或大型测试工程。
