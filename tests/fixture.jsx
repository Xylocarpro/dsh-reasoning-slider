import React, { useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { ReasoningSlider } from '../src/client.jsx';
import css from '../src/style.css';
const style = document.createElement('style'); style.textContent = css; document.head.append(style);
const models = ['DeepSeek V4 Flash','DeepSeek V4 Pro'].map((name, i) => ({ id: `model-${i}`, name, reasoning: { defaultEffort:'high', efforts:['off','low','high','max'].map(id=>({id,name:id})) } }));
let state = { current:{provider:'test',model:'model-0',reasoningEffort:'low'}, groups:[{id:'test',name:'DeepSeek',models}], failures:[], pending:null, status:'ready', routable:true };
const listeners = new Set();
const emit = patch => { state = {...state,...patch}; listeners.forEach(fn=>fn()); };
const subscribe = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const snapshot = () => state;
window.fixture = { calls:[], fail:false, emit, state: snapshot, mounts:0 };
const select = async selection => {
  window.fixture.calls.push(selection); emit({pending:selection,status:'loading'});
  await new Promise(resolve => setTimeout(resolve,180));
  if(window.fixture.fail) { emit({pending:null,status:'ready'}); return {ok:false,error:{message:'模拟保存失败'}}; }
  emit({current:selection,pending:null,status:'ready'}); return {ok:true,value:undefined};
};
const load = () => {};
const root = createRoot(document.getElementById('app'));
window.fixture.unmount = () => root.unmount();
root.render(<ReasoningSlider locked={false} available directory={{ subscribe, getSnapshot: snapshot }} load={load} select={select}/>);
