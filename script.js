
// ================= Configuration =================
// Default admin password (client-side). Change if needed.
const ADMIN_PASSWORD = 'abhi1430';

// ================= Data: default 15 players (UPDATED) =================
const DEFAULT_PLAYERS = [
   {id:1,name:'Abhishek Chouhan',role:'All-rounder',matches:9,runs:180,wickets:23,img:'player1.png'},
  {id:2,name:'Akhil Chouhan',role:'All-rounder',matches:6,runs:230,wickets:14,img:'player2.png'},
  {id:3,name:'Vikash Chouhan',role:'All-rounder/wc',matches:6,runs:130,wickets:18,img:'player3.png'},
  {id:4,name:'Atul Chouhan',role:'All-rounder',matches:5,runs:60,wickets:1,img:'player4.png'},
  {id:5,name:'Nitin Chouhan',role:'Batsman',matches:8,runs:50,wickets:3,img:'player5.png'},
  {id:6,name:'Rajeev Rajput',role:'All-rounder',matches:5,runs:90,wickets:13,img:'player6.png'},
  {id:7,name:'Abhiraj Chouhan',role:'Batsman',matches:8,runs:26,wickets:5,img:'player7.png'},
  {id:8,name:'Shivansh Chouhan',role:'Batsman',matches:9,runs:10,wickets:3,img:'player8.png'},
  {id:9,name:'Nitin Chouhan',role:'Batsman',matches:4,runs:58,wickets:0,img:'player9.png'},
  {id:10,name:'Lucky Chouhan',role:'Batsman',matches:9,runs:0,wickets:0,img:'player10.png'},
  {id:11,name:'Aniket Chouhan',role:'All-rounder',matches:2,runs:15,wickets:6,img:'player11.png'},
  {id:12,name:'Jatin Chouhan',role:'Batsman',matches:7,runs:8,wickets:0,img:'player12.png'},
  {id:13,name:'Player Thirteen',role:'Batsman',matches:0,runs:0,wickets:0,img:'player13.png'},
  {id:14,name:'Player Fourteen',role:'Batsman',matches:0,runs:0,wickets:0,img:'player14.png'},
  {id:15,name:'Mit Rajput',role:'Batsman',matches:6,runs:20,wickets:3,img:'player15.png'}
];

// ================= State =================
let players = []; // will load from storage or default
const state = {}; // id -> 0/1/2 (none/playing/bench)
const roles = { captain: null, viceCaptain: null, wicketKeeper: null };

// === Live batting state ===
let isAdmin = false;
let liveState = { // persisted in localStorage key: 'ts_live'
  liveMode: false,
  currentBatsmen: [], // [{id, strike}] strike true/false optional
  teamScore: 0,
  teamWickets: 0
};

// ================= DOM refs =================
const playersGrid = document.getElementById('playersGrid');
const playingCountEl = document.getElementById('playingCount');
const benchCountEl = document.getElementById('benchCount');
const profileCard = document.getElementById('profileCard');
const profileImg = document.getElementById('profileImg');
const profileName = document.getElementById('profileName');
const profileRole = document.getElementById('profileRole');
const statMatches = document.getElementById('statMatches');
const statRuns = document.getElementById('statRuns');
const statWickets = document.getElementById('statWickets');
const closeProfile = document.getElementById('closeProfile');
const resetBtn = document.getElementById('resetBtn');
const showBtn = document.getElementById('showBtn');
const squadModal = document.getElementById('squadModal');
const closeModal = document.getElementById('closeModal');
const squadList = document.getElementById('squadList');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');

const roleControlsContainer = document.getElementById('roleControlsContainer');
const mRoleControlsContainer = document.getElementById('mRoleControlsContainer');

// Admin DOM refs
const adminBtn = document.getElementById('adminBtn');
const adminModal = document.getElementById('adminModal');
const closeAdmin = document.getElementById('closeAdmin');
const adminLogin = document.getElementById('adminLogin');
const adminPanel = document.getElementById('adminPanel');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminPw = document.getElementById('adminPw');
const adminCancelBtn = document.getElementById('adminCancelBtn');
const playersAdminList = document.getElementById('playersAdminList');
const playerForm = document.getElementById('playerForm');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const savePlayerBtn = document.getElementById('savePlayerBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const exportPlayersBtn = document.getElementById('exportPlayersBtn');
const importPlayersBtn = document.getElementById('importPlayersBtn');

// mobile profile refs
const mProfileImg = document.getElementById('mProfileImg');
const mProfileName = document.getElementById('mProfileName');
const mProfileRole = document.getElementById('mProfileRole');
const mMatches = document.getElementById('mMatches');
const mRuns = document.getElementById('mRuns');
const mWickets = document.getElementById('mWickets');

// form fields
const formId = document.getElementById('formId');
const formTitle = document.getElementById('formTitle');
const formName = document.getElementById('formName');
const formRole = document.getElementById('formRole');
const formMatches = document.getElementById('formMatches');
const formRuns = document.getElementById('formRuns');
const formWickets = document.getElementById('formWickets');
const formImg = document.getElementById('formImg');

// ================= Storage helpers =================
function saveAll(){
  try{
    localStorage.setItem('ts_players', JSON.stringify(players));
    localStorage.setItem('ts_state', JSON.stringify(state));
    localStorage.setItem('ts_roles', JSON.stringify(roles));
    localStorage.setItem('ts_live', JSON.stringify(liveState));
  }catch(e){}
}

function loadAll(){
  try{
    const pRaw = localStorage.getItem('ts_players');
    if(pRaw) players = JSON.parse(pRaw); else players = DEFAULT_PLAYERS.slice();
    players.forEach(p => { if(typeof state[p.id] === 'undefined') state[p.id] = 0; });
    const sRaw = localStorage.getItem('ts_state');
    if(sRaw){ const saved = JSON.parse(sRaw); players.forEach(p=> { if(typeof saved[p.id] !== 'undefined') state[p.id] = saved[p.id]; }); }
    const rRaw = localStorage.getItem('ts_roles');
    if(rRaw){ const rs = JSON.parse(rRaw); roles.captain = rs.captain; roles.viceCaptain = rs.viceCaptain; roles.wicketKeeper = rs.wicketKeeper; }
    const lRaw = localStorage.getItem('ts_live');
    if(lRaw){ const ls = JSON.parse(lRaw); liveState = Object.assign(liveState, ls); }
  }catch(e){ players = DEFAULT_PLAYERS.slice(); players.forEach(p=> state[p.id]=0); }
}

// ================= Rendering players grid =================
function renderPlayers(){
  playersGrid.innerHTML = '';
  players.forEach(p=>{
    if(typeof state[p.id] === 'undefined') state[p.id] = 0;

    const card = document.createElement('button');
    card.className = 'player-card';
    if(state[p.id] === 1) card.classList.add('playing');
    if(state[p.id] === 2) card.classList.add('bench');
    card.type = 'button';

    const img = document.createElement('img'); img.src = p.img || placeholder(); img.alt = p.name;
    const name = document.createElement('div'); name.className = 'player-name'; name.textContent = p.name;
    const role = document.createElement('div'); role.className = 'player-role'; role.textContent = p.role || '';
    const tag = document.createElement('div'); tag.className = 'tag';

    // badge wrapper
    const badgeWrap = document.createElement('div'); badgeWrap.className = 'badge-wrap';

    // tag text & classes
    if(state[p.id]===1){ tag.classList.add('playing'); tag.textContent = 'Playing'; }
    else if(state[p.id]===2){ tag.classList.add('bench'); tag.textContent = 'Bench'; }
    else { tag.classList.add('unselected'); tag.textContent = 'Select'; }

    // role badges
    if(roles.captain === p.id){ const b=document.createElement('span'); b.className='role-badge cap'; b.textContent='C'; badgeWrap.appendChild(b); }
    if(roles.viceCaptain === p.id){ const b=document.createElement('span'); b.className='role-badge vc'; b.textContent='VC'; badgeWrap.appendChild(b); }
    if(roles.wicketKeeper === p.id){ const b=document.createElement('span'); b.className='role-badge wk'; b.textContent='WK'; badgeWrap.appendChild(b); }

    // if player is currently batting, add subtle outline (no UI/UX change otherwise)
    const isBatting = liveState.currentBatsmen.find(b => b.id === p.id);
    if(isBatting) card.style.boxShadow = '0 0 0 3px rgba(255,183,77,0.08)';

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(role);
    card.appendChild(tag);
    card.appendChild(badgeWrap);

    // click handlers
    card.addEventListener('click', (e)=>{
      const target = e.target;
      if(target.tagName === 'IMG' || target.classList.contains('player-name')){ openProfile(p.id); return; }
      togglePlayer(p.id);
    });

    playersGrid.appendChild(card);
  });
  updateCounts();
  renderLiveSummaryInUI();
}

// placeholder image fallback
function placeholder(){ return 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><rect width=\"100%\" height=\"100%\" fill=\"#b5c8d8\"/><text x=\"50%\" y=\"50%\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"#fff\" font-size=\"18\">No Img</text></svg>'; }

function updateCounts(){
  const playing = Object.values(state).filter(v=>v===1).length;
  const bench = Object.values(state).filter(v=>v===2).length;
  playingCountEl.textContent = playing;
  benchCountEl.textContent = bench;
}

// ================= Toggle selection =================
function togglePlayer(id){
  const playing = Object.values(state).filter(v=>v===1).length;
  const bench = Object.values(state).filter(v=>v===2).length;
  const current = state[id] || 0;

  if(current === 0){
    if(playing < 11){ state[id] = 1; }
    else if(bench < 4){ state[id] = 2; }
    else { flash('Max selected (11 playing, 4 bench)'); return; }
  } else if(current === 1){
    if(bench < 4){ state[id] = 2; }
    else { state[id] = 0; }
    // clear roles if moved out
    if(roles.captain === id) roles.captain = null;
    if(roles.viceCaptain === id) roles.viceCaptain = null;
    if(roles.wicketKeeper === id) roles.wicketKeeper = null;
  } else if(current === 2){
    state[id] = 0;
    if(roles.captain === id) roles.captain = null;
    if(roles.viceCaptain === id) roles.viceCaptain = null;
    if(roles.wicketKeeper === id) roles.wicketKeeper = null;
  }

  saveAll(); renderPlayers();
}

// ================= Profile open (desktop / mobile) =================
function openProfile(id){
  const p = players.find(x=>x.id===id);
  if(!p) return;
  if(window.innerWidth > 980){
    profileImg.src = p.img || placeholder();
    profileName.textContent = p.name;
    profileRole.textContent = p.role;
    statMatches.textContent = p.matches || 0;
    statRuns.textContent = p.runs || 0;
    statWickets.textContent = p.wickets || 0;
    profileCard.classList.remove('hidden');
    profileCard.setAttribute('aria-hidden','false');
    showRoleControls(id,false);
    if(isAdmin && liveState.liveMode) showAdminBattingControlsFor(p.id, roleControlsContainer);
  } else {
    mProfileImg.src = p.img || placeholder();
    mProfileName.textContent = p.name;
    mProfileRole.textContent = p.role;
    mMatches.textContent = p.matches || 0;
    mRuns.textContent = p.runs || 0;
    mWickets.textContent = p.wickets || 0;
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden','false');
    showRoleControls(id,true);
    if(isAdmin && liveState.liveMode) showAdminBattingControlsFor(p.id, mRoleControlsContainer, true);
  }
}

closeProfile.addEventListener('click', ()=> { profileCard.classList.add('hidden'); profileCard.setAttribute('aria-hidden','true'); roleControlsContainer.innerHTML=''; });
closeProfileModal.addEventListener('click', ()=> { profileModal.classList.add('hidden'); profileModal.setAttribute('aria-hidden','true'); mRoleControlsContainer.innerHTML=''; });

// ================= Role Controls =================
function showRoleControls(playerId, mobile=false){
  const p = players.find(x=>x.id===playerId);
  const container = mobile ? mRoleControlsContainer : roleControlsContainer;
  container.innerHTML = '';

  const info = document.createElement('div'); info.style.marginTop='8px'; info.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--muted);font-size:13px">${p.role}</div>`;
  container.appendChild(info);

  function mkBtn(text, active){
    const b = document.createElement('button'); b.className='role-btn'; b.textContent = text;
    if(active) b.style.borderColor = 'rgba(255,183,77,0.9)';
    return b;
  }

  const capBtn = mkBtn(roles.captain === playerId ? 'Unset Captain (C)' : 'Set Captain (C)', roles.captain === playerId);
  capBtn.addEventListener('click', ()=>{
    if(state[playerId] !== 1){ flash('Select player in Playing XI before assigning Captain'); return; }
    roles.captain = (roles.captain === playerId) ? null : playerId;
    saveAll(); renderPlayers(); showRoleControls(playerId,mobile);
  });

  const vcBtn = mkBtn(roles.viceCaptain === playerId ? 'Unset Vice (VC)' : 'Set Vice (VC)', roles.viceCaptain === playerId);
  vcBtn.addEventListener('click', ()=>{
    if(state[playerId] !== 1){ flash('Select player in Playing XI before assigning Vice Captain'); return; }
    roles.viceCaptain = (roles.viceCaptain === playerId) ? null : playerId;
    saveAll(); renderPlayers(); showRoleControls(playerId,mobile);
  });

  const wkBtn = mkBtn(roles.wicketKeeper === playerId ? 'Unset WK' : 'Set Wicket Keeper (WK)', roles.wicketKeeper === playerId);
  wkBtn.addEventListener('click', ()=>{
    if(state[playerId] !== 1){ flash('Select player in Playing XI before assigning Wicket Keeper'); return; }
    roles.wicketKeeper = (roles.wicketKeeper === playerId) ? null : playerId;
    saveAll(); renderPlayers(); showRoleControls(playerId,mobile);
  });

  const wrap = document.createElement('div'); wrap.style.display='flex'; wrap.style.gap='8px'; if(mobile) wrap.style.flexDirection='column';
  wrap.appendChild(capBtn); wrap.appendChild(vcBtn); wrap.appendChild(wkBtn);
  container.appendChild(wrap);
}

// ================= Squad modal populate =================
function populateSquadModal(){
  squadList.innerHTML = '';
  const playingPlayers = players.filter(p=> state[p.id]===1);
  const benchPlayers = players.filter(p=> state[p.id]===2);
  const others = players.filter(p=> state[p.id]===0);

  const section = (title, list) => {
    const h = document.createElement('h4'); h.textContent = `${title} (${list.length})`; h.style.color='var(--accent)'; h.style.margin='8px 0 6px 0';
    squadList.appendChild(h);
    if(list.length === 0){
      const note = document.createElement('div'); note.textContent='None'; note.style.color='var(--muted)'; note.style.marginBottom='8px';
      squadList.appendChild(note); return;
    }
    list.forEach(p=>{
      const item = document.createElement('div'); item.className='squad-item';
      const img = document.createElement('img'); img.src = p.img || placeholder(); img.alt = p.name;
      const txt = document.createElement('div'); txt.style.flex='1';
      const titleRow = document.createElement('div'); titleRow.style.display='flex'; titleRow.style.justifyContent='space-between';
      const nameEl = document.createElement('div'); nameEl.style.fontWeight='600'; nameEl.textContent = p.name + (p.matches || p.runs ? ` • ${p.runs || 0} runs` : '');
      const roleEl = document.createElement('div'); roleEl.style.fontSize='12px'; roleEl.style.color='var(--muted)'; roleEl.textContent = p.role;
      titleRow.appendChild(nameEl); titleRow.appendChild(roleEl);

      const badgeRow = document.createElement('div'); badgeRow.style.marginTop='6px';
      if(roles.captain === p.id){ const b=document.createElement('span'); b.textContent='C'; styleBadge(b,'cap'); badgeRow.appendChild(b); }
      if(roles.viceCaptain === p.id){ const b=document.createElement('span'); b.textContent='VC'; styleBadge(b,'vc'); badgeRow.appendChild(b); }
      if(roles.wicketKeeper === p.id){ const b=document.createElement('span'); b.textContent='WK'; styleBadge(b,'wk'); badgeRow.appendChild(b); }

      txt.appendChild(titleRow); txt.appendChild(badgeRow);
      item.appendChild(img); item.appendChild(txt);
      squadList.appendChild(item);
    });
  };

  section('Playing 11', playingPlayers);
  section('Bench (4)', benchPlayers);
  section('Unselected', others);
}

// style badge helper
function styleBadge(el, kind){
  el.style.marginRight='6px';
  el.style.padding='4px 8px';
  el.style.borderRadius='999px';
  el.style.fontSize='12px';
  if(kind === 'cap'){ el.style.background='linear-gradient(90deg,#ffd166,#ffb74d)'; el.style.color='#081226'; }
  if(kind === 'vc'){ el.style.background='rgba(255,255,255,0.06)'; el.style.color='var(--muted)'; }
  if(kind === 'wk'){ el.style.background='linear-gradient(90deg,#60d394,#2bb673)'; el.style.color='#04210d'; }
}

// ================= Flash message =================
function flash(text){
  const t = document.createElement('div'); t.textContent = text;
  t.style.position='fixed'; t.style.bottom='18px'; t.style.left='50%'; t.style.transform='translateX(-50%)';
  t.style.background='rgba(0,0,0,0.7)'; t.style.padding='10px 14px'; t.style.borderRadius='8px'; t.style.color='white'; t.style.zIndex=9999;
  document.body.appendChild(t); setTimeout(()=>{ t.style.transition='opacity 0.4s'; t.style.opacity=0; setTimeout(()=>t.remove(),400); },1600);
}

// ================= Admin Panel logic =================
adminBtn.addEventListener('click', ()=>{ adminModal.classList.remove('hidden'); adminModal.setAttribute('aria-hidden','false'); adminLogin.classList.remove('hidden'); adminPanel.classList.add('hidden'); adminPw.value=''; playersAdminList.innerHTML=''; playerForm.classList.add('hidden'); buildLiveAdminArea(); });

closeAdmin.addEventListener('click', ()=>{ adminModal.classList.add('hidden'); adminModal.setAttribute('aria-hidden','true'); });
adminCancelBtn.addEventListener('click', ()=>{ adminModal.classList.add('hidden'); adminModal.setAttribute('aria-hidden','true'); });

adminLoginBtn.addEventListener('click', ()=>{
  const v = adminPw.value.trim();
  if(v === ADMIN_PASSWORD){
    isAdmin = true;
    adminLogin.classList.add('hidden'); adminPanel.classList.remove('hidden'); buildAdminList(); buildLiveAdminArea();
  } else { flash('Wrong password'); }
});

// build admin list
function buildAdminList(){
  playersAdminList.innerHTML = '';
  players.forEach(p=>{
    const row = document.createElement('div'); row.className='players-admin-item';
    const img = document.createElement('img'); img.src = p.img || placeholder();
    const txt = document.createElement('div'); txt.style.flex='1'; txt.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="font-size:12px;color:var(--muted)">${p.role}</div>`;
    const editBtn = document.createElement('button'); editBtn.className='btn'; editBtn.textContent='Edit';
    editBtn.addEventListener('click', ()=> openEditForm(p.id));
    const delBtn = document.createElement('button'); delBtn.className='btn'; delBtn.textContent='Delete';
    delBtn.addEventListener('click', ()=> { if(confirm('Delete player?')) { players = players.filter(x=>x.id!==p.id); delete state[p.id]; saveAll(); renderPlayers(); buildAdminList(); } });

    row.appendChild(img); row.appendChild(txt);

    // Admin-only: send to strike / remove from strike button
    if(isAdmin){
      const strikeBtn = document.createElement('button'); strikeBtn.className='btn'; strikeBtn.style.marginLeft='8px';
      const inStrike = liveState.currentBatsmen.find(b=>b.id===p.id);
      strikeBtn.textContent = inStrike ? 'Remove from Strike' : 'Send to Strike';
      strikeBtn.addEventListener('click', ()=>{
        if(!liveState.liveMode){ flash('Start Live Mode first'); return; }
        if(inStrike){
          removeBatsman(p.id);
        } else {
          sendToStrike(p.id);
        }
      });
      row.appendChild(strikeBtn);
    }

    row.appendChild(editBtn); row.appendChild(delBtn);
    playersAdminList.appendChild(row);
  });
  // live area redraw
  buildLiveAdminArea();
}

// Add player
addPlayerBtn.addEventListener('click', ()=>{
  formTitle.textContent = 'Add Player'; formId.value=''; formName.value=''; formRole.value=''; formMatches.value='0'; formRuns.value='0'; formWickets.value='0'; formImg.value='';
  playerForm.classList.remove('hidden');
});

// open edit form
function openEditForm(id){
  const p = players.find(x=>x.id===id); if(!p) return;
  formTitle.textContent = 'Edit Player'; formId.value = p.id; formName.value = p.name; formRole.value = p.role; formMatches.value = p.matches || 0; formRuns.value = p.runs || 0; formWickets.value = p.wickets || 0; formImg.value = p.img || '';
  playerForm.classList.remove('hidden');
}

// cancel edit
cancelEditBtn.addEventListener('click', ()=>{ playerForm.classList.add('hidden'); });

// save player (add or update)
playerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const idVal = formId.value.trim();
  const name = formName.value.trim() || 'Unnamed';
  const roleVal = formRole.value.trim() || '';
  const matches = parseInt(formMatches.value) || 0;
  const runs = parseInt(formRuns.value) || 0;
  const wickets = parseInt(formWickets.value) || 0;
  const img = formImg.value.trim() || '';

  if(idVal){
    // update existing
    const pid = parseInt(idVal);
    const p = players.find(x=>x.id===pid);
    if(p){ p.name = name; p.role = roleVal; p.matches = matches; p.runs = runs; p.wickets = wickets; p.img = img; }
  } else {
    // new id generation
    const newId = (players.reduce((m,x)=> Math.max(m, x.id), 0) + 1);
    players.push({ id: newId, name, role: roleVal, matches, runs, wickets, img });
    state[newId] = 0;
  }

  saveAll(); renderPlayers(); buildAdminList(); playerForm.classList.add('hidden');
});

// export players JSON
exportPlayersBtn.addEventListener('click', ()=>{
  const dataStr = JSON.stringify(players, null, 2);
  const blob = new Blob([dataStr], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'players.json'; a.click(); URL.revokeObjectURL(url);
});

// import players JSON
importPlayersBtn.addEventListener('click', ()=>{
  const inp = document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
  inp.addEventListener('change', (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = function(ev){
      try{
        const arr = JSON.parse(ev.target.result);
        if(Array.isArray(arr)){
          players = arr.map(p => ({ id: p.id, name: p.name, role: p.role, matches: p.matches||0, runs: p.runs||0, wickets: p.wickets||0, img: p.img||'' }));
          players.forEach(p => { if(typeof state[p.id] === 'undefined') state[p.id] = 0; });
          saveAll(); renderPlayers(); buildAdminList(); flash('Imported players');
        } else flash('Invalid file format');
      }catch(err){ flash('Invalid JSON'); }
    };
    reader.readAsText(file);
  });
  inp.click();
});

// ================= Live batting helpers (ADMIN) =================
function buildLiveAdminArea(){
  // ensure adminPanel exists and is visible
  if(!adminPanel) return;

  // create or reuse container
  let liveArea = document.getElementById('liveArea');
  if(!liveArea){
    liveArea = document.createElement('div');
    liveArea.id = 'liveArea';
    liveArea.style.marginBottom = '10px';
    adminPanel.insertBefore(liveArea, adminPanel.firstChild);
  }
  liveArea.innerHTML = '';

  // controls visible only after admin login
  if(!isAdmin){
    liveArea.innerHTML = '<div style="color:var(--muted);margin-bottom:8px">Log in as admin to access Live Batting Controls.</div>';
    return;
  }

  // Start/Stop buttons
  const startBtn = document.createElement('button'); startBtn.className='btn primary'; startBtn.textContent = liveState.liveMode ? 'Live Mode: ON' : 'Start Live Mode';
  startBtn.style.marginRight = '8px';
  startBtn.addEventListener('click', ()=>{
    liveState.liveMode = !liveState.liveMode;
    if(!liveState.liveMode){
      // stopping live mode — keep data saved
      flash('Live mode stopped');
    } else {
      flash('Live mode started — send two openers to strike');
    }
    saveAll(); buildAdminList(); buildLiveAdminArea(); renderPlayers();
  });
  liveArea.appendChild(startBtn);

  const resetInningBtn = document.createElement('button'); resetInningBtn.className='btn'; resetInningBtn.textContent='Reset Inning';
  resetInningBtn.addEventListener('click', ()=>{
    if(!confirm('Reset inning? This will clear current batsmen, score and wickets.')) return;
    liveState.currentBatsmen = [];
    liveState.teamScore = 0;
    liveState.teamWickets = 0;
    // Reset individual live-out flags if any (we track nothing else)
    saveAll(); buildLiveAdminArea(); renderPlayers(); flash('Inning reset');
  });
  liveArea.appendChild(resetInningBtn);

  // Show small scoreboard
  const sb = document.createElement('div');
  sb.style.marginTop = '8px';
  sb.innerHTML = `<strong>Score:</strong> ${liveState.teamScore} / ${liveState.teamWickets} &nbsp; <small style="color:var(--muted)">Batsmen: ${liveState.currentBatsmen.map(b=> players.find(p=>p.id===b.id)?.name).filter(Boolean).join(', ') || 'None'}</small>`;
  liveArea.appendChild(sb);

  // If live mode on, show controls for current batsmen
  if(liveState.liveMode){
    const controlsWrap = document.createElement('div'); controlsWrap.style.display='flex'; controlsWrap.style.gap='8px'; controlsWrap.style.marginTop='8px';
    // for each current batsman
    for(let i=0;i<2;i++){
      const b = liveState.currentBatsmen[i];
      const pnl = document.createElement('div'); pnl.style.background='rgba(255,255,255,0.02)'; pnl.style.padding='8px'; pnl.style.borderRadius='8px'; pnl.style.minWidth='200px';
      if(b){
        const player = players.find(x=>x.id===b.id);
        pnl.innerHTML = `<div style="font-weight:700">${player.name}</div><div style="font-size:12px;color:var(--muted)">Runs: ${player.runs || 0}</div>`;
        const runBtns = document.createElement('div'); runBtns.style.marginTop='8px'; runBtns.style.display='flex'; runBtns.style.gap='6px';
        ['+1','+4','+6','OUT'].forEach(action=>{
          const rb = document.createElement('button'); rb.className='btn'; rb.textContent = action;
          rb.addEventListener('click', ()=>{
            if(action === 'OUT') return adminDeclareOut(player.id);
            const add = parseInt(action.replace('+',''));
            adminAddRuns(player.id, add);
          });
          runBtns.appendChild(rb);
        });
        pnl.appendChild(runBtns);
      } else {
        pnl.innerHTML = `<div style="color:var(--muted)">Batsman ${i+1} not set</div>`;
      }
      controlsWrap.appendChild(pnl);
    }
    liveArea.appendChild(controlsWrap);
    // helper: show button to auto-pick openers (first two playing)
    const pickOpenersBtn = document.createElement('button'); pickOpenersBtn.className='btn'; pickOpenersBtn.textContent='Auto-Pick Openers (first 2 Playing)';
    pickOpenersBtn.style.marginTop='8px';
    pickOpenersBtn.addEventListener('click', ()=>{
      const playing = players.filter(p=> state[p.id] === 1);
      if(playing.length < 2){ flash('Select at least 2 players in Playing XI'); return; }
      liveState.currentBatsmen = [{id: playing[0].id},{id: playing[1].id}];
      saveAll(); buildLiveAdminArea(); renderPlayers();
    });
    liveArea.appendChild(pickOpenersBtn);
  }
}

// send to strike (admin)
function sendToStrike(id){
  if(!isAdmin){ flash('Admin only'); return; }
  if(!liveState.liveMode){ flash('Start Live Mode first'); return; }
  if(!state[id] || state[id] !== 1){ flash('Player must be in Playing XI'); return; }
  if(liveState.currentBatsmen.find(b=>b.id === id)) { flash('Player already batting'); return; }
  if(liveState.currentBatsmen.length >= 2){ flash('Two batsmen already on crease'); return; }
  liveState.currentBatsmen.push({id});
  saveAll(); buildAdminList(); buildLiveAdminArea(); renderPlayers();
}

// remove from strike (admin)
function removeBatsman(id){
  if(!isAdmin) return;
  liveState.currentBatsmen = liveState.currentBatsmen.filter(b=>b.id !== id);
  saveAll(); buildAdminList(); buildLiveAdminArea(); renderPlayers();
}

// admin adds runs to player
function adminAddRuns(playerId, runs){
  if(!isAdmin){ flash('Admin only'); return; }
  if(!liveState.liveMode){ flash('Start Live Mode first'); return; }
  const p = players.find(x=>x.id===playerId); if(!p) return;
  p.runs = (p.runs || 0) + runs;
  liveState.teamScore += runs;
  // optionally increment matches? not necessary here
  saveAll(); renderPlayers(); buildLiveAdminArea(); // update UI
}

// admin declares out
function adminDeclareOut(playerId){
  if(!isAdmin){ flash('Admin only'); return; }
  if(!liveState.liveMode){ flash('Start Live Mode first'); return; }
  // mark wicket
  liveState.teamWickets += 1;
  // remove batsman from current
  liveState.currentBatsmen = liveState.currentBatsmen.filter(b=>b.id !== playerId);
  // increment player's wickets? (batsman out doesn't add wicket to himself)
  // allow admin to choose next batsman from Playing XI not currently batting and not out (we don't track out list separately)
  saveAll(); buildLiveAdminArea(); renderPlayers();
  // choose next batsman UI
  promptSelectNextBatsman();
}

// show small chooser in admin panel to pick next batsman after OUT
function promptSelectNextBatsman(){
  // create modal-like chooser inside adminPanel
  let chooser = document.getElementById('nextBatsmanChooser');
  if(chooser) chooser.remove();
  chooser = document.createElement('div'); chooser.id = 'nextBatsmanChooser';
  chooser.style.position = 'relative'; chooser.style.marginTop = '10px'; chooser.style.padding = '10px'; chooser.style.background='rgba(255,255,255,0.02)'; chooser.style.borderRadius='8px';
  chooser.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Select Next Batsman</div>`;

  const available = players.filter(p => state[p.id] === 1 && !liveState.currentBatsmen.find(b=>b.id===p.id));
  if(available.length === 0){
    chooser.innerHTML += `<div style="color:var(--muted)">No available players (Playing XI exhausted)</div>`;
    adminPanel.insertBefore(chooser, playersAdminList);
    return;
  }

  available.forEach(p=>{
    const btn = document.createElement('button'); btn.className='btn'; btn.style.marginRight='6px'; btn.textContent = p.name;
    btn.addEventListener('click', ()=>{
      if(liveState.currentBatsmen.length >= 2){ flash('Two batsmen already on crease'); chooser.remove(); return; }
      liveState.currentBatsmen.push({id: p.id});
      saveAll(); buildLiveAdminArea(); renderPlayers(); chooser.remove();
    });
    chooser.appendChild(btn);
  });

  const cancel = document.createElement('button'); cancel.className='btn'; cancel.textContent='Cancel'; cancel.style.marginLeft='8px';
  cancel.addEventListener('click', ()=> chooser.remove());
  chooser.appendChild(cancel);

  adminPanel.insertBefore(chooser, playersAdminList);
}

// Helper: show admin batting controls for player inside profile panel (small quick controls)
function showAdminBattingControlsFor(playerId, container, mobile=false){
  const wrapper = document.createElement('div'); wrapper.style.marginTop='8px';
  const p = players.find(x=>x.id===playerId);
  wrapper.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Live Controls (Admin)</div>`;
  ['+1','+4','+6','OUT'].forEach(action=>{
    const b = document.createElement('button'); b.className='btn'; b.style.marginRight='6px'; b.textContent = action;
    b.addEventListener('click', ()=>{
      if(action === 'OUT') adminDeclareOut(playerId);
      else adminAddRuns(playerId, parseInt(action.replace('+','')));
    });
    wrapper.appendChild(b);
  });
  container.appendChild(wrapper);
}

// small UI: render live summary somewhere unobtrusive (we put it in topbar counts area visually subtle)
function renderLiveSummaryInUI(){
  // inject a small element next to counts (non-intrusive)
  const countsEl = document.querySelector('.counts');
  if(!countsEl) return;
  let liveSummary = document.getElementById('liveSummary');
  if(!liveSummary){
    liveSummary = document.createElement('div'); liveSummary.id = 'liveSummary';
    liveSummary.style.fontSize = '12px'; liveSummary.style.color = 'var(--muted)'; liveSummary.style.marginLeft = '8px';
    countsEl.parentNode.insertBefore(liveSummary, countsEl.nextSibling);
  }
  liveSummary.textContent = liveState.liveMode ? ` | Score: ${liveState.teamScore}/${liveState.teamWickets}` : '';
}

// ================= Flash message reused (already defined) =================
// function flash(text){ ... } (already above)

// ================= Admin build list on open helper (keeps admin area up-to-date) =================
function buildAdminListOnOpen(){
  if(!adminPanel.classList.contains('hidden')) buildAdminList();
}

// Add player
// (existing handlers already define addPlayerBtn, etc.)

// ================= Show squad modal / close handlers =================
showBtn.addEventListener('click', ()=>{ populateSquadModal(); squadModal.classList.remove('hidden'); squadModal.setAttribute('aria-hidden','false'); });
closeModal.addEventListener('click', ()=>{ squadModal.classList.add('hidden'); squadModal.setAttribute('aria-hidden','true'); });

// close modal on outside click
document.addEventListener('click', (e)=>{
  if(e.target === squadModal){ squadModal.classList.add('hidden'); squadModal.setAttribute('aria-hidden','true'); }
  if(e.target === adminModal){ adminModal.classList.add('hidden'); adminModal.setAttribute('aria-hidden','true'); }
  if(e.target === profileModal){ profileModal.classList.add('hidden'); profileModal.setAttribute('aria-hidden','true'); mRoleControlsContainer.innerHTML=''; }
});

// reset handler
resetBtn.addEventListener('click', ()=>{
  if(!confirm('Reset all selections and roles?')) return;
  players = DEFAULT_PLAYERS.slice();
  Object.keys(state).forEach(k=> state[k]=0);
  roles.captain = roles.viceCaptain = roles.wicketKeeper = null;
  liveState = { liveMode:false, currentBatsmen:[], teamScore:0, teamWickets:0 };
  saveAll(); renderPlayers();
});

// ================= Persist/load initial =================
loadAll();
renderPlayers();

// When admin panel is open and admin logged in, build admin list
function buildAdminListOnOpen(){
  if(!adminPanel.classList.contains('hidden')) buildAdminList();
}
