import { QUESTIONS } from './knowledge.mjs';

export function answerValues(value) {
  return value == null || value === 'unknown' ? [] : Array.isArray(value) ? value : [value];
}
export function hasAnswer(answers, id, value) { return answerValues(answers[id]).includes(value); }
export function answerLabel(id, value) {
  const q=QUESTIONS.find(q=>q.id===id);
  return answerValues(value).map(v=>q?.options.find(o=>o.value===v)?.label||v).join('、')||'待澄清';
}
export function normalizeAnswer(q, value='unknown') {
  if(!q.multiple) {
    if(value!=='unknown'&&!q.options.some(o=>o.value===value))throw new Error(q.title+'：需要一个有效单选值。');
    return value;
  }
  const values=answerValues(value).flatMap(v=>q.legacyValues?.[v]||[v]);
  if(values.some(v=>!q.options.some(o=>o.value===v)))throw new Error(q.title+'：包含无效多选值。');
  const selected=q.options.filter(o=>values.includes(o.value)).map(o=>o.value);
  if(selected.length>1&&selected.some(v=>q.exclusive?.includes(v)))throw new Error(q.title+'：排他选项不能与其他选项同时选择。');
  return selected.length?selected:'unknown';
}
export function toggleAnswer(q, current, value, checked) {
  if(!q.multiple)return value;
  if(value==='unknown')return 'unknown';
  if(checked&&q.exclusive?.includes(value))return [value];
  const values=answerValues(current).filter(v=>v!==value&&!(checked&&q.exclusive?.includes(v)));
  return normalizeAnswer(q,checked?[...values,value]:values);
}
