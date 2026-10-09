window.__ModuleLoader__.load({id:"dsh-reasoning-slider",factory:(require)=>{const module={exports:{}};const exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  ReasoningSlider: () => ReasoningSlider,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/style.css
var style_default = '.drs-trigger,.drs-panel{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}\n.drs-panel,.drs-panel *,.drs-trigger,.drs-trigger *{box-sizing:border-box}\n/* Harness applies superellipse corners globally. Circular geometry must opt out. */\n.drs-track,.drs-inner,.drs-fill,.drs-aurora,.drs-thumb,.drs-ticks i,.drs-spinner{corner-shape:round}\n.drs-trigger{min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary,#cfd3d6);cursor:pointer;background:transparent;border:0;border-radius:8px;display:flex;align-items:center;gap:5px;padding:0 6px 0 7px;font-size:13px;line-height:20px}\n.drs-trigger:hover:not(:disabled),.drs-trigger[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}\n.drs-trigger:disabled{opacity:.45;cursor:default}\n.drs-model-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.drs-pill-tier{color:#7aaaff;flex-shrink:1000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.drs-trigger[data-tier="0"] .drs-pill-tier{color:var(--dsw-alias-label-tertiary,#adb2b8)}\n.drs-trigger[data-tier="3"] .drs-pill-tier{color:#c05cff;text-shadow:0 0 5px #c05cff66,0 0 10px #9932cc40}\n.drs-pill-bolt{width:14px;height:16px;display:grid;place-items:center;color:#c05cff;flex:none}\n.drs-pill-bolt svg{width:12px;height:14px;fill:currentColor;stroke:currentColor;stroke-width:1.4}\n.drs-chevron{display:grid;place-items:center;flex:none}\n.drs-chevron svg,.drs-model svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}\n.drs-spinner{width:12px;height:12px;border:1.5px solid #8885;border-top-color:currentColor;border-radius:50%;animation:drs-spin .7s linear infinite;flex:none}\n@keyframes drs-spin{to{transform:rotate(360deg)}}\n@property --drs-border-angle{syntax:"<angle>";inherits:true;initial-value:0deg}\n.drs-panel{--drs-edge:conic-gradient(from var(--drs-border-angle),#9932CC 0%,#DA70D6 25%,#9932CC 50%,#DA70D6 75%,#9932CC 100%);position:fixed;width:330px;max-width:calc(100vw - 24px);border:1px solid var(--dsw-alias-border-l4,#ffffff33);border-radius:15px;background:var(--dsw-alias-bg-layer-2,#29292b);color:var(--dsw-alias-label-primary,#f9fafb);box-shadow:0 18px 48px #00000038,0 4px 12px #00000018;z-index:1100;isolation:isolate;animation:drs-panel-in .18s ease-out}\n.drs-content{max-height:calc(100dvh - 26px);overflow-y:auto;padding:12px 16px 10px;border-radius:inherit}\n.drs-panel{animation:drs-panel-in .18s ease-out,drs-border-flow 6s linear infinite}\n/* The opaque surface covers all inward blur; only the outside halo is visible. */\n.drs-panel::after{content:"";position:absolute;inset:0;border-radius:14px;background:var(--dsw-alias-bg-layer-2,#29292b);z-index:-1;pointer-events:none}\n.drs-edge-ring,.drs-edge-glow{position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .45s ease}\n.drs-edge-ring{padding:1px;background:var(--drs-edge);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude}\n.drs-edge-glow{inset:-3px;z-index:-2;filter:blur(9px)}\n.drs-edge-glow::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:5px;background:var(--drs-edge);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;pointer-events:none}\n.drs-panel[data-edge=true] .drs-edge-ring{opacity:1}\n.drs-panel[data-edge=true] .drs-edge-glow{opacity:.9}\n@keyframes drs-border-flow{to{--drs-border-angle:360deg}}\n@keyframes drs-panel-in{from{opacity:0}to{opacity:1}}\n.drs-panel button,.drs-panel input{font-family:inherit}\n.drs-trigger:focus-visible,.drs-panel button:focus-visible,.drs-panel input:focus-visible,.drs-hit:focus-visible{outline:2px solid #7aaaff;outline-offset:2px}\n.drs-bolt{position:absolute;top:7px;left:12px;width:28px;height:28px;display:grid;place-items:center;padding:0;border:0;border-radius:8px;background:transparent;color:#fff;cursor:pointer;z-index:2}\n.drs-bolt:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}\n.drs-bolt svg{width:16px;height:18px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round;transition:color .25s,fill .25s,filter .25s}\n.drs-panel[data-powered=true] .drs-bolt{color:#c05cff}\n.drs-panel[data-powered=true] .drs-bolt svg{fill:currentColor;filter:drop-shadow(0 0 5px #c05cffb8)}\n.drs-meter{position:relative;text-align:center;margin-bottom:12px;height:59px}\n.drs-title{display:block;color:var(--drs-tier-color,#7aaaff);font-size:23px;line-height:30px;font-weight:550;letter-spacing:-.025em;transition:opacity .2s}\n.drs-panel[data-tier="0"]{--drs-tier-color:var(--dsw-alias-label-tertiary,#adb2b8)}\n.drs-panel[data-tier="3"]{--drs-tier-color:#c05cff}\n.drs-panel[data-tier="3"] .drs-title{text-shadow:0 0 7px #c05cff80,0 0 18px #9932cc59,0 0 28px #da70d626}\n.drs-model{margin-top:3px;max-width:100%;display:inline-flex;align-items:center;gap:6px;padding:3px 7px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary,#adb2b8);font-size:12px;line-height:20px;cursor:pointer;transition:opacity .2s}\n.drs-model:hover{color:var(--dsw-alias-label-primary,#fff);background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}\n.drs-model:disabled{cursor:default}\n.drs-model span{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.drs-model svg{width:11px;height:11px;transition:transform .2s}\n.drs-model[aria-expanded=true] svg{transform:rotate(180deg)}\n.drs-notice{position:absolute;left:50%;top:50%;width:max-content;max-width:100%;transform:translate(-50%,calc(-50% + 4px));color:#c05cff;font-size:18px;line-height:24px;font-weight:600;letter-spacing:.01em;opacity:0;pointer-events:none;white-space:nowrap;transition:opacity .22s,transform .22s}\n.drs-panel[data-notice=true] .drs-title,.drs-panel[data-notice=true] .drs-model{opacity:0;visibility:hidden;pointer-events:none}\n.drs-notice[data-visible=true]{opacity:1;transform:translate(-50%,-50%)}\n.drs-notice-glint{position:absolute;inset:0;pointer-events:none;opacity:0;color:transparent;background:linear-gradient(105deg,transparent 38%,#fff 49%,transparent 60%);background-size:250% 100%;background-repeat:no-repeat;background-position:150% 50%;background-clip:text;-webkit-background-clip:text}\n.drs-shimmer .drs-notice-glint{animation:drs-shimmer 1.35s ease-out 1 forwards}\n/* Animate only the white overlay; the complete purple sentence remains painted. */\n@keyframes drs-shimmer{0%{background-position:150% 50%;opacity:0}10%{opacity:1}90%{opacity:1}100%{background-position:-50% 50%;opacity:0}}\n.drs-track{--pos:0;position:relative;height:28px;border-radius:999px;background:#414142;box-shadow:inset 0 0 0 1px #ffffff38;isolation:isolate;margin-bottom:2px}\n.drs-track[data-disabled=true]{opacity:.55}\n.drs-inner{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none}\n/* The 14px end-cap center follows the thumb center, fully under its 16px radius. */\n.drs-fill{position:absolute;left:0;top:0;bottom:0;width:calc(28px + (100% - 28px)*var(--pos));border-radius:inherit;background:#339cff;transition:width .28s cubic-bezier(.2,.85,.2,1),opacity .2s}\n.drs-panel[data-tier="0"]:not([data-dragging=true]) .drs-fill{opacity:0}\n.drs-aurora{position:absolute;inset:0;border-radius:inherit;opacity:0;background:radial-gradient(ellipse 62% 180% at 8% 50%,#339cff 0%,#339cffcc 28%,transparent 72%),radial-gradient(ellipse 68% 170% at 51% 42%,#7657c8 0%,#7657c8d9 30%,transparent 72%),radial-gradient(ellipse 62% 180% at 91% 58%,#654ea3 0%,#654ea3d9 32%,transparent 72%),linear-gradient(105deg,#339cff 0%,#7657c8 48%,#654ea3 100%);background-size:190% 100%;transition:opacity .3s}\n.drs-aurora{opacity:var(--drs-ultra-progress,0);animation:drs-aurora 12s ease-in-out infinite}\n@keyframes drs-aurora{0%,100%{background-position:0% 50%,100% 50%,0% 50%,0% 50%}50%{background-position:100% 50%,0% 50%,100% 50%,50% 50%}}\n.drs-ticks{position:absolute;inset:0 14px;pointer-events:none}\n.drs-ticks i{position:absolute;left:calc(var(--i)*100%/3);top:50%;width:4.5px;height:4.5px;border-radius:50%;transform:translate(-50%,-50%);background:#ffffff3d;transition:opacity .28s,transform .28s}\n.drs-ticks i[data-reached=true]{background:#ffffff80}\n.drs-ticks i[data-supported=false]{opacity:.2}\n.drs-panel[data-tier="3"] .drs-ticks i{opacity:0;transform:translate(-50%,-50%) scale(.55)}\n.drs-thumb{position:absolute;left:calc(14px + (100% - 28px)*var(--pos));top:50%;width:32px;height:32px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);box-shadow:0 1px 4px #00000025;transition:left .28s cubic-bezier(.2,.85,.2,1),scale .18s;pointer-events:none;z-index:2}\n.drs-panel[data-dragging=true] .drs-thumb{scale:1.055;transition:scale .18s}\n.drs-panel[data-dragging=true] .drs-fill{transition:opacity .2s}\n.drs-panel[data-dragging=true] .drs-particles,.drs-panel[data-dragging=true] .drs-aurora{transition:none}\n.drs-hit{cursor:grab;touch-action:none;user-select:none}\n.drs-hit[aria-disabled=true]{cursor:default}\n.drs-panel[data-dragging=true] .drs-hit{cursor:grabbing}\n/* Whole-layer opacity caps even overlapping particle pixels below 65%. */\n.drs-particles{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:var(--drs-particle-opacity,0);transition:opacity .28s ease}\n/* Outside the scroll container; the central hole keeps sparks behind the thumb. */\n.drs-ultra-burst{position:absolute;width:140px;height:140px;pointer-events:none;z-index:3;opacity:.64;mask-image:radial-gradient(circle at center,transparent 16px,#000 17px)}\n.drs-burst-flight{position:absolute;left:70px;top:70px;width:0;height:0;pointer-events:none;animation:drs-burst-flight var(--duration) cubic-bezier(.12,.65,.24,1) both}\n.drs-burst-flight i{position:absolute;left:0;top:0;width:var(--size);height:var(--size);border-radius:50%;corner-shape:round;background:#c05cff;box-shadow:0 0 4px #c05cff66;pointer-events:none;animation:drs-burst-fade var(--duration) linear both}\n@keyframes drs-burst-flight{from{transform:translate(0,0)}to{transform:translate(var(--dx),var(--dy))}}\n@keyframes drs-burst-fade{0%{opacity:0;transform:translate(-50%,-50%) scale(.7)}12%,40%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.35)}}\n.drs-models{position:relative;margin-top:14px;overflow:hidden;padding:6px;border:1px solid var(--dsw-alias-border-l4,#ffffff33);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#323234)}\n.drs-models input{width:100%;height:30px;margin-bottom:4px;padding:0 8px;border:0;border-radius:7px;background:var(--dsw-alias-interactive-bg-hover,#ffffff0d);color:inherit;font-size:12px}\n.drs-models>div{max-height:min(260px,36vh);overflow:auto}\n.drs-group{padding:5px 8px;color:var(--dsw-alias-label-caption,#81858c);font-size:10px}\n.drs-models button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px;padding:5px 8px;border:0;border-radius:7px;background:transparent;color:inherit;text-align:left;cursor:pointer;font-size:12px;line-height:20px}\n.drs-models button span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}\n.drs-models button:hover,.drs-models button:focus-visible{background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}\n.drs-models button[aria-checked=true]{background:#669aff0d}\n.drs-status{margin:10px 0 0;color:var(--dsw-alias-label-tertiary,#adb2b8);font-size:11px;text-align:center}\n.drs-status button,.drs-error button{border:0;background:transparent;color:#7aaaff;cursor:pointer}\n.drs-error{margin-top:10px;padding:6px 7px;border-radius:8px;background:#ff5c5c12;color:#ff8585;font-size:11px;display:flex;gap:8px;justify-content:space-between;overflow-wrap:anywhere}\n.drs-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}\n@media(max-width:600px){.drs-content{padding:12px 14px 10px}}\n@media(prefers-reduced-motion:reduce){.drs-panel,.drs-panel *,.drs-trigger *{animation:none!important;transition:none!important}}\n@media(prefers-reduced-motion:reduce){.drs-ultra-burst{display:none}}\n';

// src/core.js
var LEVELS = Object.freeze([
  { id: "off", name: "\u5173" },
  { id: "low", name: "\u8F7B\u5EA6" },
  { id: "high", name: "\u9AD8" },
  { id: "max", name: "Ultra" }
]);
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function findChoice(state) {
  for (const group of state.groups ?? []) {
    const model = group.models.find((m) => m.id === state.current?.model && group.id === state.current?.provider);
    if (model) return { group, model };
  }
}
function supportedTiers(model) {
  const ids = new Set(model?.reasoning?.efforts.map((e) => e.id) ?? []);
  return LEVELS.flatMap((level, i) => ids.has(level.id) ? [i] : []);
}
function currentTier(state, model) {
  const effort = state.current?.reasoningEffort ?? model?.reasoning?.defaultEffort;
  return LEVELS.findIndex((level) => level.id === effort);
}
function nearestTier(value, supported) {
  return supported.reduce((best, i) => Math.abs(i - value) < Math.abs(best - value) ? i : best, supported[0] ?? -1);
}
function selectionForModel(group, model, effort) {
  const next = model.reasoning?.efforts.some((e) => e.id === effort) ? effort : model.reasoning?.defaultEffort;
  return { provider: group.id, model: model.id, ...next === void 0 ? {} : { reasoningEffort: next } };
}
var PARTICLE_SPEED_RANGES = Object.freeze([
  Object.freeze([204, 220]),
  Object.freeze([188, 204]),
  Object.freeze([172, 188]),
  Object.freeze([156, 172])
]);
function makeParticle(width, height, depth, random = Math.random) {
  const layer = clamp(Math.round(depth * 3), 0, 3);
  const [minSpeed, maxSpeed] = PARTICLE_SPEED_RANGES[layer];
  return {
    x: width + 10 + random() * Math.max(12, width * 0.35),
    y: 5 + random() * (height - 10),
    depth,
    layer,
    speed: minSpeed + random() * (maxSpeed - minSpeed),
    radius: 0.45 + depth * 0.7875 + (random() - 0.5) * 0.1,
    opacity: clamp(0.24 + depth * 0.76 + (random() - 0.5) * 0.08, 0, 1),
    phase: random() * Math.PI * 2,
    driftAmplitude: 0.8 + depth * 0.8 + random() * 0.4,
    driftRate: 1.8 + random() * 0.8
  };
}

// src/particles.js
var HIGH_TARGET_COUNT = 12;
var ULTRA_TARGET_COUNT = 25;
var POOL_SIZE = 40;
var FLOW_RAMP_SECONDS = 0.8;
var LAYER_TRIGGER_DELAY_SECONDS = 0.035;
var LAYER_COUNT = 4;
var GOLDEN_FRACTION = 0.61803398875;
var easeInOutSine = (value) => (1 - Math.cos(Math.PI * value)) / 2;
var flowForLayer = (elapsed, layer, from = 0, to = 1) => {
  const localElapsed = elapsed - layer * LAYER_TRIGGER_DELAY_SECONDS;
  if (localElapsed <= 0) return from;
  const progress = clamp(localElapsed / FLOW_RAMP_SECONDS, 0, 1);
  return from + (to - from) * easeInOutSine(progress);
};
var smoothstep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
function readState(getState) {
  const value = typeof getState === "function" ? getState() : getState;
  if (value && typeof value === "object") {
    return { position: clamp(Number(value.position) || 0, 0, 3), powered: value.powered === true };
  }
  return { position: clamp(Number(value) || 0, 0, 3), powered: true };
}
function startParticles(canvas, getState = () => ({ position: 3, powered: false })) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0, previous = 0, elapsed = 0, width = 0, height = 0;
  let points = [], visible = true, transitionTo = 0, lastPowered = false;
  let transitionElapsed = FLOW_RAMP_SECONDS + (LAYER_COUNT - 1) * LAYER_TRIGGER_DELAY_SECONDS;
  let layerFlows = Array(LAYER_COUNT).fill(0), transitionFrom = Array(LAYER_COUNT).fill(0);
  const current = () => readState(getState);
  const boundaryFor = (position) => 14 + Math.max(0, width - 28) * position / 3;
  const trackEnd = () => Math.max(14, width - 14);
  const targetCount = (position) => {
    if (position <= 1) return 0;
    if (position < 2) return HIGH_TARGET_COUNT * (position - 1);
    return HIGH_TARGET_COUNT + (ULTRA_TARGET_COUNT - HIGH_TARGET_COUNT) * (position - 2);
  };
  function seed() {
    points = Array.from({ length: POOL_SIZE }, (_, i) => {
      const point = makeParticle(width, height, i % 4 / 3);
      point.x = 4 + (i * GOLDEN_FRACTION + Math.random() * 0.08) % 1 * Math.max(1, trackEnd() - 8);
      point.baseY = 5 + Math.random() * Math.max(1, height - 10);
      point.wanderX = 0;
      point.wanderY = 0;
      return point;
    });
  }
  function resize() {
    const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    paint(0);
  }
  function wander(point, dt) {
    const noise = Math.sqrt(dt);
    point.wanderX = clamp(point.wanderX * Math.max(0, 1 - dt * 0.48) + (Math.random() - 0.5) * 1.15 * noise, -2.5, 2.5);
    point.wanderY = clamp(point.wanderY * Math.max(0, 1 - dt * 0.58) + (Math.random() - 0.5) * 0.95 * noise, -2, 2);
  }
  function paint(dt) {
    const state = current(), boundary = boundaryFor(state.position);
    const visibleTarget = targetCount(state.position);
    const count = visibleTarget <= 0 ? 0 : Math.min(
      POOL_SIZE,
      visibleTarget * trackEnd() / Math.max(boundary, 1)
    );
    if (state.powered !== lastPowered) {
      lastPowered = state.powered;
      transitionFrom = [...layerFlows];
      transitionTo = state.powered ? 1 : 0;
      transitionElapsed = 0;
    }
    transitionElapsed = Math.min(
      FLOW_RAMP_SECONDS + (LAYER_COUNT - 1) * LAYER_TRIGGER_DELAY_SECONDS,
      transitionElapsed + dt
    );
    layerFlows = layerFlows.map((_, layer) => flowForLayer(transitionElapsed, layer, transitionFrom[layer], transitionTo));
    const speedScale = clamp((state.position - 1) / 2, 0, 1);
    elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    for (const point of points) {
      const flow = layerFlows[point.layer];
      wander(point, dt);
      point.x -= point.speed * speedScale * flow * dt;
      if (point.x < -point.radius * 3) {
        point.x = trackEnd() + Math.random() * 8;
        point.baseY = 5 + Math.random() * Math.max(1, height - 10);
        point.wanderX = 0;
        point.wanderY = 0;
      } else if (point.x > trackEnd() + 8) {
        point.x = trackEnd() + Math.random() * 8;
      }
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, boundary, height);
    ctx.clip();
    const rendered = points.slice(0, Math.ceil(count)).map((point, index) => ({ point, reveal: smoothstep(count - index) })).sort((a, b) => a.point.depth - b.point.depth);
    for (const { point, reveal } of rendered) {
      const flow = layerFlows[point.layer];
      const x = point.x + point.wanderX * (1 - flow);
      const y = point.baseY + point.wanderY + Math.sin(elapsed * point.driftRate + point.phase) * 0.35 * point.driftAmplitude;
      const alpha = point.opacity * reveal * clamp(x / 15, 0, 1) * clamp((boundary - x) / 10, 0, 1);
      const radius = point.radius * (2.1 + point.depth * 0.5);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(245,242,255,${alpha})`);
      gradient.addColorStop(0.38, `rgba(240,237,255,${alpha * 0.88})`);
      gradient.addColorStop(0.62, `rgba(234,231,255,${alpha * 0.28})`);
      gradient.addColorStop(1, "rgba(234,231,255,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function frame(time) {
    raf = 0;
    paint(previous ? Math.min((time - previous) / 1e3, 0.05) : 0);
    previous = time;
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    if (!document.hidden && visible) {
      if (reduced.matches) paint(0);
      else raf = requestAnimationFrame(frame);
    }
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  intersection.observe(canvas);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  resize();
  sync();
  return () => {
    cancelAnimationFrame(raf);
    observer.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
  };
}

// src/client.jsx
var import_jsx_runtime = require("react/jsx-runtime");
var Bolt = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 18 20", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M11.6 1.8 3.7 10.5h5.1l-1.1 7.7 7.8-9.2h-5.2z" }) });
var Chevron = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m4 6 4 4 4-4" }) });
function Particles({ position, powered }) {
  const ref = (0, import_react.useRef)(null);
  const stateRef = (0, import_react.useRef)({ position, powered });
  stateRef.current = { position, powered };
  (0, import_react.useEffect)(() => startParticles(ref.current, () => stateRef.current), []);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { className: "drs-particles", ref, "aria-hidden": "true" });
}
function UltraBurst({ x, y }) {
  const [points] = (0, import_react.useState)(() => Array.from({ length: 13 }, (_, i) => {
    const angle = (i + Math.random() * 0.75) / 13 * Math.PI * 2;
    const distance = 29 + Math.random() * 23;
    return {
      "--dx": `${Math.cos(angle) * distance}px`,
      "--dy": `${Math.sin(angle) * distance + 5}px`,
      "--size": `${2.5 + Math.random() * 2}px`,
      "--duration": `${650 + Math.random() * 200}ms`
    };
  }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-ultra-burst", "aria-hidden": "true", style: { left: x - 70, top: y - 70 }, children: points.map((style, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-burst-flight", style, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}) }, i)) });
}
function ReasoningSlider({ locked, available, directory, load, select }) {
  const state = (0, import_react.useSyncExternalStore)(directory.subscribe, directory.getSnapshot);
  const choice = findChoice(state), supported = supportedTiers(choice?.model);
  const actualTier = currentTier(state, choice?.model);
  const [open, setOpen] = (0, import_react.useState)(false), [modelsOpen, setModelsOpen] = (0, import_react.useState)(false);
  const [preview, setPreview] = (0, import_react.useState)(null), [position, setPosition] = (0, import_react.useState)(null);
  const [visual, setVisual] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)("");
  const [notice, setNotice] = (0, import_react.useState)(false), [leaving, setLeaving] = (0, import_react.useState)(false);
  const [edgeVisible, setEdgeVisible] = (0, import_react.useState)(false);
  const [burst, setBurst] = (0, import_react.useState)(null);
  const wasAtUltra = (0, import_react.useRef)(false), burstTimer = (0, import_react.useRef)(null), burstId = (0, import_react.useRef)(0);
  const [shimmer, setShimmer] = (0, import_react.useState)(false), [query, setQuery] = (0, import_react.useState)("");
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [powered, setPowered] = (0, import_react.useState)(() => {
    try {
      return localStorage.getItem("dsh-reasoning-slider.lightning") === "on";
    } catch {
      return false;
    }
  });
  const trigger = (0, import_react.useRef)(null), panel = (0, import_react.useRef)(null), hit = (0, import_react.useRef)(null), track = (0, import_react.useRef)(null);
  const modelButton = (0, import_react.useRef)(null), search = (0, import_react.useRef)(null), drag = (0, import_react.useRef)(null);
  const mounted = (0, import_react.useRef)(true), inFlight = (0, import_react.useRef)(false), noticeTimers = (0, import_react.useRef)([]);
  const id = (0, import_react.useId)(), tier = preview ?? actualTier;
  const previousTier = (0, import_react.useRef)(tier);
  const busy = saving || state.pending != null;
  const blocked = locked || !available || busy;
  const sliderUnavailable = locked || !available || supported.length === 0 || state.routable === false;
  const canSlide = !sliderUnavailable && !busy;
  const title = LEVELS[tier]?.name ?? state.retainedEffort ?? "\u9ED8\u8BA4";
  const modelName = choice?.model.name ?? state.current?.model ?? "\u9009\u62E9\u6A21\u578B";
  const sliderValue = clamp(visual ?? tier, 0, 3);
  const particleVisibility = clamp(sliderValue - 1, 0, 1);
  const ultraProgress = clamp(sliderValue - 2, 0, 1);
  const atUltra = sliderValue >= 2.995;
  (0, import_react.useEffect)(() => {
    const entered = atUltra && !wasAtUltra.current;
    wasAtUltra.current = atUltra;
    if (!open || tier !== 3) {
      clearTimeout(burstTimer.current);
      setBurst(null);
      return;
    }
    if (!entered || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimeout(burstTimer.current);
    const launch = () => {
      const thumb = track.current?.querySelector(".drs-thumb");
      if (!thumb || !panel.current) return;
      const t = thumb.getBoundingClientRect(), p = panel.current.getBoundingClientRect();
      setBurst({
        id: ++burstId.current,
        x: t.x + t.width / 2 - p.x - panel.current.clientLeft,
        y: t.y + t.height / 2 - p.y - panel.current.clientTop
      });
      burstTimer.current = setTimeout(() => setBurst(null), 900);
    };
    if (drag.current) launch();
    else burstTimer.current = setTimeout(launch, 280);
  }, [atUltra, open, tier]);
  (0, import_react.useEffect)(() => () => clearTimeout(burstTimer.current), []);
  function clearNotice() {
    noticeTimers.current.forEach(clearTimeout);
    noticeTimers.current = [];
    setNotice(false);
    setLeaving(false);
    setShimmer(false);
  }
  (0, import_react.useEffect)(() => {
    mounted.current = true;
    if (available) load();
    return () => {
      mounted.current = false;
      noticeTimers.current.forEach(clearTimeout);
    };
  }, [available, load]);
  (0, import_react.useEffect)(() => {
    const entered = previousTier.current !== 3 && tier === 3;
    previousTier.current = tier;
    if (tier !== 3 || !open) {
      clearNotice();
      setEdgeVisible(false);
      return;
    }
    if (!entered) {
      setEdgeVisible(true);
      return;
    }
    clearNotice();
    setEdgeVisible(false);
    setNotice(true);
    setShimmer(true);
    noticeTimers.current = [setTimeout(() => setEdgeVisible(true), 200), setTimeout(() => setShimmer(false), 1400), setTimeout(() => {
      setNotice(false);
      setLeaving(true);
      noticeTimers.current.push(setTimeout(() => setLeaving(false), 220));
    }, 2e3)];
  }, [tier, open]);
  function close(restore = false) {
    drag.current = null;
    setVisual(null);
    setPreview(null);
    setOpen(false);
    setModelsOpen(false);
    setQuery("");
    clearNotice();
    if (restore) trigger.current?.focus();
  }
  (0, import_react.useEffect)(() => {
    if (locked || !available) close();
  }, [locked, available]);
  (0, import_react.useLayoutEffect)(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const place = () => {
      if (!trigger.current || !panel.current) return;
      const t = trigger.current.getBoundingClientRect(), p = panel.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const width = viewport?.width ?? innerWidth, height = viewport?.height ?? innerHeight;
      const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
      const x = clamp(t.right - p.width, left + 12, Math.max(left + 12, left + width - p.width - 12));
      const y = t.top - p.height - 10 >= top + 12 ? t.top - p.height - 10 : clamp(t.bottom + 10, top + 12, Math.max(top + 12, top + height - p.height - 12));
      setPosition((previous) => previous?.left === x && previous?.top === y ? previous : { left: x, top: y });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(panel.current);
    observer.observe(trigger.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    const outside = (ev) => {
      if (!panel.current?.contains(ev.target) && !trigger.current?.contains(ev.target)) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  (0, import_react.useEffect)(() => {
    if (open) hit.current?.focus();
  }, [open]);
  (0, import_react.useEffect)(() => {
    if (modelsOpen) search.current?.focus();
  }, [modelsOpen]);
  async function submit(selection) {
    if (blocked || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await select(selection);
      if (result?.ok !== true) throw new Error(result?.error?.code === "session/writer-held" ? "\u6B64\u4F1A\u8BDD\u6B63\u5728\u5176\u4ED6\u7A97\u53E3\u4F7F\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" : result?.error?.message ?? "\u8BBE\u7F6E\u672A\u4FDD\u5B58\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setSaving(false);
        setPreview(null);
        setVisual(null);
      }
    }
  }
  function chooseTier(next) {
    if (!canSlide || !supported.includes(next) || !state.current) return;
    if (next === actualTier) {
      setPreview(null);
      setVisual(null);
      return;
    }
    setPreview(next);
    setVisual(null);
    void submit({ ...state.current, reasoningEffort: LEVELS[next].id });
  }
  function dragTo(clientX) {
    const d = drag.current;
    if (!d) return;
    const r = track.current.getBoundingClientRect();
    const raw = clamp((clientX - r.left - 14 - d.offset) / Math.max(1, r.width - 28) * 3, 0, 3);
    d.next = nearestTier(raw, supported);
    const distance = Math.abs(raw - d.next);
    setVisual(distance < 0.13 ? d.next + (raw - d.next) * Math.pow(distance / 0.13, 1.3) : raw);
    setPreview(d.next);
  }
  function pointerDown(ev) {
    if (!canSlide || !ev.isPrimary || ev.button !== 0 || drag.current) return;
    const r = track.current.getBoundingClientRect(), x = r.left + 14 + (r.width - 28) * Math.max(0, tier) / 3;
    drag.current = { pointer: ev.pointerId, offset: Math.abs(ev.clientX - x) < 19 ? ev.clientX - x : 0, next: actualTier };
    setModelsOpen(false);
    ev.currentTarget.focus();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    dragTo(ev.clientX);
    ev.preventDefault();
  }
  function finishDrag(ev, cancel = false) {
    if (drag.current?.pointer !== ev.pointerId) return;
    if (!cancel) dragTo(ev.clientX);
    const next = drag.current.next;
    drag.current = null;
    setVisual(null);
    if (cancel) setPreview(null);
    else chooseTier(next);
    if (ev.currentTarget.hasPointerCapture(ev.pointerId)) ev.currentTarget.releasePointerCapture(ev.pointerId);
  }
  function sliderKey(ev) {
    if (!canSlide) return;
    const at = supported.indexOf(tier);
    const keys = {
      ArrowRight: supported[Math.min(supported.length - 1, at + 1)],
      ArrowUp: supported[Math.min(supported.length - 1, at + 1)],
      ArrowLeft: supported[Math.max(0, at - 1)],
      ArrowDown: supported[Math.max(0, at - 1)],
      Home: supported[0],
      End: supported.at(-1)
    };
    if (ev.key in keys) {
      ev.preventDefault();
      chooseTier(keys[ev.key]);
    }
  }
  function panelKey(ev) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      ev.stopPropagation();
      if (modelsOpen) {
        setModelsOpen(false);
        modelButton.current?.focus();
      } else close(true);
    }
    if (ev.key === "Tab") {
      const focusable = [...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter((el) => getComputedStyle(el).visibility !== "hidden" && el.getClientRects().length);
      const at = focusable.indexOf(document.activeElement);
      if (focusable.length && (ev.shiftKey && at <= 0 || !ev.shiftKey && at === focusable.length - 1)) {
        ev.preventDefault();
        focusable[ev.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
  }
  function togglePower() {
    setPowered((value) => {
      try {
        localStorage.setItem("dsh-reasoning-slider.lightning", value ? "off" : "on");
      } catch {
      }
      return !value;
    });
  }
  const filteredGroups = (state.groups ?? []).map((group) => ({ ...group, models: group.models.filter((model) => `${model.name} ${model.id} ${group.name}`.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.models.length);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "drs-trigger",
        ref: trigger,
        disabled: locked || !available,
        "data-tier": actualTier,
        "aria-label": `\u6A21\u578B ${modelName}\uFF0C\u63A8\u7406\u5F3A\u5EA6 ${LEVELS[actualTier]?.name ?? "\u9ED8\u8BA4"}`,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: () => {
          if (open) close();
          else {
            setOpen(true);
            load();
          }
        },
        children: [
          powered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-pill-bolt", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bolt, {}) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-model-label", children: modelName }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-pill-tier", children: LEVELS[actualTier]?.name ?? state.retainedEffort ?? "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: busy || state.status === "loading" ? "drs-spinner" : "drs-chevron", children: !busy && state.status !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chevron, {}) })
        ]
      }
    ),
    open && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "section",
      {
        id,
        ref: panel,
        role: "dialog",
        "aria-label": "\u6A21\u578B\u4E0E\u63A8\u7406\u5F3A\u5EA6",
        className: "drs-panel",
        "data-tier": tier,
        "data-powered": powered,
        "data-dragging": visual !== null,
        "data-notice": notice || leaving,
        "data-edge": edgeVisible && tier === 3,
        style: { ...position ?? { visibility: "hidden", left: 0, top: 0 }, "--drs-particle-opacity": particleVisibility * 0.64, "--drs-ultra-progress": ultraProgress },
        onKeyDown: panelKey,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-edge-ring", "aria-hidden": "true" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-edge-glow", "aria-hidden": "true" }),
          burst && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UltraBurst, { x: burst.x, y: burst.y }, burst.id),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "drs-bolt", "aria-label": "\u5207\u6362\u95EA\u7535\u88C5\u9970", "aria-pressed": powered, onClick: togglePower, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bolt, {}) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "drs-content", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "drs-meter", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-title", children: title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  type: "button",
                  className: "drs-model",
                  ref: modelButton,
                  "aria-expanded": modelsOpen,
                  "aria-controls": `${id}-models`,
                  disabled: blocked,
                  onClick: () => setModelsOpen((value) => !value),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: modelName }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chevron, {})
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "span",
                {
                  role: "status",
                  className: `drs-notice${shimmer ? " drs-shimmer" : ""}`,
                  "data-visible": notice,
                  onAnimationEnd: (ev) => {
                    if (ev.animationName === "drs-shimmer") setShimmer(false);
                  },
                  children: [
                    notice || leaving ? "\u66F4\u5FEB\u6D88\u8017\u4F7F\u7528\u989D\u5EA6" : "",
                    shimmer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-notice-glint", "aria-hidden": "true", children: "\u66F4\u5FEB\u6D88\u8017\u4F7F\u7528\u989D\u5EA6" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: "drs-track drs-hit",
                ref: (node) => {
                  track.current = node;
                  hit.current = node;
                },
                style: { "--pos": Math.max(0, visual ?? tier) / 3 },
                "data-disabled": sliderUnavailable,
                role: "slider",
                tabIndex: 0,
                "aria-label": "\u63A8\u7406\u5F3A\u5EA6",
                "aria-valuemin": 0,
                "aria-valuemax": 3,
                "aria-valuenow": Math.max(0, tier),
                "aria-valuetext": title,
                "aria-disabled": !canSlide,
                onKeyDown: sliderKey,
                onPointerDown: pointerDown,
                onPointerMove: (ev) => {
                  if (drag.current?.pointer === ev.pointerId) dragTo(ev.clientX);
                },
                onPointerUp: (ev) => finishDrag(ev),
                onPointerCancel: (ev) => finishDrag(ev, true),
                onLostPointerCapture: (ev) => finishDrag(ev, true),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "drs-inner", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "drs-fill", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "drs-aurora" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, { position: sliderValue, powered }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "drs-ticks", children: LEVELS.map((level, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { "--i": i }, "data-supported": supported.includes(i), "data-reached": i <= tier }, level.id)) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "drs-thumb" })
                ]
              }
            ),
            busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-sr", role: "status", children: "\u6B63\u5728\u4FDD\u5B58\u8BBE\u7F6E" }),
            state.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "drs-sr", role: "status", children: "\u6B63\u5728\u52A0\u8F7D\u6A21\u578B\u2026" }),
            state.routable === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "drs-status", children: "\u5F53\u524D\u6A21\u578B\u4E0D\u53EF\u7528\uFF0C\u8BF7\u9009\u62E9\u5176\u4ED6\u6A21\u578B\u3002" }),
            !supported.length && state.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "drs-status", children: "\u6B64\u6A21\u578B\u4E0D\u652F\u6301\u8FD9\u56DB\u6863\u63A8\u7406\u5F3A\u5EA6\u3002" }),
            (error || state.error) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "drs-error", role: "alert", children: [
              error || state.error,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
                setError("");
                load();
              }, children: "\u91CD\u8BD5\u52A0\u8F7D" })
            ] }),
            !!state.failures?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "drs-status", children: [
              "\u90E8\u5206\u670D\u52A1\u5546\u52A0\u8F7D\u5931\u8D25\uFF0C\u53EF\u4F7F\u7528\u5DF2\u52A0\u8F7D\u7684\u6A21\u578B\u3002",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: load, children: "\u91CD\u8BD5" })
            ] }),
            modelsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { id: `${id}-models`, className: "drs-models", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ref: search, "aria-label": "\u641C\u7D22\u6A21\u578B", placeholder: "\u641C\u7D22\u6A21\u578B", value: query, onChange: (ev) => setQuery(ev.target.value) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { role: "menu", "aria-label": "\u9009\u62E9\u6A21\u578B", onKeyDown: (ev) => {
                if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(ev.key)) return;
                const options = [...ev.currentTarget.querySelectorAll("button:not(:disabled)")];
                if (!options.length) return;
                ev.preventDefault();
                const at = options.indexOf(document.activeElement);
                options[ev.key === "Home" ? 0 : ev.key === "End" ? options.length - 1 : (at + (ev.key === "ArrowDown" ? 1 : -1) + options.length) % options.length].focus();
              }, children: [
                filteredGroups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "drs-group", children: group.name ?? group.id }),
                  group.models.map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "button",
                    {
                      type: "button",
                      role: "menuitemradio",
                      disabled: blocked,
                      "aria-checked": state.current?.provider === group.id && state.current?.model === model.id,
                      onClick: () => {
                        setModelsOpen(false);
                        modelButton.current?.focus();
                        void submit(selectionForModel(group, model, LEVELS[tier]?.id));
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: model.name ?? model.id }),
                        state.current?.provider === group.id && state.current?.model === model.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u2713" })
                      ]
                    },
                    model.id
                  ))
                ] }, group.id)),
                !filteredGroups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "drs-status", children: "\u6CA1\u6709\u5339\u914D\u7684\u6A21\u578B" })
              ] })
            ] })
          ] })
        ]
      }
    ), document.body)
  ] });
}
var name = "reasoning-slider-client";
var inject = ["slots", "modelDirectories", "sessions", "remote", "remote.session"];
function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = "dsh-reasoning-slider";
    style.textContent = style_default;
    document.head.append(style);
    return () => style.remove();
  });
  ctx.inject(["slots", "modelDirectories"], (scope) => {
    scope.slots.inject("conversation.input.model", () => scope.slots.register({
      name: "conversation.input.model",
      priority: -100,
      inject: (sessionId) => {
        const directory = scope.modelDirectories.directoryFor(sessionId);
        const available = scope.sessions.subagentAddress(sessionId) === void 0;
        return {
          available,
          directory: directory.store,
          load: () => {
            if (available) void directory.load().catch(() => {
            });
          },
          select: (selection) => available ? directory.select(selection) : Promise.resolve({ ok: false, error: { message: "\u6B64\u4F1A\u8BDD\u4E0D\u652F\u6301\u6A21\u578B\u5207\u6362\u3002" } })
        };
      }
    }, ReasoningSlider));
  });
}

return module.exports;}});
