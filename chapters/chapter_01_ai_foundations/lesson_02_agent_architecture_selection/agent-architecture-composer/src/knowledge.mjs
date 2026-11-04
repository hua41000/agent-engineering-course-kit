export const EDITION = '2026-09-22-preview';
export const COURSE = '企业级Agent工程架构实战营';
const options = (rows) => rows.map(([value, label, hint]) => ({ value, label, hint }));
export const QUESTIONS = [
  { id:'existing', group:0, title:'现在的系统处于什么阶段？', why:'先识别可以保留的资产，避免为换架构而重写。', options:options([['new','从零开始','还没有稳定实现'],['stable','已有系统，基本好用','希望扩展能力'],['limited','已有系统遇到瓶颈','流程、成本或效果需要改善']]) },
  { id:'language', group:0, title:'主要使用什么技术栈？', why:'语言影响实现候选，业务控制边界可以保持稳定。', options:options([['python','Python','数据与后端生态'],['typescript','TypeScript','Web 与全栈应用'],['dotnet','.NET','现有企业系统'],['other','其他语言','复用现有服务接口']]) },
  { id:'semantic', group:1, title:'任务需要模型理解或生成内容吗？', why:'能用确定规则完成的部分，优先复用普通代码。', options:options([['yes','需要语义理解','非结构化材料、解释、判断或生成'],['no','规则就能完成','已知公式、字段映射、固定校验']]) },
  { id:'path', group:1, title:'下一步的处理路径，能提前写清吗？', why:'路径与决策权决定顶层架构；Graph 本身不决定谁做主。', options:options([['fixed','步骤基本固定','按既定顺序完成'],['routing','出口有限','按类型进入已知分支'],['local','大流程固定，局部要探索','如退款流程中的材料补全'],['open','需要边做边决定','新结果会改变调查方向'],['compiled','先动态生成计划，再执行','计划需要校验后交给流程运行']]) },
  { id:'feedback', group:1, title:'是否需要模型根据新结果改变策略？', why:'固定重试和已知分支可以用代码；开放策略调整才需要持续模型决策。', options:options([['yes','需要模型重新判断','换假设、换工具或增加调查'],['no','已知规则足够','按响应状态重试或固定分支']]) },
  { id:'planning', group:1, title:'任务有多长的依赖链？', why:'Plan 管理长程依赖，ReAct 处理局部反馈。', options:options([['short','一步或少量步骤','一个短循环就够'],['long','多个阶段与里程碑','需要计划和调整先后关系']]) },
  { id:'parallel', group:1, title:'子任务怎样拆分？', why:'并行需要独立性、汇总规则和部分失败处理。', options:options([['none','顺序做就好','结果依赖前一步'],['fixed','可提前分成独立任务','按地区、文档或已知维度并行'],['dynamic','做的时候才知道要拆什么','动态发现专题或调查方向']]) },
  { id:'isolation', group:1, title:'需要其他 Agent 参与吗？', why:'先明确上下文或职责分工，再增加 Agent 数量。', options:options([['none','一个执行者足够','工具和普通并发可处理'],['tool','独立子任务，完成后返回','主 Agent 保留最终责任'],['handoff','专业角色持续接管','如客服分诊后换负责人'],['group','需要多角色反复协商','必须有汇总者和轮次上限']]) },
  { id:'verifier', group:2, title:'怎样判断结果足够好？', why:'检查方式决定修订循环是否有用，也决定何时停止。', options:options([['automatic','规则、数据或测试检查','有可执行的完成标准'],['human','由人检查','有明确的审阅负责人'],['weak','目前主要靠模型自评','完成标准还不清晰']]) },
  { id:'effect', group:2, title:'会对外部系统产生什么影响？', why:'分析建议与真实写入可以使用不同控制结构。', options:options([['read','只读分析或生成建议','不提交业务动作'],['write','会写入、发布或执行','退款、预算、发布或系统变更']]) },
  { id:'approval', group:2, title:'真实执行的授权边界准备好了吗？', why:'授权应绑定具体动作，执行接口落实权限和参数约束。', when:'write', options:options([['ready','已有受控执行入口','权限、授权和结果查询有明确位置'],['planned','准备建设','目前只有方案'],['missing','还没有','模型可能直接调用写入接口']]) },
  { id:'recovery', group:2, title:'任务中断或等待后，需要怎样继续？', why:'运行记录、持久等待和业务补偿承担不同责任。', options:options([['short','短任务，可以重新开始','先保持简单进程'],['resume','需要保存进度','中断后继续同一任务'],['durable','跨日审批或跨系统等待','需要持久执行与恢复']]) },
  { id:'team', group:2, title:'团队更适合怎样维护主控层？', why:'自研薄 Harness 带来控制力，也需要维护 Loop、状态与上下文。', options:options([['lean','优先交付，减少自维护','希望复用成熟框架'],['control','需要深度定制且有人维护','愿意掌握主循环和领域契约']]) },
  { id:'priority', group:2, title:'当前最重要的取舍是什么？', why:'在可行结构之间比较交付速度、控制力和运行成本。', options:options([['delivery','尽快做出可用版本','从轻量结构开始'],['control','控制权与可替换性','减少业务对框架对象的绑定'],['cost','成本与延迟','减少重复模型调用和无效循环']]) },
  { id:'deployment', group:2, title:'部署环境有什么约束？', why:'候选的模型、遥测和外部依赖需要匹配部署环境。', options:options([['flexible','可按项目选择','允许云服务和外部模型'],['private','需要私有环境','数据与网络出口要受控']]) }
];
// Questions describe project properties. Scenario IDs are never decision inputs.
const extraQuestion=(id,group,title,why,rows,when)=>({id,group,title,why,options:options(rows),...(when?{when}:{})});
const upgrade={field:'existing',values:['stable','limited']};
QUESTIONS.find(q=>q.id==='language').group=4;
for(const id of ['verifier','effect','approval','recovery'])QUESTIONS.find(q=>q.id===id).group=3;
for(const id of ['team','priority','deployment'])QUESTIONS.find(q=>q.id===id).group=4;
QUESTIONS.push(
 extraQuestion('industry',0,'项目属于哪个行业？','行业用于理解背景、提示需确认的约束。实际风险和数据要求由后续回答决定。',[
 ['general','通用企业服务','办公、管理与内部工具'],['retail','零售与电商','交易、商品、经营'],['finance','金融与保险','服务、分析与业务操作'],['health','医疗与健康','运营、知识与专业工作'],['manufacturing','制造与物流','生产、供应链与设备'],['education','教育与科研','教学、研究与知识服务'],['public','政务与公共服务','公众服务与组织流程'],['other','其他 / 跨行业','直接描述你的领域']]),
 extraQuestion('business',0,'核心业务任务属于哪一类？','选择最主要的交付结果；组合任务可以在阶段中拆开。',[
 ['analysis','分析与研究','解释现象、比较方案'],['content','内容与信息加工','提取、生成、转换'],['service','咨询与服务','回答问题、持续服务用户'],['operations','流程与业务操作','完成跨步骤工作'],['decision','辅助专业决策','给出由负责人采用的建议'],['other','其他 / 组合任务','按实际阶段分析']]),
 extraQuestion('interaction',0,'任务由谁、以什么方式发起？','决定入口、状态范围与交付方式。',[
 ['copilot','人使用中的辅助能力','嵌入已有界面'],['chat','持续对话','多轮沟通与任务状态'],['event','系统事件触发','订单、告警或消息'],['batch','定时或批量处理','异步任务与集中交付']]),
 extraQuestion('current',2,'已有系统怎样安排任务？','识别需要保留的主控和新增能力的位置。',[
 ['traditional','普通业务应用','接口、规则或人工流程'],['workflow','已有 Workflow / 工作流','步骤和状态已经显式管理'],['agent','已有 Agent 系统','已有模型循环与工具'],['mixed','多系统混合','需要跨服务对接']],upgrade),
 extraQuestion('change',2,'这次允许改动多大范围？','改造路线要匹配实际权限与切换成本。',[
 ['extension','只增加能力','核心系统和主流程保留'],['partial','可以替换局部','接口兼容，逐步切换'],['replace','允许整体重构','仍需数据与运行迁移']],upgrade),
 extraQuestion('bottleneck',2,'现有系统最主要的问题是什么？','把改动集中在已发生的问题上。',[
 ['quality','结果质量不足','理解、检索或输出不稳定'],['flow','流程难以适应变化','分支和策略变化多'],['integration','数据或工具接不通','上下文和接口缺失'],['cost','成本或延迟过高','调用多、循环长'],['scale','运行稳定性或规模','中断、并发、等待']],{field:'existing',values:['limited']}),
 extraQuestion('dataSource',2,'完成任务主要依赖哪些信息？','数据形态决定上下文与工具层的组合。',[
 ['input','用户当次提供的信息','无需额外知识源'],['documents','文档与知识库','非结构化资料'],['structured','数据库和业务记录','指标、订单与结构化查询'],['mixed','多种数据组合','文档与业务事实交叉使用'],['live','实时事件或设备信号','时效、时间窗与状态']],),
 extraQuestion('dataReady',2,'这些信息现在能稳定获取吗？','先判断任务是否有足够输入，再设计自主程度。',[
 ['ready','可以稳定获取','接口、权限和基本质量具备'],['partial','部分可用','需要补数据、清洗或授权'],['blocked','关键数据尚不可用','主要输入缺失或无访问权']]),
 extraQuestion('integration',2,'需要连接的系统提供什么入口？','接入成熟度决定工具适配和可自动化的范围。',[
 ['none','无需连接外部系统','只处理当次输入'],['api','稳定 API 或受控工具','有清楚的输入输出'],['partial','部分接口可用','还需要补适配层'],['ui','主要通过界面操作','缺少稳定接口']]),
 extraQuestion('risk',3,'错误结果或操作会造成多大影响？','分析建议也可能影响重要决定；风险不只来自写入。',[
 ['low','影响较小且容易恢复','草稿、查询与内部辅助'],['material','有明显业务损失','客户体验、费用或流程结果'],['critical','涉及重大权益或不可逆损失','需要专业负责人和明确授权']]),
 extraQuestion('autonomy',3,'允许系统独立完成到哪一步？','目标自动化程度与模型探索能力分别设置。',[
 ['advisory','只给建议或草稿','由人执行后续动作'],['approval','关键动作逐次确认','人批准后才能执行'],['bounded','在明确范围内自动执行','限定额度、对象与工具'],['full','希望端到端自动完成','仍需明确权限与停止边界']],{kind:'execution'}),
 extraQuestion('dataPolicy',3,'输入包含怎样的数据边界？','影响模型部署、检索权限和日志保存。',[
 ['open','公开或无敏感内容','按项目选择服务'],['internal','组织内部信息','访问权限、租户与日志隔离'],['restricted','严格受限的信息','端点、外发和存储需逐项确认']]),
 extraQuestion('oversight',3,'项目已经确定哪些监督要求？','记录实际项目要求，工具不根据行业名推断法规。',[
 ['normal','常规运行记录','可查输入、输出与错误'],['audited','需要追踪与复核','保留决策、批准与运行记录'],['strict','有强制人工或规则关口','关键终态必须经过指定控制']]),
 extraQuestion('latency',4,'结果需要多快返回？','交互等待、后台任务与硬实时控制采用不同执行路径。',[
 ['interactive','用户等待中返回','控制串行调用与超时'],['async','允许后台完成','先返回任务编号，再交付结果'],['realtime','有严格实时截止时间','例如设备控制或实时交易链路']]),
 extraQuestion('load',4,'预计的运行负载是什么样？','影响队列、隔离、限流和状态存储；不直接决定 Agent 数量。',[
 ['pilot','少量试用','先保持简单部署'],['steady','持续多用户使用','需要并发隔离与稳定配额'],['burst','批量或突发高峰','需要排队、背压和限流']]),
 extraQuestion('budget',4,'模型调用费用的约束有多强？','控制调用和上下文成本，不给出未经测量的价格承诺。',[
 ['tight','费用严格受限','优先固定路径、缓存与调用上限'],['balanced','质量与费用平衡','按任务限制预算'],['quality','质量优先','允许更多调用，仍设总预算']]),
 extraQuestion('horizon',4,'当前要交付到什么阶段？','探索原型和生产改造的实施顺序不同。',[
 ['prototype','先验证可用性','最小链路和代表任务'],['production','需要进入真实业务','运行、发布与回退职责明确']])
);
// Coexisting requirements are sets; priorities and boundary levels remain single choices.
const multipleQuestions=['industry','business','interaction','path','parallel','isolation','verifier','effect','current','bottleneck','dataSource','integration','latency','language'];
for(const q of QUESTIONS)q.multiple=multipleQuestions.includes(q.id);
const questionUpdates={
 industry:{title:'项目涉及哪些行业？'},
 business:{title:'产品需要支持哪些业务任务？',why:'选择所有需要支持的任务；后续按任务路径组合能力，首期范围可在实施时收窄。'},
 path:{title:'产品需要支持哪些处理路径？',why:'可为不同任务选择多条路径。系统按任务路由组合，具体阶段可进一步指定路径。'},
 language:{title:'哪些技术栈需要承载 Agent 能力？',why:'可选择多个服务的语言；候选分别标注适用语言，不要求每个框架覆盖所有语言。'},
 bottleneck:{title:'现有系统有哪些需要解决的问题？'},
 dataSource:{title:'完成任务需要哪些信息来源？',legacyValues:{mixed:['documents','structured']}},
 parallel:{exclusive:['none'],why:'独立任务可同时包含固定并行和动态分工；“顺序做就好”与两者互斥。'},
 isolation:{exclusive:['none'],why:'可组合独立子任务、专业接管与协商；“一个执行者足够”与这些需求互斥。'},
 verifier:{exclusive:['weak'],why:'可以同时使用自动检查和人工复核；仅靠模型自评时需先补完成标准。'},
 integration:{exclusive:['none'],why:'按实际接口组合 API、适配层与界面操作；无需外接与其他选项互斥。'},
 risk:{why:'按本次范围内最高影响填写；各阶段的具体风险在实施前分别确认。'},
 dataPolicy:{why:'按本次范围内最严格的数据边界填写，进一步明确不同数据的访问范围。'},
 recovery:{why:'按最强恢复需求填写；短任务可保留简单执行方式。'},
 latency:{title:'不同任务有哪些响应时间要求？',why:'可同时支持同步交互、后台任务与实时路径，分别安排执行方式。'}
};
for(const [id,patch] of Object.entries(questionUpdates))Object.assign(QUESTIONS.find(q=>q.id===id),patch);
QUESTIONS.find(q=>q.id==='dataSource').options=QUESTIONS.find(q=>q.id==='dataSource').options.filter(o=>o.value!=='mixed');
QUESTIONS.find(q=>q.id==='dataSource').options.find(o=>o.value==='input').hint='本次请求、材料或表单';
QUESTIONS.find(q=>q.id==='business').options.find(o=>o.value==='other').label='其他任务';
QUESTIONS.find(q=>q.id==='effect').options.find(o=>o.value==='read').label='分析或生成建议';
QUESTIONS.find(q=>q.id==='effect').options.find(o=>o.value==='read').hint='这类任务不提交业务动作，可与写入类任务并存';
QUESTIONS.sort((a,b)=>a.group-b.group);
export const INDUSTRY_PROMPTS={
 general:'确认组织访问范围和现有业务流程。',retail:'确认客户数据、价格或订单动作的权限，以及业务高峰。',
 finance:'确认这项任务涉及哪些业务权限、数据边界和专业复核要求。',health:'区分运营辅助与专业判断，确认数据范围和最终责任人。',
 manufacturing:'区分后台分析与设备实时控制，确认实时截止时间。',education:'确认使用者范围、内容要求以及是否包含受限个人数据。',
 public:'确认服务对象、数据访问范围和已确定的审批要求。',other:'按具体任务填写后续维度，未列出的领域同样适用。'
};
export const PATTERNS = [
  ['deterministic','Deterministic code','用函数、SQL、规则和状态机完成已知任务。','规则稳定，无需语义推理','规则变化由应用维护'],
  ['llm','LLM Feature','把理解或生成放在一个有边界的调用中。','单次语义处理足够','结构正确仍需检查内容'],
  ['chain','Prompt Chaining','把稳定阶段串成可检查的步骤。','阶段输入输出明确','前序错误可能继续传播'],
  ['router','Routing','在有限且已知的出口之间选择。','出口稳定，有未知类别回退','模型不能创造越权出口'],
  ['parallel','Parallelization','并发处理可独立完成的子问题。','状态隔离，合并规则清楚','注意部分失败、重复统计和成本'],
  ['workers','Orchestrator-Workers','运行时拆分子任务并统一汇总。','任务数量动态，分工有边界','限制数量、去重并保留最终负责人'],
  ['evaluator','Evaluator-Optimizer','用明确反馈改进产物，达到条件即停止。','检查能提供可操作反馈','避免同源自评和无限循环'],
  ['island','Agentic Island','在固定流程中开放一个有界探索区。','主流程与业务终态稳定','超时或失败需要归还控制权'],
  ['react','ReAct','依据新观察选择下一步行动。','模型需要在运行时调整策略','限制轮次、工具与重复失败'],
  ['plan','Plan-and-Execute','先安排依赖和里程碑，再执行步骤。','有长程依赖','计划需要与实际进展同步'],
  ['replan','Replanning','新结果推翻假设时修改计划。','里程碑结果会影响后续步骤','只修改受影响部分，避免重复工作'],
  ['reflection','Verifier-Guided Reflection','根据检查结果修正假设或策略。','有外部检查或人工反馈','缺少新信息时应停止或补问'],
  ['tool','Agent-as-Tool','专业子 Agent 完成有界任务后返回。','需要独立上下文或专业职责','调用者负责最终汇总'],
  ['handoff','Handoff','把后续会话控制权交给新负责人。','接收角色需要持续处理','明确权限、上下文和责任的移交'],
  ['group','Group Chat / Supervisor','多角色协商，由主控管理分工和汇总。','确有协商或动态派工收益','限制发言次数和重复上下文'],
  ['workflowTool','Workflow-as-Tool','将稳定查询、计算与业务步骤封装为能力。','开放任务反复调用稳定步骤','输入输出与失败语义保持独立'],
  ['compiled','Plan-to-Workflow','模型产生受限计划，校验后交给执行器。','计划需要显式检查与持久执行','只允许注册节点，限制动态权限'],
  ['harness','Thin Harness','组合计划、工具、上下文、运行状态与预算。','较长自主任务有持续工作环境需求','保持应用层轻薄，复用成熟基础设施'],
  ['approval','Controlled Action Workflow','把授权、参数核验和确定性执行串起来。','存在真实业务副作用','幂等、结果查询和失败处理独立落实'],
  ['runtime','Durable Runtime','管理跨时间等待、恢复和执行协调。','长等待或跨系统恢复','保存状态不等于撤销已发生的业务动作']
].map(([id,name,description,when,cost])=>({id,name,description,when,cost}));
export const ARCHITECTURES = {
  software:{name:'传统确定性软件',en:'Deterministic software',summary:'让普通代码处理已知规则，用清楚的输入输出和状态管理完成任务。'},
  feature:{name:'LLM Feature',en:'Bounded model capability',summary:'在现有应用中增加一个有边界的模型能力，流程继续由应用控制。'},
  workflow:{name:'Workflow 主导',en:'Workflow-dominant',summary:'由代码安排主要步骤与分支，模型负责其中的理解、分类或生成。'},
  workflowHybrid:{name:'Workflow-first Hybrid',en:'Bounded exploration',summary:'业务流程掌握终态，在局部开放探索区，并在完成或失败后收回控制权。'},
  autonomous:{name:'Autonomous Agent',en:'Observation-driven loop',summary:'模型根据观察选择下一步，用少量工具和明确停止条件完成开放任务。'},
  autonomousHybrid:{name:'Autonomous-first Hybrid',en:'Agent-led, workflow-backed',summary:'Agent 规划与调整路径，稳定查询、计算和业务动作沉淀为可调用 Workflow。'},
  dynamic:{name:'Dynamic Hybrid',en:'Plan, validate, execute',summary:'模型生成受限任务计划，校验后交给流程执行器；变更继续经过同一边界。'}
};
export const SCENARIOS = [
  {id:'data',name:'DataAgent',icon:'↗',desc:'经营分析与异常调查',goal:'分析 GMV 下滑原因，给出可回查的解释与经营建议。',answers:{semantic:'yes',path:'open',feedback:'yes',planning:'long',parallel:'dynamic',isolation:'tool',verifier:'automatic',effect:'read',recovery:'resume',team:'control',priority:'control',language:'python',existing:'new',deployment:'flexible'},stages:['确认指标与目标','查询与多维调查','汇总解释与建议']},
  {id:'extract',name:'结构化抽取',icon:'▤',desc:'从材料得到标准字段',goal:'从业务文档抽取标准字段，检查格式并返回结构化结果。',answers:{semantic:'yes',path:'fixed',feedback:'no',planning:'short',parallel:'none',isolation:'none',verifier:'automatic',effect:'read',recovery:'short',team:'lean',priority:'cost',language:'python',existing:'new',deployment:'flexible'},stages:['读取材料','抽取字段','字段检查']},
  {id:'rag',name:'知识问答',icon:'⌕',desc:'检索资料并形成回答',goal:'检索企业知识，给出有资料依据的回答，资料不足时说明缺口。',answers:{semantic:'yes',path:'routing',feedback:'no',planning:'short',parallel:'none',isolation:'none',verifier:'human',effect:'read',recovery:'short',team:'lean',priority:'delivery',language:'python',existing:'new',deployment:'private'},stages:['理解与路由','检索资料','回答与来源检查']},
  {id:'support',name:'客服咨询',icon:'◎',desc:'分诊与专业角色接管',goal:'识别客户问题，交给专业角色处理，复杂情况返回人工。',answers:{semantic:'yes',path:'local',feedback:'yes',planning:'short',parallel:'none',isolation:'handoff',verifier:'human',effect:'read',recovery:'resume',team:'lean',priority:'delivery',language:'typescript',existing:'stable',deployment:'flexible'},stages:['请求分诊','专业问题处理','汇总或转人工']},
  {id:'refund',name:'退款与理赔',icon:'↩',desc:'规则流程中的局部探索',goal:'核对退款材料，处理缺项，经过业务授权后执行退款。',answers:{semantic:'yes',path:'local',feedback:'yes',planning:'long',parallel:'none',isolation:'none',verifier:'automatic',effect:'write',approval:'planned',recovery:'durable',team:'lean',priority:'control',language:'python',existing:'stable',deployment:'private'},stages:['受理与规则核对','补充材料与解释','授权与退款执行']},
  {id:'research',name:'Deep Research',icon:'✳',desc:'分解课题与持续调查',goal:'围绕研究主题分解问题，查找资料，比较解释并形成研究报告。',answers:{semantic:'yes',path:'open',feedback:'yes',planning:'long',parallel:'dynamic',isolation:'tool',verifier:'human',effect:'read',recovery:'resume',team:'lean',priority:'delivery',language:'python',existing:'new',deployment:'flexible'},stages:['拆分研究问题','调查与调整假设','形成研究报告']},
  {id:'coding',name:'Coding Agent',icon:'⌘',desc:'在工作区编辑与迭代',goal:'在指定代码范围内完成需求，根据检查结果调整实现，交付可审阅变更。',answers:{semantic:'yes',path:'open',feedback:'yes',planning:'long',parallel:'dynamic',isolation:'tool',verifier:'automatic',effect:'write',approval:'planned',recovery:'resume',team:'lean',priority:'delivery',language:'typescript',existing:'stable',deployment:'flexible'},stages:['理解需求与代码','编辑与迭代','审阅与提交']},
  {id:'transaction',name:'高风险业务动作',icon:'◇',desc:'建议、授权与执行分开',goal:'根据业务信息生成操作建议，授权后由确定性服务执行并查询结果。',answers:{semantic:'yes',path:'fixed',feedback:'no',planning:'long',parallel:'none',isolation:'none',verifier:'automatic',effect:'write',approval:'missing',recovery:'durable',team:'control',priority:'control',language:'dotnet',existing:'stable',deployment:'private'},stages:['生成动作建议','规则核验与授权','执行与查询结果']},
  {id:'longrun',name:'跨系统长任务',icon:'⇄',desc:'计划、等待与恢复',goal:'跨多个系统完成任务，动态安排步骤，等待外部输入后继续执行。',answers:{semantic:'yes',path:'compiled',feedback:'yes',planning:'long',parallel:'dynamic',isolation:'tool',verifier:'automatic',effect:'write',approval:'planned',recovery:'durable',team:'control',priority:'control',language:'python',existing:'new',deployment:'private'},stages:['生成与校验计划','分步执行与等待','汇总与业务核对']}
];
export const FRAMEWORKS = [
 {id:'native',name:'原生 SDK + 薄主控',layer:'应用主控',languages:['python','typescript','dotnet','other'],fit:'核心循环需要深度定制，团队愿意维护领域契约。',cost:'自行维护 Loop、上下文、状态和 Provider 差异。',url:null},
 {id:'pydantic',name:'PydanticAI',layer:'Agent SDK',languages:['python'],fit:'Python 类型化工具、结构化输出与 Agent 调用。',cost:'仍需自己设计业务权限、状态与部署边界。',url:'https://ai.pydantic.dev/'},
 {id:'langgraph',name:'LangGraph',layer:'Workflow / Graph',languages:['python','typescript'],fit:'希望显式表达状态、路径和恢复节点。',cost:'需要管理图状态与业务对象的耦合。',url:'https://docs.langchain.com/oss/python/langgraph/overview'},
 {id:'agents',name:'OpenAI Agents SDK',layer:'Agent SDK',languages:['python','typescript'],fit:'使用工具循环、Agent-as-Tool 或 Handoff。',cost:'部署、业务授权和复杂持久执行仍需应用组合。',url:'https://openai.github.io/openai-agents-python/'},
 {id:'mastra',name:'Mastra',layer:'Agent / Workflow',languages:['typescript'],fit:'TypeScript 应用中组合 Agent 与 Workflow。',cost:'检查工作流状态和部署方式对现有系统的影响。',url:'https://mastra.ai/docs'},
 {id:'microsoft',name:'Microsoft Agent Framework',layer:'Agent / Workflow',languages:['python','dotnet'],fit:'.NET 或微软生态的 Agent 与流程候选。',cost:'具体语言版本和子能力需要对照官方文档确认。',url:'https://learn.microsoft.com/agent-framework/'},
 {id:'adk',name:'Google ADK',layer:'Agent / Workflow',languages:['python','typescript'],fit:'Google 生态中的 Agent 与工作流候选。',cost:'不同语言能力存在差异，接入前核对。',url:'https://google.github.io/adk-docs/'},
 {id:'crewai',name:'CrewAI',layer:'Coordination',languages:['python'],fit:'以角色、任务和 Flow 组织协作。',cost:'确认角色数量与协调成本确有收益。',url:'https://docs.crewai.com/'},
 {id:'llamaindex',name:'LlamaIndex Workflows',layer:'Data / Workflow',languages:['python'],fit:'检索和数据处理链路中的事件工作流候选。',cost:'数据层与编排层分别评估耦合。',url:'https://developers.llamaindex.ai/'},
 {id:'harness',name:'成熟 Agent Harness',layer:'Harness',languages:['python','typescript'],fit:'代码或研究任务需要工作区、工具与上下文管理。',cost:'检查平台、Provider、权限和会话的绑定；如 Claude Agent SDK、Deep Agents。',url:null}
];
export const PRINCIPLES = [
 ['路径稳定','Chain / Router','把已知步骤写清，保留未知出口。'],['子任务独立','Parallel','检查共享状态、合并和部分失败。'],['运行时才知道如何拆分','Orchestrator-Workers','限制分工范围、数量与总预算。'],['模型需要随反馈改策略','ReAct','固定重试仍由普通代码负责。'],['长程依赖明显','Plan-and-Execute','按里程碑更新计划。'],['结果可以检查和改进','Evaluator','明确检查方式和停止条件。'],['职责或上下文需要隔离','Delegation','明确接管者、返回位置和最终责任。'],['存在真实业务动作','受控 Workflow','授权与确定性执行保持明确边界。']
];
