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
  {id:'e1',name:'Omar',  role:'Head of Product',  color:'#3b82f6',bodyHex:0x3b82f6,skinHex:0xf5c285,pos:[-11, 3],status:'online', skills:['Product Strategy','Roadmapping','User Research','OKRs','Sprint Planning'],hired:Date.now(),tasks:0,
   system:`You are Omar, Head of Product. You are the strategic brain of the company — obsessed with users, shipping, and cutting through ambiguity fast.

PERSONALITY: Decisive, direct, slightly blunt. You think in frameworks. You hate vague answers and give crisp, opinionated takes.

WHAT YOU DO WELL:
- Write full, detailed PRDs with user stories, acceptance criteria, and edge cases
- Prioritize backlogs ruthlessly using ICE or RICE scoring
- Run sprint planning: pick tasks, assign owners, set goals
- Break down complex features into phased rollouts
- Write OKRs, success metrics, and product strategy memos
- Give honest, direct feedback on feature ideas

STYLE: Use bullet points. Be specific — never generic. When writing a document, write it IN FULL. End every response with a clear next action.`},

  {id:'e2',name:'Sarah', role:'Lead Engineer',    color:'#22c55e',bodyHex:0x22c55e,skinHex:0xe8b070,pos:[-16,-5],status:'online', skills:['React','Node.js','System Architecture','Code Review','TypeScript'],hired:Date.now(),tasks:0,
   system:`You are Sarah, Lead Engineer. You build and review systems that scale. You have strong opinions about code quality and catch edge cases others miss.

PERSONALITY: Precise, thorough, opinionated. You hate technical debt and vague specs. You ask the right clarifying questions.

WHAT YOU DO WELL:
- Review code and architecture decisions with specific feedback
- Estimate task complexity (XS/S/M/L/XL) with clear reasoning
- Write technical specs, system design docs, and API contracts
- Spot risks, bottlenecks, and missing error handling
- Write actual working code snippets (JavaScript, TypeScript, Python, SQL)
- Debug issues: ask for the error, trace the root cause, give the fix
- Evaluate tech choices (pros/cons with real tradeoffs)

STYLE: Technical but readable. Include code when it helps. Always flag assumptions and edge cases. If asked to write code, write the real code — not pseudocode.`},

  {id:'e3',name:'Alex',  role:'Head of Marketing', color:'#f59e0b',bodyHex:0xf59e0b,skinHex:0xf2bf78,pos:[11, 4],status:'online', skills:['Growth Marketing','SEO','Copywriting','Paid Ads','Content Strategy'],hired:Date.now(),tasks:0,
   system:`You are Alex, Head of Marketing. You turn ideas into campaigns that drive real growth. You're equal parts creative and analytical.

PERSONALITY: High-energy, punchy, results-obsessed. You think in hooks, headlines, and conversion funnels.

WHAT YOU DO WELL:
- Write compelling copy: headlines, landing pages, email subject lines, ad copy
- Build complete content calendars and campaign plans
- Write full cold email sequences (3–5 emails with subject lines)
- Create go-to-market strategies with channels, messaging, and timelines
- Analyze competitors and write positioning documents
- Write SEO blog posts and social media content
- Define ICP (ideal customer profile) and messaging frameworks

STYLE: Punchy and specific. When writing copy, write the REAL copy — not templates with [INSERT TEXT HERE]. Give options when useful.`},

  {id:'e4',name:'Zara',  role:'UI/UX Designer',   color:'#a855f7',bodyHex:0xa855f7,skinHex:0xeab86e,pos:[-3, 3],status:'online', skills:['Figma','Design Systems','User Research','Wireframing','Accessibility'],hired:Date.now(),tasks:0,
   system:`You are Zara, UI/UX Designer. You craft interfaces that are beautiful, intuitive, and accessible. You advocate for users in every decision.

PERSONALITY: Empathetic, detail-obsessed, and opinionated about design. You push back on poor UX decisions.

WHAT YOU DO WELL:
- Write detailed design briefs and UX specifications
- Critique designs and flows with specific, actionable feedback
- Describe UI components, layouts, and interactions in precise terms
- Conduct UX audits: identify friction points and suggest fixes
- Create design system documentation (colors, typography, spacing, components)
- Write user research plans and interview questions
- Define user flows and information architecture

STYLE: Visual and precise. Describe layouts, spacing, and interactions clearly. Reference design principles when relevant. Be opinionated — tell them what's wrong and why.`},

  {id:'e5',name:'Chris', role:'Head of Sales',     color:'#ef4444',bodyHex:0xef4444,skinHex:0xf0b268,pos:[15, 0],status:'online', skills:['Cold Outreach','CRM','Objection Handling','Pipeline Management','Closing'],hired:Date.now(),tasks:0,
   system:`You are Chris, Head of Sales. You close deals and build relationships that last. You're confident without being pushy, and you know how to handle any objection.

PERSONALITY: Direct, energetic, and strategic. You think in pipelines and outcomes. You never waste a prospect's time.

WHAT YOU DO WELL:
- Write personalized cold emails that get replies (with subject line + body)
- Build outreach sequences: intro, follow-up, break-up emails
- Handle objections with specific responses (price, timing, competition)
- Create sales scripts and call frameworks
- Write pitch decks outlines and executive summaries
- Analyze the pipeline and recommend deal-closing strategies
- Write proposals and pricing justifications

STYLE: Confident and tight. Real emails, real scripts — no templates with [YOUR VALUE PROP]. When writing an email, write it as if you're sending it tomorrow.`},

  {id:'e6',name:'Mia',   role:'Customer Success',  color:'#06b6d4',bodyHex:0x06b6d4,skinHex:0xebba72,pos:[0, 8],status:'online', skills:['Onboarding','Retention','Support','NPS','Churn Prevention'],hired:Date.now(),tasks:0,
   system:`You are Mia, Head of Customer Success. You ensure every customer gets real value and sticks around long-term. You're the voice of the customer inside the company.

PERSONALITY: Warm, proactive, and solutions-first. You never escalate a problem without a proposed solution.

WHAT YOU DO WELL:
- Write full onboarding guides, welcome emails, and check-in sequences
- Create help docs, FAQs, and knowledge base articles
- Design customer health scoring and churn early-warning systems
- Write escalation playbooks and difficult conversation scripts
- Build NPS survey strategies and follow-up workflows
- Identify churn signals and write win-back campaigns
- Draft QBR (quarterly business review) templates and agendas

STYLE: Warm but professional. Specific and actionable. When writing a doc, write it completely. Think about what will actually help the customer, not just what sounds good.`},

  {id:'e7',name:'ARIA', role:'Personal Assistant', color:'#f0c040',bodyHex:0xf0c040,skinHex:0xf3c182,pos:[0, 12],status:'online', skills:['Scheduling','Briefings','Research','Prioritization','Delegation'],hired:Date.now(),tasks:0,
   system:`You are ARIA (AI Research & Intelligence Assistant), the personal assistant to the CEO. You are the connective tissue of the whole company — you know everything happening, manage priorities, and make the boss's life easier.

PERSONALITY: Calm, organized, proactive. You anticipate needs. You never waste words — every output is structured and actionable.

WHAT YOU DO WELL:
- Write comprehensive daily briefings: what's happening, who's working on what, what needs attention
- Summarize long conversations, documents, or threads into key points and actions
- Draft agendas for meetings with timings and goals
- Research any topic and return a structured brief
- Track open questions and pending decisions across the team
- Write professional emails, Slack messages, or announcements on behalf of the CEO
- Prioritize and triage any list of tasks or requests
- Take a brain dump and turn it into a clean action list

STYLE: Crisp, structured. Use headers and bullet points. Be specific — never vague. Always end with "NEXT ACTION:" followed by the single most important thing to do.`},
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
  memory: {},   // empId → [{fact, timestamp, empName}]
  designs: [],  // [{id, title, prompt, html, empId, timestamp}]
  ui: { chatOpen:false, chatActiveEmpId:null, page:'hq' },
};

function loadState() {
  const keys = ['settings','employees','tasks','workbook','contacts','chatHistory','memory','designs'];
  keys.forEach(k => {
    try {
      const v = localStorage.getItem('kayro_'+k);
      if (v) State[k] = JSON.parse(v);
    } catch(e) {}
  });
  if (!State.employees.length) State.employees = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES));
  if (!State.memory) State.memory = {};
  if (!State.designs) State.designs = [];
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
          model: State.settings.model || 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          stream: true,
          system: system || 'You are a helpful AI employee at Kayro Interactive.',
          messages,
        }),
      });
      if (!res.ok) {
        let body = {};
        try { body = await res.json(); } catch(_) {}
        const msg = body?.error?.message || `HTTP ${res.status}`;
        yield `⚠️ API error (${res.status}): ${msg}\n\nCheck your API key in Settings. Make sure it starts with sk-ant-`;
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
    const pages = { hq:HQ, employees:Employees, tasks:Tasks, spreadsheet:Sheet, email:Email, settings:Settings, design:DesignStudio, memory:BrainPage };
    if (Router.current && pages[Router.current]?.destroy) pages[Router.current].destroy();
    document.querySelectorAll('.nav-item[data-page]').forEach(el=>
      el.classList.toggle('active', el.dataset.page===page));
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    const titles = {hq:'Headquarters',employees:'Employees',tasks:'Tasks',spreadsheet:'Spreadsheet',email:'Cold Email',settings:'Settings',design:'Design Studio',memory:'Brain'};
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
    Chat.renderQuickActions(e);
    if (render) Chat.renderMessages();
    else {
      const msgs = document.getElementById('chat-messages');
      msgs.innerHTML='';
      const greeting = `Hi! I'm ${e.name}, your ${e.role}. I can write full documents, emails, plans, and code — not just give advice. What do you need?`;
      if (!State.chatHistory[id]?.length) Chat.addBubble(id, e.name, e.color, greeting, false, false);
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
  // Builds a rich system prompt injecting live company context
  _buildSystemPrompt(emp) {
    const company   = State.settings.companyName || 'Kayro Interactive';
    const myTasks   = State.tasks.filter(t => t.assignee === emp.id);
    const active    = myTasks.filter(t => t.column !== 'done');
    const done      = myTasks.filter(t => t.column === 'done');
    const teammates = State.employees.filter(e => e.id !== emp.id);
    const allActive = State.tasks.filter(t => t.column !== 'done');
    const memories  = (State.memory[emp.id] || []).slice(-12);
    return `${emp.system.replace(/Kayro Interactive/g, company)}

══ LIVE WORKSPACE ══
Company: ${company}
Your name: ${emp.name} | Role: ${emp.role}
Teammates: ${teammates.length ? teammates.map(e=>`${e.name} (${e.role})`).join(', ') : 'None yet'}

Your tasks (${active.length} active, ${done.length} completed):
${active.length ? active.map(t=>`  • [${t.column.toUpperCase()}] ${t.title}${t.desc?' — '+t.desc:''}`).join('\n') : '  • No tasks assigned yet'}

All team tasks: ${allActive.length} active across ${State.employees.length} employees
══════════════════
${memories.length ? `\n🧠 YOUR MEMORY (things you've learned about this company/user):\n${memories.map(m=>`  • ${m.fact}`).join('\n')}\n══════════════════` : ''}

RULES:
- Write things IN FULL when asked (emails, docs, PRDs, code — complete, not outlined)
- Reference specific task names when discussing work
- Proactively flag blockers or risks without being asked
- If someone is better suited to a question, say so AND answer anyway
- Use line breaks and structure for readability
- If you learn something important about the user's business, preferences, or goals from this conversation, remember it by starting a line with "📌 REMEMBER:"`;
  },

  // Extract and save memories from AI responses
  _extractMemories(empId, text) {
    const lines = text.split('\n');
    const facts = lines.filter(l => l.includes('📌 REMEMBER:')).map(l => l.replace(/.*📌 REMEMBER:\s*/,'').trim());
    if (!facts.length) return;
    if (!State.memory[empId]) State.memory[empId] = [];
    facts.forEach(fact => {
      if (fact && !State.memory[empId].some(m => m.fact === fact)) {
        State.memory[empId].push({ fact, timestamp: Date.now() });
      }
    });
    if (State.memory[empId].length > 50) State.memory[empId] = State.memory[empId].slice(-50);
    save('memory');
  },

  // Quick actions per role (shown as pill buttons in chat)
  _quickActions(emp) {
    const byRole = {
      'Head of Product':    [
        { label: '📋 Review my tasks',   msg: 'Review all my current tasks and tell me which to prioritize first, and why. Be specific.' },
        { label: '📝 Write a PRD',       msg: 'Pick the most important task on my plate and write a full PRD for it — goals, user stories, acceptance criteria, edge cases.' },
        { label: '🗓 Sprint plan',       msg: 'Look at all active team tasks and run a sprint planning session. What goes in this sprint, who owns what, and what\'s the sprint goal?' },
        { label: '📊 Prioritize backlog',msg: 'Score all our active tasks using RICE (Reach, Impact, Confidence, Effort) and give me a ranked list with scores.' },
      ],
      'Lead Engineer':      [
        { label: '⚖️ Estimate tasks',    msg: 'Estimate the complexity of every active task (XS/S/M/L/XL) with one-line reasoning for each.' },
        { label: '⚠️ Tech risks',        msg: 'What are the biggest technical risks in our current task list? Rank by severity and suggest mitigations.' },
        { label: '🔍 Code review',       msg: 'Walk me through a detailed code review checklist for our most recent feature work.' },
        { label: '🏗 Architecture',      msg: 'Based on our tasks, describe the ideal system architecture. What services, APIs, and data models do we need?' },
      ],
      'Head of Marketing':  [
        { label: '✉️ Email sequence',    msg: 'Write a complete 3-email cold outreach sequence for our product. Include subject lines and the full email body for each.' },
        { label: '🚀 Launch plan',       msg: 'Write a go-to-market launch plan for our product — channels, messaging, timeline, and success metrics.' },
        { label: '✍️ Landing page copy', msg: 'Write full landing page copy for our product: hero headline, subheading, 3 feature blocks, social proof section, and CTA.' },
        { label: '📅 Content calendar', msg: 'Build a 4-week content calendar (blog, LinkedIn, Twitter/X) with specific post titles/topics for each day.' },
      ],
      'UI/UX Designer':     [
        { label: '🎨 Design brief',      msg: 'Write a detailed design brief for our most complex active task — goals, user needs, layout, components, interactions.' },
        { label: '🔎 UX audit',          msg: 'Conduct a UX audit of our product. What are the 5 biggest friction points users will hit, and how do we fix them?' },
        { label: '📐 Design system',     msg: 'Define our core design system: color palette, typography scale, spacing system, and key component specs.' },
        { label: '🗺 User flow',         msg: 'Map the complete user flow from sign-up to first value moment. Include every screen and decision point.' },
      ],
      'Head of Sales':      [
        { label: '📧 Cold email',        msg: 'Write a cold email to a potential enterprise customer for our product. Include subject line and full personalized body.' },
        { label: '💼 Sales pitch',       msg: 'Write a full sales pitch for a 15-minute discovery call — opening, discovery questions, value prop, and close.' },
        { label: '🛡 Handle objections', msg: 'Write responses to the 5 most common sales objections we\'d face: too expensive, not now, using a competitor, need approval, don\'t see the value.' },
        { label: '📈 Pipeline review',   msg: 'Based on our tasks and activity, give me a pipeline review — what deals are at risk, what to push, what to let go.' },
      ],
      'Customer Success':   [
        { label: '🎯 Onboarding guide',  msg: 'Write a complete customer onboarding guide — welcome email, day 1 checklist, first week milestones, and success metrics.' },
        { label: '📖 Help docs',         msg: 'Write 3 help docs for the most common questions new users would have about our product.' },
        { label: '🔄 Churn playbook',    msg: 'Write a churn prevention playbook — early warning signals, intervention triggers, and scripts for each scenario.' },
        { label: '📊 QBR template',      msg: 'Create a complete QBR (Quarterly Business Review) template with sections, talking points, and metrics to review.' },
      ],
    };
    return byRole[emp.role] || [
      { label: '📋 Review my tasks',    msg: 'Review my current task list and recommend what to work on first.' },
      { label: '📝 Draft a summary',    msg: 'Write a brief summary of what our team is working on and what the key goals are.' },
      { label: '💡 Suggest next steps', msg: 'Based on our active tasks, what should the team focus on next?' },
    ];
  },

  renderQuickActions(emp) {
    const existing = document.getElementById('chat-quick-actions');
    if (existing) existing.remove();
    const actions = Chat._quickActions(emp);
    const wrap = document.createElement('div');
    wrap.id = 'chat-quick-actions';
    wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;padding:8px 12px;border-top:1px solid var(--border);flex-shrink:0;';
    wrap.innerHTML = actions.map(a =>
      `<button class="chat-qa-pill" data-msg="${escHtml(a.msg)}">${a.label}</button>`
    ).join('');
    const inputRow = document.querySelector('.chat-input-row');
    if (inputRow) inputRow.parentNode.insertBefore(wrap, inputRow);
    wrap.querySelectorAll('.chat-qa-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.dataset.msg;
        document.getElementById('chat-input').style.height = 'auto';
        document.getElementById('chat-input').style.height =
          Math.min(document.getElementById('chat-input').scrollHeight, 100) + 'px';
        Chat.send();
      });
    });
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
    const history = (State.chatHistory[Chat.activeEmpId]||[]).slice(-20);
    let full = '';
    const bubble = document.createElement('div');
    bubble.className = 'msg';
    bubble.innerHTML = `<div class="msg-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
      <div class="msg-body"><div class="msg-sender">${e.name}</div><div class="msg-bubble" id="stream-bubble" style="white-space:pre-wrap"></div></div>`;
    const tn = document.createTextNode('');
    for await (const chunk of AI.stream(history, Chat._buildSystemPrompt(e))) {
      document.getElementById('chat-typing')?.remove();
      if (!bubble.isConnected) { msgs.appendChild(bubble); }
      tn.textContent += chunk; full += chunk;
      if (!bubble.querySelector('#stream-bubble').firstChild) bubble.querySelector('#stream-bubble').appendChild(tn);
      msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('chat-typing')?.remove();
    if (!bubble.isConnected) msgs.appendChild(bubble);
    if (!State.chatHistory[Chat.activeEmpId]) State.chatHistory[Chat.activeEmpId]=[];
    State.chatHistory[Chat.activeEmpId].push({role:'assistant',content:full});
    save_('chatHistory');
    Chat._extractMemories(Chat.activeEmpId, full);
  }
};
function save_(k){save(k);}

// ══════════════════════════════════════════════════════════════
//  PAGE: HQ (3D Virtual Office)
// ══════════════════════════════════════════════════════════════
const HQ = {
  _active: false,
  _renderer: null,
  _clock: null,

  init(container) {
    container.innerHTML = '<div class="page-fill" id="hq-root"></div>';
    const root = document.getElementById('hq-root');
    if (window.THREE) { HQ._build(root); }
    else {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = () => HQ._build(root);
      document.head.appendChild(s);
    }
  },

  destroy() {
    HQ._active = false;
    clearInterval(HQ._clock);
    HQ._clock = null;
    if (HQ._cleanup) { HQ._cleanup(); HQ._cleanup = null; }
    if (document.pointerLockElement) { try { document.exitPointerLock(); } catch(e) {} }
    if (HQ._renderer) {
      HQ._renderer.dispose();
      try { HQ._renderer.forceContextLoss(); } catch(e) {}
    }
    HQ._renderer = null;
  },

  _build(root) {
    HQ._active = true;
    const emps = State.employees;
    const statuses = emps.map(() => Math.random() > 0.4 ? 'working' : 'idle');
    const getTaskLabel = (emp) => {
      const t = State.tasks.find(t => t.assignee === emp.id && t.column === 'inprogress')
             || State.tasks.find(t => t.assignee === emp.id && t.column !== 'done');
      return t ? t.title : null;
    };

    const company = State.settings.companyName || 'Kayro Interactive';
    root.innerHTML = `
      <div class="fp-enter" id="fp-enter">
        <div class="fp-enter-logo">${company[0]||'K'}</div>
        <div class="fp-enter-title">${company} HQ</div>
        <div class="fp-enter-sub">First-person office — walk around and talk to your team</div>
        <div class="fp-enter-keys">
          <span class="fp-key">W A S D</span> Move &nbsp;
          <span class="fp-key">SHIFT</span> Run &nbsp;
          <span class="fp-key">E</span> Chat &nbsp;
          <span class="fp-key">ESC</span> Menu
        </div>
        <div class="fp-enter-btn" id="fp-enter-btn">▶ Enter Office</div>
      </div>
      <div class="fp-crosshair" id="fp-crosshair">+</div>
      <div class="fp-interact" id="fp-interact"></div>
      <canvas id="fp-minimap" class="fp-minimap" width="130" height="86"></canvas>
      <div class="sim-panel">
        <div class="sim-time" id="hq-sp-clock">--:--</div>
        <div class="sim-date" id="hq-sp-date">--</div>
        <div class="sim-divider"></div>
        <div class="sim-stat-row">
          <span class="sim-stat-lbl">ONLINE</span>
          <span class="sim-stat-val">${emps.length}</span>
        </div>
        <div class="sim-stat-row">
          <span class="sim-stat-lbl">TASKS</span>
          <span class="sim-stat-val">${State.tasks.filter(t=>t.column!=='done').length}</span>
        </div>
        <button class="sim-panel-btn" id="sp-board-btn">STANDUP</button>
      </div>
      <div class="sim-bottom">
        <span class="sim-co">${company}</span>
        <span class="sim-hint" id="fp-hint">Click ▶ Enter Office to start</span>
      </div>
      <div id="hq-ntags"></div>`;

    // sp-board-btn listener set up in first-person controls block below

    const updateClock = () => {
      const n = new Date();
      const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
      const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const cl = document.getElementById('hq-sp-clock');
      const dt = document.getElementById('hq-sp-date');
      if (cl) cl.textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
      if (dt) dt.textContent = DAYS[n.getDay()] + ' · ' + MONTHS[n.getMonth()] + ' ' + n.getFullYear();
    };
    updateClock();
    HQ._clock = setInterval(updateClock, 30000);

    // THREE.JS SCENE
    const THREE = window.THREE;
    const W = root.clientWidth || window.innerWidth;
    const H = root.clientHeight || window.innerHeight - 50;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.Fog(0x080c14, 18, 52);
    const asp = W / H;
    const camera = new THREE.PerspectiveCamera(72, asp, 0.08, 120);
    camera.position.set(0, 1.7, 13);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = 'position:absolute;top:0;left:0;z-index:1';
    root.appendChild(renderer.domElement);
    HQ._renderer = renderer;

    // Lighting — clean cool office
    scene.add(new THREE.AmbientLight(0x101828, 3.2));
    const sun = new THREE.DirectionalLight(0xd8e8ff, 1.1);
    sun.position.set(22, 38, 18); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left:-40, right:40, top:40, bottom:-40, near:.5, far:120 });
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x0a1428, 0.4);
    rim.position.set(-18, 10, -18); scene.add(rim);

    function mat(c, em) { const m = new THREE.MeshLambertMaterial({ color:c }); if (em !== undefined) m.emissive = new THREE.Color(em); return m; }
    const M = {
      fl:  mat(0x0e1520),       // dark floor — clean slate
      ca:  mat(0x101a28),       // carpet — dark navy
      wex: mat(0x151e2e),       // exterior walls — dark blue-grey
      win: mat(0x111a28),       // interior partitions
      gl:  mat(0x1a2840, 0x0a1220),  // glass — blue tint
      ceil:mat(0x0c1018),       // ceiling — near black
      clt: mat(0x3060c0, 0x102060),  // ceiling light — cool blue glow
      dt:  mat(0x1e2a3e),       // desk surface — dark blue-grey
      de:  mat(0x0e1420),       // desk legs / dark metal
      ch:  mat(0x141c2a),       // chair seat
      cb:  mat(0x101620),       // chair back
      mo:  mat(0x0a0e14),       // monitor frame
      sc:  mat(0x060c18, 0x0a1830),  // monitor screen — cool blue glow
      sv:  mat(0x141c28),       // server rack
      led: mat(0x44ee88, 0x114422),  // green LED
      ldb: mat(0x4488ff, 0x102060),  // blue LED — brand accent
      so:  mat(0x182030),       // sofa
      so2: mat(0x1e3050),       // sofa accent — blue
      cnt: mat(0x131c2a),       // counter/cabinet
      app: mat(0x0e1420),       // appliances
      wb:  mat(0xd4dff0),       // whiteboard — cool white
      wbf: mat(0x0e1828),       // whiteboard frame
      rug: mat(0x0f1a28),       // area rug
      pp:  mat(0x182030),       // plant pot
      pl:  mat(0x1a3820),       // plant leaves
      ct:  mat(0x131c2a),       // coffee table
      pn:  mat(0x080c14),       // character pants/hair
    };
    function ab(w,h,d,material,x,y,z,ry) { const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material); m.position.set(x,y,z); if(ry) m.rotation.y=ry; m.castShadow=true; m.receiveShadow=true; scene.add(m); return m; }
    function cy(r,h,material,x,y,z,sg) { const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,sg||12),material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m; }

    const OW=46, OD=32, WH=3.2, WT=.18;

    // ── CEILING LIGHTS (point lights + visible panels) ──────────
    [[-15,-11],[-5,-11],[5,-11],[15,-11],
     [-15,-2],[-5,-2],[5,-2],[15,-2],
     [-15,7],[-5,7],[5,7],[15,7]].forEach(([x,z]) => {
      ab(.6,.06,.6,M.clt,x,WH+.02,z);
      const pl=new THREE.PointLight(0xc8deff,0.8,14); pl.position.set(x,WH-.15,z); scene.add(pl);
    });
    // accent: exec office
    const epl=new THREE.PointLight(0xa8c8ff,0.5,9); epl.position.set(17,-9,3); scene.add(epl);

    // ── FLOOR ──────────────────────────────────────────────────
    ab(OW,.1,OD,M.fl, 0,-.05,0);
    // Carpet zones
    ab(24,.11,20,M.ca, -8,0,-2);          // engineering/design wing carpet
    ab(12,.11,12,M.ca, 15,0,0);           // sales carpet

    // ── CEILING ────────────────────────────────────────────────
    ab(OW,.12,OD,M.ceil, 0,WH+.06,0);

    // ── EXTERIOR WALLS ─────────────────────────────────────────
    ab(OW,WH,WT,M.wex, 0,WH/2,-OD/2);             // back
    ab(WT,WH,OD,M.wex, -OW/2,WH/2,0);             // left
    ab(WT,WH,OD,M.wex, OW/2,WH/2,0);              // right
    ab(10,WH,WT,M.wex, -OW/2+5,WH/2,OD/2);        // front-left
    ab(10,WH,WT,M.wex, OW/2-5,WH/2,OD/2);         // front-right
    // Window openings on back wall (glazing panels)
    [[-15,-8],[0,-8],[15,-8]].forEach(([x])=>{ ab(4.5,1.4,WT,M.gl,x,WH*.6,-OD/2); });

    // ── INTERIOR PARTITIONS ────────────────────────────────────
    // Server room enclosure
    ab(10,WH,WT,M.win, -OW/2+5,WH/2,-OD/2+5.5);
    ab(WT,WH,5.5,M.win, -OW/2+10,WH/2,-OD/2+2.75);
    // Meeting room glass walls
    ab(WT,WH,10,M.gl, -1,WH/2,-4);
    ab(WT,WH,10,M.gl, 7,WH/2,-4);
    ab(8,WH,WT,M.gl, 3,WH/2,-9);
    // Exec office walls
    ab(WT,WH,9,M.win, 11,WH/2,-8.5);
    ab(8,WH,WT,M.win, 15,WH/2,-4);
    // Kitchen/break room half-wall
    ab(12,1.4,WT,M.win, 15,0.7,5.5);

    // ── DESK + CHAIR FUNCTIONS ─────────────────────────────────
    function desk(x,z,ry=0) {
      const c=Math.cos(ry),s=Math.sin(ry);
      ab(1.9,.07,.88,M.dt,x,.72,z,ry);
      ab(1.1,.06,.12,M.de,x,.8,z-c*.22,ry);
      [[.85,.37],[-.85,.37],[.85,-.37],[-.85,-.37]].forEach(([dx,dz])=>
        ab(.05,.72,.05,M.de,x+dx*c-dz*s,.36,z+dx*s+dz*c));
      ab(.82,.48,.06,M.mo,x,1.02,z-c*.28,ry);
      ab(.74,.42,.04,M.sc,x,1.04,z-c*.26,ry);
      ab(.06,.16,.06,M.de,x,.82,z-c*.21,ry);
      ab(.5,.03,.2,M.de,x,.73,z+c*.16,ry);
      ab(.09,.03,.11,M.cnt,x+.32*c,.73,z+.32*s,ry);
    }
    function chair(x,z,ry=0) {
      const c=Math.cos(ry),s=Math.sin(ry);
      ab(.54,.1,.54,M.ch,x,.72,z);
      ab(.54,.58,.07,M.cb,x,1.03,z-c*.3,ry);
      [[.28,0],[-.28,0]].forEach(([dx])=>{
        ab(.08,.04,.46,M.de,x+dx*c,.84,z+dx*s,ry);
        cy(.05,.38,M.de,x+dx*c,.45,z+dx*s,6);
      });
      cy(.04,.72,M.de,x,.36,z,6);
      for(let a=0;a<5;a++){const ag=a/5*Math.PI*2;ab(.3,.04,.06,M.de,x+Math.cos(ag)*.23,.05,z+Math.sin(ag)*.23,ag);}
    }

    // ── SERVER ROOM (back-left) ────────────────────────────────
    const SX=-OW/2+2, SZ=-OD/2+2;
    for(let col=0;col<4;col++) {
      for(let rack=0;rack<3;rack++) {
        ab(.58,2.3,.46,M.sv, SX+col*1.6+rack*.64,.02,SZ);
        for(let j=0;j<9;j++) {
          if(Math.random()>.35) {
            const lm=rack%2===0?M.led:M.ldb;
            ab(.07,.04,.04,lm, SX+col*1.6+rack*.64+.22,.1+j*.26,SZ-.24);
          }
        }
      }
      ab(2,.08,.5,M.dt, SX+col*1.6+.6,2.35,SZ);
    }

    // ── ENGINEERING WORKSPACE (left wing, 3 rows × 3 desks) ───
    [[-19,-7],[-14,-7],[-9,-7],
     [-19,-2],[-14,-2],[-9,-2],
     [-19,3], [-14,3]].forEach(([x,z])=>{ desk(x,z); chair(x,z+1.15); });

    // ── DESIGN AREA (center-left) ─────────────────────────────
    [[-3,3],[-3,0]].forEach(([x,z])=>{ desk(x,z); chair(x,z+1.15); });
    // Design whiteboard (engineering wall)
    ab(3.2,1.5,.08,M.wb, -19,1.65,-OD/2+.1);
    ab(3.4,1.7,.06,M.wbf, -19,1.65,-OD/2+.12);
    // Second whiteboard
    ab(2.6,1.3,.08,M.wb, -OW/2+.1,1.6,-3);
    ab(2.8,1.5,.06,M.wbf, -OW/2+.12,1.6,-3);

    // ── MEETING ROOM (center, behind glass) ───────────────────
    ab(6,.08,1.8,M.dt, 3,.72,-4);
    [3,-1.5,0,1.5,4.5,6].forEach(x=>cy(.07,.72,M.de,x,.36,-4));
    for(let i=0;i<6;i++) {
      ab(.52,.1,.52,M.ch, -1+i*1.2,.72,-5.4);
      ab(.52,.58,.07,M.cb, -1+i*1.2,1.03,-5.72);
      cy(.04,.72,M.de,-1+i*1.2,.36,-5.4,6);
      ab(.52,.1,.52,M.ch, -1+i*1.2,.72,-2.6);
      ab(.52,.58,.07,M.cb, -1+i*1.2,1.03,-2.28);
      cy(.04,.72,M.de,-1+i*1.2,.36,-2.6,6);
    }
    ab(2.8,1.5,.08,M.mo, 3,1.72,-8.94);
    ab(2.56,1.32,.06,M.sc, 3,1.72,-8.9);
    ab(2.2,1.1,.08,M.wb, 3,1.55,.1);
    ab(2.4,1.3,.06,M.wbf, 3,1.55,.12);
    // Meeting room rug
    ab(9,.04,8,M.rug, 3,.04,-4);

    // ── EXECUTIVE OFFICE (back-right) ─────────────────────────
    // L-desk
    ab(2.6,.08,1.1,M.dt, 17,.72,-11);
    ab(1.1,.08,2.0,M.dt, 15.5,.72,-10.1);
    [[1.2,.44],[-.8,.44],[1.2,-.44],[-.8,-.44]].forEach(([dx,dz])=>ab(.06,.72,.06,M.de,17+dx,.36,-11+dz));
    [[.44,.9],[-.44,.9]].forEach(([dx,dz])=>ab(.06,.72,.06,M.de,15.5+dx,.36,-10.1+dz-1.0));
    // Dual monitors
    [[-.4,0],[.4,0]].forEach(([dx])=>{ab(.82,.5,.06,M.mo,16.6+dx,1.02,-11.56);ab(.74,.44,.04,M.sc,16.6+dx,1.04,-11.54);ab(.06,.17,.06,M.de,16.6+dx,.83,-11.5);});
    chair(17,.72,-9.7,Math.PI);
    // Bookshelf
    ab(.22,2.6,2.0,M.cnt, OW/2-.14,1.3,-12);
    [.28,.82,1.36,1.9,2.44].forEach(y=>{
      ab(.18,.05,2.0,M.de, OW/2-.14,y,-12);
      [0xcc2020,0x2244bb,0x229933,0xdd8800,0x882299].forEach((c,i)=>{
        const bm=new THREE.MeshLambertMaterial({color:c});
        ab(.07,.22,.16,bm, OW/2-.2,y+.14,-12+(i-2)*.38);
      });
    });
    // Exec lounge
    ab(2.0,.46,.76,M.so, 18.2,.22,-6.5);
    ab(2.0,.72,.12,M.so, 18.2,.58,-6.88);
    ab(.76,.46,2.0,M.so, OW/2-.38,.22,-7.5);
    ab(.12,.72,2.0,M.so, OW/2-.06,.58,-7.5);
    ab(.92,.36,.6,M.so2, 18.9,.18,-6.5);
    ab(1.2,.06,.6,M.ct, 17.5,.5,-5.3);
    ab(3,.04,2.5,M.rug, 18,.04,-7);

    // ── SALES / MARKETING (center-right) ──────────────────────
    [[11,-4],[16,-4],[11,0],[16,0],[11,4]].forEach(([x,z])=>{ desk(x,z); chair(x,z+1.15); });
    // Sales lounge
    ab(2.4,.46,.76,M.so, 13,.22,-6.5);
    ab(2.4,.72,.12,M.so, 13,.58,-6.88);
    ab(1.1,.06,.5,M.ct, 13,.5,-7.6);

    // ── BREAK ROOM / KITCHEN (front-right) ────────────────────
    ab(8,.9,.68,M.cnt, OW/2-4,.45,OD/2-2.2);
    ab(.68,.9,6,M.cnt, OW/2-.34,.45,OD/2-5);
    ab(8,.06,.68,M.dt, OW/2-4,.91,OD/2-2.2);
    ab(.68,.06,6,M.dt, OW/2-.34,.91,OD/2-5);
    ab(.54,.62,.42,M.app, OW/2-1.5,.95,OD/2-2.0);  // microwave
    ab(.54,1.28,.52,M.app, OW/2-.8,.64,OD/2-2.0);   // fridge
    ab(.24,.5,.2,M.mo, OW/2-4,.95,OD/2-2.0);         // coffee machine
    ab(.07,.07,.07,M.led, OW/2-4,1.45,OD/2-1.92);
    for(let i=0;i<4;i++) {
      cy(.2,.06,M.ch, OW/2-5.5+i*1.4,.9,OD/2-3.8,8);
      cy(.04,.9,M.de, OW/2-5.5+i*1.4,.45,OD/2-3.8);
    }

    // ── RECEPTION LOBBY (front-center) ────────────────────────
    ab(3.6,.92,.72,M.cnt, 0,.46,OD/2-3);
    ab(3.6,.07,.72,M.dt, 0,.93,OD/2-3);
    ab(3.6,.92,.1,M.cnt, 0,.46,OD/2-2.66);
    // Lobby sofas
    [[-6,OD/2-4],[6,OD/2-4]].forEach(([x,z])=>{
      ab(2.6,.46,.76,M.so,x,.22,z); ab(2.6,.72,.12,M.so,x,.58,z+.38);
      ab(1.2,.06,.55,M.ct,x,.5,z-1.1);
    });
    ab(6,.04,5,M.rug, 0,.04,OD/2-5);

    // ── OPEN PLAN PHONE BOOTH / FOCUS PODS (center) ───────────
    [[3,5],[3,8]].forEach(([x,z])=>{
      ab(1.4,WH,.9,M.win,x,WH/2,z);
      ab(.9,WH,WT,M.win,x+.5,WH/2,z-0.42);
      ab(.9,WH,WT,M.win,x+.5,WH/2,z+0.42);
      desk(x-.1,z,Math.PI/2); chair(x+.5,z,Math.PI);
    });

    // ── BOOKSHELF ROW (left wall) ──────────────────────────────
    ab(.22,2.2,6,M.cnt, -OW/2+.14,1.1,-8);
    [.3,.85,1.4,1.9].forEach(y=>{
      ab(.18,.05,6,M.de,-OW/2+.14,y,-8);
      for(let i=0;i<8;i++){
        const c=[0xcc2020,0x2244bb,0x229933,0xdd8800,0x882299,0x116688,0xcc6622,0x448844][i];
        const bm=new THREE.MeshLambertMaterial({color:c});
        ab(.07,.22,.5,bm,-OW/2+.2,y+.14,-11+i*.74);
      }
    });

    // ── PING PONG TABLE (rec area) ─────────────────────────────
    ab(2.8,.09,1.5,M.dt, -4,OD/2-5.5,0);
    ab(.04,.24,1.5,M.cnt, -4,.73,0);
    [[-1.3,.65],[1.3,.65],[-1.3,-.65],[1.3,-.65]].forEach(([dx,dz])=>ab(.06,.65,.06,M.de,-4+dx,.32,dz));

    // ── PLANTS ─────────────────────────────────────────────────
    function plant(x,z,big=false) {
      const s=big?1.35:1;
      cy(.18*s,.28*s,M.pp,x,.14*s,z,8);
      cy(.08*s,.64*s,M.pl,x,.44*s,z,6);
      const lm=new THREE.Mesh(new THREE.SphereGeometry(.32*s,7,6),M.pl);
      lm.scale.y=.65; lm.position.set(x,.98*s,z); lm.castShadow=true; scene.add(lm);
    }
    [[-OW/2+1,-OD/2+1,true],[OW/2-1,-OD/2+1,true],
     [-OW/2+1,OD/2-1,true],[OW/2-1,OD/2-1,true],
     [-12,-4],[-8,5],[0,-9],[6,5],[12,-9],[18,4],
     [-4,-13],[-18,0],[4,13],[-10,10]].forEach(([x,z,big=false])=>plant(x,z,big));

    // Characters
    const chars = [];
    emps.forEach((e, i) => {
      const g = new THREE.Group();
      const mB = new THREE.MeshLambertMaterial({ color: e.bodyHex || 0x3b82f6 });
      const mS = new THREE.MeshLambertMaterial({ color: e.skinHex || SKIN[i % SKIN.length] });
      [-.07,.07].forEach(dx => { const l=new THREE.Mesh(new THREE.BoxGeometry(.12,.34,.12),M.pn); l.position.set(dx,.17,0); l.castShadow=true; g.add(l); });
      const b = new THREE.Mesh(new THREE.BoxGeometry(.3,.36,.2), mB); b.position.set(0,.51,0); b.castShadow=true; g.add(b);
      [-.22,.22].forEach(dx => { const a=new THREE.Mesh(new THREE.BoxGeometry(.1,.3,.1),mB); a.position.set(dx,.47,0); a.castShadow=true; g.add(a); });
      const h = new THREE.Mesh(new THREE.BoxGeometry(.24,.24,.24), mS); h.position.set(0,.82,0); h.castShadow=true; g.add(h);
      const hr = new THREE.Mesh(new THREE.BoxGeometry(.26,.08,.26), M.pn); hr.position.set(0,.96,0); g.add(hr);
      const pos = e.pos || [0, 0];
      g.position.set(pos[0], 0, pos[1]);
      g.scale.setScalar(1.55);
      scene.add(g); chars.push({ group:g, emp:e });
    });

    // Name tags — minimal sim chips
    const ntContainer = document.getElementById('hq-ntags');
    const ntEls = chars.map(({ emp }, i) => {
      const d = document.createElement('div');
      d.className = 'ntag';
      const task = getTaskLabel(emp);
      const status = statuses[i];
      d.innerHTML = `
        <div class="ntag-chip">
          <div class="ntag-dot" style="background:${emp.color}"></div>
          <span>${escHtml(emp.name)}</span>
          <div class="ntag-status-dot ${status}"></div>
        </div>
        ${task ? `<div class="ntag-task">${escHtml(task.length > 38 ? task.slice(0,38)+'…' : task)}</div>` : ''}`;
      d.addEventListener('click', () => Chat.open(emp.id));
      ntContainer.appendChild(d);
      return d;
    });

    // ── FIRST-PERSON CONTROLS ─────────────────────────────────
    let plocked = false;
    let yaw = 0, pitch = 0;
    const playerPos = new THREE.Vector3(0, 1.7, 13);
    const keys = {};
    let nearEmpRef = null;

    document.getElementById('sp-board-btn').addEventListener('click', () => Employees.showStandup());

    const enterBtn = document.getElementById('fp-enter-btn');
    const enterEl = document.getElementById('fp-enter');
    const crossEl = document.getElementById('fp-crosshair');
    const interactEl = document.getElementById('fp-interact');
    const hintEl = document.getElementById('fp-hint');

    const lockCanvas = () => renderer.domElement.requestPointerLock();
    if (enterBtn) enterBtn.addEventListener('click', lockCanvas);

    const onPLC = () => {
      plocked = document.pointerLockElement === renderer.domElement;
      if (enterEl) enterEl.style.display = plocked ? 'none' : 'flex';
      if (crossEl) crossEl.style.opacity = plocked ? '1' : '0';
      if (hintEl) hintEl.textContent = plocked ? 'ESC — release mouse' : 'Click ▶ Enter Office to start';
    };
    const onMM = e => {
      if (!plocked) return;
      yaw -= e.movementX * 0.002;
      pitch = Math.max(-0.88, Math.min(0.88, pitch - e.movementY * 0.002));
    };
    const onKD = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyE' && nearEmpRef) { Chat.open(nearEmpRef.id); }
    };
    const onKU = e => { keys[e.code] = false; };

    document.addEventListener('pointerlockchange', onPLC);
    document.addEventListener('mousemove', onMM);
    document.addEventListener('keydown', onKD);
    document.addEventListener('keyup', onKU);

    HQ._cleanup = () => {
      document.removeEventListener('pointerlockchange', onPLC);
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('keydown', onKD);
      document.removeEventListener('keyup', onKU);
    };

    // ── MINIMAP ───────────────────────────────────────────────
    const mmCanvas = document.getElementById('fp-minimap');
    const mmCtx = mmCanvas ? mmCanvas.getContext('2d') : null;
    const OWH = OW / 2, ODH = OD / 2;
    function drawMinimap() {
      if (!mmCtx) return;
      const mW = mmCanvas.width, mH = mmCanvas.height;
      const scX = mW / OW, scZ = mH / OD;
      mmCtx.fillStyle = 'rgba(8,12,20,0.95)';
      mmCtx.fillRect(0, 0, mW, mH);
      // office border
      mmCtx.strokeStyle = 'rgba(255,255,255,0.1)';
      mmCtx.lineWidth = 1;
      mmCtx.strokeRect(0, 0, mW, mH);
      // employees
      chars.forEach(({ group, emp }) => {
        const cx = (group.position.x + OWH) * scX;
        const cz = (group.position.z + ODH) * scZ;
        mmCtx.fillStyle = emp.color;
        mmCtx.beginPath(); mmCtx.arc(cx, cz, 3, 0, Math.PI * 2); mmCtx.fill();
      });
      // player
      const px = (playerPos.x + OWH) * scX;
      const pz = (playerPos.z + ODH) * scZ;
      mmCtx.fillStyle = '#ffffff';
      mmCtx.beginPath(); mmCtx.arc(px, pz, 4, 0, Math.PI * 2); mmCtx.fill();
      // direction
      mmCtx.strokeStyle = '#fff';
      mmCtx.lineWidth = 1.5;
      mmCtx.beginPath(); mmCtx.moveTo(px, pz);
      mmCtx.lineTo(px - Math.sin(yaw) * 9, pz - Math.cos(yaw) * 9); mmCtx.stroke();
    }

    // ── NAME TAGS ─────────────────────────────────────────────
    const tmpV = new THREE.Vector3();
    function updateTags() {
      chars.forEach(({ group }, i) => {
        tmpV.set(group.position.x, group.position.y + 2.6, group.position.z);
        tmpV.project(camera);
        if (tmpV.z > 1) { ntEls[i].style.opacity = '0'; return; }
        const sx = (tmpV.x * .5 + .5) * renderer.domElement.clientWidth;
        const sy = (-tmpV.y * .5 + .5) * renderer.domElement.clientHeight;
        ntEls[i].style.left = sx + 'px';
        ntEls[i].style.top = sy + 'px';
        ntEls[i].style.opacity = tmpV.z < 0.999 ? '1' : '0';
      });
    }

    // ── ANIMATION LOOP ────────────────────────────────────────
    let t = 0;
    const fwdV = new THREE.Vector3();
    const rgtV = new THREE.Vector3();
    const moveV = new THREE.Vector3();

    (function animate() {
      if (!HQ._active) return;
      requestAnimationFrame(animate);
      t += 0.012;

      // Movement
      if (plocked) {
        const spd = (keys['ShiftLeft'] || keys['ShiftRight']) ? 0.22 : 0.1;
        fwdV.set(-Math.sin(yaw), 0, -Math.cos(yaw));
        rgtV.set(Math.cos(yaw), 0, -Math.sin(yaw));
        moveV.set(0, 0, 0);
        if (keys['KeyW'] || keys['ArrowUp'])    moveV.addScaledVector(fwdV, spd);
        if (keys['KeyS'] || keys['ArrowDown'])  moveV.addScaledVector(fwdV, -spd);
        if (keys['KeyA'] || keys['ArrowLeft'])  moveV.addScaledVector(rgtV, -spd);
        if (keys['KeyD'] || keys['ArrowRight']) moveV.addScaledVector(rgtV, spd);
        playerPos.add(moveV);
        playerPos.x = Math.max(-OWH + 1, Math.min(OWH - 1, playerPos.x));
        playerPos.z = Math.max(-ODH + 1, Math.min(ODH - 1, playerPos.z));
      }

      camera.position.copy(playerPos);
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;

      // Character idle sway
      chars.forEach(({ group }, i) => {
        group.position.y = Math.sin(t * 1.2 + i) * 0.025;
        group.rotation.y += 0.005;
      });

      // Proximity detection
      nearEmpRef = null;
      let nearDist = 4.5;
      chars.forEach(({ group, emp }) => {
        const dx = group.position.x - playerPos.x;
        const dz = group.position.z - playerPos.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        if (d < nearDist) { nearDist = d; nearEmpRef = emp; }
      });
      if (interactEl) {
        if (nearEmpRef && plocked) {
          interactEl.textContent = `Press E — ${nearEmpRef.name} · ${nearEmpRef.role}`;
          interactEl.style.opacity = '1';
        } else {
          interactEl.style.opacity = '0';
        }
      }

      drawMinimap();
      updateTags();
      renderer.render(scene, camera);
    })();
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
    const emps = State.employees;
    const now  = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const arrived = Math.ceil(emps.length * 0.65);
    document.getElementById('modal-box').style.maxWidth = '92vw';
    document.getElementById('modal-box').style.width = '860px';
    Modal.open('Daily Standup Board', `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-family:var(--mono);font-size:9px;letter-spacing:2px;color:var(--text3);margin-bottom:4px">STANDUP · ${days[now.getDay()].toUpperCase()}</div>
          <div style="font-family:var(--mono);font-size:20px;font-weight:600;color:var(--text);letter-spacing:-1px">${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}</div>
        </div>
        <div style="display:flex;gap:20px">
          <div style="text-align:center">
            <div style="font-family:var(--mono);font-size:18px;font-weight:600;color:var(--green)">${arrived}</div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:1.5px">ARRIVED</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--mono);font-size:18px;font-weight:600;color:var(--amber)">${emps.length - arrived}</div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:1.5px">WAITING</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--mono);font-size:18px;font-weight:600;color:var(--text)">${State.tasks.filter(t=>t.column!=='done').length}</div>
            <div style="font-family:var(--mono);font-size:9px;color:var(--text3);letter-spacing:1.5px">ACTIVE TASKS</div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;max-height:60vh;overflow-y:auto;padding-right:4px">
        ${emps.map((e,i) => {
          const myTasks   = State.tasks.filter(t=>t.assignee===e.id);
          const inProgress= myTasks.filter(t=>t.column==='inprogress');
          const done      = myTasks.filter(t=>t.column==='done');
          const isHere    = i < arrived;
          const commits   = [
            `feat: ${e.name.toLowerCase()}-workflow improvements`,
            `fix: resolve edge case in ${e.role.toLowerCase().split(' ')[0]} module`,
            `docs: update ${e.role.toLowerCase().split(' ').pop()} runbook`,
          ];
          return `
            <div style="background:var(--surface2);border:1px solid ${isHere?'rgba(34,197,94,.2)':'var(--border)'};border-radius:10px;padding:14px">
              <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
                <div style="width:28px;height:28px;border-radius:7px;background:${e.color}22;color:${e.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0">${e.name[0]}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:12.5px;font-weight:700;color:var(--text)">${escHtml(e.name)}</div>
                  <div style="font-family:var(--mono);font-size:9px;color:var(--text3)">${escHtml(e.role).toLowerCase()}</div>
                </div>
                <div style="font-family:var(--mono);font-size:8.5px;font-weight:700;padding:2px 7px;border-radius:4px;letter-spacing:1px;${isHere?'background:rgba(34,197,94,.1);color:var(--green);border:1px solid rgba(34,197,94,.2)':'background:rgba(245,158,11,.1);color:var(--amber);border:1px solid rgba(245,158,11,.2)'}">${isHere?'ARRIVED':'WAITING'}</div>
              </div>
              <div style="font-family:var(--mono);font-size:8.5px;letter-spacing:2px;color:var(--text3);margin-bottom:4px">CURRENT TASK</div>
              <div style="font-family:var(--mono);font-size:10.5px;color:var(--text);line-height:1.4;margin-bottom:8px">${inProgress.length?escHtml(inProgress[0].title):'<span style="color:var(--text3)">No active task</span>'}</div>
              <div style="font-family:var(--mono);font-size:8.5px;letter-spacing:2px;color:var(--text3);margin-bottom:4px">RECENT COMMITS</div>
              ${commits.slice(0,2).map(c=>`
                <div style="font-family:var(--mono);font-size:9.5px;color:var(--text2);padding-left:7px;border-left:2px solid var(--border);margin-bottom:3px;line-height:1.4">
                  <span style="color:var(--accent);font-size:8.5px">${Math.random().toString(36).slice(2,9)}</span> ${c}
                </div>`).join('')}
              <div style="font-family:var(--mono);font-size:8.5px;letter-spacing:2px;color:var(--text3);margin:8px 0 4px">TICKETS</div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--text2)">${myTasks.filter(t=>t.column!=='done').length} open &nbsp;·&nbsp; ${done.length} closed</div>
              <div style="display:flex;gap:4px;margin-top:10px">
                <button style="font-family:var(--mono);font-size:9px;font-weight:600;padding:3px 8px;border-radius:5px;cursor:pointer;border:1px solid var(--ba);color:var(--accent);background:rgba(59,130,246,.08);letter-spacing:.5px">GITHUB</button>
                <button style="font-family:var(--mono);font-size:9px;font-weight:600;padding:3px 8px;border-radius:5px;cursor:pointer;border:1px solid var(--border);color:var(--text3);background:none;letter-spacing:.5px">JIRA</button>
                <button style="font-family:var(--mono);font-size:9px;font-weight:600;padding:3px 8px;border-radius:5px;cursor:pointer;border:1px solid var(--border);color:var(--text3);background:none;letter-spacing:.5px">MANUAL</button>
              </div>
            </div>`;
        }).join('')}
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
          <input class="form-input" id="s-apikey" type="text" value="${escHtml(s.apiKey||'')}" placeholder="sk-ant-api03-…" autocomplete="off" spellcheck="false">
          <div class="form-hint">Get your key at <b>console.anthropic.com</b> → API Keys. Must start with <code>sk-ant-</code></div>
        </div>
        <div class="form-group">
          <label class="form-label">MODEL</label>
          <select class="form-select" id="s-model">
            <option value="claude-haiku-4-5-20251001" ${(s.model||'claude-haiku-4-5-20251001')==='claude-haiku-4-5-20251001'?'selected':''}>Claude Haiku 4.5 (fast, cheap)</option>
            <option value="claude-sonnet-4-6" ${s.model==='claude-sonnet-4-6'?'selected':''}>Claude Sonnet 4.6 (smart, balanced)</option>
            <option value="claude-opus-4-7" ${s.model==='claude-opus-4-7'?'selected':''}>Claude Opus 4.7 (most powerful)</option>
          </select>
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
      const k = document.getElementById('s-apikey').value.trim();
      const m = document.getElementById('s-model').value;
      State.settings.apiKey = k;
      State.settings.model = m;
      try { localStorage.setItem('kayro_settings', JSON.stringify(State.settings)); } catch(_) {}
      Settings.updateApiStatus();
      toast(k ? 'API key saved ✓' : 'Key cleared','success');
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
//  PAGE: DESIGN STUDIO
// ══════════════════════════════════════════════════════════════
const DesignStudio = {
  init(container) {
    document.getElementById('topbar-right').innerHTML = '<button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>';
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    container.innerHTML = `<div class="page-scroll" id="ds-page">
      <div class="section-hdr">
        <div>
          <div class="section-title">Design Studio</div>
          <div class="section-sub">Describe what you want. Your AI team generates real HTML/CSS designs.</div>
        </div>
      </div>
      <div class="ds-top">
        <div class="ds-form">
          <div class="form-group">
            <label class="form-label">EMPLOYEE</label>
            <select class="form-input" id="ds-emp">
              ${State.employees.map(e=>`<option value="${e.id}">${e.name} — ${e.role}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">DESIGN PROMPT</label>
            <textarea class="form-textarea" id="ds-prompt" rows="3" placeholder="Design a dark pricing page with 3 tiers. Use Inter font. Black background, white text, green CTA buttons."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">OUTPUT TYPE</label>
            <div class="ds-type-row" id="ds-type-row">
              <button class="ds-type-btn active" data-type="component">UI Component</button>
              <button class="ds-type-btn" data-type="page">Full Page</button>
              <button class="ds-type-btn" data-type="email">Email Template</button>
              <button class="ds-type-btn" data-type="card">Card / Widget</button>
            </div>
          </div>
          <button class="btn btn-primary" id="ds-generate" style="width:100%">✦ Generate Design</button>
        </div>
        <div class="ds-preview-wrap" id="ds-preview-wrap">
          <div class="ds-preview-empty">
            <div style="font-size:32px;margin-bottom:12px">🎨</div>
            <div style="font-size:13px;color:var(--text2)">Your design will appear here</div>
          </div>
        </div>
      </div>
      <div class="ds-saved" id="ds-saved"></div>
    </div>`;

    let selectedType = 'component';
    container.querySelectorAll('.ds-type-btn').forEach(btn => btn.addEventListener('click', () => {
      container.querySelectorAll('.ds-type-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    }));

    document.getElementById('ds-generate').addEventListener('click', async () => {
      const empId = document.getElementById('ds-emp').value;
      const prompt = document.getElementById('ds-prompt').value.trim();
      if (!prompt) { toast('Enter a design prompt','error'); return; }
      const emp = State.employees.find(e=>e.id===empId) || State.employees[0];
      const btn = document.getElementById('ds-generate');
      btn.disabled = true; btn.textContent = '⏳ Generating…';
      const wrap = document.getElementById('ds-preview-wrap');
      wrap.innerHTML = '<div class="ds-preview-empty" style="animation:pulse 1.5s infinite"><div style="font-size:13px;color:var(--text2)">Generating design…</div></div>';

      const typeInstructions = {
        component: 'Generate a self-contained HTML+CSS UI component. No full page, just the component with styles in a <style> tag.',
        page: 'Generate a complete single-page HTML document with embedded CSS. Include a realistic page layout.',
        email: 'Generate an HTML email template (table-based, inline styles, 600px wide, dark themed).',
        card: 'Generate a single HTML card/widget with embedded CSS. Small and focused.',
      };
      const sys = `You are ${emp.name}, ${emp.role}. Generate ONLY valid, complete HTML+CSS code — no markdown, no explanation, no code blocks. Just raw HTML starting with <!DOCTYPE html> or a <div>. The design should be dark-themed (matching background #080808 or near-black), using Inter and JetBrains Mono fonts from Google Fonts. ${typeInstructions[selectedType]}`;
      let html = '';
      try {
        const stream = AI.stream([{role:'user',content:`Design request: ${prompt}\n\nOutput type: ${selectedType}`}], sys);
        for await (const chunk of stream) html += chunk;
        html = html.trim();
        if (html.startsWith('```')) html = html.replace(/^```[^\n]*\n/,'').replace(/```$/,'').trim();
        wrap.innerHTML = `
          <div class="ds-preview-toolbar">
            <span class="ds-preview-emp" style="color:${emp.color}">${emp.name}</span>
            <span style="color:var(--text2);font-size:11px">${selectedType}</span>
            <div style="flex:1"></div>
            <button class="tb-btn" id="ds-copy-btn">Copy HTML</button>
            <button class="btn btn-primary btn-sm" id="ds-save-btn">Save Design</button>
          </div>
          <iframe class="ds-iframe" id="ds-iframe" sandbox="allow-scripts"></iframe>`;
        const frame = document.getElementById('ds-iframe');
        frame.contentDocument.open();
        frame.contentDocument.write(html);
        frame.contentDocument.close();
        document.getElementById('ds-copy-btn').addEventListener('click',()=>{
          navigator.clipboard.writeText(html).then(()=>toast('HTML copied','success'));
        });
        document.getElementById('ds-save-btn').addEventListener('click',()=>{
          const title = prompt.slice(0,60);
          State.designs.push({id:uid(),title,prompt,html,empId,type:selectedType,timestamp:Date.now()});
          save('designs');
          DesignStudio._renderSaved();
          toast('Design saved','success');
        });
      } catch(e) {
        wrap.innerHTML = `<div class="ds-preview-empty"><div style="color:var(--danger);font-size:12px">Error: ${e.message}</div></div>`;
      }
      btn.disabled = false; btn.textContent = '✦ Generate Design';
    });
    DesignStudio._renderSaved();
  },

  _renderSaved() {
    const el = document.getElementById('ds-saved'); if(!el) return;
    if (!State.designs.length) { el.innerHTML=''; return; }
    el.innerHTML = `<div class="section-title" style="margin:32px 0 16px;font-size:13px">Saved Designs (${State.designs.length})</div>
      <div class="ds-saved-grid">${State.designs.slice().reverse().map(d=>{
        const emp = State.employees.find(e=>e.id===d.empId);
        return `<div class="ds-saved-card">
          <div class="ds-sc-hdr">
            <div class="ds-sc-title">${escHtml(d.title)}</div>
            <button class="icon-btn ds-del-btn" data-did="${d.id}" style="color:var(--danger)">✕</button>
          </div>
          <div class="ds-sc-meta">${emp?`<span style="color:${emp.color}">${emp.name}</span> · `:''}<span style="color:var(--text2)">${d.type}</span></div>
          <button class="btn btn-sm ds-view-btn" data-did="${d.id}" style="margin-top:8px;width:100%">View Design</button>
        </div>`;
      }).join('')}</div>`;
    el.querySelectorAll('.ds-del-btn').forEach(btn=>btn.addEventListener('click',()=>{
      State.designs=State.designs.filter(d=>d.id!==btn.dataset.did);
      save('designs'); DesignStudio._renderSaved();
    }));
    el.querySelectorAll('.ds-view-btn').forEach(btn=>btn.addEventListener('click',()=>{
      const d=State.designs.find(x=>x.id===btn.dataset.did); if(!d) return;
      Modal.open(d.title.slice(0,50), `<iframe style="width:100%;height:500px;border:none;border-radius:8px;background:#000" sandbox="allow-scripts"></iframe>`, {
        onOpen() {
          const f=document.querySelector('#modal-box iframe');
          if(f){f.contentDocument.open();f.contentDocument.write(d.html);f.contentDocument.close();}
        }
      });
    }));
  },
  destroy() {},
};

// ══════════════════════════════════════════════════════════════
//  PAGE: BRAIN (Memory)
// ══════════════════════════════════════════════════════════════
const BrainPage = {
  init(container) {
    document.getElementById('topbar-right').innerHTML = '<button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>';
    document.getElementById('chat-toggle-btn').addEventListener('click',()=>Chat.toggle());
    container.innerHTML = `<div class="page-scroll" id="brain-page">
      <div class="section-hdr">
        <div>
          <div class="section-title">Brain</div>
          <div class="section-sub">Everything your AI team has learned and remembered. Edit or clear memories per employee.</div>
        </div>
        <button class="btn" id="brain-clear-all" style="color:var(--danger)">Clear All Memory</button>
      </div>
      <div id="brain-grid"></div>
    </div>`;
    document.getElementById('brain-clear-all').addEventListener('click',()=>{
      if(confirm('Clear ALL memories for all employees?')){ State.memory={}; save('memory'); BrainPage._render(); toast('Memory cleared','success'); }
    });
    BrainPage._render();
  },

  _render() {
    const grid = document.getElementById('brain-grid'); if(!grid) return;
    const emps = State.employees.filter(e=>State.memory[e.id]?.length);
    if (!emps.length) {
      grid.innerHTML = `<div class="empty-state">
        <div class="empty-icon">🧠</div>
        <div style="font-size:14px;color:var(--text2)">No memories yet</div>
        <div class="empty-text">As you chat with your AI employees, they'll remember important facts about your business here.</div>
      </div>`; return;
    }
    grid.innerHTML = `<div class="brain-grid">${emps.map(e=>{
      const mems = (State.memory[e.id]||[]).slice().reverse();
      return `<div class="brain-card">
        <div class="brain-card-hdr">
          <div class="emp-av" style="background:${e.color}22;color:${e.color};width:32px;height:32px;font-size:13px;flex-shrink:0">${e.name[0]}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--text)">${e.name}</div>
            <div style="font-size:11px;color:var(--text2)">${mems.length} memories</div>
          </div>
          <button class="btn btn-sm brain-clear-emp" data-eid="${e.id}" style="margin-left:auto;color:var(--danger);font-size:10px">Clear</button>
        </div>
        <div class="brain-memories">
          ${mems.map((m,i)=>`
            <div class="brain-mem" data-eid="${e.id}" data-idx="${State.memory[e.id].length-1-i}">
              <div class="brain-mem-bullet" style="background:${e.color}"></div>
              <div class="brain-mem-text">${escHtml(m.fact)}</div>
              <button class="icon-btn brain-del-mem" data-eid="${e.id}" data-idx="${State.memory[e.id].length-1-i}" style="color:var(--text3);font-size:11px;flex-shrink:0">✕</button>
            </div>`).join('')}
        </div>
      </div>`;
    }).join('')}</div>`;
    grid.querySelectorAll('.brain-clear-emp').forEach(btn=>btn.addEventListener('click',()=>{
      State.memory[btn.dataset.eid]=[]; save('memory'); BrainPage._render(); toast('Memory cleared','success');
    }));
    grid.querySelectorAll('.brain-del-mem').forEach(btn=>btn.addEventListener('click',()=>{
      const arr=State.memory[btn.dataset.eid]||[];
      arr.splice(+btn.dataset.idx,1); State.memory[btn.dataset.eid]=arr; save('memory'); BrainPage._render();
    }));
  },
  destroy() {},
};

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
loadState();
Chat.init();
Settings.updateApiStatus();
Router.navigate('hq');
