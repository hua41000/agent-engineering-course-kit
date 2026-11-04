import { EDITION, QUESTIONS, PATTERNS, ARCHITECTURES, SCENARIOS, FRAMEWORKS } from './knowledge.mjs';

import { answerValues, hasAnswer, normalizeAnswer, answerLabel } from './answers.mjs';
import { assessContext } from './context.mjs';

const clean = (v,max=2000) => typeof v === 'string' ? v.trim().slice(0,max) : '';
export function normalize(input={}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('请提供一个项目对象。');
  if (input.schema_version != null && ![1,2].includes(input.schema_version)) throw new Error('暂不支持此会话版本，支持 v1 / v2 JSON。');
  const source=input.session || input;
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('会话格式不正确。');
  const raw=source.answers || {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('answers 应为对象。');
  const answers={};
  for (const q of QUESTIONS) {
    answers[q.id]=normalizeAnswer(q,raw[q.id]);
  }
  if (source.stages != null && !Array.isArray(source.stages)) throw new Error('stages 应为阶段数组。');
  if (source.stages?.length>12) throw new Error('首版最多支持 12 个阶段，请先合并相近步骤。');
  const stages=(source.stages?.length ? source.stages : [{name:'核心任务',path:'inherit',effect:'inherit'}]).map((s,i)=>{
    if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error('阶段格式不正确。');
    const path=s.path || 'inherit',effect=s.effect || 'inherit';
    if (!['inherit','fixed','routing','local','open','compiled'].includes(path) || !['inherit','read','write'].includes(effect)) throw new Error('阶段包含无效的路径或动作类型。');
    return {id:'stage-'+(i+1),name:clean(s.name,80)||'阶段 '+(i+1),path,effect};
  });
  return {schema_version:2,edition:EDITION,name:clean(source.name,120)||'我的架构方案',goal:clean(source.goal),industryDetail:clean(source.industryDetail,200),businessDetail:clean(source.businessDetail,500),existingStack:clean(source.existingStack),notes:clean(source.notes),scenario:SCENARIOS.some(s=>s.id===source.scenario)?source.scenario:'custom',answers,stages};
}
export function scenarioSession(id) {
  const s=SCENARIOS.find(x=>x.id===id);
  if(!s) return normalize({});
  return normalize({name:s.name+' 架构方案',goal:s.goal,scenario:s.id,answers:s.answers,stages:s.stages.map((name,i)=>({name,path:i===1?'inherit':'fixed',effect:i===s.stages.length-1?'inherit':'read'}))});
}
export function hasWrite(session) { return hasAnswer(session.answers,'effect','write') || session.stages.some(s=>s.effect==='write'); }
export function visibleQuestions(session) {
  return QUESTIONS.filter(q=>{
    if(!q.when)return true;
    if(q.when==='write')return hasWrite(session);
    if(q.when.kind==='execution')return hasWrite(session)||['material','critical'].includes(session.answers.risk);
    return answerValues(session.answers[q.when.field]).some(v=>q.when.values.includes(v));
  });
}
export function effectiveAnswers(session) {
  const ids=new Set(visibleQuestions(session).map(q=>q.id));
  return Object.fromEntries(Object.entries(session.answers).map(([id,value])=>[id,ids.has(id)?value:'unknown']));
}
export function nextQuestions(input) {
  const s=normalize(input);
  const missing=visibleQuestions(s).filter(q=>s.answers[q.id]==='unknown');
  const order=['industry','business','existing','current','change','risk','dataReady','effect','approval','semantic','path','feedback','verifier','language','planning','parallel','isolation','recovery','team','existing','priority','deployment'];
  return [...missing].sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99)).map(q=>({id:q.id,title:q.title,why:q.why,multiple:q.multiple,exclusive:q.exclusive||[],options:q.options}));
}
function choose(a, count=1) {
  if(a.semantic==='no') return 'software';
  const paths=answerValues(a.path);
  if(paths.length>1){
    const keys=paths.map(path=>choose({...a,path},count));
    if(keys.every(k=>['feature','workflow'].includes(k)))return 'workflow';
    return 'workflowHybrid';
  }
  a={...a,path:paths[0]||'unknown'};
  if(a.path==='compiled') return 'dynamic';
  if(a.path==='local') return 'workflowHybrid';
  if(a.path==='open' && a.feedback==='yes') return a.planning==='long'||hasAnswer(a,'parallel','dynamic')||a.effect==='write'||count>1 ? 'autonomousHybrid':'autonomous';
  if(a.path==='fixed' && a.planning==='short' && hasAnswer(a,'parallel','none') && hasAnswer(a,'isolation','none') && count===1) return 'feature';
  return 'workflow';
}
function selectPatterns(a,key) {
  if(answerValues(a.path).length>1){
    const patterns=answerValues(a.path).flatMap(path=>selectPatterns({...a,path},choose({...a,path})));
    return [...new Map(patterns.map(p=>[p.id,p])).values()];
  }
  a={...a,path:answerValues(a.path)[0]||'unknown'};
  const ids=[];
  const add=id=>{if(!ids.includes(id))ids.push(id);};
  if(key==='software')add('deterministic');
  else if(key==='feature')add('llm');
  else {
    if(['workflow','workflowHybrid'].includes(key))add(a.path==='routing'?'router':'chain');
    if(key==='workflowHybrid')add('island');
    if(['autonomous','autonomousHybrid','workflowHybrid'].includes(key)&&a.feedback==='yes')add('react');
    if(key==='dynamic'){add('plan');add('compiled');}
    if(a.planning==='long'){add('plan');if(a.feedback==='yes')add('replan');}
    if(key==='autonomousHybrid')add('workflowTool');
    if(['autonomous','autonomousHybrid'].includes(key)&&a.planning==='long')add('harness');
    if(hasAnswer(a,'parallel','fixed'))add('parallel');
    if(hasAnswer(a,'parallel','dynamic')){add('workers');add('parallel');}
    if(hasAnswer(a,'verifier','automatic')){add('evaluator');if(a.feedback==='yes')add('reflection');}
    if(hasAnswer(a,'isolation','tool'))add('tool');
    if(hasAnswer(a,'isolation','handoff'))add('handoff');
    if(hasAnswer(a,'isolation','group'))add('group');
  }
  if(a.effect==='write')add('approval');
  if(a.recovery==='durable')add('runtime');
  return ids.map(id=>PATTERNS.find(p=>p.id===id));
}
function frameworksForLanguage(s,key,lang) {
  const a=effectiveAnswers(s);
  const graph=['workflowHybrid','dynamic'].includes(key)||(key==='workflow'&&a.recovery!=='short');
  let order;
  if(key==='software'||key==='feature')order=['native'];
  else if(a.team==='control')order=['native',...(graph?['langgraph']:['pydantic','mastra']),'agents','microsoft'];
  else if(lang==='dotnet')order=['microsoft','native'];
  else if(graph)order=['langgraph','mastra','microsoft','native'];
  else order=lang==='typescript'?['mastra','agents','native']:['pydantic','agents','native'];
  const list=order.map(id=>FRAMEWORKS.find(f=>f.id===id)).filter(f=>lang==='unknown'?f.id==='native':f.languages.includes(lang)).slice(0,3).map(f=>({...f}));
  if(key==='software'&&list[0]){list[0].name='普通代码与现有服务';list[0].fit='用领域函数、数据库与确定性流程完成任务。';list[0].cost='保持业务规则、输入输出与错误处理清楚。';}
  if(key==='feature'&&list[0]){list[0].name='现有应用 + 原生模型 SDK';list[0].fit='增加一个有边界的语义能力，不必先引入完整 Agent 框架。';}
  return list;
}
function frameworks(s,key) {
  const a=effectiveAnswers(s),languages=answerValues(a.language);
  const byId=new Map();
  for(const language of languages.length?languages:['unknown'])for(const f of frameworksForLanguage(s,key,language)){
    if(!byId.has(f.id))byId.set(f.id,{...f,matchedLanguages:[]});
    if(language!=='unknown')byId.get(f.id).matchedLanguages.push(language);
  }
  const list=[...byId.values()];
  if(['stable','limited'].includes(a.existing)&&a.change!=='replace'){list.unshift({id:'existing',name:'优先保留现有实现',layer:'现有资产',fit:s.existingStack||'保留已有服务、状态与身份体系，在允许改动的范围内新增能力。',cost:'先确认现有实现可以承载下列新增职责；不满足时再替换局部。',url:null});}
  return list;
}
export function recommend(input) {
  const s=normalize(input),rawAnswers=effectiveAnswers(s),write=hasWrite(s);
  const a={...rawAnswers,effect:hasAnswer(rawAnswers,'effect','write')?'write':hasAnswer(rawAnswers,'effect','read')?'read':'unknown'};
  const context=assessContext(s,a);
  let key=choose(a,s.stages.length);
  // Explicit local overrides may introduce exploration into a fixed outer flow.
  const localOpen=s.stages.some(t=>['open','local'].includes(t.path));
  if(a.semantic!=='no'&&['feature','workflow'].includes(key)&&localOpen)key='workflowHybrid';
  if(write&&key==='autonomous')key='autonomousHybrid';
  const questions=nextQuestions(s), reminders=[], reasons=[], conditions=[...context.conditions];
  const criticalIds=['existing','semantic','path','effect','risk','dataReady','integration','verifier','latency','dataPolicy','deployment','oversight','language','team'];
  if(answerValues(a.path).some(v=>['open','local'].includes(v)))criticalIds.push('feedback');
  if(['stable','limited'].includes(a.existing))criticalIds.push('change','current');
  if(write)criticalIds.push('approval','autonomy');
  const criticalQuestions=questions.filter(q=>criticalIds.includes(q.id));
  const completeness={answered:visibleQuestions(s).filter(q=>a[q.id]!=='unknown').length,total:visibleQuestions(s).length,criticalMissing:criticalQuestions.map(q=>q.id)};
  if(criticalQuestions.length)conditions.unshift('关键决策条件仍待明确：'+criticalQuestions.map(q=>q.title).join('；')+'。当前仅展示待确认方向。');
  const executionAllowed=write&&a.approval==='ready'&&['approval','bounded','full'].includes(a.autonomy)&&a.dataReady!=='blocked'&&a.risk!=='unknown'&&a.oversight!=='unknown';
  const executionMode=!write?'只读处理':!executionAllowed?'建议 / 草稿，待补齐执行条件':a.risk==='critical'||a.oversight==='strict'||a.autonomy==='approval'?'经指定复核与批准后执行':'限定权限范围内执行';
  if(write&&!executionAllowed)conditions.push('当前业务写入保持草稿或人工处理：确认自动化范围、风险和受控入口后再接入执行。');
  if(write&&a.autonomy==='full'&&(a.risk==='critical'||a.oversight==='strict'))conditions.push('端到端自动化目标与关键复核要求冲突：当前方案保留强制复核关口。');
  const add=(title,detail)=>reminders.push({title,detail});
  if(a.semantic==='no')reasons.push('核心任务可以用确定规则完成，优先普通代码和现有服务。');
  else if(key==='feature')reasons.push('单次语义处理就能完成主要工作，先把模型封装成应用能力。');
  else if(key==='workflowHybrid')reasons.push('外层业务流程稳定，局部问题需要模型探索，适合有边界地交接控制权。');
  else if(['autonomous','autonomousHybrid'].includes(key))reasons.push('分析路径需要模型依据新结果调整，持续决策有实际用途。');
  else if(key==='dynamic')reasons.push('任务计划需要动态生成，并在执行前检查节点、依赖与允许动作。');
  else reasons.push('稳定步骤或有限出口可以由代码安排，便于维护和定位问题。');
  if(a.planning==='long'&&a.semantic!=='no')reasons.push('任务有长程依赖，计划与里程碑有助于协调步骤，局部执行按实际反馈调整。');
  if(write){
    reasons.push('分析与业务动作分开：模型提出意图，受控接口负责授权、参数检查与确定性执行。');
    if(a.approval!=='ready')conditions.push('真实写入前补齐受控执行入口。当前先交付分析或动作草稿，尚不满足自动执行的完整目标。');
    add('动作边界','将权限检查、批准对象、操作编号、结果查询和失败处理放在执行入口；高风险动作按业务规则引入人工审批。');
  }
  if(a.effect==='unknown')conditions.push('先确认是否存在写入、发布或其他副作用，再确定执行边界。');
  if(hasAnswer(a,'path','open')&&a.feedback==='no')add('路径描述需要确认','你选择了开放路径，同时认为已知规则足够。当前采用 Workflow 起点；如果规则无法覆盖策略选择，再开放局部自主性。');
  if(a.semantic==='no'&&(hasAnswer(a,'path','open')||answerValues(a.isolation).some(v=>v!=='none')))add('保持最小结构','你认为确定规则已足够。先用普通代码完成任务，再确认是否确需模型决策或多个 Agent。');
  if(!answerValues(a.verifier).some(v=>['automatic','human'].includes(v))){conditions.push('明确结果由谁检查、何时算完成；首版先保留人工审阅和运行上限。');}
  if(answerValues(a.parallel).some(v=>v!=='none'))add('并行前提','先确认子任务独立、共享状态可隔离、汇总不重复计算；动态分工还需限制 Worker 数量。');
  if(answerValues(a.isolation).some(v=>v!=='none'))add('协作责任','为每个子 Agent 说明任务边界、可用工具、上下文、结果返回与最终负责人；角色名称不会自动隔离权限。');
  if(a.team==='control'&&a.semantic!=='no')add('自研维护成本','你将维护主循环、上下文装配、状态、Provider 差异和停止逻辑；计算、存储与持久执行继续复用成熟组件。');
  if(a.deployment==='private')add('私有部署','接入前核对模型端点、外部工具、遥测出口和依赖许可；此处是实现方向，不代表候选已通过你的部署要求。');
  if(a.priority==='cost')add('先减调用再加结构','优先固定可重复路径、限制重试轮次；并行与多 Agent 需计入上下文复制和汇总成本。');
  if(a.recovery==='resume')add('进度与恢复','保存任务状态和中间结果，明确从哪里恢复；业务动作另用操作编号查询结果。');
  if(a.recovery==='durable')add('持久执行','引入持久等待与恢复机制，先比较现有任务平台或 Durable Runtime；跨日等待不自动要求分布式 Agent。');
  const stageInputs=s.stages.flatMap(t=>{
    const effect=t.effect==='inherit'?a.effect:t.effect,path=t.path==='inherit'?a.path:t.path;
    if(a.semantic!=='no'&&effect==='write'&&(hasAnswer(rawAnswers,'effect','read')||answerValues(path).some(v=>['open','local','compiled'].includes(v))))return [
      {...t,name:t.name+'：分析与决策',effect:'read'},
      {...t,name:t.name+'：受控执行',path:'fixed',effect:'write'}
    ];
    return [t];
  });
  const stages=stageInputs.map((t,i)=>{
    const effect=t.effect==='inherit'?a.effect:t.effect;
    const path=t.path==='inherit'?a.path:t.path;
    const local={...a,path,effect};
    // Explicit fixed stages should not inherit an investigation's planning or collaboration.
    if(t.path==='fixed')Object.assign(local,{planning:'short',parallel:'none',isolation:'none',feedback:'no'});
    let stageKey=choose(local,1);
    if(effect==='write')stageKey=a.semantic==='no'?'software':'workflow';
    const mixedPaths=answerValues(path).length>1;
    const model=a.semantic!=='no'&&(['autonomous','autonomousHybrid','dynamic','workflowHybrid'].includes(stageKey));
    return {id:'node-'+(i+1),name:t.name,key:stageKey,effect,owner:mixedPaths&&effect!=='write'&&a.semantic!=='no'?'应用路由 / 对应主控':model?'Agent / Planner':'应用 / Workflow',verification:answerValues(a.verifier).filter(v=>v!=='weak').map(v=>v==='automatic'?'规则、数据或测试':'人工审阅').join(' + ')||'待明确验收',patterns:effect==='write'?[PATTERNS.find(p=>p.id==='approval')]:selectPatterns(local,stageKey).filter(p=>!['runtime','harness'].includes(p.id)).slice(0,4),returnTo:model?'结果或失败返回主控':'交给下一阶段',condition:effect==='write'?executionMode:'按定义的输入输出执行'};
  });
  const p=selectPatterns({...a,effect:write?'write':a.effect},key);
  for(const st of stages)for(const pattern of st.patterns)if(!p.some(x=>x.id===pattern.id))p.push(pattern);
  const alternatives=[];
  if(key==='software')alternatives.push({name:'LLM Feature',reason:'只有确实需要理解非结构化内容时，再引入单次模型调用。'});
  else if(key==='feature')alternatives.push({name:'Workflow',reason:'当多个阶段与中间检查变得稳定时，再显式拆分流程。'});
  else if(['autonomous','autonomousHybrid','dynamic'].includes(key))alternatives.push({name:'Workflow-first Hybrid',reason:'先开放最有价值的一段探索，其余步骤保留固定流程；适合从既有系统渐进改造。'});
  else alternatives.push({name:'LLM Feature / 普通代码',reason:'如果只剩单次语义转换或已知规则，继续删减流程与模型调用。'});
  alternatives.push({name:'保留当前可用实现',reason:'优先改造已发生的瓶颈，业务工具与状态契约稳定后再评估框架替换。'});
  const steps=[
    {title:'画清业务边界',detail:'围绕“'+(s.goal||'待确认的业务目标')+'”，确认阶段输入、完成标准与负责人。'},
    {title:a.existing==='stable'?'复用已有业务能力':'先跑通最小链路',detail:a.existing==='stable'?'保留现有服务和可用框架，把新增能力放到明确接口之后。':'先实现一条端到端路径，复用查询、计算与业务服务。'},
    {title:'加入确有收益的模式',detail:'按需加入 '+p.filter(x=>!['approval','runtime'].includes(x.id)).slice(0,4).map(x=>x.name).join('、')+'，为循环设置时间和轮次上限。'},
    {title:write?'接入受控业务动作':'用代表任务检查输出',detail:write?'在授权接口准备好之前保留动作草稿；准备好后接入参数复核、幂等执行和结果查询。':'用一个正常任务和一个信息不足的任务检查输出，确认它能说明缺口并停止。'}
  ];
  steps[1]={title:context.migration.title,detail:context.migration.detail};
  if(a.dataReady==='blocked'||hasAnswer(a,'integration','partial'))steps.splice(1,0,{title:'先打通必要输入与接口',detail:'明确首期任务可用的数据和工具，缺少输入的环节保留人工；完成接入后再启用目标架构。'});
  if(a.horizon==='production')steps.push({title:'安排生产接入与回退',detail:'明确运行负责人、负载配额与发布范围，改造项目先保留原有路径。'});
  if(hasAnswer(a,'latency','realtime'))steps.splice(1,0,{title:'隔离实时关键路径',detail:'确定性控制负责硬实时响应；模型处理异步建议或预先规划。'});
  if(write)steps[steps.findIndex(x=>x.title==='接入受控业务动作')].detail=executionMode+'。将批准、权限、幂等与结果查询落实到执行入口。';
  const pathVariants=answerValues(a.path).length>1?answerValues(a.path).map(path=>{
    const variantKey=choose({...a,path},1);
    return {path,label:answerLabel('path',path),architecture:ARCHITECTURES[variantKey].name,patterns:selectPatterns({...a,path},variantKey).map(p=>p.name)};
  }):[];
  if(pathVariants.length){
    reasons.unshift('产品包含多种处理路径，按任务类型选择对应主控，共享数据、工具和权限边界。各路径分别启用所需模式。');
    conditions.push('补充任务类型与路径的对应关系；固定步骤、开放调查和计划执行按各自边界运行，路径清单不代表串行执行顺序。');
  }
  const architecture=pathVariants.length&&a.semantic!=='no'?{name:'多路径组合 · '+ARCHITECTURES[key].name,en:'Task-routed composition',summary:'由应用识别任务类型，分别进入固定流程、有界探索或计划执行路径，复用公共工具与运行能力。具体启用哪些路径见下方组合。'}:ARCHITECTURES[key];
  const contracts=['输入与前置条件','允许工具与权限','状态归属','时间与费用预算','完成标准','返回结果','失败与重试','副作用与补偿','控制权返回对象'];
  return {schema_version:2,edition:EDITION,session:s,key,architecture,pathVariants,status:criticalQuestions.length?'待补充关键条件':conditions.length?'有条件的初步方案':questions.length?'初步方向，仍有待澄清项':'可作为初始方案',completeness,context,executionMode,visibleQuestionIds:visibleQuestions(s).map(q=>q.id),reasons,patterns:p,stages,frameworks:frameworks(s,key),alternatives,questions,conditions,reminders,steps,contracts,implementationNote:'首版按已填条件生成架构建议。框架卡片用于缩小候选，接入时核对官方文档、版本与项目约束。'};
}
