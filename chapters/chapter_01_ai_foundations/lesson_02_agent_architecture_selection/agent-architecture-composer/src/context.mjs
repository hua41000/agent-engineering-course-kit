import { QUESTIONS, INDUSTRY_PROMPTS } from './knowledge.mjs';
import { answerValues, hasAnswer, answerLabel } from './answers.mjs';

// No scenario lookup here: every rule consumes project properties.
export function assessContext(s, a) {
  const dimensions=[],components=[],conditions=[];
  const label=id=>answerLabel(id,a[id]);
  const texts=(id,map)=>answerValues(a[id]).map(v=>map[v]).filter(Boolean);
  const describe=(id,map)=>{const impact=texts(id,map).join(' ');if(impact)add(id,impact);};
  const combine=(id,map)=>{const rows=texts(id,map);for(const row of rows)component(...row);if(rows.length)add(id,rows.map(row=>row[1]).join(' '));};
  const add=(id,impact)=>dimensions.push({id,title:QUESTIONS.find(q=>q.id===id).title,answer:label(id),impact});
  const component=(name,detail)=>{const existing=components.find(c=>c.name===name);if(existing){if(!existing.detail.includes(detail))existing.detail+=' '+detail;}else components.push({name,detail});};
  if(a.industry!=='unknown')add('industry',texts('industry',INDUSTRY_PROMPTS).join(' ')+' 行业标签只影响澄清提示。');
  const business={analysis:'明确查询口径、比较依据与解释范围。',content:'定义输入格式、产物结构和内容检查。',service:'维护会话状态、知识依据与转人工出口。',operations:'显式管理业务状态、执行结果和补偿责任。',decision:'区分资料整理、建议生成与最终专业决策，明确结果责任人。',other:'以目标和阶段为边界，组合后续控制、数据与执行策略。'};
  describe('business',business);
  const entry={copilot:['应用内能力接口','复用现有身份与界面，返回可审阅产物。'],chat:['会话与任务状态','区分会话历史与业务状态，支持澄清和转人工。'],event:['事件入口与去重','事件触发任务，保存事件标识，处理重复投递。'],batch:['任务队列与批处理','以任务编号追踪进度，控制并发和部分失败。']};
  combine('interaction',entry);
  const data={input:['请求上下文','检查用户提供的输入，缺少必要信息时补问。'],documents:['知识检索层','文档解析、索引和检索权限与生成层分开，保留来源。'],structured:['受控查询与计算层','复用指标与领域查询，限制查询范围，计算由代码完成。'],mixed:['检索与结构化工具组合','分别处理文档与业务事实，统一标识、时效和访问范围。'],live:['事件与时间窗处理','先整理时间窗、延迟与新鲜度，再给分析层提供状态。']};
  combine('dataSource',data);
  if(a.dataReady==='partial'){add('dataReady','先明确可覆盖的任务范围，补齐缺失输入再扩展自动化。');conditions.push('部分输入尚不可用，首期范围限于已有数据可支撑的任务。');}
  if(a.dataReady==='blocked'){add('dataReady','先解决数据可达性；当前架构仅为目标方向。');conditions.push('关键数据缺失：先打通输入，再开展真实业务自动化。');}
  if(a.dataReady==='ready')add('dataReady','可直接围绕实际输入搭建端到端链路。');
  const integration={none:'保持请求内处理，不增加外部工具适配。',api:'用稳定接口封装能力，保持参数、权限与错误语义清楚。',partial:'先建立适配层；缺少接口的环节保留人工入口。',ui:'将界面自动化隔离为适配器，设置操作确认与失效回退。'};
  describe('integration',integration);for(const v of answerValues(a.integration))if(v!=='none')component('系统接入层',integration[v]);
  if(hasAnswer(a,'integration','ui'))conditions.push('界面操作稳定性与执行范围需先确认；首期限定操作对象并保留人工接管。');
  const policies={open:'可按质量与成本选择服务，仍设置输入与日志范围。',internal:'检索、会话和日志沿用组织身份与权限隔离。',restricted:'先列明可用模型端点、外发字段与留存范围，再筛选部署和依赖。'};
  if(policies[a.dataPolicy]){add('dataPolicy',policies[a.dataPolicy]);component('数据与权限边界',policies[a.dataPolicy]);}
  if(a.dataPolicy==='restricted')conditions.push('受限数据的模型端点、外发和留存范围尚需具体确认。');
  if(a.risk==='critical'){component('专业复核与受控终态','重要建议与不可逆动作交给明确责任人复核，执行前应用规则兜底。');add('risk','限制关键终态的自主执行，将专业复核和执行权限纳入主流程。');}
  else if(a.risk==='material')add('risk','为高影响环节增加结果复核、回退和可查询记录。');
  else if(a.risk==='low')add('risk','保持轻量边界，输出可审阅，失败可恢复。');
  const autonomy={advisory:'首期交付建议与动作草稿，由人执行。',approval:'在批准具体对象和参数后执行，等待批准期间保存任务状态。',bounded:'把允许动作、对象与额度落实到工具入口，超出范围时停止。',full:'自动化范围仍受权限、风险和可恢复性约束。'};
  if(autonomy[a.autonomy])add('autonomy',autonomy[a.autonomy]);
  if(a.oversight==='audited'){component('决策与运行记录','记录输入版本、关键判断、动作与批准结果，按项目要求保存。');add('oversight','方案中加入可复核的记录与责任归属。');}
  if(a.oversight==='strict'){component('强制业务关口','关键状态转换必须由规定的人工或确定性规则通过。');add('oversight','强制关口由应用控制，模型不能跳过。');}
  if(a.oversight==='normal')add('oversight','保留必要的运行结果与错误记录。');
  const timing={interactive:'限制同步串行调用与探索轮次，超时转后台或交还用户。',async:'任务接收与执行分离，提供进度、取消和结果获取。',realtime:'实时闭环交给确定性控制系统，模型只处理异步分析或提前规划。'};
  describe('latency',timing);for(const v of answerValues(a.latency))component(({interactive:'同步响应路径',async:'后台任务路径',realtime:'确定性实时路径'})[v],timing[v]);
  if(hasAnswer(a,'latency','realtime'))conditions.push('模型调用不承诺硬实时截止时间；模型层需移出实时关键路径。');
  const load={pilot:'先用简单部署和少量并发，保留任务标识。',steady:'隔离会话和任务状态，设置并发配额与超时。',burst:'增加队列、背压和资源配额，优先消峰，再评估扩容。'};
  if(load[a.load]){add('load',load[a.load]);if(a.load!=='pilot')component('并发与负载管理',load[a.load]);}
  if(a.budget==='tight'){add('budget','优先一次调用、缓存和小范围上下文；多轮与多 Agent 设严格调用上限。');component('调用预算','为每个任务限定调用、Token 与时间预算，达到上限时返回已有结果。');}
  else if(a.budget!=='unknown')add('budget',a.budget==='quality'?'允许必要的分解和复核，仍设置总预算与停止条件。':'按任务设置预算，先确定质量底线再控制开销。');
  const isUpgrade=['stable','limited'].includes(a.existing);
  let migration={title:'待确认建设方式',detail:'补充从零建设或已有系统改造的信息。'};
  if(a.existing==='new')migration={title:'从最小端到端链路开始',detail:'独立定义领域输入输出、工具与状态契约，再按必要性增加编排和运行设施。'};
  if(isUpgrade){
    const routes={extension:['保留核心，外围增加能力','通过侧车服务或已有扩展点增加能力，复用现有身份、状态和业务接口。推荐目标结构用于新增能力，现有核心继续保留。'],partial:['接口兼容，逐段替换','先选一个瓶颈模块，保留旧路径，通过流量切换逐步接入。'],replace:['分期重构与迁移','先列明数据、状态、接口和运行依赖，双轨核对后再切换，保留回退路径。']};
    const r=routes[a.change]||['先确认改造边界','默认保留核心流程，明确允许改动的模块后再安排迁移。'];
    migration={title:r[0],detail:r[1]};
    if(a.change!=='unknown')add('change',r[1]);
    const current={traditional:'保留领域服务，模型能力放在应用边界之后。',workflow:'复用现有 Workflow 的状态和恢复点，在确需探索的节点增加 Agent。',agent:'优先修正工具、上下文、预算与循环策略，再比较主控替换。',mixed:'先建立各服务的职责和适配接口，避免重复管理同一业务状态。'};
    describe('current',current);migration.detail+=' '+texts('current',current).join(' ');
    const issue={quality:'先定位输入、检索或产物检查问题，避免仅替换编排框架。',flow:'找出规则覆盖不了的局部，再引入受限探索。',integration:'先修复数据和工具接口，增加自主性无法补足缺失输入。',cost:'先减少重复调用、上下文和循环，再考虑替换框架。',scale:'优先处理任务队列、状态恢复和资源配额。'};
    describe('bottleneck',issue);migration.detail+=' '+texts('bottleneck',issue).join(' ');
  }
  if(a.existing!=='unknown')add('existing',migration.title+'：'+migration.detail);
  if(a.horizon!=='unknown')add('horizon',a.horizon==='prototype'?'先保留最小链路与一个明确的任务范围。':'在真实接入前落实部署、运行负责人、发布和回退路径。');
  return {dimensions,components,conditions,migration};
}
