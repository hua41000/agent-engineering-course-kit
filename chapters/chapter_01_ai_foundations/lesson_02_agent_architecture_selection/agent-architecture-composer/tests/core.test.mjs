import test from 'node:test';
import assert from 'node:assert/strict';
import {normalize,scenarioSession,recommend,nextQuestions} from '../src/core.mjs';
import {QUESTIONS} from '../src/knowledge.mjs';
import {toggleAnswer} from '../src/answers.mjs';
import {reportMarkdown,mermaid} from '../src/report.mjs';

test('确定规则保留普通代码，不增加 Agent 模式',()=>{
 const s=scenarioSession('data');s.answers.semantic='no';
 const d=recommend(s);assert.equal(d.key,'software');assert.ok(!d.patterns.some(p=>['react','harness','tool'].includes(p.id)));
});
test('固定重试不因观察变化升级为 ReAct',()=>{
 const s=scenarioSession('data');s.answers.feedback='no';s.answers.parallel='none';s.answers.isolation='none';
 const d=recommend(s);assert.equal(d.key,'workflow');assert.ok(!d.patterns.some(p=>p.id==='react'));
});
test('局部写入会激活授权补问并标记当前目标缺口',()=>{
 const s=scenarioSession('data');s.stages[2].effect='write';
 assert.ok(nextQuestions(s).some(q=>q.id==='approval'));
 const d=recommend(s);assert.ok(d.conditions.some(t=>t.includes('尚不满足自动执行')));assert.equal(d.stages[2].owner,'应用 / Workflow');
});
test('改为 TypeScript 保留结构并过滤 Python 专属候选',()=>{
 const s=scenarioSession('data');s.answers.team='lean';const a=recommend(s);s.answers.language='typescript';const b=recommend(s);
 assert.equal(a.key,b.key);assert.ok(a.frameworks.some(f=>f.id==='pydantic'));assert.ok(!b.frameworks.some(f=>f.id==='pydantic'));assert.ok(b.frameworks.some(f=>f.id==='mastra'));
});
test('未知项和阶段覆盖在 JSON 往返中保留',()=>{
 const s=scenarioSession('refund');s.answers.verifier='unknown';
 const restored=normalize(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored,s);assert.ok(nextQuestions(restored).some(q=>q.id==='verifier'));
 assert.throws(()=>normalize({schema_version:3}));assert.throws(()=>normalize({answers:{path:'invented'}}));
});
test('报告、图与决策使用同一任务与阶段',()=>{
 const d=recommend(scenarioSession('data'));
 assert.ok(reportMarkdown(d).includes(d.architecture.name));for(const s of d.stages){assert.ok(reportMarkdown(d).includes(s.name));assert.ok(mermaid(d).includes(s.name));}
 assert.ok(reportMarkdown(d).includes('重新评估的时机'));
});

test('案例标签和未知行业不改变同一任务的选型结构',()=>{
 const a=normalize({goal:'园区设施异常处置',industryDetail:'环保设施',answers:{semantic:'yes',path:'local',effect:'read',industry:'other'}});
 const b=normalize({...a,scenario:'data',answers:{...a.answers,industry:'health'}});
 const x=recommend(a),y=recommend(b);
 assert.equal(x.key,y.key);assert.deepEqual(x.patterns,y.patterns);assert.deepEqual(x.frameworks,y.frameworks);
 assert.notDeepEqual(x.context.dimensions,y.context.dimensions);
});
test('从改造切换为新建后，隐藏回答保留但不影响决策',()=>{
 const a=normalize({answers:{existing:'limited',current:'workflow',change:'extension',bottleneck:'cost'}});
 assert.ok(nextQuestions(a).some(q=>q.id==='dataSource'));
 a.answers.existing='new';const x=recommend(a),y=recommend({answers:{existing:'new'}});
 assert.deepEqual(x.context,y.context);assert.deepEqual(x.frameworks,y.frameworks);
 assert.ok(!x.visibleQuestionIds.includes('change'));assert.equal(x.session.answers.change,'extension');
 assert.ok(!reportMarkdown(x).includes('| 这次允许改动多大范围？ |'));
});
test('约束改变执行范围、组件与迁移路线，而不靠行业标签',()=>{
 const s=scenarioSession('data');Object.assign(s.answers,{existing:'limited',current:'workflow',change:'extension',bottleneck:'integration',dataSource:'documents',integration:'partial',dataReady:'blocked',risk:'critical',effect:'write',approval:'ready',autonomy:'full',oversight:'strict',latency:'realtime'});
 const d=recommend(s);
 assert.match(d.context.migration.title,/保留核心/);assert.ok(d.context.components.some(c=>c.name==='知识检索层'));
 assert.match(d.executionMode,/草稿/);assert.ok(d.conditions.some(x=>x.includes('实时')));assert.ok(d.conditions.some(x=>x.includes('冲突')));
 assert.ok(d.steps.some(x=>x.title==='先打通必要输入与接口'));
});
test('单一探索任务包含写入时，报告显式拆开分析与执行',()=>{
 const s=normalize({goal:'自主调查后创建工单',answers:{semantic:'yes',path:'open',feedback:'yes',effect:'write',approval:'ready',risk:'material',autonomy:'approval',oversight:'audited',dataReady:'ready'}});
 const d=recommend(s);assert.equal(d.stages.length,2);assert.equal(d.stages[0].owner,'Agent / Planner');assert.equal(d.stages[1].owner,'应用 / Workflow');assert.match(d.stages[1].condition,/批准/);
});
test('空问卷只给待确认方向，补问覆盖决策约束',()=>{
 const d=recommend({goal:'自定义任务'});assert.equal(d.status,'待补充关键条件');assert.ok(d.completeness.criticalMissing.includes('risk'));assert.ok(d.completeness.criticalMissing.includes('deployment'));
});

test('旧单选会话迁移为多选集合，旧混合数据展开，序列化不丢项',()=>{
 const old={schema_version:1,answers:{business:'analysis',dataSource:'mixed',verifier:'human'}};
 const s=normalize(old);assert.equal(s.schema_version,2);assert.deepEqual(s.answers.business,['analysis']);assert.deepEqual(s.answers.dataSource,['documents','structured']);
 assert.deepEqual(normalize(JSON.parse(JSON.stringify(s))),s);
 assert.throws(()=>normalize({answers:{risk:['low','critical']}}));
 assert.throws(()=>normalize({answers:{business:['analysis','unknown']}}));
 assert.deepEqual(normalize({answers:{business:[]}}).answers.business,'unknown');
});
test('多选组合同时保留入口、数据、接入、时延与改造需求',()=>{
 const answers={existing:'limited',change:'extension',industry:['health','manufacturing'],business:['analysis','service'],interaction:['chat','event','batch'],dataSource:['documents','structured','live'],integration:['api','ui','partial'],latency:['interactive','async','realtime'],current:['workflow','agent'],bottleneck:['cost','integration']};
 const d=recommend({answers});const names=d.context.components.map(c=>c.name);
 for(const name of ['会话与任务状态','事件入口与去重','任务队列与批处理','知识检索层','受控查询与计算层','事件与时间窗处理','同步响应路径','后台任务路径','确定性实时路径'])assert.ok(names.includes(name),name);
 assert.equal(names.length,new Set(names).size);assert.ok(d.conditions.some(x=>x.includes('界面操作')));assert.ok(d.conditions.some(x=>x.includes('实时')));
 assert.match(d.context.migration.detail,/Workflow/);assert.match(d.context.migration.detail,/上下文/);
 const reversed=Object.fromEntries(Object.entries(answers).map(([k,v])=>[k,Array.isArray(v)?[...v].reverse():v]));
 assert.deepEqual(recommend({answers:reversed}),d);
 assert.match(reportMarkdown(d),/分析与研究、咨询与服务/);
});
test('多路径按任务组合并保留协作、检查和写入边界',()=>{
 const d=recommend({answers:{semantic:'yes',path:['fixed','open','compiled'],feedback:'yes',planning:'long',parallel:['fixed','dynamic'],isolation:['tool','handoff'],verifier:['automatic','human'],effect:['read','write'],approval:'missing'}});
 assert.equal(d.key,'workflowHybrid');assert.equal(d.pathVariants.length,3);
 for(const id of ['chain','react','compiled','parallel','workers','tool','handoff','evaluator','approval'])assert.ok(d.patterns.some(p=>p.id===id),id);
 assert.equal(d.stages.at(-1).owner,'应用 / Workflow');assert.match(d.stages[0].verification,/测试.*人工/);assert.match(d.executionMode,/草稿/);
 assert.match(reportMarkdown(d),/按任务组合处理路径/);
 assert.ok(d.visibleQuestionIds.includes('approval'));assert.ok(d.visibleQuestionIds.includes('autonomy'));
 const read=recommend({...d.session,answers:{...d.session.answers,effect:['read']}});
 assert.ok(!read.visibleQuestionIds.includes('approval'));assert.ok(!read.patterns.some(p=>p.id==='approval'));
});
test('多语言候选标注实际适用范围，覆盖每种已选语言',()=>{
 const d=recommend({answers:{language:['python','typescript','dotnet'],team:'lean',semantic:'yes',path:['open'],feedback:'yes'}});
 for(const lang of ['python','typescript','dotnet'])assert.ok(d.frameworks.some(f=>f.matchedLanguages.includes(lang)),lang);
 for(const f of d.frameworks)for(const lang of f.matchedLanguages)assert.ok(f.languages.includes(lang));
 const p=d.frameworks.find(f=>f.id==='pydantic');assert.deepEqual(p.matchedLanguages,['python']);
});

test('排他项和未知清空组合，取消最后一项重新进入待澄清',()=>{
 const q=QUESTIONS.find(q=>q.id==='isolation');
 assert.deepEqual(toggleAnswer(q,['tool'],'handoff',true),['tool','handoff']);
 assert.deepEqual(toggleAnswer(q,['tool','handoff'],'none',true),['none']);
 assert.deepEqual(toggleAnswer(q,['none'],'tool',true),['tool']);
 assert.equal(toggleAnswer(q,['tool'],'tool',false),'unknown');
 assert.equal(toggleAnswer(q,['tool'],'unknown',true),'unknown');
 assert.throws(()=>normalize({answers:{isolation:['none','tool']}}));
 assert.ok(nextQuestions({answers:{isolation:[]}}).some(q=>q.id==='isolation'&&q.multiple&&q.exclusive.includes('none')));
});
