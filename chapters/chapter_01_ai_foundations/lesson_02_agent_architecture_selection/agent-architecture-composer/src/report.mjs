import { COURSE, QUESTIONS } from './knowledge.mjs';
import { answerLabel } from './answers.mjs';
const md=(s)=>String(s??'').replace(/[\r\n]+/g,' ').replace(/\|/g,'\\|').replace(/[<>]/g,'');
export function mermaid(d) {
  const label=s=>String(s).replace(/["\n\r<>\[\]{}|`]/g,' ').slice(0,100);
  const lines=['flowchart TD','  goal["'+label(d.session.goal||d.session.name)+'"]'];
  d.stages.forEach((s,i)=>{
    lines.push('  n'+i+'["'+label(s.name)+' · '+label(s.owner)+'"]');
    lines.push('  '+(i?'n'+(i-1):'goal')+' --> n'+i);
    if(s.effect==='write'&&d.session.answers.approval!=='ready')lines.push('  n'+i+' -.-> pending'+i+'["待补齐受控执行入口"]');
  });
  lines.push('  n'+(d.stages.length-1)+' --> result["结果检查与交付"]');
  return lines.join('\n');
}
export function reportMarkdown(d) {
  const s=d.session;
  const text=['# '+md(s.name),'', '> '+COURSE+' · Agent Architecture Composer · '+d.edition,'',
    '## 推荐方案','', '**'+d.architecture.name+'** — '+d.status,'',d.architecture.summary,'',
    '业务目标：'+md(s.goal||'待补充'),'','现有系统：'+md(s.existingStack||'未提供'),'',
    '### 选择理由','',...d.reasons.map(x=>'- '+x),'',
    '## 建设与改造路线','',d.context.migration.title,'',d.context.migration.detail,'','执行范围：'+d.executionMode,'','具体行业：'+md(s.industryDetail||'见输入摘要'),'业务环节与使用者：'+md(s.businessDetail||'见业务目标'),'','## 系统能力组合','',...d.context.components.map(c=>'- **'+c.name+'**：'+c.detail),'','## 回答与方案的关系','',...d.context.dimensions.map(x=>'- **'+x.title+' '+md(x.answer)+'**：'+md(x.impact)),'','## 任务阶段与控制权','','| 阶段 | 谁决定下一步 | 模式 | 检查与边界 |','|---|---|---|---|',
    ...d.stages.map(x=>'| '+md(x.name)+' | '+x.owner+' | '+x.patterns.map(p=>p.name).join(' + ')+' | '+x.verification+'；'+x.condition+' |'),'',
    ...(d.pathVariants.length?['## 按任务组合处理路径','','以下路径按任务类型选择，需补充具体任务与路径的对应关系。',...d.pathVariants.map(v=>'- **'+v.label+'**：'+v.architecture+'；'+v.patterns.join(' + ')),'']:[]),'## 模式组合','',...d.patterns.map(p=>'- **'+p.name+'**：'+p.description+' 成立条件：'+p.when+'。取舍：'+p.cost+'。'),'',
    '## 技术与框架路线','',...d.frameworks.map((f,i)=>(i+1)+'. **'+f.name+'**：'+md(f.fit)+(f.matchedLanguages?.length?' 适用技术栈：'+f.matchedLanguages.map(v=>answerLabel('language',v)).join('、')+'。':'')+' 取舍：'+f.cost+(f.url?' [官方文档]('+f.url+')':'')),
    '',d.implementationNote,'','## 备选方案','',...d.alternatives.map(x=>'- **'+x.name+'**：'+x.reason),'',
    '## 实施顺序','',...d.steps.map((x,i)=>(i+1)+'. **'+x.title+'**：'+md(x.detail)),
    '','## 需要补充的条件','',...(d.conditions.length?d.conditions.map(x=>'- '+x):['- 当前已填信息可支撑初步讨论，具体实施仍按项目约束确认。']),
    ...d.questions.map(q=>'- '+q.title+'（'+q.why+'）'),'',
    '## 关键取舍','',...d.reminders.map(x=>'- **'+x.title+'**：'+x.detail),'',
    '## 调用与移交约定','',d.contracts.join(' / '),'',
    '## 架构草图','','```mermaid',mermaid(d),'```','',
    '## 输入摘要','','| 问题 | 回答 |','|---|---|',
    ...QUESTIONS.filter(q=>d.visibleQuestionIds.includes(q.id)).map(q=>'| '+q.title+' | '+answerLabel(q.id,s.answers[q.id])+' |'),
    '',s.notes?'补充说明：'+md(s.notes):'',
    '','## 重新评估的时机','','任务终态、写入权限、模型能力、语言与部署约束、团队维护能力发生变化时，修改会话条件重新生成。',''];
  return text.join('\n');
}
export function adrMarkdown(d) {
 return ['# 架构决策记录：'+md(d.session.name),'','## 目标',md(d.session.goal||'待补充'),'','## 当前选择',d.architecture.name,'',...d.reasons.map(x=>'- '+x),'','## 建设与迁移',d.context.migration.title,d.context.migration.detail,'执行范围：'+d.executionMode,'','## 接受的代价',...d.reminders.map(x=>'- '+x.detail),'','## 备选',...d.alternatives.map(x=>'- '+x.name+'：'+x.reason),'','## 待确认',...d.conditions.map(x=>'- '+x),...d.questions.map(x=>'- '+x.title),'','## 重选条件','任务、风险、技术栈或维护能力变化后重新评估。',''].join('\n');
}
