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
  {id:'e1',name:'Omar',  role:'Head of Product',  color:'#3b82f6',bodyHex:0x3b82f6,skinHex:0xf5c285,pos:[18.5,-10],status:'online', skills:['Product Strategy','Roadmapping','User Research','OKRs','Sprint Planning'],hired:Date.now(),tasks:0,
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

  {id:'e2',name:'Sarah', role:'Lead Engineer',    color:'#22c55e',bodyHex:0x22c55e,skinHex:0xe8b070,pos:[-17,-6],status:'online', skills:['React','Node.js','System Architecture','Code Review','TypeScript'],hired:Date.now(),tasks:0,
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

  {id:'e3',name:'Alex',  role:'Head of Marketing', color:'#f59e0b',bodyHex:0xf59e0b,skinHex:0xf2bf78,pos:[5, 4],status:'online', skills:['Growth Marketing','SEO','Copywriting','Paid Ads','Content Strategy'],hired:Date.now(),tasks:0,
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

  {id:'e4',name:'Zara',  role:'UI/UX Designer',   color:'#a855f7',bodyHex:0xa855f7,skinHex:0xeab86e,pos:[-3,-1],status:'online', skills:['Figma','Design Systems','User Research','Wireframing','Accessibility'],hired:Date.now(),tasks:0,
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

  {id:'e5',name:'Chris', role:'Head of Sales',     color:'#ef4444',bodyHex:0xef4444,skinHex:0xf0b268,pos:[5, 0],status:'online', skills:['Cold Outreach','CRM','Objection Handling','Pipeline Management','Closing'],hired:Date.now(),tasks:0,
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

  {id:'e6',name:'Mia',   role:'Customer Success',  color:'#06b6d4',bodyHex:0x06b6d4,skinHex:0xebba72,pos:[-9, 3],status:'online', skills:['Onboarding','Retention','Support','NPS','Churn Prevention'],hired:Date.now(),tasks:0,
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
  _headers(key) {
    return {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    };
  },
  async *stream(messages, system) {
    const key = (State.settings.apiKey||'').trim();
    if (!key) { yield '⚠️ No API key set.\n\nGo to ⚙️ Settings → paste your Anthropic key (starts with sk-ant-) → click Save Key.'; return; }
    if (!key.startsWith('sk-')) { yield '⚠️ Invalid API key format.\n\nYour key should start with sk-ant-  — check Settings.'; return; }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        mode: 'cors',
        headers: AI._headers(key),
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
        const hint = res.status===401 ? '\n\nYour API key is invalid or expired — get a new one at console.anthropic.com'
                   : res.status===429 ? '\n\nRate limit hit — wait a moment and try again'
                   : res.status===403 ? '\n\nAccess denied — check your API key permissions'
                   : '\n\nCheck your API key in Settings.';
        yield `⚠️ API error (${res.status}): ${msg}${hint}`;
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
    } catch(e) {
      const msg = e.message || String(e);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        yield `⚠️ Safari blocked the API request.\n\nSafari's privacy protections block cross-origin API calls.\n\n🔧 Quick fixes:\n1. Switch to Chrome or Firefox (recommended)\n2. Or in Safari: Settings → Privacy → uncheck "Prevent Cross-Site Tracking"\n\nError: ${msg}`;
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('CORS') || msg.toLowerCase().includes('failed')) {
        yield `⚠️ Network error — cannot reach Anthropic API.\n\nPossible causes:\n• No internet connection\n• Browser is blocking cross-origin requests\n• Try Chrome if you're on another browser\n\nError: ${msg}`;
      } else {
        yield `⚠️ Error: ${msg}`;
      }
    }
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
    Chat._renderSkillsBar();
    if (State.employees.length) Chat.setEmp(State.employees[0].id, false);
  },

  _renderSkillsBar() {
    const existing = document.getElementById('chat-skills-bar');
    if (existing) existing.remove();
    const bar = document.createElement('div');
    bar.id = 'chat-skills-bar';
    bar.className = 'chat-skills-bar';
    bar.innerHTML = [
      ['/gsd','Get Shit Done'],
      ['/brainstorm','Brainstorm'],
      ['/brief','Daily Brief'],
      ['/autopilot','Autopilot'],
    ].map(([cmd,label])=>`<button class="skill-cmd-pill" data-cmd="${cmd} " title="${label}">${cmd}</button>`).join('');
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.parentNode.insertBefore(bar, msgs);
    bar.querySelectorAll('.skill-cmd-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = document.getElementById('chat-input');
        if (inp) { inp.value = btn.dataset.cmd; inp.focus(); inp.style.height = 'auto'; }
      });
    });
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

  // ── SKILLS — slash commands with specialized system prompts ─────
  SKILLS: {
    '/gsd': (args, emps) => `

══ SKILL: GET SHIT DONE (GSD) ══
Project: "${args||'what was just discussed'}"

Act as a senior PM. Produce:
1. Task breakdown — 6-10 specific, actionable tasks with clear titles
2. For each task: Owner (pick from ${emps.map(e=>e.name+' — '+e.role).join(', ')}), Priority (🔴 High / 🟡 Medium / 🟢 Low), Effort (1-5 days)
3. Dependencies and blockers between tasks
4. START TODAY: the 3 tasks to kick off immediately for momentum

Format as a clean list. Then at the end, for each task output one line:
📌 TASK: [title] | OWNER: [name] | PRIORITY: [high/medium/low]
════════════════════`,

    '/brainstorm': (args) => `

══ SKILL: BRAINSTORM MODE ══
Topic: "${args||'the topic just discussed'}"

Generate ideas across 5 distinct lenses — 3 ideas each:
🔥 BOLD — unconventional, surprising, polarizing
💰 REVENUE — highest business value, fastest to monetize
👤 USER — starts from real user pain, highest empathy
⚡ QUICK WIN — achievable this week with current resources
🚀 10X — 10x bigger than what we'd normally attempt

For each idea: one punchy sentence + one-line rationale.
End with: ⭐ TOP PICK: [idea] — [why it wins over the rest]
════════════════════`,

    '/brief': () => `

══ SKILL: DAILY BRIEF ══
Generate a crisp morning brief:

📊 TEAM STATUS — who is working on what, any blockers right now
🔥 TOP 3 TODAY — the 3 most critical things to accomplish today
⚠️ AT RISK — what's in danger of slipping this week
💡 QUICK WINS — tasks we can close out fast for momentum
📅 DEADLINES — time-sensitive items coming up

Use actual task names and team member names. Keep it tight — like a 3-minute standup.
End with: NEXT ACTION: [the single most important thing to do right now]
════════════════════`,

    '/autopilot': () => `

══ SKILL: AUTOPILOT ══
Work autonomously right now. No summaries — do the actual work:
1. Pick your highest-impact active task
2. Produce the complete deliverable (write the full email / code / doc / copy — not an outline)
3. Flag what you need from others to stay unblocked
4. List 2-3 concrete follow-up tasks to queue next

Start immediately. The deliverable should be ready to use as-is.
════════════════════`,
  },

  _getSkillInject(text) {
    const emps = State.employees;
    for (const [cmd, handler] of Object.entries(Chat.SKILLS)) {
      if (text === cmd || text.startsWith(cmd + ' ') || text.startsWith(cmd + '\n')) {
        const args = text.slice(cmd.length).trim();
        return handler(args, emps);
      }
    }
    return '';
  },

  _extractTasks(text) {
    const lines = text.split('\n');
    const taskLines = lines.filter(l => l.includes('📌 TASK:'));
    if (!taskLines.length) return;
    let created = 0;
    taskLines.forEach(line => {
      const tm = line.match(/📌 TASK:\s*([^|]+)/);
      const om = line.match(/OWNER:\s*([^|]+)/);
      const pm = line.match(/PRIORITY:\s*([^|]+)/i);
      if (!tm) return;
      const title = tm[1].trim();
      if (!title || State.tasks.find(t => t.title === title)) return;
      const ownerName = om?.[1].trim();
      const prioRaw = pm?.[1].trim().toLowerCase()||'';
      const assignee = State.employees.find(e => e.name === ownerName)?.id || State.employees[0]?.id;
      const priority = prioRaw.includes('high')||prioRaw.includes('🔴') ? 'high'
                     : prioRaw.includes('low')||prioRaw.includes('🟢') ? 'low' : 'medium';
      State.tasks.push({id:'gsd_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),title,column:'todo',priority,assignee,created:Date.now(),tags:['gsd']});
      created++;
    });
    if (created) { save('tasks'); toast(`✅ ${created} task${created>1?'s':''} added to board from /gsd`,'success',4000); }
  },

  async send() {
    const inp = document.getElementById('chat-input');
    const text = inp.value.trim(); if(!text||!Chat.activeEmpId) return;
    const e = getEmp(Chat.activeEmpId); if(!e) return;
    inp.value = ''; inp.style.height = 'auto';
    Chat.addBubble(Chat.activeEmpId, e.name, e.color, text, true);
    const skillInject = Chat._getSkillInject(text);
    if (skillInject) toast(`Running ${text.split(' ')[0]} skill…`,'',2000);
    // typing indicator
    const msgs = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className='msg'; typing.id='chat-typing';
    typing.innerHTML=`<div class="msg-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
      <div class="msg-body"><div class="msg-sender">${e.name}</div>
      <div class="typing"><div class="tdot"></div><div class="tdot"></div><div class="tdot"></div></div></div>`;
    msgs.appendChild(typing); msgs.scrollTop=msgs.scrollHeight;
    const history = (State.chatHistory[Chat.activeEmpId]||[]).slice(-20);
    const sysPrompt = Chat._buildSystemPrompt(e) + skillInject;
    let full = '';
    const bubble = document.createElement('div');
    bubble.className = 'msg';
    bubble.innerHTML = `<div class="msg-av" style="background:${e.color}22;color:${e.color}">${e.name[0]}</div>
      <div class="msg-body"><div class="msg-sender">${e.name}</div><div class="msg-bubble" id="stream-bubble" style="white-space:pre-wrap"></div></div>`;
    const tn = document.createTextNode('');
    for await (const chunk of AI.stream(history, sysPrompt)) {
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
    Chat._extractTasks(full);
  }
};
function save_(k){save(k);}

// ══════════════════════════════════════════════════════════════
//  PAGE: HQ (Command Center)
// ══════════════════════════════════════════════════════════════
const HQ = {
  _clock: null,
  _simInterval: null,
  _taskTimer: null,
  _feedLog: [],

  // ── GUEST MANAGEMENT ─────────────────────────────────────────
  _refreshGuests() {
    const guests = HQ._getGuests();
    const el = document.getElementById('hq-guests-sidebar');
    if (!el) return;
    el.innerHTML = guests.length ? guests.map(g=>
      `<div style="display:flex;align-items:center;gap:6px;padding:3px 0">
        <div style="width:7px;height:7px;border-radius:50%;background:${g.color||'#22c55e'}"></div>
        <span style="font-size:11px;color:#aaa;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(g.name)}</span>
        <span style="font-size:9px;color:#555">GUEST</span>
      </div>`).join('') : '';
  },
  _getGuests() { try{return JSON.parse(localStorage.getItem('kayro_guests')||'[]');}catch{return [];} },
  _saveGuests(g) { try{localStorage.setItem('kayro_guests',JSON.stringify(g));}catch{} },
  _addGuest() {
    const inp=document.getElementById('guest-name-inp');
    if(!inp||!inp.value.trim())return;
    const guests=HQ._getGuests();
    const colors=['#22c55e','#f59e0b','#a855f7','#06b6d4','#ef4444','#f97316'];
    guests.push({name:inp.value.trim(),color:colors[guests.length%colors.length],joined:Date.now()});
    HQ._saveGuests(guests); HQ._refreshGuests();
    toast(inp.value.trim()+' added to the office','success');
  },
  _removeGuest(i) {
    const guests=HQ._getGuests(); guests.splice(i,1); HQ._saveGuests(guests); Modal.close();
  },
  _openInvite() {
    const company=State.settings.companyName||'Kayro Interactive';
    const guests=HQ._getGuests();
    const config=btoa(JSON.stringify({company,employees:State.employees.map(e=>({id:e.id,name:e.name,role:e.role,color:e.color}))})).replace(/=/g,'');
    const baseUrl=window.location.href.split('?')[0].split('#')[0];
    const inviteUrl=`${baseUrl}?invite=${config}`;
    const guestHtml=guests.length?`<div style="margin-bottom:16px"><div style="font-size:11px;font-weight:600;color:#555;letter-spacing:1.5px;margin-bottom:8px;font-family:monospace">GUESTS</div>${guests.map((g,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.03);border-radius:7px;margin-bottom:4px"><div style="width:8px;height:8px;border-radius:50%;background:${g.color||'#22c55e'}"></div><span style="font-size:13px;color:#ccc;flex:1">${escHtml(g.name)}</span><button onclick="HQ._removeGuest(${i})" style="background:none;border:none;color:#555;cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px">Remove</button></div>`).join('')}</div>`:'';
    Modal.open('Invite to Your Office',`<div style="padding:4px 0">${guestHtml}<div style="font-size:11px;font-weight:600;color:#555;letter-spacing:1.5px;margin-bottom:10px;font-family:monospace">INVITE LINK</div><div style="display:flex;gap:8px;margin-bottom:12px"><input id="invite-url-input" value="${escHtml(inviteUrl)}" readonly style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;font-size:11px;color:#888;font-family:monospace;outline:none"><button onclick="navigator.clipboard.writeText(document.getElementById('invite-url-input').value).then(()=>{this.textContent='Copied!';this.style.background='rgba(34,197,94,.2)';setTimeout(()=>{this.textContent='Copy';this.style.background=''},2000)})" style="padding:10px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">Copy</button></div><div style="font-size:12px;color:#555;line-height:1.7;margin-bottom:20px">Anyone with this link can access <b style="color:#888">${escHtml(company)} HQ</b> and chat with your AI employees.</div><div style="font-size:11px;font-weight:600;color:#555;letter-spacing:1.5px;margin-bottom:10px;font-family:monospace">ADD GUEST</div><div style="display:flex;gap:8px"><input id="guest-name-inp" placeholder="Guest name" style="flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;font-size:13px;color:#fff;outline:none"><button onclick="HQ._addGuest();Modal.close();HQ._openInvite()" style="padding:10px 18px;background:#fff;color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">Add</button></div></div>`);
  },

  // ── LIFECYCLE ─────────────────────────────────────────────────
  init(container) {
    HQ.render(container);
    HQ._startClock();
    HQ._startSim();
    HQ._startTaskAssignment();
  },

  destroy() {
    clearInterval(HQ._clock);
    clearInterval(HQ._simInterval);
    clearTimeout(HQ._taskTimer);
    HQ._feedLog = [];
  },

  _startClock() {
    const DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const MONTHS=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const upd=()=>{
      const n=new Date();
      const cl=document.getElementById('hq-clock');
      const dt=document.getElementById('hq-date');
      if(cl) cl.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
      if(dt) dt.textContent=DAYS[n.getDay()]+' · '+MONTHS[n.getMonth()]+' '+n.getDate();
    };
    upd(); HQ._clock=setInterval(upd,30000);
  },

  // ── COMMAND CENTER RENDER ─────────────────────────────────────
  render(container) {
    const emps=State.employees;
    const company=State.settings.companyName||'Kayro Interactive';
    const activeTasks=State.tasks.filter(t=>t.column!=='done').length;
    const doneTasks=State.tasks.filter(t=>t.column==='done').length;
    const memTotal=Object.values(State.memory||{}).reduce((s,a)=>s+(a?.length||0),0);

    // topbar: add invite + brief buttons
    document.getElementById('topbar-right').innerHTML=`
      <button class="tb-btn" id="hq-tb-invite">🔗 Invite</button>
      <button class="tb-btn" id="hq-tb-brief">📋 Brief</button>
      <button class="tb-btn" id="chat-toggle-btn">💬 Chat</button>`;
    document.getElementById('hq-tb-invite')?.addEventListener('click',()=>HQ._openInvite());
    document.getElementById('hq-tb-brief')?.addEventListener('click',()=>{
      const aria=State.employees.find(e=>e.role.includes('Assistant'))||State.employees[0];
      if(!aria)return;
      Chat.open(aria.id);
      setTimeout(()=>{const inp=document.getElementById('chat-input');if(inp){inp.value='/brief';Chat.send();}},300);
    });
    document.getElementById('chat-toggle-btn')?.addEventListener('click',()=>Chat.toggle());

    container.innerHTML=`<div class="hq-root page-scroll">

      <!-- HEADER ROW -->
      <div class="hq-header">
        <div class="hq-company-block">
          <div class="hq-company-av">${(company[0]||'K').toUpperCase()}</div>
          <div>
            <div class="hq-company-name">${escHtml(company)}</div>
            <div class="hq-company-meta">AI Command Center &nbsp;·&nbsp; <span id="hq-clock">--:--</span> &nbsp;·&nbsp; <span id="hq-date">---</span></div>
          </div>
        </div>
        <div class="hq-stats-row">
          <div class="hq-stat"><div class="hq-stat-n" id="hq-sn-agents">${emps.length}</div><div class="hq-stat-l">Agents</div></div>
          <div class="hq-stat"><div class="hq-stat-n" id="hq-sn-active">${activeTasks}</div><div class="hq-stat-l">Active</div></div>
          <div class="hq-stat"><div class="hq-stat-n" id="hq-sn-done">${doneTasks}</div><div class="hq-stat-l">Done</div></div>
          <div class="hq-stat"><div class="hq-stat-n">${memTotal}</div><div class="hq-stat-l">Memories</div></div>
        </div>
      </div>

      <!-- MAIN LAYOUT -->
      <div class="hq-layout">

        <!-- AGENT GRID -->
        <div class="hq-agent-grid" id="hq-agent-grid">
          ${emps.map(e=>HQ._agentCard(e)).join('')}
          <div class="hq-agent-card hq-hire-card" id="hq-hire-card">
            <div class="hq-hire-plus">＋</div>
            <div class="hq-hire-label">Hire New Agent</div>
            <div class="hq-hire-sub">Expand your AI workforce</div>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <div class="hq-sidebar">

          <!-- ASK THE ROOM -->
          <div class="hq-panel">
            <div class="hq-panel-hdr">
              <span class="hq-panel-title">ASK THE ROOM</span>
              <span class="hq-panel-badge">${emps.length} agents</span>
            </div>
            <div class="hq-panel-body">
              <textarea class="hq-ask-inp" id="hq-ask-input" rows="2" placeholder="Send a question to your entire team at once…"></textarea>
              <button class="btn btn-primary btn-full" id="hq-ask-btn" style="margin-top:8px">↑ Ask Everyone</button>
            </div>
          </div>

          <!-- LIVE FEED -->
          <div class="hq-panel">
            <div class="hq-panel-hdr">
              <span class="hq-live-dot"></span>
              <span class="hq-panel-title">LIVE ACTIVITY</span>
            </div>
            <div class="hq-feed-list" id="hq-feed-list"></div>
          </div>

          <!-- SKILLS REFERENCE -->
          <div class="hq-panel">
            <div class="hq-panel-hdr"><span class="hq-panel-title">POWER SKILLS (type in chat)</span></div>
            <div class="hq-panel-body hq-skills-ref">
              ${[['/gsd','Break any project into a full sprint plan'],
                 ['/brainstorm','5-angle idea generation on any topic'],
                 ['/brief','Morning brief — status, priorities, risks'],
                 ['/autopilot','Agent works autonomously on their tasks']
                ].map(([cmd,desc])=>`<div class="hq-skill-row"><div class="hq-skill-cmd">${cmd}</div><div class="hq-skill-desc">${desc}</div></div>`).join('')}
            </div>
          </div>

        </div>
      </div>
    </div>`;

    // Wire events
    container.querySelectorAll('.hq-chat-btn').forEach(b=>b.addEventListener('click',()=>Chat.open(b.dataset.eid)));
    container.querySelectorAll('.hq-cmd-btn').forEach(b=>b.addEventListener('click',()=>{
      Chat.open(b.dataset.eid);
      setTimeout(()=>{const inp=document.getElementById('chat-input');if(inp){inp.value=b.dataset.cmd;Chat.send();}},300);
    }));
    document.getElementById('hq-hire-card')?.addEventListener('click',Employees.openHireModal);
    document.getElementById('hq-ask-btn')?.addEventListener('click',HQ._askRoom);
    document.getElementById('hq-ask-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();HQ._askRoom();}});
  },

  _agentCard(e) {
    const task=State.tasks.find(t=>t.assignee===e.id&&t.column==='inprogress')
            ||State.tasks.find(t=>t.assignee===e.id&&t.column==='todo');
    const memCount=(State.memory[e.id]||[]).length;
    const taskCount=State.tasks.filter(t=>t.assignee===e.id).length;
    const skills=(e.skills||[]).slice(0,3);
    return `<div class="hq-agent-card" style="--ac:${e.color}">
      <div class="hq-card-glow"></div>
      <div class="hq-card-hdr">
        <div class="hq-av-wrap">
          <div class="hq-card-av" style="background:${e.color}18;color:${e.color};border-color:${e.color}35">${e.name[0]}</div>
          <div class="hq-online-dot"></div>
        </div>
        <div class="hq-card-info">
          <div class="hq-card-name">${escHtml(e.name)}</div>
          <div class="hq-card-role">${escHtml(e.role)}</div>
        </div>
        <div class="hq-card-pills">
          ${memCount?`<div class="hq-badge">🧠 ${memCount}</div>`:''}
          <div class="hq-badge">${taskCount} tasks</div>
        </div>
      </div>
      <div class="hq-card-activity ${task?'active':''}">
        <div class="hq-act-dot"></div>
        <div class="hq-act-txt" id="hq-wo-${e.id}">${task?escHtml(task.title.length>48?task.title.slice(0,48)+'…':task.title):'Ready — waiting for work'}</div>
      </div>
      ${skills.length?`<div class="hq-card-chips">${skills.map(s=>`<span class="hq-chip">${escHtml(s)}</span>`).join('')}</div>`:''}
      <div class="hq-card-btns">
        <button class="btn btn-primary btn-sm hq-chat-btn" data-eid="${e.id}">💬 Chat</button>
        <button class="btn btn-sm hq-cmd-btn" data-eid="${e.id}" data-cmd="/gsd ">/gsd</button>
        <button class="btn btn-sm hq-cmd-btn" data-eid="${e.id}" data-cmd="/brainstorm ">/brainstorm</button>
        <button class="btn btn-sm hq-cmd-btn" data-eid="${e.id}" data-cmd="/autopilot">/auto</button>
      </div>
    </div>`;
  },

  // ── SIMULATION ────────────────────────────────────────────────
  _addFeedItem(emp, text) {
    HQ._feedLog.unshift({name:emp.name,color:emp.color,text,t:Date.now()});
    if(HQ._feedLog.length>16) HQ._feedLog.pop();
    HQ._renderFeed();
    const wo=document.getElementById(`hq-wo-${emp.id}`);
    if(wo){ wo.textContent=text; wo.closest('.hq-card-activity')?.classList.add('active'); }
  },

  _renderFeed() {
    const el=document.getElementById('hq-feed-list'); if(!el)return;
    const ago=t=>{const s=Math.floor((Date.now()-t)/1000);return s<60?'just now':Math.floor(s/60)+'m ago';};
    el.innerHTML=HQ._feedLog.map(f=>`
      <div class="hq-feed-item">
        <div class="hq-feed-av" style="background:${f.color}18;color:${f.color}">${f.name[0]}</div>
        <div class="hq-feed-body">
          <span class="hq-feed-who">${escHtml(f.name)}</span>
          <span class="hq-feed-what"> ${escHtml(f.text)}</span>
          <div class="hq-feed-ago">${ago(f.t)}</div>
        </div>
      </div>`).join('');
  },

  _startSim() {
    const SIM={
      'Head of Product':   ['Writing PRD v2…','Sprint planning ✓','Reviewing user stories','Roadmap sync','OKR check-in','Backlog groomed','User interview done ✓','Feature scoped ✓','Wireframe review','Strategy doc sent'],
      'Lead Engineer':     ['Reviewing PR #'+(Math.ceil(Math.random()*300+100)),'Fixing memory leak','Refactoring auth module','Writing unit tests','Deploy to staging ✓','Build passing ✓','Merged to main ✓','Architecture review','Code review done ✓','Hotfix pushed'],
      'Head of Marketing': ['Writing launch copy','A/B test running…','Email campaign live ✓','SEO audit done ✓','Content calendar set','Analyzing funnels','Ad spend optimized','Blog post published ✓','Campaign brief sent','Partnership outreach'],
      'UI/UX Designer':    ['In Figma — new flows','Component library updated','User testing running','Design review done ✓','Accessibility audit','Handoff to eng ✓','Prototype ready ✓','Brand guide v2 live','Motion specs sent','UX audit complete'],
      'Head of Sales':     ['Discovery call live','Proposal sent ✓','Following up 12 leads','CRM updated ✓','Deal closed! 🎉','Pipeline review','Demo scheduled','Objection handled ✓','Contract sent','Outreach sequence live'],
      'Customer Success':  ['Onboarding call ✓','NPS survey sent','Churn risk flagged ⚠️','Help docs updated','QBR prep done ✓','Client check-in','Ticket resolved ✓','Health score: green','Renewal secured ✓','Escalation handled'],
      'Personal Assistant':['Daily brief ready ✓','Meetings scheduled','Notes distributed','Research complete','Inbox cleared ✓','Tasks prioritized','Calendar synced','Agenda prepared ✓','Travel booked','Deck formatted'],
    };
    const phrase=e=>{const l=SIM[e.role]||['Working…'];return l[Math.floor(Math.random()*l.length)];};
    State.employees.forEach((e,i)=>setTimeout(()=>{if(!document.getElementById('hq-feed-list'))return;HQ._addFeedItem(e,phrase(e));},600+i*900));
    HQ._simInterval=setInterval(()=>{
      if(!document.getElementById('hq-feed-list')){clearInterval(HQ._simInterval);return;}
      const e=State.employees[Math.floor(Math.random()*State.employees.length)];
      HQ._addFeedItem(e,phrase(e));
    },5500);
  },

  _startTaskAssignment() {
    const TASKS=[
      {from:'Sarah',text:'Architecture proposal for new API — needs your sign-off'},
      {from:'Zara',text:'Homepage redesign v3 ready — please review in Figma'},
      {from:'Alex',text:'Q3 campaign brief needs your go-ahead before it goes live'},
      {from:'Chris',text:'New enterprise pricing deck — approve before Friday'},
      {from:'Mia',text:'High-value client at risk of churn — need your call today'},
      {from:'Sarah',text:'Sprint goals for next 2 weeks — finalize and sign off'},
      {from:'Zara',text:'Design system v2 — review before Monday standup'},
      {from:'Alex',text:'New ad creative needs approval — budget locks Friday'},
      {from:'Chris',text:'Hot deal closing this week — review proposal terms'},
      {from:'Mia',text:'Customer success playbook v2 — your review requested'},
    ];
    const assign=()=>{
      if(!document.getElementById('hq-feed-list'))return;
      const t=TASKS[Math.floor(Math.random()*TASKS.length)];
      const emp=State.employees.find(e=>e.name===t.from)||State.employees[1];
      toast(`📋 ${t.from} → you: "${t.text.slice(0,50)}…"`,'info',8000);
      HQ._addFeedItem(emp,`→ Omar: "${t.text.slice(0,38)}…"`);
      if(!State.tasks.find(st=>st.title===t.text)){
        State.tasks.push({id:'at_'+Date.now(),title:t.text,column:'todo',priority:'high',
          assignee:State.employees[0]?.id||'e1',created:Date.now(),tags:['from:'+t.from]});
        save('tasks');
        const sn=document.getElementById('hq-sn-active');
        if(sn) sn.textContent=State.tasks.filter(t=>t.column!=='done').length;
      }
    };
    const scheduleNext=()=>{
      HQ._taskTimer=setTimeout(()=>{assign();if(document.getElementById('hq-feed-list'))scheduleNext();},40000+Math.random()*20000);
    };
    setTimeout(()=>{assign();scheduleNext();},22000);
  },

  // ── ASK THE ROOM ─────────────────────────────────────────────
  _askRoom() {
    const inp=document.getElementById('hq-ask-input');
    const q=inp?.value.trim();
    if(!q)return;
    if(!State.settings.apiKey){toast('Add your API key in ⚙️ Settings first','error');return;}
    inp.value='';
    toast(`Asking your team: "${q.slice(0,40)}…"`,'info',3000);
    Modal.open('Ask the Room',`
      <div style="padding:4px 0">
        <div style="font-size:13px;color:#888;padding:10px 14px;background:rgba(255,255,255,.03);border-radius:8px;margin-bottom:16px;line-height:1.5">"${escHtml(q)}"</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${State.employees.map(e=>`
            <div style="display:flex;gap:10px;padding:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px">
              <div style="width:36px;height:36px;border-radius:10px;background:${e.color}18;color:${e.color};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;flex-shrink:0">${e.name[0]}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:11.5px;font-weight:700;color:${e.color};margin-bottom:5px">${escHtml(e.name)} <span style="color:#555;font-weight:400">· ${escHtml(e.role)}</span></div>
                <div id="atr-${e.id}" style="font-size:12.5px;color:#888;line-height:1.7;white-space:pre-wrap">thinking…</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`);
    State.employees.forEach((e,i)=>{
      setTimeout(async()=>{
        const el=document.getElementById(`atr-${e.id}`); if(!el)return;
        const sys=Chat._buildSystemPrompt(e)+'\n\nIMPORTANT: Answer in 2-4 sentences max. Be direct and specific from your role perspective. No preamble.';
        let resp='';
        for await(const chunk of AI.stream([{role:'user',content:q}],sys)){
          if(!document.getElementById(`atr-${e.id}`))return;
          resp+=chunk; el.textContent=resp;
        }
      },i*950);
    });
  },
};


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
          <div class="form-hint">Get your key at <b>console.anthropic.com</b> → API Keys. Must start with <code>sk-ant-</code><br><span style="color:#f59e0b">⚠️ Safari users: use Chrome or Firefox for API calls — Safari blocks cross-origin requests.</span></div>
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
      if(reply.includes('⚠️')){st.textContent='❌ '+reply.split('\n')[0];st.style.color='var(--red,#ef4444)';}
      else{st.textContent='✅ Connected! Response: '+reply;st.style.color='var(--green,#22c55e)';}
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

// Handle invite link
(function handleInviteLink() {
  const params = new URLSearchParams(window.location.search);
  const inv = params.get('invite');
  if (!inv) { Router.navigate('hq'); return; }
  try {
    const pad = inv + '='.repeat((4 - inv.length % 4) % 4);
    const cfg = JSON.parse(atob(pad));
    if (cfg.company) {
      State.settings.companyName = cfg.company;
      document.getElementById('brand-name').textContent = cfg.company;
    }
    toast(`Welcome to ${cfg.company||'the'} HQ! You have guest access.`, 'success', 6000);
    // Clean the URL
    window.history.replaceState({}, '', window.location.pathname);
  } catch(e) {}
  Router.navigate('hq');
})();
