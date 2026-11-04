import { patternVisual } from './pattern-visuals.mjs';
import { EDITION, COURSE, QUESTIONS, SCENARIOS, PATTERNS, PRINCIPLES, FRAMEWORKS, INDUSTRY_PROMPTS } from './knowledge.mjs';
import { normalize, scenarioSession, visibleQuestions, recommend } from './core.mjs';
import { answerValues, hasAnswer, answerLabel, toggleAnswer } from './answers.mjs';
import { architectureVisual } from './visuals.mjs';
import { reportMarkdown, adrMarkdown, mermaid } from './report.mjs';

const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session=normalize({}),step=0,toastTimer,goalError=false,isImporting=false,importError='',didRender=false;
const icon=name=>`<span class='bxy-icon' aria-hidden='true'>${UI_ICONS[name]||''}</span>`;
const nav=['业务背景','任务与控制','系统与数据','风险与权限','交付与运行','选型报告'];
const resultStep=nav.length-1;
const questionPositions={};
const groupQuestions=()=>visibleQuestions(session).filter(q=>q.group===step);
function questionPosition(){return Math.min(questionPositions[step]||0,Math.max(0,groupQuestions().length-1));}
const brandMark=()=>`<img class="brand-mark" src="${COMPOSER_LOGO}" alt="" width="48" height="48">`;
let page='home',demo=false,demoReturnStep=0,previewMode='hybrid',motionObserver;
const previewCopy={workflow:['Workflow','步骤清楚，流程就有秩序。','由应用安排稳定步骤，模型负责理解、分类与生成。'],autonomous:['Autonomous','跟随新线索，调整下一步。','让模型依据观察选择行动，用工具与停止条件限制探索。'],hybrid:['Hybrid','稳定与探索，组合成一套架构。','固定流程负责业务终态，Agent 在需要判断的局部获得控制权。']};
function demoSession(){
 const s=scenarioSession('data');s.name='DataAgent 经营分析 · 示例方案';s.notes='演示用假设：这是展示报告结构的虚构项目条件，不代表真实系统评估。';
 Object.assign(s.answers,{industry:['retail'],business:['analysis','decision'],interaction:['chat','batch'],dataSource:['documents','structured'],dataReady:'ready',integration:['api'],risk:'material',autonomy:'advisory',dataPolicy:'internal',oversight:'audited',latency:['interactive','async'],load:'steady',budget:'balanced',horizon:'prototype'});
 return normalize(s);
}
const currentDecision=()=>recommend(demo?demoSession():session);
function productHeader(home=false){
 return `<header class="topbar ${home?'home-topbar':''}"><button class="brand brand-link" data-action="home" aria-label="Architecture Composer 首页">${brandMark()}<span class="brand-wordmark"><strong>Architecture Composer</strong><span>Agent 架构选型</span></span></button><nav class="top-actions" aria-label="工具操作"><button id="handbook-button" class="btn ghost desktop-action" data-action="handbook">方法手册</button>${home?`<button class="btn ghost desktop-action" data-action="skill">下载 Skill ${icon('download')}</button><button class="btn primary" data-action="workspace">${session.goal?'继续方案':'开始评估'}${icon('arrow_forward')}</button>`:`<button class="btn ghost desktop-action" data-action="import" ${isImporting?'disabled aria-busy="true"':''}>${isImporting?'正在导入…':'导入会话'}</button><button id="save-button" class="btn" data-action="${demo?'workspace':'save'}">${demo?'我的方案':'保存草稿'}</button>`}<button id="more-button" class="icon-button" data-action="tools" aria-label="更多工具" aria-haspopup="dialog">${icon('more_horiz')}</button></nav></header>`;
}
function sessionNotice(){return `${isImporting?`<div class="notice" role="status">正在读取会话文件…</div>`:''}${importError?`<div class="notice error" role="alert"><div><strong>会话未能导入</strong><p>${h(importError)}</p><button class="btn" data-action="import">重新选择文件</button></div></div>`:''}`;}
function landingScreen(){
 const copy=previewCopy[previewMode];
 return `${productHeader(true)}<main class="landing" id="main-content" tabindex="-1">${sessionNotice()}<section class="landing-hero"><div class="hero-copy reveal"><h1 tabindex="-1">为你的 Agent，<br>找到合适的架构。</h1><p class="hero-description">从业务需求出发，把流程、探索、协作与运行约束，组合成一份能着手实施的方案。</p><div class="hero-actions"><button class="btn primary hero-cta" data-action="workspace">${session.goal?'继续我的评估':'开始架构评估'}${icon('arrow_forward')}</button><button class="text-action" data-action="demo">看一份示例报告 ${icon('arrow_forward')}</button></div>${hasDraft?`<button class="draft-link" data-action="restore">${icon('save')}恢复本机保存的草稿</button>`:''}<div class="hero-delivery"><span>${icon('check_circle')}多种需求，一起评估</span><span>${icon('download')}报告与 Skill 可下载</span></div></div><figure class="hero-art reveal"><div class="art-heading"><span>三种控制方式，按任务组合</span><button class="motion-toggle" data-action="motion" aria-pressed="false" aria-label="暂停结构动画">暂停动画</button></div><div class="mode-switch" role="group" aria-label="选择架构预览">${Object.entries(previewCopy).map(([id,c])=>`<button id="mode-${id}" data-preview-mode="${id}" aria-pressed="${id===previewMode}">${c[0]}</button>`).join('')}</div><div class="motion-frame">${architectureVisual(previewMode,'home-architecture')}</div><figcaption aria-live="polite"><strong>${copy[1]}</strong><p>${copy[2]}</p></figcaption><div class="art-footer"><span>结构示意</span><span>最终选型由你的项目条件决定</span></div></figure></section>
 <section class="home-process" aria-label="评估流程"><h2>把问题说清，<br>让结构成形。</h2><ol><li><span>01</span><div><h3>描述你的项目</h3><p>行业、任务、新建或改造，建立真实的业务背景。</p></div></li><li><span>02</span><div><h3>明确关键取舍</h3><p>多选需求，补齐路径、数据、权限与运行边界。</p></div></li><li><span>03</span><div><h3>获得组合方案</h3><p>看清推荐理由、控制权、框架候选与实施顺序。</p></div></li></ol></section>
 <section class="home-examples" id="home-examples"><div class="home-section-intro"><h2>从熟悉的问题开始。</h2><p>选一个案例进入问卷，再改成你的条件。所有案例使用同一套评估模型。</p></div><div class="example-list">${['data','support','coding'].map(id=>{const s=SCENARIOS.find(x=>x.id===id);return `<button class="example-row" data-scenario="${s.id}"><span class="example-name">${h(s.name)}</span><span class="example-description">${h(s.desc)}</span>${icon('arrow_forward')}</button>`;}).join('')}</div></section>
 <section class="skill-feature"><div class="skill-brand" aria-hidden="true">${brandMark()}</div><div><h2>把方法带进你的项目。</h2><p>下载配套 Skill，让它读取现有代码与架构，补问关键问题，把选型方向细化到实际模块和改造步骤。</p></div><button class="btn" data-action="skill">下载 Skill ${icon('download')}</button></section><footer class="home-footer"><span>${h(COURSE)} · 第 02 课配套</span><span>本地评估 · 无需登录 · 支持离线</span></footer></main>`;
}
let motionPaused=false;
function observeMotion(){
 motionObserver?.disconnect();const target=root.querySelector('.hero-art');if(!target)return;
 const update=visible=>target.classList.toggle('motion-paused',motionPaused||document.hidden||!visible);
 motionObserver=new IntersectionObserver(entries=>update(entries[0].isIntersecting),{threshold:.1});motionObserver.observe(target);update(true);
 const button=root.querySelector('.motion-toggle');button.setAttribute('aria-pressed',String(motionPaused));button.textContent=motionPaused?'播放动画':'暂停动画';button.setAttribute('aria-label',motionPaused?'播放结构动画':'暂停结构动画');
}
document.addEventListener('visibilitychange',()=>{const target=root.querySelector('.hero-art');if(target)target.classList.toggle('motion-paused',motionPaused||document.hidden||target.getBoundingClientRect().bottom<0||target.getBoundingClientRect().top>innerHeight);});

function questionnaire(){
 const qs=groupQuestions(),pos=questionPosition();
 return `<section class='panel questionnaire'><div class='panel-top'><span class='section-count'>本节第 ${pos+1} 题，共 ${qs.length} 题</span><span class='tiny'>${qs[pos]?.multiple?'多选 · 已选 '+answerValues(session.answers[qs[pos].id]).length+' 项':'单选，选择当前条件'}</span></div><nav class='question-dots' aria-label='本节题目'>${qs.map((q,i)=>`<button id='question-nav-${i}' class='question-dot ${i===pos?'active':''} ${session.answers[q.id]!=='unknown'?'answered':''}' data-question-index='${i}' ${i===pos?'aria-current="step"':''} title='${h(q.title)}' aria-label='第 ${i+1} 题，${session.answers[q.id]!=='unknown'?'已回答':'待明确'}：${h(q.title)}'>${i+1}${session.answers[q.id]!=='unknown'?icon('check_circle'):''}</button>`).join('')}</nav>${qs[pos]?question(qs[pos]):''}${qs[pos]?.id==='industry'&&answerValues(session.answers.industry).map(v=>INDUSTRY_PROMPTS[v]).join(' ')?`<div class='note-card'>${icon('info')}<p>${h(answerValues(session.answers.industry).map(v=>INDUSTRY_PROMPTS[v]).join(' '))}</p></div>`:''}${qs[pos]?.id==='industry'&&hasAnswer(session.answers,'industry','other')?`<div class='field extra-field'><label class='label' for='industry-detail'>补充行业名称</label><input id='industry-detail' data-field='industryDetail' value='${h(session.industryDetail)}' maxlength='200' placeholder='例如：建筑设计、能源运营'></div>`:''}${qs[pos]?.id==='business'?`<div class='field extra-field'><label class='label' for='business-detail'>具体业务环节与使用者<span class='optional'>选填</span></label><input id='business-detail' data-field='businessDetail' value='${h(session.businessDetail)}' maxlength='500' placeholder='例如：采购人员处理供应商材料'></div>`:''}</section>`;
}
const root=document.getElementById('app');
const STORE='architecture-composer-preview-session';
let hasDraft=false;
try{hasDraft=!!localStorage.getItem(STORE);}catch{}
function toast(message,kind='info'){
 const el=document.getElementById('toast');el.innerHTML=icon(kind==='success'?'check_circle':kind==='error'?'error':'info')+`<span>${h(message)}</span>`;el.dataset.kind=kind;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),kind==='error'?6500:3300);
}
function download(name,body,type='text/plain;charset=utf-8') {const blob=body instanceof Blob?body:new Blob([body],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function progress(){const qs=visibleQuestions(session);return {all:qs.length,done:qs.filter(q=>session.answers[q.id]!=='unknown').length};}
function question(q) {
 const value=session.answers[q.id];
 const selected=v=>v==='unknown'?value==='unknown':answerValues(value).includes(v);
 const rows=[...q.options,{value:'unknown',label:'暂时不确定',hint:q.multiple?'清除本题已选项，之后可以回来补充。':'保留这个问题，之后可以回来补充。'}];
 return `<section class='question'><h2 id='question-title' tabindex='-1'>${h(q.title)}</h2><p class='why' id='question-help'>${h(q.why)}</p><div class='options' role='${q.multiple?'group':'radiogroup'}' aria-labelledby='question-title' aria-describedby='question-help'>${rows.map(o=>`<label class='option ${selected(o.value)?'selected':''} ${o.value==='unknown'?'unknown-option':''}'><input type='${q.multiple?'checkbox':'radio'}' id='answer-${q.id}-${o.value}' name='answer-${q.id}' data-answer='${q.id}' data-value='${o.value}' value='${o.value}' ${selected(o.value)?'checked':''}><span><strong>${h(o.label)}</strong><small>${h(o.hint)}</small></span></label>`).join('')}</div></section>`;
}
function preview() {
 const d=recommend(session),p=progress(),missing=d.completeness.criticalMissing.length;
 return `<aside class='preview' aria-label='答题概览'><section class='preview-card'><h2>答题概览</h2><div class='progress-heading'><span>已明确 ${p.done} / ${p.all} 项</span><span>${Math.round(p.done/p.all*100)}%</span></div><progress value='${p.done}' max='${p.all}' aria-label='问卷完成进度'>${p.done}/${p.all}</progress><p class='subtle'>新建或改造、动作权限等回答会影响后续题目。</p><dl class='answer-summary'>${['existing','industry','business'].map(id=>{const q=QUESTIONS.find(q=>q.id===id);return `<div><dt>${{existing:'建设方式',industry:'所在行业',business:'主要任务'}[id]}</dt><dd>${h(answerLabel(id,session.answers[id]))}</dd></div>`;}).join('')}</dl></section><section class='preview-card'><h2>选型方向</h2><p class='preview-title'>${missing?'还需补充关键条件':h(d.architecture.name)}</p><p>${missing?'明确任务、数据和运行约束后，系统会给出结构与实施建议。':h(d.architecture.summary)}</p><button class='btn full-width' data-go='${resultStep}'>${missing?'查看当前分析':'查看选型报告'}${icon('arrow_forward')}</button></section></aside>`;
}
function stageEditor() {
 return `<section class='panel'><div class='panel-top'><h2>任务阶段</h2><button class='btn small' data-action='add-stage' ${session.stages.length>=12?'disabled':''}>${icon('add')}添加阶段</button></div><p class='why'>按执行顺序填写。每个阶段可以单独指定路径和动作范围。</p><div class='stage-list'>${session.stages.map((s,i)=>`<div class='stage-item'><div class='stage-heading'><strong>阶段 ${i+1}</strong><button class='icon-button danger' aria-label='删除阶段 ${i+1}' data-remove-stage='${i}' ${session.stages.length===1?'disabled':''}>${icon('delete')}</button></div><label class='stage-name'>名称<input aria-label='阶段 ${i+1} 名称' value='${h(s.name)}' data-stage='${i}' data-key='name' maxlength='80'></label><label>处理路径<select id='stage-path-${i}' aria-label='阶段 ${i+1} 路径' data-stage='${i}' data-key='path'>${[['inherit','沿用整体'],['fixed','固定步骤'],['routing','有限分支'],['local','局部探索'],['open','开放调查'],['compiled','校验后执行计划']].map(([v,l])=>`<option value='${v}' ${s.path===v?'selected':''}>${l}</option>`).join('')}</select></label><label>动作范围<select id='stage-effect-${i}' aria-label='阶段 ${i+1} 影响' data-stage='${i}' data-key='effect'>${[['inherit','沿用整体'],['read','只读'],['write','写入']].map(([v,l])=>`<option value='${v}' ${s.effect===v?'selected':''}>${l}</option>`).join('')}</select></label></div>`).join('')}</div><p class='subtle'>阶段设置优先于整体设置。需要真实执行的部分单独标记。</p></section>`;
}
function contextScreen() {
 return `<div class='intro'><h1 tabindex='-1'>业务背景</h1><p class='lead'>描述项目，再逐题明确任务与约束。完成后获得架构建议和实施路线。</p></div>${hasDraft?`<div class='restore'><span>有一份保存在本机的草稿</span><button class='btn small' data-action='restore'>恢复草稿</button></div>`:''}${questionPosition()===0?`<details class='details'><summary>使用典型案例了解模型（可选）</summary><div class='scenario-grid'>${SCENARIOS.map(s=>`<button class='scenario ${session.scenario===s.id?'selected':''}' data-scenario='${s.id}' aria-pressed='${session.scenario===s.id}'><span class='scenario-title'>${h(s.name)}</span><span class='scenario-desc'>${h(s.desc)}</span></button>`).join('')}</div><p class='subtle'>案例填入部分示例答案，新增的项目约束仍需你确认。模型不读取案例名称进行判断。</p></details><section class='panel'><div class='field'><label class='label' for='project-name'>项目名称</label><input id='project-name' data-field='name' maxlength='120' value='${h(session.name)}' placeholder='填写自己的项目'></div><div class='field'><label class='label' for='project-goal'>希望谁在什么情况下完成什么任务？</label><textarea id='project-goal' data-field='goal' maxlength='2000' required aria-describedby='goal-feedback' aria-invalid='${goalError}' class='${goalError?'is-error':session.goal.trim()?'is-success':''}' placeholder='描述使用者、触发场景、处理对象和最终交付结果。'>${h(session.goal)}</textarea><p id='goal-feedback' class='field-feedback ${goalError?'error':session.goal.trim()?'success':''}' ${goalError?'role="alert"':''}>${goalError?icon('error')+'请描述希望完成的任务，再继续答题。':session.goal.trim()?icon('check_circle')+'已填写项目目标。':'请写清使用者、处理对象和预期结果。'}</p></div></section>`:`<div class='note-card'><strong>${h(session.name)}</strong><p>${h(session.goal)}</p><button class='btn small' data-question-index='0'>修改目标与建设方式</button></div>`}${questionnaire()}`;
}
function questionsScreen() {
 const titles=nav;
 const leads=['','路径、反馈、依赖与协作决定求解结构。','已有系统追加改造问题；新建项目直接评估数据和接口。','分析建议也有风险，权限、复核与真实写入分别确认。','技术栈、团队、时间要求、负载与费用共同影响实施路线。'];
 return `<div class='intro'><h1 tabindex='-1'>${titles[step]}</h1><p class='lead'>${leads[step]}</p></div>${questionnaire()}${step===1&&questionPosition()===groupQuestions().length-1?stageEditor():''}${step===2&&['stable','limited'].includes(session.answers.existing)?`<section class='panel'><label class='label' for='existing-stack'>现有系统与必须保留的能力</label><textarea id='existing-stack' data-field='existingStack' maxlength='2000' placeholder='主流程、技术栈、已有接口及不能替换的部分。'>${h(session.existingStack)}</textarea></section>`:''}${step===4&&questionPosition()===groupQuestions().length-1?`<section class='panel'><label class='label' for='extra-notes'>其他约束与特殊情况</label><textarea id='extra-notes' data-field='notes' maxlength='2000' placeholder='未被问卷覆盖的条件可保留给 Skill 进一步分析。'>${h(session.notes)}</textarea></section>`:''}`;
}
function contextResult(d){
 return `<section class='panel'><div class='panel-top'><h3>建设 / 改造路线</h3><span class='pill'>${d.completeness.answered}/${d.completeness.total} 项已明确</span></div><h3>${h(d.context.migration.title)}</h3><p>${h(d.context.migration.detail)}</p><p><strong>执行范围：</strong>${h(d.executionMode)}</p><p class='subtle'>问卷完整度用于提示缺口；关键条件未明确时，结构和框架均为待确认方向。</p></section><div class='section-heading'><h2>需要组合的系统能力</h2></div><div class='pattern-grid'>${d.context.components.length?d.context.components.map(c=>`<article class='pattern-card'><h3>${h(c.name)}</h3><p>${h(c.detail)}</p></article>`).join(''):`<p class='empty-hint'>补充系统与数据条件后，会在这里列出需要组合的能力。</p>`}</div><details class='details'><summary>查看各项回答怎样影响方案</summary>${d.context.dimensions.map(x=>`<p class='reminder'><strong>${h(x.title)} ${h(x.answer)}</strong><br>${h(x.impact)}</p>`).join('')}</details>`;
}
function resultScreen() {
 const d=currentDecision(),s=d.session;
 const family=['autonomous','autonomousHybrid'].includes(d.key)?d.key:['workflowHybrid','dynamic'].includes(d.key)?'hybrid':'workflow';
 const chapter=(id,n,title)=>`<div class="section-heading report-chapter" id="${id}"><span aria-hidden="true">${n}</span><h2>${title}</h2></div>`;
 return `<article class="result-body"><div class="report-toolbar no-print"><button class="text-action" data-action="workspace">${icon('arrow_back')}${demo?'退出示例，开始评估':'返回问卷调整条件'}</button><span>${demo?'示例报告 · 演示用假设':'架构方案 · 基于当前回答'}</span></div>
 <header class="report-cover"><img class="cover-watermark" src="${COMPOSER_LOGO}" alt="" aria-hidden="true"><div class="cover-heading"><span class="document-type">架构选型报告</span><span class="report-status">${h(d.status)}</span></div><h1 tabindex="-1">${h(s.name)}</h1><p class="report-goal">${h(s.goal||'补充业务目标后，方案会更贴近你的项目。')}</p><dl class="cover-context"><div><dt>建设方式</dt><dd>${h(answerLabel('existing',s.answers.existing))}</dd></div><div><dt>业务任务</dt><dd>${h(answerLabel('business',s.answers.business))}</dd></div><div><dt>技术栈</dt><dd>${h(answerLabel('language',s.answers.language))}</dd></div></dl><div class="cover-signature"><span>Architecture Composer</span><span>已明确 ${d.completeness.answered} / ${d.completeness.total} 项条件</span></div></header>
 <section class="report-recommendation" aria-label="推荐目标结构"><div><p class="recommendation-label">推荐控制结构</p><h2>${h(d.architecture.name)}</h2><p>${h(d.architecture.summary)}</p><div class="execution-caption"><span>执行范围</span><strong>${h(d.executionMode)}</strong></div></div><div class="report-architecture">${architectureVisual(family,'report-architecture')}<p>控制结构示意 · 具体阶段见下方方案</p></div></section>
 <div class="result-actions no-print"><button class="btn primary" data-export="report">${icon('download')}下载完整报告</button><button class="btn" data-export="session">保存会话 JSON</button><button class="btn" data-export="mermaid">导出架构图</button><button class="btn" data-export="adr">导出 ADR</button><button class="btn ghost" data-action="print">${icon('print')}打印 / PDF</button></div>
 <nav class="report-index no-print" aria-label="报告目录">${[['report-reasons','决策理由'],['report-context','系统能力'],['report-flow','控制权'],['report-patterns','模式组合'],['report-frameworks','框架路线'],['report-plan','实施顺序']].map(([id,label],i)=>`<a href="#${id}"><span>${String(i+1).padStart(2,'0')}</span>${label}</a>`).join('')}</nav>
 ${d.conditions.length?`<details class="details report-conditions" open><summary>实施前需要明确 ${d.conditions.length} 项条件</summary><ul>${d.conditions.map(x=>`<li>${h(x)}</li>`).join('')}</ul></details>`:''}
 ${chapter('report-reasons','01','为什么这样组合')}<div class="result-grid"><section class="panel decision-reasons"><h3>选择依据</h3><ol class="reason-list">${d.reasons.map(x=>`<li>${h(x)}</li>`).join('')}</ol></section><section class="panel decision-alternatives"><h3>保留合理的备选</h3>${d.alternatives.map(x=>`<p class="reminder"><strong>${h(x.name)}</strong>${h(x.reason)}</p>`).join('')}</section></div>
 ${chapter('report-context','02','系统能力与改造路线')}${contextResult(d)}
 ${d.pathVariants.length?`<section class="panel"><h3>按任务组合处理路径</h3><p>以下路径按任务选择，任务与路径的对应关系需要进一步明确。</p>${d.pathVariants.map(v=>`<p class="reminder"><strong>${h(v.label)} · ${h(v.architecture)}</strong>${h(v.patterns.join(' + '))}</p>`).join('')}</section>`:''}
 ${chapter('report-flow','03','每一步，由谁掌握控制权')}<section class="panel flow-panel"><div class="architecture-flow">${d.stages.map((st,i)=>`${i?`<span class="flow-arrow">${icon('arrow_forward')}</span>`:''}<div class="flow-node ${st.owner==='Agent / Planner'?'agent':''}"><span class="stage-number">${String(i+1).padStart(2,'0')}</span><h3>${h(st.name)}</h3><span class="pill ${st.owner==='Agent / Planner'?'orange':''}">${h(st.owner)}</span><div class="tag-list">${st.patterns.map(p=>`<span class="tiny">${h(p.name)}</span>`).join('<span class="tiny"> · </span>')}</div><p>${h(st.verification)}<br>${h(st.condition)}</p></div>`).join('')}</div><p class="subtle">阶段顺序草图；并发、返回与重规划按选定模式实现。租户权限、预算和硬停止由应用负责。</p></section>
 ${chapter('report-patterns','04','需要的模式，按职责组合')}<div class="pattern-grid report-patterns">${d.patterns.map(p=>`<article class="pattern-card"><h3>${h(p.name)}</h3><p>${h(p.description)}</p>${patternVisual(p.id)}<dl><div><dt>适用条件</dt><dd>${h(p.when)}</dd></div><div><dt>维护代价</dt><dd>${h(p.cost)}</dd></div></dl></article>`).join('')}</div>
 ${chapter('report-frameworks','05','技术与框架路线')}<div class="pattern-grid">${d.frameworks.map((f,i)=>`<article class="framework-card ${i===0?'primary-choice':''}"><div class="framework-heading"><span>${h(f.layer)}</span><span>${i===0?'优先考虑':'备选方向'}</span></div><h3>${h(f.name)}</h3>${f.matchedLanguages?.length?`<p class="tiny">适用技术栈：${h(f.matchedLanguages.map(v=>answerLabel('language',v)).join('、'))}</p>`:''}<p>${h(f.fit)}</p><small>${h(f.cost)}</small>${f.url?`<a href="${h(f.url)}" target="_blank" rel="noopener noreferrer">查看官方文档 ${icon('arrow_forward')}</a>`:''}</article>`).join('')}</div><p class="subtle">${h(d.implementationNote)}</p>
 ${chapter('report-plan','06','从一条可用链路开始')}<div class="roadmap">${d.steps.map(x=>`<article class="roadmap-item"><div><h3>${h(x.title)}</h3><p>${h(x.detail)}</p></div></article>`).join('')}</div>
 ${d.reminders.length?`<section class="panel report-boundaries"><h2>实施中的边界与取舍</h2>${d.reminders.map(x=>`<p class="reminder"><strong>${h(x.title)}</strong>${h(x.detail)}</p>`).join('')}</section>`:''}
 ${d.questions.length?`<details class="details"><summary>还有 ${d.questions.length} 个问题可以继续澄清</summary>${d.questions.map(q=>`<p class="reminder"><strong>${h(q.title)}</strong>${h(q.why)} ${!demo?`<button class="btn small" data-jump-question="${q.id}">补充回答</button>`:''}</p>`).join('')}</details>`:''}
 <details class="details"><summary>查看完整报告文字</summary><pre>${h(reportMarkdown(d))}</pre></details><footer class="report-end"><div>${brandMark()}<p>把方案带进你的代码。<span>用配套 Skill 继续细化模块、接口与改造步骤。</span></p></div><button class="btn no-print" data-action="skill">下载 Skill ${icon('download')}</button></footer></article>`;
}

function render(keepScroll=false){
 const y=window.scrollY,activeId=document.activeElement?.id,p=progress();
 motionObserver?.disconnect();
 const menuImport=document.querySelector('#tool-menu [data-action=import]');menuImport.disabled=isImporting;menuImport.setAttribute('aria-busy',String(isImporting));
 document.body.dataset.page=page==='home'?'home':step===resultStep?'report':'workspace';
 if(page==='home'||step===resultStep){
   root.innerHTML=`<a class="skip-link" href="#main-content">跳到主要内容</a>`+(page==='home'?landingScreen():`${productHeader()}<main class="report-main" id="main-content" tabindex="-1">${sessionNotice()}${resultScreen()}</main>`);
   if(keepScroll){window.scrollTo(0,y);if(activeId)document.getElementById(activeId)?.focus({preventScroll:true});}else {window.scrollTo(0,0);if(didRender)root.querySelector('h1')?.focus({preventScroll:true});}
   if(page==='home')observeMotion();didRender=true;return;
 }

 root.innerHTML=`<a class='skip-link' href='#main-content'>跳到主要内容</a>${productHeader()}<div class='layout'><aside class='sidebar'><nav aria-label='选型章节'>${nav.map((x,i)=>{const qs=visibleQuestions(session).filter(q=>q.group===i),done=qs.filter(q=>session.answers[q.id]!=='unknown').length;return `<button id='section-${i}' class='nav-step ${step===i?'active':''}' data-go='${i}' ${step===i?'aria-current="step"':''}><span class='step-num'>${i+1}</span><span class='nav-label'>${x}</span>${qs.length?`<span class='nav-count'>${done}/${qs.length}</span>`:''}</button>`;}).join('')}</nav><div class='side-note'><p>${h(COURSE)}<br>第 02 课配套工具</p><button class='btn ghost full-width' data-action='reset'>${icon('add')}开始新方案</button><button class='btn full-width' data-action='skill'>${icon('download')}下载 Skill</button><p class='tiny'>回答保留在本机。可导出会话后继续使用。</p></div></aside><main class='main' id='main-content' tabindex='-1'><div class='mobile-section'><label for='section-select'>当前章节</label><select id='section-select' aria-label='选择问卷章节'>${nav.map((n,i)=>`<option value='${i}' ${i===step?'selected':''}>${i+1}. ${h(n)}</option>`).join('')}</select></div><div class='mobile-progress'>已明确 ${p.done} / ${p.all} 项<progress value='${p.done}' max='${p.all}' aria-label='问卷完成进度'></progress></div>${isImporting?`<div class='notice' role='status'>${icon('info')}正在读取会话文件…</div>`:''}${importError?`<div class='notice error' role='alert'>${icon('error')}<div><strong>会话未能导入</strong><p>${h(importError)}</p><button class='btn small' data-action='import'>重新选择文件</button></div></div>`:''}${step===resultStep?resultScreen():`<div class='workspace'><div class='question-content'>${step===0?contextScreen():questionsScreen()}<div class='step-footer'><button class='btn' data-action='previous' ${step===0&&questionPosition()===0?'disabled':''}>${icon('arrow_back')}上一题</button><span class='footer-position'>本节 ${questionPosition()+1} / ${groupQuestions().length}</span><button class='btn primary' data-next='true'>${questionPosition()<groupQuestions().length-1?'下一题':step===resultStep-1?'生成报告':'下一节'}${icon('arrow_forward')}</button></div></div>${preview()}</div>`}</main></div>`;
 if(keepScroll){window.scrollTo(0,y);if(activeId)document.getElementById(activeId)?.focus({preventScroll:true});}
 else {window.scrollTo(0,0);if(didRender)(document.getElementById('question-title')||root.querySelector('h1'))?.focus({preventScroll:true});}

 didRender=true;
}

function handbook(){
 document.getElementById('handbook-content').innerHTML=`<h2>先看任务，再组合模式。</h2><p class='why'>本课八条选配原则。点击场景只提供起点，实际选择由你的条件决定。</p><div class='principles'>${PRINCIPLES.map(([title,pattern,desc])=>`<article class='principle'><strong>${h(title)} → ${h(pattern)}</strong><p>${h(desc)}</p></article>`).join('')}</div><h3>模式速查</h3><div class='pattern-grid'>${PATTERNS.map(p=>`<article class='pattern-card'><h3>${h(p.name)}</h3><p>${h(p.description)}</p>${patternVisual(p.id,'handbook')}<p class='tradeoff'>${h(p.cost)}</p></article>`).join('')}</div><h3 class='section-heading'>框架按责任比较</h3><p class='why'>Model SDK → Agent Loop → Workflow / Graph → 协作 → Harness → Runtime。下面是候选方向，具体子能力与语言版本以官方文档为准。</p><div class='pattern-grid'>${FRAMEWORKS.map(f=>`<article class='pattern-card'><h3>${h(f.name)}</h3><span class='pill'>${h(f.layer)}</span><p>${h(f.fit)}</p><p class='tradeoff'>${h(f.cost)}</p>${f.url?`<a class='tiny' href='${h(f.url)}' target='_blank' rel='noopener noreferrer'>官方文档</a>`:''}</article>`).join('')}</div>`;
 document.getElementById('handbook').showModal();
}
function requireGoal(){
 if(session.goal.trim())return true;
 goalError=true;step=0;questionPositions[0]=0;render();document.getElementById('project-goal')?.focus();return false;
}
function go(n){page='work';demo=false;if(n===resultStep&&!requireGoal())return;step=n;render();}
root.addEventListener('input',e=>{
 const el=e.target;
 if(el.dataset.field)session[el.dataset.field]=el.value;
 if(el.dataset.field==='goal'&&el.value.trim()){goalError=false;el.setAttribute('aria-invalid','false');el.classList.remove('is-error');el.classList.add('is-success');const feedback=document.getElementById('goal-feedback');feedback.className='field-feedback success';feedback.removeAttribute('role');feedback.innerHTML=icon('check_circle')+'已填写项目目标。';}
 if(el.dataset.field==='goal'&&!el.value.trim()){el.classList.remove('is-success');const feedback=document.getElementById('goal-feedback');if(!goalError){feedback.className='field-feedback';feedback.textContent='请写清使用者、处理对象和预期结果。';}}
 if(el.dataset.stage!==undefined&&el.dataset.key==='name')session.stages[Number(el.dataset.stage)].name=el.value;
});
root.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='section-select'){go(Number(el.value));return;}
 if(el.dataset.answer){const q=QUESTIONS.find(q=>q.id===el.dataset.answer);session.answers[q.id]=toggleAnswer(q,session.answers[q.id],el.value,el.checked);questionPositions[step]=Math.max(0,groupQuestions().findIndex(q=>q.id===el.dataset.answer));render(true);return;}
 if(el.dataset.stage!==undefined&&el.tagName==='SELECT'){session.stages[Number(el.dataset.stage)][el.dataset.key]=el.value;render(true);}
});
function handleClick(e){
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.closest('#tool-menu'))document.getElementById('tool-menu').close();
 if(b.dataset.questionIndex!==undefined){questionPositions[step]=Number(b.dataset.questionIndex);render(true);return;}
 if(b.dataset.previewMode){previewMode=b.dataset.previewMode;render(true);return;}
 if(b.dataset.jumpQuestion){page='work';demo=false;const q=QUESTIONS.find(q=>q.id===b.dataset.jumpQuestion);step=q.group;questionPositions[step]=groupQuestions().findIndex(x=>x.id===q.id);render();return;}
 if(b.dataset.scenario){if(page==='home'&&session.goal&&!window.confirm('载入案例会替换当前方案。继续吗？'))return;page='work';demo=false;step=0;session=scenarioSession(b.dataset.scenario);for(const k in questionPositions)delete questionPositions[k];render(true);toast('已载入场景示例，后续条件都可以修改。');return;}
 if(b.dataset.go!==undefined){go(Number(b.dataset.go));return;}
 if(b.dataset.next){if(step===0&&!requireGoal())return;if(questionPosition()<groupQuestions().length-1){questionPositions[step]=questionPosition()+1;render();}else go(step+1);return;}
 if(b.dataset.removeStage!==undefined){session.stages.splice(Number(b.dataset.removeStage),1);render(true);return;}
 if(b.dataset.export){const d=currentDecision();const k=b.dataset.export;if(k==='report')download('architecture-report.md',reportMarkdown(d));if(k==='adr')download('architecture-adr.md',adrMarkdown(d));if(k==='mermaid')download('architecture.mmd',mermaid(d));if(k==='session')download('architecture-session.json',JSON.stringify(d.session,null,2),'application/json');toast('下载文件已准备好。','success');return;}
 switch(b.dataset.action){
 case 'home':if(demo)step=demoReturnStep;demo=false;page='home';render();break;
 case 'workspace':if(demo){step=demoReturnStep;demo=false;}else if(step===resultStep)step=0;page='work';render();break;
 case 'demo':demoReturnStep=step;demo=true;page='work';step=resultStep;render();break;
 case 'motion':motionPaused=!motionPaused;observeMotion();break;
 case 'tools':document.getElementById('tool-menu').showModal();break;
 case 'previous':if(questionPosition()>0){questionPositions[step]=questionPosition()-1;render();}else go(step-1);break;
 case 'custom':page='work';demo=false;session=normalize({});render();document.getElementById('project-goal')?.focus();break;
 case 'add-stage':if(session.stages.length<12){session.stages.push({name:'新的阶段',path:'inherit',effect:'read'});render(true);}break;
 case 'save':try{localStorage.setItem(STORE,JSON.stringify(normalize(session)));hasDraft=true;toast('草稿已保存在本机浏览器。','success');}catch{download('architecture-session.json',JSON.stringify(normalize(session),null,2),'application/json');toast('当前环境不支持本地保存，已改为下载会话。');}break;
 case 'restore':try{page='work';demo=false;step=0;session=normalize(JSON.parse(localStorage.getItem(STORE)));hasDraft=false;render();toast('已恢复草稿。');}catch{toast('草稿无法读取，可以导入之前下载的 JSON。','error');}break;
 case 'clear':try{localStorage.removeItem(STORE);hasDraft=false;toast('本机草稿已清除，当前方案仍在页面中。');render(true);}catch{toast('当前没有可清除的本地存储。');}break;
 case 'reset':if(window.confirm('开始新方案？未保存的当前内容将清空。')){page='work';demo=false;session=normalize({});step=0;goalError=false;importError='';for(const k in questionPositions)delete questionPositions[k];render();}break;
 case 'import':document.getElementById('import-file').click();break;
 case 'handbook':handbook();break;
 case 'print':window.print();break;
 case 'skill':{if(typeof BUNDLED_SKILL==='undefined'||!BUNDLED_SKILL){toast('请先运行构建命令生成 Skill 包。');break;}const bytes=Uint8Array.from(atob(BUNDLED_SKILL),c=>c.charCodeAt(0));download('agent-architecture-composer-skill.zip',new Blob([bytes],{type:'application/zip'}));toast('已准备 Skill 下载包，安装方法见压缩包中的说明。');break;}
 }
}
root.addEventListener('click',handleClick);
document.getElementById('tool-menu').addEventListener('click',handleClick);
document.getElementById('close-handbook').addEventListener('click',()=>document.getElementById('handbook').close());
document.getElementById('import-file').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 isImporting=true;importError='';render(true);
 try{if(file.size>1024*1024)throw new Error('会话文件不能超过 1 MB。');const parsed=JSON.parse(await file.text());session=normalize(parsed);page='work';demo=false;goalError=false;step=0;for(const k in questionPositions)delete questionPositions[k];render();toast('会话已导入，可以继续修改或生成方案。','success');}catch(err){importError=err.message;toast('导入失败：'+err.message,'error');}finally{isImporting=false;e.target.value='';render(true);}
});
for(const dialog of document.querySelectorAll('dialog')){dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]')){const target=document.getElementById(dialog.id==='handbook'?'handbook-button':'more-button');(target?.offsetParent?target:document.getElementById('more-button'))?.focus({preventScroll:true});}});}
document.getElementById('close-tools').addEventListener('click',()=>document.getElementById('tool-menu').close());
render();
