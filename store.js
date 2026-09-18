// Rolls — single source of truth. Local-first: everything lives on the device.
// Text data → localStorage (rolls_lib_v1). Images → IndexedDB (rolls-images), referenced by frame.
const KEY = 'rolls_lib_v1';
const DBN = 'rolls-images';
const IMG = '@img'; // marker stored in place of an image data URL in localStorage

const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

function fresh() {
  return {
    v: 1,
    rolls: [],
    frames: {},          // { [rollId]: { [n]: frame } }
    customLights: (() => { try { return JSON.parse(ls.get('rolls_custom_lights') || '[]'); } catch (e) { return []; } })(),
    profile: { name: '', handle: '', avatar: '' },
    settings: {
      defaultFilm: ls.get('rolls_default_film') || 'Kodak Portra 400',
      units: ls.get('rolls_units') || 'Metric',
      theme: ls.get('rolls_theme') || 'Portra 400',
      appearance: ls.get('rolls_appearance') || 'system',
    },
  };
}

// ---- IndexedDB ----
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    if (!('indexedDB' in window)) { rej(new Error('no idb')); return; }
    const r = indexedDB.open(DBN, 1);
    r.onupgradeneeded = () => { r.result.createObjectStore('img'); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
const images = {
  async put(key, val) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('img', 'readwrite'); t.objectStore('img').put(val, key); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async del(key) { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('img', 'readwrite'); t.objectStore('img').delete(key); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async all() {
    const d = await db();
    return new Promise((res, rej) => {
      const out = {}; const t = d.transaction('img', 'readonly'); const c = t.objectStore('img').openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
      c.onerror = () => rej(c.error);
    });
  },
  async clear() { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('img', 'readwrite'); t.objectStore('img').clear(); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
};

const IMG_FIELDS = ['intended', 'scan'];
const imgKey = (rollId, n, field) => rollId + '/' + n + '/' + field;
const isData = (v) => typeof v === 'string' && (v.startsWith('data:') || v.startsWith('blob:'));

// ---- store ----
const listeners = new Set();
let data = null;
let saveT = null;
let pendingImgs = {}; // key → dataUrl | null (delete)

function notify() { listeners.forEach((fn) => { try { fn(data); } catch (e) {} }); }

function flushImages() {
  const batch = pendingImgs; pendingImgs = {};
  Object.keys(batch).forEach((k) => { const v = batch[k]; (v == null ? images.del(k) : images.put(k, v)).catch(() => {}); });
}

function serialize(d) {
  const frames = {};
  Object.keys(d.frames).forEach((rid) => {
    const fr = d.frames[rid]; const o = {};
    Object.keys(fr).forEach((n) => {
      const f = { ...fr[n] };
      IMG_FIELDS.forEach((fld) => { if (isData(f[fld])) f[fld] = IMG; });
      o[n] = f;
    });
    frames[rid] = o;
  });
  const profile = { ...d.profile };
  if (isData(profile.avatar)) profile.avatar = IMG;
  return JSON.stringify({ ...d, frames, profile });
}

function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => { ls.set(KEY, serialize(data)); flushImages(); }, 150);
}

export const store = {
  get ready() { return !!data; },
  get() { return data; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  async load() {
    if (data) return data;
    let d = null;
    try { d = JSON.parse(ls.get(KEY) || 'null'); } catch (e) {}
    data = d && d.v === 1 ? { ...fresh(), ...d, settings: { ...fresh().settings, ...(d.settings || {}) } } : fresh();
    // hydrate images
    try {
      const all = await images.all();
      Object.keys(data.frames).forEach((rid) => Object.keys(data.frames[rid]).forEach((n) => {
        const f = data.frames[rid][n];
        IMG_FIELDS.forEach((fld) => { if (f[fld] === IMG) f[fld] = all[imgKey(rid, n, fld)] || ''; });
      }));
      if (data.profile.avatar === IMG) data.profile.avatar = all['profile/avatar'] || '';
    } catch (e) {}
    notify();
    return data;
  },

  update(fn) {
    if (!data) return;
    const next = fn(data) || data;
    data = next;
    save(); notify();
  },

  setRolls(rolls) { this.update((d) => ({ ...d, rolls })); },
  setFrames(rollId, frames) {
    this.update((d) => {
      const prev = d.frames[rollId] || {};
      Object.keys(frames).forEach((n) => IMG_FIELDS.forEach((fld) => {
        const nv = frames[n][fld], ov = prev[n] ? prev[n][fld] : undefined;
        if (nv !== ov) pendingImgs[imgKey(rollId, n, fld)] = isData(nv) ? nv : null;
      }));
      return { ...d, frames: { ...d.frames, [rollId]: frames } };
    });
  },
  deleteRoll(rollId) {
    this.update((d) => {
      const fr = d.frames[rollId] || {};
      Object.keys(fr).forEach((n) => IMG_FIELDS.forEach((fld) => { pendingImgs[imgKey(rollId, n, fld)] = null; }));
      const frames = { ...d.frames }; delete frames[rollId];
      return { ...d, rolls: d.rolls.filter((r) => String(r.id) !== String(rollId)), frames };
    });
  },
  setProfile(profile) {
    this.update((d) => { if (profile.avatar !== d.profile.avatar) pendingImgs['profile/avatar'] = isData(profile.avatar) ? profile.avatar : null; return { ...d, profile }; });
  },
  setSetting(k, v) { this.update((d) => ({ ...d, settings: { ...d.settings, [k]: v } })); },
  setCustomLights(list) { ls.set('rolls_custom_lights', JSON.stringify(list)); this.update((d) => ({ ...d, customLights: list })); },

  // Shrink an image file for storage. Returns a JPEG data URL.
  downscale(file, max = 1600, q = 0.82) {
    return new Promise((res) => {
      const url = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', q));
      };
      im.onerror = () => { URL.revokeObjectURL(url); const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(''); fr.readAsDataURL(file); };
      im.src = url;
    });
  },

  // ---- export / import (Phase 4) ----
  exportJSON(withImages = true) {
    const d = data;
    const out = JSON.parse(withImages ? JSON.stringify(d) : serialize(d));
    out.exportedAt = new Date().toISOString();
    out.app = 'Rolls';
    return JSON.stringify(out);
  },
  async importJSON(text, mode = 'replace') {
    const inc = JSON.parse(text);
    if (!inc || inc.app !== 'Rolls' || !Array.isArray(inc.rolls)) throw new Error('Not a Rolls library file');
    const clean = (o) => { const c = { ...o }; delete c.exportedAt; delete c.app; return c; };
    if (mode === 'replace') { await images.clear().catch(() => {}); data = { ...fresh(), ...clean(inc) }; }
    else {
      const have = new Set(data.rolls.map((r) => String(r.id)));
      const rolls = data.rolls.concat(inc.rolls.filter((r) => !have.has(String(r.id))));
      const frames = { ...data.frames }; Object.keys(inc.frames || {}).forEach((rid) => { if (!have.has(rid)) frames[rid] = inc.frames[rid]; });
      data = { ...data, rolls, frames };
    }
    // stage every image for IDB
    Object.keys(data.frames).forEach((rid) => Object.keys(data.frames[rid]).forEach((n) => IMG_FIELDS.forEach((fld) => {
      const v = data.frames[rid][n][fld]; if (isData(v)) pendingImgs[imgKey(rid, n, fld)] = v; else if (v === IMG) data.frames[rid][n][fld] = '';
    })));
    if (isData(data.profile.avatar)) pendingImgs['profile/avatar'] = data.profile.avatar; else if (data.profile.avatar === IMG) data.profile.avatar = '';
    save(); notify();
    return data;
  },
};

export const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
export const nowTime = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
