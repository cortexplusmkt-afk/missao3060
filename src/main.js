import './style.css';
import { syncWidget } from './widget-plugin';
import { configureNotifications } from './notifications';

const KEY = 'missao-30-60-state-v3';
const today = () => new Date().toISOString().slice(0, 10);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const defaults = {
  startDate: today(), streak: 1, bestStreak: 1, weight: null, weightHistory: [],
  water: 0, steps: 0, reading: 0, cortex: 0, family: 0, nutrition: false,
  workout: false, walk: false, completedDate: null
};
let state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') };

const menus = {
  0:{day:'Domingo',pick:'Proteína + legumes/salada + 1 carboidrato.',avoid:'Sem “dia do lixo”.'},
  1:{day:'Segunda',pick:'Arroz + feijão + carne suína + salada.',avoid:'Macarrão fora. Mandioca só no lugar de parte do arroz.'},
  2:{day:'Terça',pick:'Galinhada moderada + feijão + frango + cabotiá + salada.',avoid:'Macarrão e linguiça fora.'},
  3:{day:'Quarta',pick:'Arroz + feijão + carne de panela + salada.',avoid:'Macarrão, purê e torresmo fora.'},
  4:{day:'Quinta',pick:'Pouco arroz + pouco tropeiro + peito de frango + chuchu + salada.',avoid:'Macarrão e peixe frito fora.'},
  5:{day:'Sexta',pick:'Arroz + feijão + carne assada + couve + salada.',avoid:'Farofa, feijoada e suco de saquinho fora.'},
  6:{day:'Sábado',pick:'Proteína magra + legumes/salada + 1 carboidrato.',avoid:'Sábado não é recompensa.'}
};

const app = document.querySelector('#app');
app.innerHTML = `
<div class="shell">
  <div class="ambient cyan"></div><div class="ambient amber"></div>
  <main class="phone-view">
    <section class="hero-panel">
      <div class="skyline" aria-hidden="true">
        <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#183142"/><stop offset=".55" stop-color="#0c1720"/><stop offset="1" stop-color="#05090d"/></linearGradient>
            <radialGradient id="sun" cx="65%" cy="35%" r="50%"><stop offset="0" stop-color="#d58a37" stop-opacity=".65"/><stop offset="1" stop-color="#d58a37" stop-opacity="0"/></radialGradient>
          </defs>
          <rect width="800" height="320" fill="url(#sky)"/><rect width="800" height="320" fill="url(#sun)"/>
          <g fill="#071017" opacity=".95">
            <rect x="0" y="245" width="62" height="75"/><rect x="70" y="210" width="84" height="110"/><rect x="168" y="230" width="55" height="90"/><rect x="235" y="175" width="70" height="145"/><rect x="318" y="222" width="95" height="98"/><rect x="430" y="195" width="58" height="125"/><rect x="500" y="152" width="68" height="168"/><rect x="580" y="218" width="94" height="102"/><rect x="687" y="182" width="113" height="138"/>
          </g>
          <g fill="#d89443" opacity=".32">
            <circle cx="101" cy="234" r="2"/><circle cx="258" cy="204" r="2"/><circle cx="455" cy="220" r="2"/><circle cx="532" cy="188" r="2"/><circle cx="741" cy="213" r="2"/>
          </g>
          <g transform="translate(518 86)" fill="#05090d">
            <ellipse cx="56" cy="35" rx="24" ry="28"/><path d="M26 70 C38 52 72 52 85 70 L102 190 H8 Z"/><path d="M22 96 L0 172 L20 180 L46 112 Z"/><path d="M88 94 L115 170 L94 180 L67 112 Z"/>
          </g>
        </svg>
      </div>
      <div class="hero-content">
        <div class="brand-row"><div><h1>MISSÃO <span>30-60</span></h1><p>DISCIPLINA HOJE. LIBERDADE SEMPRE.</p></div><div class="version">V 0.2<br><b>PROTOCOLO ATIVO</b></div></div>
        <div class="day-row"><div><div class="day" id="dayLabel">DIA 1 / 60</div><button class="streak" id="streakBtn">🔥 OFENSIVA: <strong id="streakLabel">1 dia</strong></button></div><div class="motto">MENTE MAIS FORTE<br><span>UM DIA DE CADA VEZ</span></div></div>
      </div>
    </section>

    <section class="weight card interactive" id="weightCard"><div class="scan-icon">⚖</div><div class="weight-copy"><strong id="weightTitle">Peso durante a caminhada</strong><span id="weightSub">Passe na farmácia e registre aqui.</span></div><div class="cta-small">REGISTRAR ›</div></section>

    <section class="command-grid">
      <div class="progress-card card"><div class="ring" id="ring"><div class="ring-core"><b id="progressText">0%</b><span>DO DIA</span></div></div><div class="tiny">STATUS DA MISSÃO</div></div>
      <button class="current-mission card" id="walkCard"><div class="tiny cyan-text">MISSÃO ATUAL</div><strong>CAMINHADA DA MANHÃ</strong><span id="walkStatus">◌ EM ANDAMENTO</span><div class="mission-art"><i></i><i></i><i></i><i></i><i></i></div><small>Movimento hoje. Mais vida amanhã.</small></button>
    </section>

    <section class="metrics" id="metrics"></section>

    <section class="intel card"><div class="intel-head"><span>ALMOÇO ESTRATÉGICO</span><b id="menuDay">SEXTA</b></div><strong id="menuPick"></strong><p id="menuAvoid"></p><button id="nutritionBtn">MARCAR COMO CUMPRIDO</button></section>

    <section class="body card"><div><div class="tiny cyan-text">CORPO</div><strong id="trainingText">TREINO / CARDIO PENDENTE</strong><span>Construa o corpo que sustenta a presença.</span></div><button id="trainingBtn">CONCLUIR</button></section>

    <section class="ai-panel card"><div class="ai-core"><span></span><i></i></div><div><div class="tiny cyan-text">JARVIS // AXON MODE</div><strong id="jarvisText">SEM NEGOCIAÇÃO HOJE.</strong><p id="jarvisSub">A rotina tira da motivação o poder de decidir.</p></div><button id="notifyBtn" title="Ativar notificações">🔔</button></section>

    <div class="footer-space"></div>
  </main>
  <nav><button class="active">⌂<span>Hoje</span></button><button>◎<span>Missões</span></button><button>🔥<span>Ofensiva</span></button><button>◉<span>Perfil</span></button></nav>
</div>

<div class="modal hidden" id="weightModal"><div class="sheet"><button class="x" data-close="weightModal">✕</button><div class="tiny cyan-text">REGISTRO DE CAMPO</div><h2>PESO</h2><p>Registre durante a caminhada. Se possível, use sempre a mesma balança.</p><div class="big-input"><input id="weightInput" inputmode="decimal" placeholder="100,0"><span>kg</span></div><button class="primary" id="saveWeight">SALVAR REGISTRO</button></div></div>
<div class="modal hidden" id="stepsModal"><div class="sheet"><button class="x" data-close="stepsModal">✕</button><div class="tiny cyan-text">MOVIMENTO</div><h2>PASSOS</h2><p>Informe o total do celular ou relógio.</p><div class="big-input"><input id="stepsInput" inputmode="numeric" placeholder="12000"><span>passos</span></div><button class="primary" id="saveSteps">ATUALIZAR</button></div></div>
<div class="toast hidden" id="toast"></div>
`;

function dayNumber() {
  const a = new Date(state.startDate + 'T00:00:00');
  const b = new Date(today() + 'T00:00:00');
  return clamp(Math.floor((b - a) / 86400000) + 1, 1, 60);
}
function progress() {
  const done = [state.water >= 4, state.steps >= 12000, state.reading >= 10, state.cortex >= 60, state.family >= 90, state.nutrition, state.workout || state.walk];
  return Math.round(done.filter(Boolean).length / done.length * 100);
}
function toast(msg) {
  const el = document.querySelector('#toast');
  el.textContent = msg; el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2300);
}
function metric(icon, name, current, target, unit, key, quick = true) {
  const pct = clamp(current / target, 0, 1) * 100;
  const display = unit === 'passos' ? `${Number(current).toLocaleString('pt-BR')} / ${Number(target).toLocaleString('pt-BR')}` : `${current} / ${target} ${unit}`;
  return `<button class="metric card" data-key="${key}"><div class="metric-icon">${icon}</div><div class="metric-info"><strong>${name}</strong><span>${display}</span><div class="bar"><i style="width:${pct}%"></i></div></div>${quick ? `<div class="quick"><i data-minus="${key}">−</i><i data-plus="${key}">+</i></div>` : `<em>›</em>`}</button>`;
}
async function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
  await syncWidget({
    day: dayNumber(), streak: state.streak, progress: progress(),
    weight: state.weight ? `${Number(state.weight).toFixed(1)} kg` : '--',
    water: state.water, steps: state.steps, reading: state.reading,
    cortex: state.cortex, family: state.family,
    mission: state.walk ? 'Caminhada concluída' : 'Caminhada pendente'
  });
}
function render() {
  const p = progress();
  document.querySelector('#dayLabel').textContent = `DIA ${dayNumber()} / 60`;
  document.querySelector('#streakLabel').textContent = `${state.streak} dia${state.streak === 1 ? '' : 's'}`;
  document.querySelector('#progressText').textContent = `${p}%`;
  document.querySelector('#ring').style.setProperty('--p', `${p * 3.6}deg`);
  document.querySelector('#walkStatus').textContent = state.walk ? '✓ CONCLUÍDA' : '◌ EM ANDAMENTO';
  document.querySelector('#walkStatus').className = state.walk ? 'ok' : '';

  if (state.weight) {
    document.querySelector('#weightTitle').textContent = `${Number(state.weight).toFixed(1)} KG`;
    const first = state.weightHistory[0]?.value;
    const diff = first ? Number(state.weight) - Number(first) : 0;
    document.querySelector('#weightSub').textContent = state.weightHistory.length > 1 ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg desde o primeiro registro` : 'Primeiro registro feito.';
  } else {
    document.querySelector('#weightTitle').textContent = 'PESO DURANTE A CAMINHADA';
    document.querySelector('#weightSub').textContent = 'Passe na farmácia e registre aqui.';
  }

  document.querySelector('#metrics').innerHTML = [
    metric('💧','HIDRATAÇÃO',state.water,4,'garrafas','water',true),
    metric('👟','PASSOS',state.steps,12000,'passos','steps',false),
    metric('📖','LEITURA',state.reading,10,'páginas','reading',true),
    metric('⚡','CORTEX+',state.cortex,60,'min','cortex',true),
    metric('◉','FAMÍLIA',state.family,90,'min','family',true)
  ].join('');

  const m = menus[new Date().getDay()];
  document.querySelector('#menuDay').textContent = m.day.toUpperCase();
  document.querySelector('#menuPick').textContent = m.pick;
  document.querySelector('#menuAvoid').textContent = m.avoid;
  const nb = document.querySelector('#nutritionBtn');
  nb.textContent = state.nutrition ? '✓ NUTRIÇÃO CUMPRIDA' : 'MARCAR COMO CUMPRIDO';
  nb.classList.toggle('done', state.nutrition);

  document.querySelector('#trainingText').textContent = state.workout ? '✓ TREINO CONCLUÍDO' : 'TREINO / CARDIO PENDENTE';
  const tb = document.querySelector('#trainingBtn');
  tb.textContent = state.workout ? 'FEITO' : 'CONCLUIR'; tb.classList.toggle('done', state.workout);

  document.querySelector('#jarvisText').textContent = p < 45 ? 'SEM NEGOCIAÇÃO HOJE.' : p < 100 ? 'CONTINUE. A OFENSIVA ESTÁ VIVA.' : 'DIA PERFEITO. MISSÃO PROTEGIDA.';
  document.querySelector('#jarvisSub').textContent = p < 100 ? `Progresso atual: ${p}%. Termine o que começou.` : 'Amanhã você começa novamente do zero.';

  if (p === 100 && state.completedDate !== today()) {
    state.completedDate = today();
    localStorage.setItem(KEY, JSON.stringify(state));
    setTimeout(() => toast('DIA PERFEITO. OFENSIVA PROTEGIDA.'), 200);
  }
}
function open(id) { document.querySelector(id).classList.remove('hidden'); }
function close(id) { document.querySelector(id).classList.add('hidden'); }

document.querySelector('#weightCard').addEventListener('click', () => { document.querySelector('#weightInput').value = state.weight || ''; open('#weightModal'); });
document.querySelector('#walkCard').addEventListener('click', () => { state.walk = !state.walk; save(); });
document.querySelector('#trainingBtn').addEventListener('click', () => { state.workout = !state.workout; save(); });
document.querySelector('#nutritionBtn').addEventListener('click', () => { state.nutrition = !state.nutrition; save(); });
document.querySelector('#metrics').addEventListener('click', e => {
  const minus = e.target.closest('[data-minus]'); const plus = e.target.closest('[data-plus]');
  if (minus || plus) {
    e.preventDefault(); e.stopPropagation(); const k = (minus || plus).dataset[minus ? 'minus' : 'plus']; const dir = plus ? 1 : -1;
    if (k === 'water') state.water = clamp(state.water + dir, 0, 4);
    if (k === 'reading') state.reading = clamp(state.reading + dir * 5, 0, 20);
    if (k === 'cortex') state.cortex = clamp(state.cortex + dir * 15, 0, 120);
    if (k === 'family') state.family = clamp(state.family + dir * 15, 0, 180);
    save(); return;
  }
  const card = e.target.closest('[data-key]'); if (!card) return;
  if (card.dataset.key === 'steps') { document.querySelector('#stepsInput').value = state.steps || ''; open('#stepsModal'); }
});
document.querySelector('#saveWeight').addEventListener('click', () => {
  const v = Number(document.querySelector('#weightInput').value.replace(',', '.'));
  if (!v || v < 40 || v > 250) return toast('Digite um peso válido.');
  state.weight = v; state.weightHistory = [...state.weightHistory.filter(x => x.date !== today()), { date: today(), value: v }]; close('#weightModal'); save(); toast(`PESO REGISTRADO: ${v.toFixed(1)} KG`);
});
document.querySelector('#saveSteps').addEventListener('click', () => { state.steps = Number(document.querySelector('#stepsInput').value.replace(/\D/g, '')) || 0; close('#stepsModal'); save(); });
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => close('#' + b.dataset.close)));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) close('#' + m.id); }));
document.querySelector('#notifyBtn').addEventListener('click', async () => { const ok = await configureNotifications(); toast(ok ? 'NOTIFICAÇÕES DE MISSÃO ATIVADAS.' : 'NÃO FOI POSSÍVEL ATIVAR AS NOTIFICAÇÕES.'); });

render();
save();
