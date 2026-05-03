'use strict';
// ═══════════════════════════════════════════════════════════════
//  KAYRO INTERACTIVE — AI WORKFORCE PLATFORM
// ═══════════════════════════════════════════════════════════════

// ── CONSTANTS ──────────────────────────────────────────────────
const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#ef4444','#06b6d4','#f97316','#ec4899','#10b981','#8b5cf6','#84cc16','#0ea5e9'];
const SKIN   = [0xf5c285,0xe8b070,0xf2bf78,0xeab86e,0xf0b268,0xebba72,0xf3c182,0xe9b46e,0xf1bd7a,0xeab46c];
const COLS   = ['todo','inprogress','review','done'];
const COL_LABELS = {todo:'TO DO',inprogress:'IN PROGRESS',review:'REVIEW',done:'DONE'};

const DEFAULT_EMPLOYEES = [
  {id:'e1',name:'Omar',  role:'Head of Product',  color:'#3b82f6',bodyHex:0x3b82f6,skinHex:0xf5c285,pos:[-2.5, 1.5],status:'online', skills:['Product Strategy','Roadmapping','User Research'],      hired:Date.now(),tasks:0,
   system:'You are Omar, Head of Product at Kayro Interactive. You are strategic, data-driven, and user-obsessed. Give sharp, concise product advice. Max 3 sentences unless detail is needed.'},
  {id:'e2',name:'Sarah', role:'Lead Engineer',    color:'#22c55e',bodyHex:0x22c55e,skinHex:0xe8b070,pos:[-5.0,-3.5],status:'online', skills:['React','Node.js','System Architecture'],              hired:Date.now(),tasks:0,
   system:'You are Sarah, Lead Engineer at Kayro Interactive. You are technical, precise, and love clean code. Give direct technical answers. Max 3 sentences unless a code snippet is needed.'},
  {id:'e3',name:'Alex',  role:'Marketing',        color:'#f59e0b',bodyHex:0xf59e0b,skinHex:0xf2bf78,pos:[ 2.0,-0.5],status:'online', skills:['Growth Marketing','SEO','Social Media'],              hired:Date.now(),tasks:0,
   system:'You are Alex, Marketing Manager at Kayro Interactive. You are creative, data-driven, and growth-focused. Give punchy marketing advice. Max 3 sentences.'},
  {id:'e4',name:'Zara',  role:'UI/UX Designer',   color:'#a855f7',bodyHex:0xa855f7,skinHex:0xeab86e,pos:[ 0.5, 2.8],status:'online', skills:['Figma','User Research','Prototyping'],                hired:Date.now(),tasks:0,
   system:'You are Zara, UI/UX Designer at Kayro Interactive. You care deeply about user experience and beautiful design. Give thoughtful, empathy-first design feedback. Max 3 sentences.'},
  {id:'e5',name:'Chris', role:'Sales',            color:'#ef4444',bodyHex:0xef4444,skinHex:0xf0b268,pos:[ 4.5, 0.5],status:'online', skills:['Cold Outreach','CRM','Closing Deals'],                hired:Date.now(),tasks:0,
   system:'You are Chris, Sales Manager at Kayro Interactive. You are confident, persuasive, and relationship-focused. Give sales advice with energy. Max 3 sentences.'},
  {id:'e6',name:'Mia',   role:'Customer Success', color:'#06b6d4',bodyHex:0x06b6d4,skinHex:0xebba72,pos:[-1.5,-5.0],status:'online', skills:['Onboarding','Support','Retention'],                   hired:Date.now(),tasks:0,
   system:'You are Mia, Customer Success Manager at Kayro Interactive. You are empathetic and solution-focused. Give warm, actionable advice. Max 3 sentences.'},
];

// ── STATE ──────────────────────────────────────────────────────
const State = {
  settings: { apiKey:'', companyName:'Kayro Interactive', ejServiceId:'', ejTemplateId:'', ejPublicKey:'' },
  employees: [],
  tasks: [],
  workbook: { activeTab:0, tabs:[{name:'Sheet1',cells:{}}] },
  contacts: [
    {id:'c1',name:'James Carter',email:'james@acmecorp.com',company:'Acme Corp'},
    {id:'c2',name:'Lisa Chen',email:'lisa@startupxyz.io',company:'StartupXYZ'},
    {id:'c3',name:'Marcus Rivera',email:'m.rivera@techventures.co',company:'Tech Ventures'},
  ],
  chatHistory: {},
  ui: { chatOpen:false, chatActiveEmpId:null, page:'hq' },
};

function loadState() {
  const keys = ['settings','employees','tasks','workbook','contacts','chatHistory'];
  keys.forEach(k => {
    try {
      const v = localStorage.getItem('kayro_'+k);
      if (v) State[k] = JSON.parse(v);
    } catch(e) {}
  });
  if (!State.employees.length) State.employees = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES));
}

let _saveTm = {};
function save(key) {
  clearTimeout(_saveTm[key]);
  _saveTm[key] = setTimeout(() => {
    try { localStorage.setItem('kayro_'+key, JSON.stringify(State[key])); } catch(e) {}
  }, 300);
}

// ── UTILITIES ──────────────────────────────────────────────────
function uid() { return '_'+(Math.random()*1e9|0).toString(36)+(Date.now()).toString(36); }
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getEmp(id) { return State.employees.find(e=>e.id===id)||null; }

// ── TOASTS ────────────────────────────────────────────────────
function toast(msg, type='') {
  const w = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = 'toast '+(type||'');
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(()=>t.remove(), 3000);
}

// ── MODAL ─────────────────────────────────────────────────────
const Modal = {
  open(title, bodyHtml, opts={}) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').classList.add('open');
    if (opts.onOpen) opts.onOpen();
  },
  close() { document.getElementById('modal-overlay').classList.remove('open'); }
};
document.getElementById('modal-close').addEventListener('click', Modal.close);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target.id==='modal-overlay') Modal.close();
});

// ── AI CLIENT ─────────────────────────────────────────────────
const AI = {
  async *stream(messages, system) {
    const key = State.settings.apiKey;
    if (!key) { yield '⚠️ No API key. Go to Settings → add your Claude API key.'; return; }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          stream: true,
          system: system || 'You are a helpful AI employee at Kayro Interactive.',
          messages,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(()=>({error:{message:res.status}}));
        yield `⚠️ API error: ${e?.error?.message||res.status}`;
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data==='[DONE]') return;
          try {
            const ev = JSON.parse(data);
            if (ev.type==='content_block_delta'&&ev.delta?.type==='text_delta') yield ev.delta.text;
          } catch {}
        }
      }
    } catch(e) { yield `⚠️ Network error: ${e.message}`; }
  },
  async once(messages, system) {
    let out='';
    for await (const chunk of AI.stream(messages,system)) out+=chunk;
    return out;
  },
};

// ── ROUTER ────────────────────────────────────────────────────
const Router = {
  current: null,
  navigate(page) {
    if (Router.current===page) return;
    const pages = { hq:HQ, employees:Employees, tasks:Tasks, spreadsheet:Sheet, email:Email, settings:Settings };
    if (Router.current && pages[Router.current]?.destroy) pages[Router.current].destroy();
    document.querySelectorAll('.nav-item[data-page]').forEach(el=>
      el.classList.toggle('active', el.dataset.page===page));
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    const titles = {hq:'Headquarters',employees:'Employees',tasks:'Tasks',spreadsheet:'Spreadsheet',email:'Cold Email',settings:'Settings'};
    document.getElementById('topbar-title').textContent = titles[page]||page;
    document.getElementById('topbar-right').innerHTML = '<button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>';
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    Router.current = page;
    State.ui.page = page;
    if (pages[page]) pages[page].init(container);
    document.getElementById('brand-name').textContent = State.settings.companyName||'Kayro';
  }
};
document.querySelectorAll('.nav-item[data-page]').forEach(el=>
  el.addEventListener('click',()=>Router.navigate(el.dataset.page)));

// ── CHAT PANEL ────────────────────────────────────────────────
const Chat = {
  activeEmpId: null,
  init() {
    document.getElementById('chat-close').addEventListener('click',()=>Chat.close());
    document.getElementById('chat-send').addEventListener('click',()=>Chat.send());
    const inp = document.getElementById('chat-input');
    inp.addEventListener('keydown', e=>{
      if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();Chat.send();}
    });
    inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,100)+'px';});
    Chat.renderTabs();
    if (State.employees.length) Chat.setEmp(State.employees[0].id, false);
  },
  toggle() {
    const panel = document.getElementById('chat-panel');
    panel.classList.toggle('open');
  },
  open(empId) {
    document.getElementById('chat-panel').classList.add('open');
    if (empId) Chat.setEmp(empId);
  },
  close() { document.getElementById('chat-panel').classList.remove('open'); },
  renderTabs() {
    const tabs = document.getElementById('chat-emp-tabs');
    tabs.innerHTML = State.employees.map(e=>`
      <button class="chat-emp-pill${Chat.activeEmpId===e.id?' active':''}" data-eid="${e.id}">
        <span class="cp-dot" style="background:${e.color}"></span>${e.name}
      </button>`).join('');
    tabs.querySelectorAll('.chat-emp-pill').forEach(btn=>
      btn.addEventListener('click',()=>Chat.setEmp(btn.dataset.eid)));
  },
  setEmp(id, render=true) {
    const e = getEmp(id); if(!e) return;
    Chat.activeEmpId = id;
    document.getElementById('cp-av').textContent = e.name[0];
    document.getElementById('cp-av').style.background = e.color+'22';
    document.getElementById('cp-av').style.color = e.color;
    document.getElementById('cp-name').textContent = e.name;
    document.getElementById('cp-role').textContent = e.role;
    Chat.renderTabs();
    if (render) Chat.renderMessages();
    else {
      const msgs = document.getElementById('chat-messages');
      msgs.innerHTML='';
      if (!State.chatHistory[id]?.length) Chat.addBubble(id, e.name, e.color, `Hi! I'm ${e.name}, your ${e.role}. How can I help today?`, false, false);
      else Chat.renderMessages();
    }
  },
  renderMessages() {
    const id = Chat.activeEmpId; if(!id) return;
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML = '';
    const e = getEmp(id);
    const hist = State.chatHistory[id]||[];
    if (!hist.length) {
      Chat.addBubble(id, e.name, e.color, `Hi! I'm ${e.name}, your ${e.role}. How can I help today?`, false, false);
    } else {
      hist.forEach(m => {
        const isUser = m.role==='user';
        const av = isUser ? '👤' : e.name[0];
        const color = isUser ? '#7eb3ff' : e.color;
        const name = isUser ? 'You' : e.name;
        Chat._appendBubble(msgs, av, color, name, m.content, isUser);
      });
      msgs.scrollTop = msgs.scrollHeight;
    }
  },
  addBubble(empId, name, color, text, isUser, save=true) {
    const msgs = document.getElementById('chat-messages');
    const av = isUser ? '👤' : name[0];
    Chat._appendBubble(msgs, av, color, isUser?'You':name, text, isUser);
    msgs.scrollTop = msgs.scrollHeight;
    if (save) {
      if (!State.chatHistory[empId]) State.chatHistory[empId] = [];
      State.chatHistory[empId].push({role:isUser?'user':'assistant',content:text});
      if (State.chatHistory[empId].length > 80) State.chatHistory[empId].splice(0,2);
      save_('chatHistory');
    }
  },
  _appendBubble(container, av, color, name, text, isUser) {
    const div = document.createElement('div');
    div.className = 'msg'+(isUser?' user':'');
    div.innerHTML = `
      <div class="msg-av" style="background:${color}22;color:${color}">${av}</div>
      <div class="msg-body">
        <div class="msg-sender">${escHtml(name)}</div>
        <div class="msg-bubble">${escHtml(text)}</div>
      </div>`;
    container.appendChild(div);
  },
  async send() {
    const inp = document.getElementById('chat-input');
    const text = inp.value.trim(); if(!text||!Chat.activeEmpId) return;
    const e = getEmp(Chat.activeEmpId); if(!e) return;
    inp.value = ''; inp.style.height = 'auto';
    Chat.addBubble(Chat.activeEmpId, e.name, e.color, text, true);
    // typing indicator
    const msgs = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className='msg'; typing.id='chat-typing';
    typing.innerHTML=`<div class="msg-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
      <div class="msg-body"><div class="msg-sender">${e.name}</div>
      <div class="typing"><div class="tdot"></div><div class="tdot"></div><div class="tdot"></div></div></div>`;
    msgs.appendChild(typing); msgs.scrollTop=msgs.scrollHeight;
    // build message history
    const history = (State.chatHistory[Chat.activeEmpId]||[]).slice(-20);
    let full = '';
    const bubble = document.createElement('div');
    bubble.className = 'msg';
    bubble.innerHTML = `<div class="msg-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
      <div class="msg-body"><div class="msg-sender">${e.name}</div><div class="msg-bubble" id="stream-bubble"></div></div>`;
    const tn = document.createTextNode('');
    for await (const chunk of AI.stream(history, e.system)) {
      document.getElementById('chat-typing')?.remove();
      if (!bubble.isConnected) { msgs.appendChild(bubble); }
      tn.textContent += chunk; full += chunk;
      if (!bubble.querySelector('#stream-bubble').firstChild) bubble.querySelector('#stream-bubble').appendChild(tn);
      msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('chat-typing')?.remove();
    if (!bubble.isConnected) msgs.appendChild(bubble);
    // save response
    if (!State.chatHistory[Chat.activeEmpId]) State.chatHistory[Chat.activeEmpId]=[];
    State.chatHistory[Chat.activeEmpId].push({role:'assistant',content:full});
    save_('chatHistory');
  }
};
function save_(k){save(k);}

// ══════════════════════════════════════════════════════════════
//  PAGE: HQ (2D Dashboard)
// ══════════════════════════════════════════════════════════════
const HQ = {
  _active: false,
  _clock: null,

  _COMMITS: [
    ['feat','Merge branch "feature/ai-chat" into main'],
    ['fix', 'Resolve API streaming timeout on long responses'],
    ['docs','Update design system tokens for dark mode'],
    ['feat','Add UTM tracking to cold email campaigns'],
    ['fix', 'Resolve CRM duplicate contact detection bug'],
    ['feat','Add onboarding checklist for new subscribers'],
    ['refactor','Clean up task board drag-and-drop handlers'],
    ['feat','Add formula parser for AVERAGE and COUNT'],
    ['fix', 'Fix WebGL context leak on page revisit'],
    ['chore','Upgrade Claude model to haiku-4-5-20251001'],
    ['style','Align modal spacing to 8px grid'],
    ['feat','Implement cold email AI generation modal'],
  ],

  init(container) {
    HQ._active = true;
    container.innerHTML = '<div class="page-scroll" id="hq-root" style="padding:16px"></div>';
    const root = document.getElementById('hq-root');
    HQ._render(root);
    HQ._clock = setInterval(() => {
      const el = document.getElementById('hq-clock');
      if (el) {
        const n = new Date();
        el.textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
      }
    }, 30000);
  },

  destroy() {
    HQ._active = false;
    clearInterval(HQ._clock);
    HQ._clock = null;
  },

  _render(root) {
    const emps = State.employees;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const activeTasks = State.tasks.filter(t => t.column !== 'done').length;
    const doneTasks   = State.tasks.filter(t => t.column === 'done').length;
    const activities  = HQ._genActivity(emps);
    const statuses    = emps.map(() => Math.random() > 0.35 ? 'working' : 'idle');

    root.innerHTML = `
      <!-- Header -->
      <div class="hq2-header">
        <div class="hq2-clock-block">
          <div class="hq2-clock" id="hq-clock">${hh}:${mm}</div>
          <div class="hq2-date">${DAYS[now.getDay()]} · ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}</div>
        </div>
        <div class="hq2-stats">
          <div class="hq2-stat"><div class="hq2-stat-val" style="color:var(--green)">${emps.length}</div><div class="hq2-stat-lbl">ONLINE</div></div>
          <div class="hq2-stat"><div class="hq2-stat-val" style="color:var(--amber)">${activeTasks}</div><div class="hq2-stat-lbl">ACTIVE TASKS</div></div>
          <div class="hq2-stat"><div class="hq2-stat-val">${doneTasks}</div><div class="hq2-stat-lbl">COMPLETED</div></div>
          <div class="hq2-stat"><div class="hq2-stat-val" style="color:var(--accent)">${State.tasks.length}</div><div class="hq2-stat-lbl">TOTAL TASKS</div></div>
        </div>
        <button class="btn btn-primary" id="hq2-standup-btn">VIEW STANDUP</button>
      </div>

      <!-- Commit ticker -->
      <div class="hq2-ticker">
        <div class="hq2-ticker-track">
          ${[...activities,...activities].map(a=>`
            <span class="hq2-tick-item">
              <span class="hq2-tick-type">${escHtml(a.type)}</span>
              <span class="hq2-tick-name" style="color:${a.color}">${escHtml(a.name)}</span>
              <span class="hq2-tick-msg">${escHtml(a.msg)}</span>
              <span class="hq2-tick-time">${a.time}</span>
            </span>`).join('')}
        </div>
      </div>

      <!-- Employee list + Activity feed -->
      <div class="hq2-grid">
        <div class="hq2-emp-panel">
          <div class="hq2-panel-label">// team status</div>
          ${emps.map((e,i)=>`
            <div class="hq2-emp-row" data-eid="${e.id}">
              <div class="hq2-emp-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
              <div class="hq2-emp-info">
                <div class="hq2-emp-name">${escHtml(e.name)}</div>
                <div class="hq2-emp-role">${escHtml(e.role)}</div>
              </div>
              <div class="hq2-emp-status ${statuses[i]}">${statuses[i]==='working'?'WORKING':'IDLE'}</div>
            </div>`).join('')}
        </div>
        <div class="hq2-activity">
          <div class="hq2-panel-label">// commit activity</div>
          ${activities.map(a=>`
            <div class="hq2-act-row">
              <div class="hq2-act-hash">${a.hash}</div>
              <div class="hq2-act-type ${a.type}">${escHtml(a.type)}</div>
              <div class="hq2-act-msg">${escHtml(a.msg)}</div>
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                <div style="width:16px;height:16px;border-radius:50%;background:${a.color}22;color:${a.color};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:800">${a.name[0]}</div>
                <div class="hq2-act-time">${a.time}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Standup cards -->
      <div class="hq2-standup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div class="hq2-panel-label" style="margin-bottom:0">// daily standup</div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--text3)">${hh}:${mm} · ${DAYS[now.getDay()]}</div>
        </div>
        <div class="hq2-standup-grid">
          ${emps.map((e,i)=>HQ._standupCard(e,statuses[i])).join('')}
        </div>
      </div>`;

    root.querySelectorAll('.hq2-emp-row[data-eid]').forEach(row =>
      row.addEventListener('click', () => Chat.open(row.dataset.eid)));
    document.getElementById('hq2-standup-btn')?.addEventListener('click', () => Employees.showStandup());
  },

  _genActivity(emps) {
    return HQ._COMMITS.map(([ type, msg ], i) => {
      const emp  = emps[i % emps.length] || { name: 'System', color: '#3b82f6' };
      const mins = (i + 1) * 5 + Math.floor(i * 1.7);
      return {
        hash:  Math.random().toString(36).slice(2, 9),
        type, msg,
        name:  emp.name,
        color: emp.color,
        time:  mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`,
      };
    });
  },

  _standupCard(e, status) {
    const empTasks   = State.tasks.filter(t => t.assignee === e.id);
    const inProgress = empTasks.filter(t => t.column === 'inprogress');
    const done       = empTasks.filter(t => t.column === 'done');
    const isWorking  = status === 'working';
    const commits    = [
      `feat: ${e.name.toLowerCase()}-specific feature update`,
      `fix: resolve edge case in ${e.role.toLowerCase()} workflow`,
    ];
    return `
      <div class="hq2-su-card">
        <div class="hq2-su-hdr">
          <div class="hq2-su-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
          <div>
            <div class="hq2-su-name">${escHtml(e.name)}</div>
            <div class="hq2-su-role">${escHtml(e.role).toLowerCase()}</div>
          </div>
          <div class="hq2-su-status ${isWorking?'working':'idle'}">${isWorking?'WORKING':'IDLE'}</div>
        </div>
        <div class="hq2-su-section">CURRENT TASK</div>
        <div class="hq2-su-task">${inProgress.length ? escHtml(inProgress[0].title) : '<span style="color:var(--text3)">No active task</span>'}</div>
        <div class="hq2-su-section">RECENT COMMITS</div>
        ${commits.map(c=>`<div class="hq2-su-commit"><span class="hq2-commit-hash">${Math.random().toString(36).slice(2,9)}</span>${c}</div>`).join('')}
        <div class="hq2-su-section">TICKETS</div>
        <div class="hq2-su-task" style="color:var(--text2)">${empTasks.filter(t=>t.column!=='done').length} open &nbsp;·&nbsp; ${done.length} closed</div>
        <div class="hq2-su-sources">
          <button class="hq2-su-src active">GITHUB</button>
          <button class="hq2-su-src">JIRA</button>
          <button class="hq2-su-src">MANUAL</button>
        </div>
      </div>`;
  },
};

// ══════════════════════════════════════════════════════════════
//  PAGE: EMPLOYEES
// ══════════════════════════════════════════════════════════════
const Employees = {
  init(container) {
    container.innerHTML = '<div class="page-scroll" id="emp-page"></div>';
    // Add topbar actions
    document.getElementById('topbar-right').innerHTML = `
      <button class="tb-btn primary" id="hire-btn">+ Hire Employee</button>
      <button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('hire-btn').addEventListener('click', Employees.openHireModal);
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    Employees.render();
  },
  destroy() {},
  render() {
    const page = document.getElementById('emp-page');
    if (!page) return;
    const emps = State.employees;
    page.innerHTML = `
      <div class="section-hdr">
        <div>
          <div class="section-title">AI Employees <span style="color:var(--text2);font-weight:400;font-size:14px">(${emps.length})</span></div>
          <div class="section-sub">Manage your AI workforce. Click Chat to talk to any employee.</div>
        </div>
      </div>
      ${emps.length===0?`<div class="empty-state"><div class="empty-icon">👥</div><div style="font-size:14px;color:var(--text2)">No employees yet</div><div class="empty-text">Hire your first AI employee to get started</div></div>`:
        `<div class="emp-grid">${emps.map(e=>Employees._card(e)).join('')}</div>`}`;
    page.querySelectorAll('.emp-chat-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();Chat.open(btn.dataset.eid);}));
    page.querySelectorAll('.emp-fire-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();Employees.confirmFire(btn.dataset.eid);}));
    page.querySelectorAll('.emp-edit-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();Employees.openEditModal(btn.dataset.eid);}));
  },
  _card(e) {
    const taskCount = State.tasks.filter(t=>t.assignee===e.id).length;
    return `<div class="emp-card">
      <div class="emp-card-hdr">
        <div class="emp-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
        <div>
          <div class="emp-name">${escHtml(e.name)}</div>
          <div class="emp-role">${escHtml(e.role)}</div>
        </div>
        <div style="margin-left:auto"><span class="status-pill sp-online">● Online</span></div>
      </div>
      ${e.skills?.length?`<div class="emp-skills">${e.skills.map(s=>`<span class="skill-tag">${escHtml(s)}</span>`).join('')}</div>`:''}
      <div class="emp-stat-row">
        <div class="emp-stat"><b>${taskCount}</b> tasks</div>
        <div class="emp-stat"><b>${e.role}</b></div>
      </div>
      <div class="emp-btns">
        <button class="btn btn-primary btn-sm emp-chat-btn" data-eid="${e.id}">💬 Chat</button>
        <button class="btn btn-sm emp-edit-btn" data-eid="${e.id}">✏️ Edit</button>
        <button class="btn btn-danger btn-sm emp-fire-btn" data-eid="${e.id}">🔥 Fire</button>
      </div>
    </div>`;
  },
  openHireModal() {
    Modal.open('Hire New Employee', Employees._form(null), {
      onOpen() {
        document.getElementById('hire-submit').addEventListener('click', Employees.submitHire);
        document.getElementById('hire-cancel').addEventListener('click', Modal.close);
        document.querySelectorAll('.color-swatch').forEach(s=>s.addEventListener('click',()=>{
          document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('selected'));
          s.classList.add('selected');
        }));
      }
    });
  },
  openEditModal(id) {
    const e = getEmp(id); if(!e) return;
    Modal.open(`Edit — ${e.name}`, Employees._form(e), {
      onOpen() {
        document.getElementById('hire-submit').textContent = 'Save Changes';
        document.getElementById('hire-submit').addEventListener('click', ()=>Employees.submitEdit(id));
        document.getElementById('hire-cancel').addEventListener('click', Modal.close);
        document.querySelectorAll('.color-swatch').forEach(s=>s.addEventListener('click',()=>{
          document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('selected'));
          s.classList.add('selected');
        }));
      }
    });
  },
  _form(e) {
    const cols = COLORS;
    const selColor = e?.color || cols[Math.floor(Math.random()*cols.length)];
    return `
      <div class="form-group">
        <label class="form-label">FULL NAME</label>
        <input class="form-input" id="f-name" placeholder="e.g. Jordan Lee" value="${escHtml(e?.name||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">ROLE / JOB TITLE</label>
        <input class="form-input" id="f-role" placeholder="e.g. Growth Marketing Manager" value="${escHtml(e?.role||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">SKILLS (comma separated)</label>
        <input class="form-input" id="f-skills" placeholder="e.g. SEO, Email Marketing, Analytics" value="${escHtml((e?.skills||[]).join(', '))}">
      </div>
      <div class="form-group">
        <label class="form-label">AI PERSONALITY</label>
        <textarea class="form-textarea" id="f-system" placeholder="Describe how this employee should think and respond…">${escHtml(e?.system||'')}</textarea>
        <div class="form-hint">This shapes how your AI employee responds in chat, tasks, and emails.</div>
      </div>
      <div class="form-group">
        <label class="form-label">COLOR</label>
        <div class="color-swatches">${cols.map(c=>`<div class="color-swatch${c===selColor?' selected':''}" data-color="${c}" style="background:${c}"></div>`).join('')}</div>
      </div>
      <div class="modal-actions">
        <button class="btn" id="hire-cancel">Cancel</button>
        <button class="btn btn-primary" id="hire-submit">Hire Employee</button>
      </div>`;
  },
  submitHire() {
    const name = document.getElementById('f-name').value.trim();
    const role = document.getElementById('f-role').value.trim();
    const skills = document.getElementById('f-skills').value.split(',').map(s=>s.trim()).filter(Boolean);
    const system = document.getElementById('f-system').value.trim();
    const selSwatch = document.querySelector('.color-swatch.selected');
    const color = selSwatch?.dataset.color || COLORS[0];
    if (!name||!role) { toast('Name and role are required','error'); return; }
    const emp = {
      id: uid(), name, role, color,
      bodyHex: parseInt(color.replace('#',''),16),
      skinHex: SKIN[State.employees.length%SKIN.length],
      pos: [Math.random()*14-7, Math.random()*14-7],
      status: 'online', skills,
      system: system||`You are ${name}, ${role} at ${State.settings.companyName||'Kayro Interactive'}. Be professional, helpful, and concise.`,
      hired: Date.now(), tasks: 0,
    };
    State.employees.push(emp);
    save('employees');
    Chat.renderTabs();
    Modal.close();
    Employees.render();
    toast(`${name} has joined the team! 🎉`,'success');
  },
  submitEdit(id) {
    const e = getEmp(id); if(!e) return;
    e.name = document.getElementById('f-name').value.trim()||e.name;
    e.role = document.getElementById('f-role').value.trim()||e.role;
    e.skills = document.getElementById('f-skills').value.split(',').map(s=>s.trim()).filter(Boolean);
    e.system = document.getElementById('f-system').value.trim()||e.system;
    const selSwatch = document.querySelector('.color-swatch.selected');
    if (selSwatch) { e.color=selSwatch.dataset.color; e.bodyHex=parseInt(e.color.replace('#',''),16); }
    save('employees');
    Chat.renderTabs();
    Modal.close();
    Employees.render();
    toast('Employee updated','success');
  },
  confirmFire(id) {
    const e = getEmp(id); if(!e) return;
    Modal.open(`Fire ${e.name}?`, `
      <p style="color:var(--text2);font-size:13px;line-height:1.6;margin-bottom:20px">
        Are you sure you want to fire <strong style="color:var(--text)">${escHtml(e.name)}</strong>?
        Their task assignments will be cleared. This cannot be undone.
      </p>
      <div class="modal-actions">
        <button class="btn" id="fire-cancel">Cancel</button>
        <button class="btn btn-danger" id="fire-confirm">🔥 Fire ${escHtml(e.name)}</button>
      </div>`, {
      onOpen() {
        document.getElementById('fire-cancel').addEventListener('click',Modal.close);
        document.getElementById('fire-confirm').addEventListener('click',()=>{
          State.employees = State.employees.filter(x=>x.id!==id);
          State.tasks.forEach(t=>{if(t.assignee===id)t.assignee=null;});
          delete State.chatHistory[id];
          save('employees'); save('tasks'); save('chatHistory');
          Chat.renderTabs();
          if(Chat.activeEmpId===id && State.employees.length) Chat.setEmp(State.employees[0].id);
          Modal.close(); Employees.render();
          toast(`${e.name} has been let go.`);
        });
      }
    });
  },
  showStandup() {
    const arrived = State.employees.slice(0,2);
    const waiting = State.employees.slice(2);
    Modal.open('Standup Board',`
      <div style="margin-bottom:16px;display:flex;flex-direction:column;gap:8px">
        ${State.employees.map(e=>`
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid var(--border)">
            <div style="width:32px;height:32px;border-radius:50%;background:${e.color}22;color:${e.color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0">${e.name[0]}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500;color:var(--text)">${escHtml(e.name)}</div>
              <div style="font-size:11px;color:var(--text2)">${escHtml(e.role)}</div>
            </div>
            <div style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${Math.random()>.5?'background:var(--green-dim);color:var(--green)':'background:var(--border);color:var(--text3)'}">${Math.random()>.5?'ARRIVED':'WAITING'}</div>
          </div>`).join('')}
      </div>
      <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <div style="flex:1;background:rgba(255,255,255,.06);border-radius:99px;height:6px;overflow:hidden">
          <div style="height:100%;border-radius:99px;background:var(--green);width:33%"></div>
        </div>
        <div style="font-size:12px;color:var(--green);font-weight:600;white-space:nowrap">2 / ${State.employees.length} arrived</div>
      </div>`);
  }
};

// ══════════════════════════════════════════════════════════════
//  PAGE: TASKS
// ══════════════════════════════════════════════════════════════
const Tasks = {
  init(container) {
    container.innerHTML = `<div style="height:100%;padding:16px;display:flex;flex-direction:column;gap:12px;overflow:hidden">
      <div class="kanban-wrap" id="kanban"></div>
    </div>`;
    document.getElementById('topbar-right').innerHTML = `
      <button class="tb-btn primary" id="add-task-btn">+ Add Task</button>
      <button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('add-task-btn').addEventListener('click',Tasks.openAddModal);
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    Tasks.render();
  },
  destroy() {},
  render() {
    const wrap = document.getElementById('kanban'); if(!wrap) return;
    const colClass={todo:'k-todo',inprogress:'k-inprogress',review:'k-review',done:'k-done'};
    wrap.innerHTML = COLS.map(col=>`
      <div class="k-col">
        <div class="k-col-hdr ${colClass[col]}">
          <span>${COL_LABELS[col]}</span>
          <span style="opacity:.6">${State.tasks.filter(t=>t.column===col).length}</span>
        </div>
        <div class="k-cards" id="col-${col}" data-col="${col}">
          ${State.tasks.filter(t=>t.column===col).map(t=>Tasks._card(t)).join('')}
        </div>
      </div>`).join('');
    Tasks._wireEvents();
  },
  _card(t) {
    const emp = t.assignee?getEmp(t.assignee):null;
    const latest = t.aiUpdates?.slice(-1)[0];
    return `<div class="k-card" draggable="true" data-tid="${t.id}">
      <div class="k-card-title">${escHtml(t.title)}</div>
      <div class="k-card-meta">
        <span class="priority-pill p-${t.priority||'medium'}">${(t.priority||'medium').toUpperCase()}</span>
        ${emp?`<div class="k-assignee"><div class="k-av" style="background:${emp.color}22;color:${emp.color}">${emp.name[0]}</div>${escHtml(emp.name)}</div>`:'<div class="k-assignee" style="color:var(--text3)">Unassigned</div>'}
      </div>
      ${latest?`<div class="k-ai-update">🤖 ${escHtml(latest.text)}</div>`:''}
      <div style="display:flex;gap:6px;margin-top:10px">
        <button class="btn btn-sm t-ai-btn" data-tid="${t.id}" style="font-size:10px">🤖 AI Update</button>
        <button class="btn btn-sm t-del-btn" data-tid="${t.id}" style="font-size:10px;color:var(--text3)">✕</button>
      </div>
    </div>`;
  },
  _wireEvents() {
    const wrap = document.getElementById('kanban'); if(!wrap) return;
    wrap.querySelectorAll('.k-card').forEach(card=>{
      card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',card.dataset.tid);card.classList.add('dragging');});
      card.addEventListener('dragend',()=>{card.classList.remove('dragging');document.querySelectorAll('.k-cards').forEach(c=>c.classList.remove('drag-over'));});
    });
    wrap.querySelectorAll('.k-cards').forEach(col=>{
      col.addEventListener('dragover',e=>{e.preventDefault();col.classList.add('drag-over');});
      col.addEventListener('dragleave',()=>col.classList.remove('drag-over'));
      col.addEventListener('drop',e=>{
        e.preventDefault();col.classList.remove('drag-over');
        const tid=e.dataTransfer.getData('text/plain');
        const task=State.tasks.find(t=>t.id===tid);
        if(task){task.column=col.dataset.col;save('tasks');Tasks.render();}
      });
    });
    wrap.querySelectorAll('.t-ai-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();Tasks.aiUpdate(btn.dataset.tid);}));
    wrap.querySelectorAll('.t-del-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();Tasks.delete(btn.dataset.tid);}));
  },
  openAddModal() {
    const emps = State.employees;
    Modal.open('Add Task', `
      <div class="form-group">
        <label class="form-label">TASK TITLE</label>
        <input class="form-input" id="t-title" placeholder="e.g. Write Q2 marketing copy">
      </div>
      <div class="form-group">
        <label class="form-label">DESCRIPTION (optional)</label>
        <textarea class="form-textarea" id="t-desc" placeholder="Add details…"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">ASSIGN TO</label>
        <select class="form-select" id="t-assignee">
          <option value="">Unassigned</option>
          ${emps.map(e=>`<option value="${e.id}">${escHtml(e.name)} — ${escHtml(e.role)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">PRIORITY</label>
        <select class="form-select" id="t-priority">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn" id="t-cancel">Cancel</button>
        <button class="btn btn-primary" id="t-submit">Add Task</button>
      </div>`, {
      onOpen() {
        document.getElementById('t-cancel').addEventListener('click',Modal.close);
        document.getElementById('t-submit').addEventListener('click',()=>{
          const title=document.getElementById('t-title').value.trim();
          if(!title){toast('Title required','error');return;}
          State.tasks.push({id:uid(),title,desc:document.getElementById('t-desc').value.trim(),column:'todo',assignee:document.getElementById('t-assignee').value||null,priority:document.getElementById('t-priority').value,aiUpdates:[],createdAt:new Date().toISOString().slice(0,10)});
          save('tasks');Modal.close();Tasks.render();toast('Task added');
        });
      }
    });
  },
  async aiUpdate(tid) {
    const task = State.tasks.find(t=>t.id===tid); if(!task) return;
    const emp = task.assignee?getEmp(task.assignee):State.employees[0];
    if(!emp){toast('No employee assigned','error');return;}
    toast(`${emp.name} is thinking...`);
    const msg = `Give a one-sentence progress update on this task: "${task.title}". Be specific and actionable.`;
    const update = await AI.once([{role:'user',content:msg}], emp.system);
    if(!task.aiUpdates)task.aiUpdates=[];
    task.aiUpdates.push({text:update.replace(/^["']|["']$/g,''),ts:Date.now()});
    save('tasks');Tasks.render();
  },
  delete(tid) {
    State.tasks = State.tasks.filter(t=>t.id!==tid);
    save('tasks');Tasks.render();
  }
};

// ══════════════════════════════════════════════════════════════
//  PAGE: SPREADSHEET
// ══════════════════════════════════════════════════════════════
const Sheet = {
  selected: null,
  init(container) {
    container.innerHTML = '<div class="sheet-wrap" id="sheet-wrap"></div>';
    document.getElementById('topbar-right').innerHTML = `
      <button class="tb-btn" id="sh-ai-btn">🤖 AI Fill</button>
      <button class="tb-btn" id="sh-csv-btn">⬇ Export CSV</button>
      <button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('sh-ai-btn').addEventListener('click',Sheet.aiFill);
    document.getElementById('sh-csv-btn').addEventListener('click',Sheet.exportCSV);
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    Sheet.render();
  },
  destroy() { Sheet.selected=null; },
  render() {
    const wrap=document.getElementById('sheet-wrap'); if(!wrap) return;
    const wb=State.workbook; const tab=wb.tabs[wb.activeTab];
    const ROWS=30,COLS_=16;
    const colLetters=Array.from({length:COLS_},(_,i)=>String.fromCharCode(65+i));
    wrap.innerHTML = `
      <div class="formula-bar">
        <span class="cell-ref" id="sh-ref">${Sheet.selected||'A1'}</span>
        <div class="sep-v"></div>
        <input class="formula-input" id="sh-formula" placeholder="Enter value or formula (=SUM, =AVERAGE…)">
      </div>
      <div class="sheet-toolbar">
        <div class="sheet-tabs">${wb.tabs.map((t,i)=>`<button class="sheet-tab${i===wb.activeTab?' active':''}" data-ti="${i}">${escHtml(t.name)}</button>`).join('')}
          <button class="sheet-tab" id="sh-addtab">+</button>
        </div>
      </div>
      <div class="sheet-scroll">
        <table class="sheet-tbl" id="sh-tbl">
          <thead><tr><th class="row-hdr"></th>${colLetters.map(l=>`<th data-col="${l}">${l}</th>`).join('')}</tr></thead>
          <tbody>${Array.from({length:ROWS},(_,r)=>`
            <tr><td class="row-hdr">${r+1}</td>${colLetters.map(c=>`
              <td data-cell="${c}${r+1}" class="${Sheet.selected===c+(r+1)?'selected':''}">
                <span class="cell-disp">${escHtml(Sheet._display(tab,c+(r+1)))}</span>
                <input class="cell-editor" data-cell="${c}${r+1}" value="${escHtml(tab.cells[c+(r+1)]?.raw||'')}">
              </td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    // Wire events
    wrap.querySelectorAll('.sheet-tab[data-ti]').forEach(btn=>btn.addEventListener('click',()=>{
      State.workbook.activeTab=parseInt(btn.dataset.ti);save('workbook');Sheet.render();
    }));
    document.getElementById('sh-addtab')?.addEventListener('click',()=>{
      const n=`Sheet${State.workbook.tabs.length+1}`;
      State.workbook.tabs.push({name:n,cells:{}});
      State.workbook.activeTab=State.workbook.tabs.length-1;
      save('workbook');Sheet.render();
    });
    const tbl=document.getElementById('sh-tbl');
    tbl.querySelectorAll('td[data-cell]').forEach(td=>{
      const key=td.dataset.cell;
      td.addEventListener('click',()=>Sheet.selectCell(key));
      td.addEventListener('dblclick',()=>Sheet.editCell(key));
    });
    tbl.querySelectorAll('.cell-editor').forEach(inp=>{
      inp.addEventListener('blur',()=>Sheet.commitEdit(inp.dataset.cell,inp.value));
      inp.addEventListener('keydown',e=>{
        if(e.key==='Enter'){e.preventDefault();Sheet.commitEdit(inp.dataset.cell,inp.value);Sheet.moveSel(inp.dataset.cell,1,0);}
        if(e.key==='Tab'){e.preventDefault();Sheet.commitEdit(inp.dataset.cell,inp.value);Sheet.moveSel(inp.dataset.cell,0,1);}
        if(e.key==='Escape'){td.classList.remove('editing');Sheet.render();}
      });
    });
    const fbar=document.getElementById('sh-formula');
    fbar.addEventListener('change',()=>{if(Sheet.selected)Sheet.commitEdit(Sheet.selected,fbar.value);});
    if(Sheet.selected){fbar.value=tab.cells[Sheet.selected]?.raw||'';document.getElementById('sh-ref').textContent=Sheet.selected;}
  },
  selectCell(key) {
    Sheet.selected=key;
    const tab=State.workbook.tabs[State.workbook.activeTab];
    document.querySelectorAll('td[data-cell]').forEach(td=>td.classList.toggle('selected',td.dataset.cell===key));
    const fbar=document.getElementById('sh-formula');if(fbar)fbar.value=tab.cells[key]?.raw||'';
    const ref=document.getElementById('sh-ref');if(ref)ref.textContent=key;
  },
  editCell(key) {
    const td=document.querySelector(`td[data-cell="${key}"]`); if(!td) return;
    Sheet.selectCell(key);
    td.classList.add('editing');
    const inp=td.querySelector('.cell-editor');
    if(inp){inp.style.display='block';inp.focus();inp.select();}
  },
  commitEdit(key,val) {
    const tab=State.workbook.tabs[State.workbook.activeTab];
    const td=document.querySelector(`td[data-cell="${key}"]`);
    if(td)td.classList.remove('editing');
    if(!tab.cells[key])tab.cells[key]={};
    tab.cells[key].raw=val;
    tab.cells[key].formula=val.startsWith('=');
    tab.cells[key].value=Sheet._eval(tab,val,new Set([key]));
    // Re-eval formulas that might reference this cell
    Object.entries(tab.cells).forEach(([k,c])=>{if(c.formula&&k!==key)c.value=Sheet._eval(tab,c.raw,new Set([k]));});
    save('workbook');
    // Update display
    const disp=td?.querySelector('.cell-disp');
    if(disp)disp.textContent=Sheet._display(tab,key);
    const fbar=document.getElementById('sh-formula');if(fbar&&Sheet.selected===key)fbar.value=val;
  },
  moveSel(key,dr,dc) {
    const col=key.match(/[A-Z]+/)[0];const row=parseInt(key.match(/\d+/)[0]);
    const newCol=String.fromCharCode(col.charCodeAt(0)+dc);const newRow=row+dr;
    if(newRow>=1&&newRow<=30&&newCol>='A'&&newCol<='P')Sheet.editCell(newCol+newRow);
  },
  _display(tab,key) {
    const c=tab.cells[key];if(!c?.raw)return '';
    return String(c.formula?(c.value??''):(c.raw));
  },
  _eval(tab,raw,evaluating) {
    if(!raw||!raw.startsWith('='))return raw;
    try {
      const expr=raw.slice(1);
      return Sheet._evalExpr(tab,expr,evaluating);
    } catch(e){return '#ERR';}
  },
  _evalExpr(tab,expr,ev) {
    expr=expr.trim();
    // Function calls
    const fnMatch=expr.match(/^([A-Z]+)\((.+)\)$/s);
    if(fnMatch){
      const fn=fnMatch[1],args=Sheet._parseArgs(fnMatch[2]);
      const vals=args.flatMap(a=>Sheet._evalArg(tab,a.trim(),ev));
      const nums=vals.map(Number).filter(n=>!isNaN(n));
      if(fn==='SUM')return nums.reduce((a,b)=>a+b,0);
      if(fn==='AVERAGE')return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;
      if(fn==='MAX')return Math.max(...nums);
      if(fn==='MIN')return Math.min(...nums);
      if(fn==='COUNT')return nums.length;
      if(fn==='CONCATENATE')return vals.join('');
      if(fn==='IF'){const cond=Sheet._evalArg(tab,args[0],ev)[0];return cond?Sheet._evalArg(tab,args[1],ev)[0]:Sheet._evalArg(tab,args[2],ev)[0];}
      if(fn==='NOW')return new Date().toLocaleString();
      if(fn==='TODAY')return new Date().toLocaleDateString();
      return '#NAME?';
    }
    // Range
    if(/^[A-Z]+\d+:[A-Z]+\d+$/.test(expr))return Sheet._rangeVals(tab,expr,ev).reduce((a,b)=>+a+(+b),0);
    // Cell ref
    if(/^[A-Z]+\d+$/.test(expr))return Sheet._cellVal(tab,expr,ev);
    // Arithmetic (very simple)
    try{return Function('"use strict";return('+expr+')')();}catch{return '#VAL';}
  },
  _parseArgs(str){const args=[];let d=0,cur='';for(const c of str){if(c==='(')d++;else if(c===')')d--;if(c===','&&d===0){args.push(cur);cur='';}else cur+=c;}if(cur)args.push(cur);return args;},
  _evalArg(tab,arg,ev){
    arg=arg.trim();
    if(/^[A-Z]+\d+:[A-Z]+\d+$/.test(arg))return Sheet._rangeVals(tab,arg,ev);
    if(/^[A-Z]+\d+$/.test(arg))return[Sheet._cellVal(tab,arg,ev)];
    if(/^".*"$/.test(arg))return[arg.slice(1,-1)];
    return[Sheet._evalExpr(tab,arg,ev)];
  },
  _cellVal(tab,key,ev){
    if(ev.has(key))return'#CIRC';ev.add(key);
    const c=tab.cells[key];if(!c?.raw)return 0;
    const v=c.formula?Sheet._eval(tab,c.raw,new Set([...ev])):c.raw;
    ev.delete(key);return isNaN(Number(v))?v:Number(v);
  },
  _rangeVals(tab,range,ev){
    const[start,end]=range.split(':');
    const sc=start.match(/[A-Z]+/)[0],sr=parseInt(start.match(/\d+/)[0]);
    const ec=end.match(/[A-Z]+/)[0],er=parseInt(end.match(/\d+/)[0]);
    const vals=[];
    for(let r=sr;r<=er;r++)for(let c=sc.charCodeAt(0);c<=ec.charCodeAt(0);c++)vals.push(Sheet._cellVal(tab,String.fromCharCode(c)+r,ev));
    return vals;
  },
  exportCSV() {
    const tab=State.workbook.tabs[State.workbook.activeTab];
    const ROWS=30;const cols=Array.from({length:16},(_,i)=>String.fromCharCode(65+i));
    const csv=Array.from({length:ROWS},(_,r)=>cols.map(c=>Sheet._display(tab,c+(r+1))).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=`${tab.name}.csv`;a.click();toast('CSV exported');
  },
  async aiFill() {
    Modal.open('AI Fill Range', `
      <div class="form-group">
        <label class="form-label">RANGE (e.g. A1:C5)</label>
        <input class="form-input" id="ai-range" placeholder="A1:D10" value="${Sheet.selected||'A1:C5'}">
      </div>
      <div class="form-group">
        <label class="form-label">WHAT SHOULD IT CONTAIN?</label>
        <textarea class="form-textarea" id="ai-prompt" placeholder="e.g. Monthly revenue data for a SaaS company, 6 months, with month names in column A and revenue in column B"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn" id="ai-cancel">Cancel</button>
        <button class="btn btn-primary" id="ai-go">Generate</button>
      </div>`, {
      onOpen() {
        document.getElementById('ai-cancel').addEventListener('click',Modal.close);
        document.getElementById('ai-go').addEventListener('click',async()=>{
          const range=document.getElementById('ai-range').value.trim();
          const prompt=document.getElementById('ai-prompt').value.trim();
          if(!range||!prompt){toast('Fill in both fields','error');return;}
          const[start,end]=range.split(':');
          const sr=parseInt(start.match(/\d+/)[0]),sc=start.match(/[A-Z]+/)[0];
          const er=parseInt(end.match(/\d+/)[0]),ec=end.match(/[A-Z]+/)[0];
          const rows=er-sr+1,cols_=ec.charCodeAt(0)-sc.charCodeAt(0)+1;
          Modal.close();toast('AI is filling your spreadsheet…');
          const sys='You are a spreadsheet assistant. Return ONLY a JSON array of arrays (rows × cols). No explanation, no markdown, just the JSON array.';
          const msg=`Fill a ${rows}×${cols_} spreadsheet range with: ${prompt}. Return ONLY a JSON array of ${rows} rows, each row has ${cols_} values.`;
          let raw=await AI.once([{role:'user',content:msg}],sys);
          try{
            raw=raw.replace(/```json\n?|```/g,'').trim();
            const data=JSON.parse(raw);
            const tab=State.workbook.tabs[State.workbook.activeTab];
            data.forEach((row,ri)=>{
              row.forEach((val,ci)=>{
                const key=String.fromCharCode(sc.charCodeAt(0)+ci)+(sr+ri);
                if(!tab.cells[key])tab.cells[key]={};
                tab.cells[key]={raw:String(val),value:isNaN(Number(val))?String(val):Number(val),formula:false};
              });
            });
            save('workbook');Sheet.render();toast('Spreadsheet filled!','success');
          }catch(e){toast('Could not parse AI response','error');}
        });
      }
    });
  }
};

// ══════════════════════════════════════════════════════════════
//  PAGE: COLD EMAIL
// ══════════════════════════════════════════════════════════════
const Email = {
  activeContact: null,
  init(container) {
    container.innerHTML = `
      <div style="height:100%;padding:16px;">
        <div class="email-layout" id="email-layout">
          <div class="contacts-panel">
            <div class="panel-hdr">
              <div class="panel-hdr-title">Contacts</div>
              <button class="btn btn-sm" id="add-contact-btn">+ Add</button>
            </div>
            <div class="contacts-list" id="contacts-list"></div>
          </div>
          <div class="composer" id="composer">
            <div class="comp-field">
              <div class="comp-lbl">TO</div>
              <input class="comp-inp" id="em-to" placeholder="recipient@company.com">
            </div>
            <div class="comp-field">
              <div class="comp-lbl">SUBJECT</div>
              <input class="comp-inp" id="em-subj" placeholder="Your email subject…">
            </div>
            <textarea class="comp-body" id="em-body" placeholder="Write your email here, or use AI to generate it…"></textarea>
            <div class="comp-footer">
              <button class="btn btn-primary" id="em-ai-btn">✨ Generate with AI</button>
              <button class="btn" id="em-template-btn">📋 Templates</button>
              <div style="margin-left:auto;display:flex;gap:8px">
                <button class="btn" id="em-mailto-btn">📤 Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    document.getElementById('topbar-right').innerHTML = `<button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    document.getElementById('add-contact-btn').addEventListener('click',Email.addContact);
    document.getElementById('em-ai-btn').addEventListener('click',Email.generate);
    document.getElementById('em-template-btn').addEventListener('click',Email.templates);
    document.getElementById('em-mailto-btn').addEventListener('click',Email.send);
    Email.renderContacts();
  },
  destroy() { Email.activeContact=null; },
  renderContacts() {
    const list=document.getElementById('contacts-list'); if(!list) return;
    list.innerHTML = State.contacts.map(c=>`
      <div class="contact-row${Email.activeContact===c.id?' active':''}" data-cid="${c.id}">
        <div class="c-av">${c.name[0]}</div>
        <div style="min-width:0">
          <div class="c-name">${escHtml(c.name)}</div>
          <div class="c-email">${escHtml(c.email)}</div>
        </div>
      </div>`).join('');
    list.querySelectorAll('.contact-row').forEach(row=>row.addEventListener('click',()=>{
      Email.activeContact=row.dataset.cid;
      Email.renderContacts();
      const c=State.contacts.find(x=>x.id===row.dataset.cid);
      if(c){document.getElementById('em-to').value=c.email;document.getElementById('em-subj').value=`Partnership Opportunity — ${State.settings.companyName}`;}
    }));
  },
  addContact() {
    Modal.open('Add Contact',`
      <div class="form-group"><label class="form-label">NAME</label><input class="form-input" id="nc-name" placeholder="Jane Doe"></div>
      <div class="form-group"><label class="form-label">EMAIL</label><input class="form-input" id="nc-email" placeholder="jane@company.com" type="email"></div>
      <div class="form-group"><label class="form-label">COMPANY</label><input class="form-input" id="nc-co" placeholder="Company Inc."></div>
      <div class="modal-actions">
        <button class="btn" id="nc-cancel">Cancel</button>
        <button class="btn btn-primary" id="nc-save">Add</button>
      </div>`,{
      onOpen(){
        document.getElementById('nc-cancel').addEventListener('click',Modal.close);
        document.getElementById('nc-save').addEventListener('click',()=>{
          const name=document.getElementById('nc-name').value.trim();
          const email=document.getElementById('nc-email').value.trim();
          if(!name||!email){toast('Name and email required','error');return;}
          State.contacts.push({id:uid(),name,email,company:document.getElementById('nc-co').value.trim()});
          save('contacts');Modal.close();Email.renderContacts();toast('Contact added');
        });
      }
    });
  },
  async generate() {
    Modal.open('Generate Email with AI',`
      <div class="form-group">
        <label class="form-label">CONTEXT / GOAL</label>
        <textarea class="form-textarea" id="eg-ctx" placeholder="e.g. Cold outreach to a SaaS startup founder offering our AI employee platform. They recently raised a Series A." style="min-height:100px"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">TONE</label>
        <select class="form-select" id="eg-tone">
          <option>Professional</option>
          <option>Casual & Friendly</option>
          <option>Direct & Bold</option>
          <option>Empathetic</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn" id="eg-cancel">Cancel</button>
        <button class="btn btn-primary" id="eg-go">Generate</button>
      </div>`,{
      onOpen(){
        document.getElementById('eg-cancel').addEventListener('click',Modal.close);
        document.getElementById('eg-go').addEventListener('click',async()=>{
          const ctx=document.getElementById('eg-ctx').value.trim();
          const tone=document.getElementById('eg-tone').value;
          if(!ctx){toast('Describe the context','error');return;}
          Modal.close();
          const company=State.settings.companyName||'Kayro Interactive';
          const emp=State.employees.find(e=>e.role.toLowerCase().includes('sales'))||State.employees[0];
          const sys=emp?emp.system:`You are a sales rep at ${company}.`;
          const prompt=`Write a cold email on behalf of ${company}. Context: ${ctx}. Tone: ${tone}. Format: Subject line first (no label), blank line, then email body. Keep it concise — under 150 words. Sign off with ${emp?.name||'the team'} from ${company}.`;
          const body=document.getElementById('em-body');
          const subj=document.getElementById('em-subj');
          body.value='✍️ Writing...';
          let full='';
          for await(const chunk of AI.stream([{role:'user',content:prompt}],sys)){
            full+=chunk;
            // Split first line as subject
            const lines=full.split('\n');
            if(lines.length>1&&!subj.value.includes('Generating')){subj.value=lines[0].trim();body.value=lines.slice(1).join('\n').trim();}
            else body.value=full;
          }
          toast('Email generated!','success');
        });
      }
    });
  },
  templates() {
    const tmpls=[
      {name:'Partnership Pitch',body:`Hi [Name],\n\nI came across [Company] and was impressed by [specific thing].\n\nAt ${State.settings.companyName||'Kayro Interactive'}, we help businesses like yours [benefit]. We've helped similar companies achieve [result].\n\nWould you be open to a 15-minute call this week?\n\nBest,\n[Your Name]`},
      {name:'Follow-up',body:`Hi [Name],\n\nJust following up on my previous message — I know things get busy.\n\nI genuinely believe [value proposition] could make a real difference for [Company].\n\nWorth a quick chat? I'm flexible on timing.\n\nBest,\n[Your Name]`},
      {name:'Cold Intro',body:`Hi [Name],\n\nI'll keep this short — I think what we're building at ${State.settings.companyName||'Kayro Interactive'} could be a great fit for [Company].\n\nWe [one-sentence pitch]. Curious if this is something you'd want to explore?\n\nHappy to send more info or jump on a call.\n\n[Your Name]`},
    ];
    Modal.open('Email Templates',tmpls.map(t=>`
      <div style="padding:12px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid var(--border);margin-bottom:10px;cursor:pointer" class="tmpl-row" data-body="${escHtml(t.body)}" data-name="${escHtml(t.name)}">
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">${t.name}</div>
        <div style="font-size:11.5px;color:var(--text2);white-space:pre-line;line-height:1.5">${escHtml(t.body.slice(0,80))}…</div>
      </div>`).join(''),{
      onOpen(){
        document.querySelectorAll('.tmpl-row').forEach(row=>row.addEventListener('click',()=>{
          document.getElementById('em-body').value=row.dataset.body.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
          Modal.close();
        }));
      }
    });
  },
  send() {
    const to=document.getElementById('em-to').value.trim();
    const subj=document.getElementById('em-subj').value.trim();
    const body=document.getElementById('em-body').value.trim();
    if(!to){toast('Add a recipient first','error');return;}
    window.open(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`);
    toast('Opening your email client…');
  }
};

// ══════════════════════════════════════════════════════════════
//  PAGE: SETTINGS
// ══════════════════════════════════════════════════════════════
const Settings = {
  init(container) {
    container.innerHTML = `<div class="page-scroll"><div class="settings-grid" id="settings-grid"></div></div>`;
    document.getElementById('topbar-right').innerHTML = `<button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    Settings.render();
  },
  destroy() {},
  render() {
    const g=document.getElementById('settings-grid'); if(!g) return;
    const s=State.settings;
    g.innerHTML = `
      <div class="s-card full">
        <div class="s-card-title">🏢 Company</div>
        <div class="form-group">
          <label class="form-label">COMPANY NAME</label>
          <input class="form-input" id="s-company" value="${escHtml(s.companyName||'')}" placeholder="Kayro Interactive">
        </div>
        <button class="btn btn-primary" id="s-save-co">Save</button>
      </div>
      <div class="s-card full">
        <div class="s-card-title">🤖 Claude AI</div>
        <div class="form-group">
          <label class="form-label">ANTHROPIC API KEY</label>
          <input class="form-input" id="s-apikey" type="password" value="${escHtml(s.apiKey||'')}" placeholder="sk-ant-…">
          <div class="form-hint">Get your key at console.anthropic.com. Required for AI chat, email generation, and task updates.</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" id="s-save-key">Save Key</button>
          <button class="btn" id="s-test-key">Test Connection</button>
        </div>
        <div id="s-key-status" style="margin-top:10px;font-size:12px;color:var(--text2)"></div>
      </div>
      <div class="s-card full">
        <div class="s-card-title">✉️ Email (Optional — EmailJS)</div>
        <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">Connect EmailJS to send cold emails directly from the browser. Create a free account at <span style="color:var(--accent)">emailjs.com</span>.</p>
        <div class="form-group"><label class="form-label">SERVICE ID</label><input class="form-input" id="s-ejsvc" value="${escHtml(s.ejServiceId||'')}" placeholder="service_xxxxx"></div>
        <div class="form-group"><label class="form-label">TEMPLATE ID</label><input class="form-input" id="s-ejtpl" value="${escHtml(s.ejTemplateId||'')}" placeholder="template_xxxxx"></div>
        <div class="form-group"><label class="form-label">PUBLIC KEY</label><input class="form-input" id="s-ejkey" value="${escHtml(s.ejPublicKey||'')}" placeholder="public_key_xxxxx"></div>
        <button class="btn btn-primary" id="s-save-ej">Save EmailJS Config</button>
      </div>
      <div class="s-card full danger-zone">
        <div class="danger-title">⚠️ Danger Zone</div>
        <div class="danger-desc">Reset all data including employees, tasks, sheets, and chat history. This cannot be undone.</div>
        <button class="btn btn-danger" id="s-reset">Reset All Data</button>
      </div>`;
    document.getElementById('s-save-co').addEventListener('click',()=>{
      State.settings.companyName=document.getElementById('s-company').value.trim()||'Kayro Interactive';
      save('settings');document.getElementById('brand-name').textContent=State.settings.companyName;toast('Saved','success');
    });
    document.getElementById('s-save-key').addEventListener('click',()=>{
      State.settings.apiKey=document.getElementById('s-apikey').value.trim();
      save('settings');Settings.updateApiStatus();toast('API key saved','success');
    });
    document.getElementById('s-test-key').addEventListener('click',async()=>{
      const st=document.getElementById('s-key-status');
      st.textContent='Testing…';st.style.color='var(--text2)';
      const reply=await AI.once([{role:'user',content:'ping'}],'Reply with just "pong".');
      if(reply.includes('⚠️')){st.textContent='❌ '+reply;st.style.color='var(--red)';}
      else{st.textContent='✅ Connected! Response: '+reply;st.style.color='var(--green)';}
    });
    document.getElementById('s-save-ej').addEventListener('click',()=>{
      State.settings.ejServiceId=document.getElementById('s-ejsvc').value.trim();
      State.settings.ejTemplateId=document.getElementById('s-ejtpl').value.trim();
      State.settings.ejPublicKey=document.getElementById('s-ejkey').value.trim();
      save('settings');toast('EmailJS config saved','success');
    });
    document.getElementById('s-reset').addEventListener('click',()=>{
      if(!confirm('Reset ALL data? This cannot be undone.'))return;
      ['employees','tasks','workbook','contacts','chatHistory','settings'].forEach(k=>localStorage.removeItem('kayro_'+k));
      location.reload();
    });
  },
  updateApiStatus() {
    const el=document.getElementById('api-status');
    if(!el)return;
    if(State.settings.apiKey){el.textContent='🟢 AI Connected';el.className='api-status ok';}
    else{el.textContent='⚪ No API Key';el.className='api-status';}
  }
};

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
loadState();
Chat.init();
Settings.updateApiStatus();
Router.navigate('hq');
