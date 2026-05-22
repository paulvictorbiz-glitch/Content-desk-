// App state + hash-based routing + selectors.
// State is initialized from window.DATA and mutated via dispatch().

const StateCtx = React.createContext(null);
const RouteCtx = React.createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'updatePost': {
      const posts = state.posts.map(p => p.id === action.id ? { ...p, ...action.patch } : p);
      return { ...state, posts };
    }
    case 'addPost': {
      const post = { ...action.post };
      return { ...state, posts: [...state.posts, post] };
    }
    case 'addPosts': {
      return { ...state, posts: [...state.posts, ...action.posts] };
    }
    case 'deletePost': {
      return { ...state, posts: state.posts.filter(p => p.id !== action.id) };
    }
    case 'updateAsset': {
      const assets = state.assets.map(a => a.id === action.id ? { ...a, ...action.patch } : a);
      return { ...state, assets };
    }
    case 'addAssets': {
      return { ...state, assets: [...action.assets, ...state.assets] };
    }
    case 'addTopic': {
      return { ...state, topics: [...state.topics, action.topic] };
    }
    case 'updateTopic': {
      return { ...state, topics: state.topics.map(t => t.id === action.id ? { ...t, ...action.patch } : t) };
    }
    case 'deleteTopic': {
      return { ...state, topics: state.topics.filter(t => t.id !== action.id) };
    }
    case 'updatePattern': {
      return { ...state, pattern: { ...state.pattern, ...action.patch } };
    }
    case 'updateSettings': {
      return { ...state, settings: { ...state.settings, ...action.patch } };
    }
    case 'updateSettingsPath': {
      // patch a nested path like ['prompts', 'business']
      const path = action.path;
      const next = JSON.parse(JSON.stringify(state.settings));
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = { ...cur[path[path.length - 1]], ...action.patch };
      return { ...state, settings: next };
    }
    case 'markExported': {
      const ids = new Set(action.postIds);
      const today = window.DATA.iso(new Date());
      const posts = state.posts.map(p => ids.has(p.id) ? { ...p, exportStatus: 'exported', exportedAt: today } : p);
      const activity = [{ at: new Date().toISOString().slice(0, 16), text: `Exported ${ids.size} rows · ${action.filename || 'planable.csv'}` }, ...state.activity];
      return { ...state, posts, activity };
    }
    case 'logActivity': {
      return { ...state, activity: [{ at: new Date().toISOString().slice(0, 16), text: action.text }, ...state.activity] };
    }
    case 'toast': {
      return { ...state, toast: action.toast };
    }
    default: return state;
  }
}

function StateProvider({ children }) {
  const initial = React.useMemo(() => ({
    topics: window.DATA.topics,
    pattern: window.DATA.pattern,
    assets: window.DATA.assets,
    posts: window.DATA.posts,
    settings: window.DATA.settings,
    activity: window.DATA.activity,
    toast: null,
  }), []);
  const [state, dispatch] = React.useReducer(reducer, initial);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: 'toast', toast: null }), 3200);
    return () => clearTimeout(t);
  }, [state.toast]);

  const api = React.useMemo(() => ({ state, dispatch,
    toast: (text, tone) => dispatch({ type: 'toast', toast: { text, tone, ts: Date.now() } }),
  }), [state]);

  return <StateCtx.Provider value={api}>{children}</StateCtx.Provider>;
}

function useStore() { return React.useContext(StateCtx); }

// ─── Selectors ────────────────────────────────────────────────
function useSelector(fn, deps = []) {
  const { state } = useStore();
  return React.useMemo(() => fn(state), [state, ...deps]); // eslint-disable-line
}

function useAssetById(id) {
  const { state } = useStore();
  return state.assets.find(a => a.id === id) || null;
}

function postsByAsset(state, assetId) {
  return state.posts.filter(p => p.assetId === assetId);
}

function isAssetUsed(state, assetId) {
  return state.posts.some(p => p.assetId === assetId);
}

// ─── Routing (hash-based) ─────────────────────────────────────
function parseHash(h) {
  // #/path?key=val&key=val
  const raw = (h || '').replace(/^#\/?/, '');
  const [pathStr, queryStr] = raw.split('?');
  const parts = pathStr.split('/').filter(Boolean);
  const tab = parts[0] || 'dashboard';
  const sub = parts.slice(1);
  const query = {};
  (queryStr || '').split('&').filter(Boolean).forEach(kv => {
    const [k, v = ''] = kv.split('=');
    query[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return { tab, sub, query };
}

function buildHash({ tab, sub, query }) {
  let h = '#/' + tab;
  if (sub && sub.length) h += '/' + sub.join('/');
  if (query && Object.keys(query).length) {
    const q = Object.entries(query).filter(([, v]) => v !== '' && v !== undefined && v !== null)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
    if (q) h += '?' + q;
  }
  return h;
}

function RouteProvider({ children }) {
  const [route, setRoute] = React.useState(() => parseHash(window.location.hash));
  React.useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    if (!window.location.hash) window.location.hash = '#/dashboard';
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const api = React.useMemo(() => ({
    route,
    go: (next) => { window.location.hash = buildHash(next); },
    goTab: (tab, query) => { window.location.hash = buildHash({ tab, query }); },
  }), [route]);
  return <RouteCtx.Provider value={api}>{children}</RouteCtx.Provider>;
}

function useRoute() { return React.useContext(RouteCtx); }

// ─── Toast ────────────────────────────────────────────────────
function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  const t = state.toast;
  const bg = t.tone === 'ok' ? UI.ok : t.tone === 'warn' ? UI.warn : t.tone === 'accent' ? UI.accent : UI.ink;
  return ReactDOM.createPortal(
    <div className="pop-in" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 16px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, zIndex: 100, boxShadow: '0 12px 32px rgba(0,0,0,.18)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {t.tone === 'ok' && <Icon name="check" size={14} />}
      {t.tone === 'accent' && <Icon name="warning" size={14} />}
      {t.text}
    </div>, document.body);
}

// ─── Date helpers exposed on window ───────────────────────────
function fmtDate(iso, opts = {}) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  if (opts.short) return `${m} ${d.getDate()}`;
  if (opts.weekday) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()] + ' ' + m + ' ' + d.getDate();
  return `${m} ${d.getDate()}, ${d.getFullYear()}`;
}
function daysFromToday(iso) {
  const today = window.DATA.TODAY;
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  return Math.round((d - today) / 86400000);
}
function relativeDay(iso) {
  const n = daysFromToday(iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 0 && n < 7) return `in ${n} days`;
  if (n < 0 && n > -7) return `${-n} days ago`;
  return fmtDate(iso, { short: true });
}

Object.assign(window, { StateProvider, RouteProvider, useStore, useRoute, useSelector, useAssetById, postsByAsset, isAssetUsed, Toast, fmtDate, daysFromToday, relativeDay });
