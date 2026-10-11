import React, { useEffect, useLayoutEffect, useRef, useState, useId, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import css from './style.css';
import { LEVELS, clamp, currentTier, findChoice, selectionForModel, supportedTiers } from './core.js';
import { startParticles } from './particles.js';

const Bolt = () => <svg viewBox="0 0 18 20" aria-hidden="true"><path d="M11.6 1.8 3.7 10.5h5.1l-1.1 7.7 7.8-9.2h-5.2z"/></svg>;
const Chevron = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>;

function Particles({ position, powered, persistence }) {
  const ref = useRef(null);
  const previousPosition = useRef(position);
  const hideTimer = useRef(null);
  const [canvasVisible, setCanvasVisible] = useState(() => position > 1);
  const stateRef = useRef({ position, powered });
  stateRef.current = { position, powered };
  useEffect(() => {
    clearTimeout(hideTimer.current);
    const wasVisibleTier = previousPosition.current > 1;
    if (position > 1) setCanvasVisible(true);
    else if (wasVisibleTier) {
      // Keep the canvas painted while the particle renderer performs its
      // ordered far-to-near fade. The layer state reaches zero after .8s.
      setCanvasVisible(true);
       hideTimer.current = setTimeout(() => setCanvasVisible(false), 900);
    } else setCanvasVisible(false);
    previousPosition.current = position;
    return () => clearTimeout(hideTimer.current);
  }, [position]);
  useEffect(() => startParticles(ref.current, () => stateRef.current, {
    restore: persistence.current,
    onSuspend: snapshot => { persistence.current = snapshot; },
  }), [persistence]);
  const canvasOpacity = position > 1 ? clamp(position - 1, 0, 1) * .64 : canvasVisible ? .64 : 0;
  return <canvas className="drs-particles" ref={ref} aria-hidden="true"
    style={{ '--drs-particle-opacity': canvasOpacity }}/>;
}

// CHROMA-style flow field: the canvas keeps its own clock so hiding and
// reopening the panel does not restart the visual state.
function ChromaAurora() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const vertexSource = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
      const fragmentSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      // CHROMA's Aurora palette: the track should read as luminous colour,
      // with the underlying blue fill only showing through the soft reveal.
      const vec3 A=vec3(0.467,0.318,1.0);
      const vec3 B=vec3(0.176,0.788,1.0);
      const vec3 C=vec3(1.0,0.384,0.694);
      float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash21(i),hash21(i+vec2(1.0,0.0)),f.x),mix(hash21(i+vec2(0.0,1.0)),hash21(i+vec2(1.0,1.0)),f.x),f.y);}
      float fbm(vec2 p){float value=0.0,amp=0.5;mat2 rot=mat2(0.80,-0.60,0.60,0.80);for(int i=0;i<4;i++){value+=amp*noise(p);p=rot*p*2.02+vec2(13.7,9.2);amp*=0.5;}return value;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution, p=(uv-.5)*vec2(u_resolution.x/max(1.0,u_resolution.y),1.0);
        p.y*=1.65;
        // The track is only a few pixels tall, so the field needs a little
        // more temporal travel than the full-size CHROMA artwork to remain
        // visibly alive at this scale.
        // The reference CHROMA page uses several slowly travelling fields. The
        // slider is much narrower, so the temporal travel and warp are lifted
        // slightly to keep the same silky motion visible at 28px tall.
        float t=u_time*2.15;
        float n1=fbm(p*1.06+vec2(t*.23,-t*.15));
        float n2=fbm(p*1.18+vec2(3.7-t*.17,6.1+t*.12));
        vec2 q=p+(vec2(n1,n2)-.5)*vec2(1.62,1.24);
        q+=vec2(sin(p.y*1.45+t*.13),cos(p.x*1.25-t*.11))*.18;
        float f1=fbm(q*1.17+vec2(t*.095,-t*.076));
        float f2=fbm(q*1.83+vec2(-t*.11,t*.085));
        float f3=noise(q*2.52+vec2(t*.065,2.0-t*.05));
        float field=f1*.55+f2*.31+f3*.14;
        float chroma=smoothstep(.16,.84,f1*.66+f2*.34);
        vec3 color=mix(B,A,chroma);
        float rose=smoothstep(.28,.76,f2*.62+f3*.38+.08*sin(q.y*2.0+t*.055));
        color=mix(color,C,rose*.78);
        // Keep a broad, bright body while reserving a little variation for
        // the narrow silk-like highlights described by CHROMA.
        float breath=.92+.08*sin(t*.31-.8);
        float centerGlow=exp(-pow((uv.y-.52)*1.42,2.0));
        float structure=.78+smoothstep(.18,.82,field)*.30;
        float highlight=pow(max(0.0,field-.40),2.0)*1.55;
        float threads=pow(max(0.0,.5+.5*sin(q.x*1.55+q.y*.76+f1*3.2+sin(q.y*1.65-t*.13)*.9)),11.0);
        float swell=.5+.5*sin(t*.24+f1*2.0-f2);
        vec3 result=color*(structure+highlight*.32)*breath*(.98+centerGlow*.12);
        result+=color*swell*.055+vec3(1.0)*threads*.13;
        // A slightly translucent output lets the blue track remain a soft
        // base at the feathered reveal edge instead of creating a dark slab.
        gl_FragColor=vec4(clamp(result,0.0,1.0),.88);
      }`;
    const compile = (type, source) => {
      const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { canvas.dataset.drsShaderError = gl.getShaderInfoLog(shader) || 'compile'; gl.deleteShader(shader); return null; }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource), fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;
    const program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.dataset.drsShaderError = gl.getProgramInfoLog(program) || 'link'; return; }
    canvas.dataset.drsReady = 'true';
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    const resolution = gl.getUniformLocation(program, 'u_resolution'), time = gl.getUniformLocation(program, 'u_time');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = performance.now(), elapsed = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), scale = Math.min(devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * scale)), height = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
    };
    const draw = now => {
      resize();
      const delta = Math.min((now - last) / 1000, .05); last = now;
      // Keep the CHROMA field continuous while running it at 1.5x playback
      // speed so the narrow track reads as visibly alive.
      if (!reduce.matches) elapsed += delta * 1.728;
      gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolution, canvas.width, canvas.height); gl.uniform1f(time, elapsed); gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.drsTime = elapsed.toFixed(3);
      frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); gl.deleteProgram(program); gl.deleteBuffer(buffer); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, []);
  return <canvas className="drs-aurora-canvas" ref={ref} aria-hidden="true"/>;
}

function UltraBurst({ x, y }) {
  const [points] = useState(() => Array.from({ length: 13 }, (_, i) => {
    const angle = (i + Math.random() * .75) / 13 * Math.PI * 2;
    const distance = 29 + Math.random() * 23;
    return { '--dx': `${Math.cos(angle) * distance}px`, '--dy': `${Math.sin(angle) * distance + 5}px`,
      '--size': `${2.5 + Math.random() * 2}px`, '--duration': `${650 + Math.random() * 200}ms` };
  }));
  return <span className="drs-ultra-burst" aria-hidden="true" style={{ left: x - 70, top: y - 70 }}>
    {points.map((style, i) => <span className="drs-burst-flight" key={i} style={style}><i/></span>)}
  </span>;
}

export function ReasoningSlider({ locked, available, directory, load, select }) {
  const state = useSyncExternalStore(directory.subscribe, directory.getSnapshot);
  const choice = findChoice(state), supported = supportedTiers(choice?.model);
  const actualTier = currentTier(state, choice?.model);
  const [open, setOpen] = useState(false), [panelMounted, setPanelMounted] = useState(false), [modelsOpen, setModelsOpen] = useState(false);
  const [preview, setPreview] = useState(null), [position, setPosition] = useState(null);
  const [visual, setVisual] = useState(null), [error, setError] = useState('');
  const [notice, setNotice] = useState(false), [leaving, setLeaving] = useState(false);
  const [edgeVisible, setEdgeVisible] = useState(false);
  const [burst, setBurst] = useState(null);
  const wasAtUltra = useRef(false), burstTimer = useRef(null), burstId = useRef(0);
  const [shimmer, setShimmer] = useState(false), [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const particlePersistence = useRef(null);
  const [powered, setPowered] = useState(() => {
    try { return localStorage.getItem('dsh-reasoning-slider.lightning') === 'on'; } catch { return false; }
  });
  const trigger = useRef(null), panel = useRef(null), hit = useRef(null), track = useRef(null);
  const modelButton = useRef(null), search = useRef(null), drag = useRef(null);
  const mounted = useRef(true), inFlight = useRef(false), noticeTimers = useRef([]);
  const id = useId(), tier = preview ?? actualTier;
  const previousTier = useRef(tier);
  const busy = saving || state.pending != null;
  const blocked = locked || !available || busy;
  const sliderUnavailable = locked || !available || supported.length === 0 || state.routable === false;
  const canSlide = !sliderUnavailable && !busy;
  const title = LEVELS[tier]?.name ?? state.retainedEffort ?? '默认';
  const modelName = choice?.model.name ?? state.current?.model ?? '选择模型';
  const sliderValue = clamp(visual ?? tier, 0, 3);
  const particleVisibility = clamp(sliderValue - 1, 0, 1);
  const ultraProgress = clamp(sliderValue - 2, 0, 1);
  const atUltra = sliderValue >= 2.995;

  useEffect(() => {
    const entered = atUltra && !wasAtUltra.current;
    wasAtUltra.current = atUltra;
    if (!open || tier !== 3) { clearTimeout(burstTimer.current); setBurst(null); return; }
    if (!entered || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearTimeout(burstTimer.current);
    const launch = () => {
      const thumb = track.current?.querySelector('.drs-thumb');
      if (!thumb || !panel.current) return;
      const t = thumb.getBoundingClientRect(), p = panel.current.getBoundingClientRect();
      setBurst({ id: ++burstId.current, x: t.x + t.width / 2 - p.x - panel.current.clientLeft,
        y: t.y + t.height / 2 - p.y - panel.current.clientTop });
      burstTimer.current = setTimeout(() => setBurst(null), 900);
    };
    const waitForEndpoint = () => {
      const thumb = track.current?.querySelector('.drs-thumb');
      const trackBox = track.current?.getBoundingClientRect();
      const thumbBox = thumb?.getBoundingClientRect();
      if (trackBox && thumbBox) {
        const expected = trackBox.right - 14;
        const actual = thumbBox.left + thumbBox.width / 2;
        if (Math.abs(actual - expected) <= 2) { launch(); return; }
      }
      burstTimer.current = setTimeout(waitForEndpoint, 16);
    };
    // A discrete drag can preview Ultra before the thumb finishes its snap.
    // The snap itself takes 170ms. Start checking when that movement can have
    // completed, then launch on the first endpoint frame without another wait.
    burstTimer.current = setTimeout(waitForEndpoint, 170);
  }, [atUltra, open, tier]);
  useEffect(() => () => clearTimeout(burstTimer.current), []);

  function clearNotice() {
    noticeTimers.current.forEach(clearTimeout); noticeTimers.current = [];
    setNotice(false); setLeaving(false); setShimmer(false);
  }
  useEffect(() => {
    mounted.current = true;
    if (available) load();
    return () => { mounted.current = false; noticeTimers.current.forEach(clearTimeout); };
  }, [available, load]);
  useEffect(() => {
    const entered = previousTier.current !== 3 && tier === 3;
    previousTier.current = tier;
    if (tier !== 3 || !open) { clearNotice(); setEdgeVisible(false); return; }
    if (!entered) { setEdgeVisible(true); return; }
    clearNotice(); setEdgeVisible(false); setNotice(true); setShimmer(true);
    noticeTimers.current = [setTimeout(() => setEdgeVisible(true), 200), setTimeout(() => setShimmer(false), 1400), setTimeout(() => {
      setNotice(false); setLeaving(true);
      noticeTimers.current.push(setTimeout(() => setLeaving(false), 220));
    }, 2000)];
  }, [tier, open]);
  function close(restore = false) {
    drag.current = null; setVisual(null); setPreview(null);
    setOpen(false); setModelsOpen(false); setQuery(''); clearNotice();
    if (restore) trigger.current?.focus();
  }
  useEffect(() => {
    if (locked || !available) close();
  }, [locked, available]);
  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    const place = () => {
      if (!trigger.current || !panel.current) return;
      const t = trigger.current.getBoundingClientRect(), p = panel.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const width = viewport?.width ?? innerWidth, height = viewport?.height ?? innerHeight;
      const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0;
      const x = clamp(t.right - p.width, left + 12, Math.max(left + 12, left + width - p.width - 12));
      const y = t.top - p.height - 10 >= top + 12 ? t.top - p.height - 10 : clamp(t.bottom + 10, top + 12, Math.max(top + 12, top + height - p.height - 12));
      setPosition(previous => previous?.left === x && previous?.top === y ? previous : { left: x, top: y });
    };
    place();
    const observer = new ResizeObserver(place); observer.observe(panel.current); observer.observe(trigger.current);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    const outside = ev => {
      if (!panel.current?.contains(ev.target) && !trigger.current?.contains(ev.target)) close();
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place); document.removeEventListener('pointerdown', outside);
    };
  }, [open]);
  useEffect(() => { if (open) hit.current?.focus(); }, [open]);
  useEffect(() => { if (modelsOpen) search.current?.focus(); }, [modelsOpen]);

  async function submit(selection) {
    if (blocked || inFlight.current) return;
    inFlight.current = true; setSaving(true); setError('');
    try {
      const result = await select(selection);
      if (result?.ok !== true) throw new Error(result?.error?.code === 'session/writer-held' ? '此会话正在其他窗口使用，请稍后重试。' : result?.error?.message ?? '设置未保存，请重试。');
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      inFlight.current = false;
      if (mounted.current) { setSaving(false); setPreview(null); setVisual(null); }
    }
  }
  function chooseTier(next) {
    if (!canSlide || !supported.includes(next) || !state.current) return;
    if (next === actualTier) { setPreview(null); setVisual(null); return; }
    setPreview(next); setVisual(null);
    void submit({ ...state.current, reasoningEffort: LEVELS[next].id });
  }
  function dragTo(clientX) {
    const d = drag.current;
    if (!d) return;
    const r = track.current.getBoundingClientRect();
    const raw = clamp((clientX - r.left - 14 - d.offset) / Math.max(1, r.width - 28) * 3, 0, 3);
    let target = d.next;
    let index = supported.indexOf(target);
    if (index < 0) return;
    // The thumb stays on its current supported tier until the pointer crosses
    // the midpoint to an adjacent tier. Multiple crossed midpoints are applied
    // in one event so a fast drag still lands on the intended discrete tier.
    while (raw > target && index < supported.length - 1) {
      const next = supported[index + 1];
      if (raw < (target + next) / 2) break;
      target = next; index += 1;
    }
    while (raw < target && index > 0) {
      const previous = supported[index - 1];
      if (raw > (previous + target) / 2) break;
      target = previous; index -= 1;
    }
    d.next = target;
    setVisual(target);
    setPreview(target);
  }
  function pointerDown(ev) {
    if (!canSlide || !ev.isPrimary || ev.button !== 0 || drag.current) return;
    const r = track.current.getBoundingClientRect(), x = r.left + 14 + (r.width - 28) * Math.max(0, tier) / 3;
    drag.current = { pointer: ev.pointerId, offset: Math.abs(ev.clientX - x) < 19 ? ev.clientX - x : 0, next: actualTier };
    setModelsOpen(false); ev.currentTarget.focus(); ev.currentTarget.setPointerCapture(ev.pointerId); dragTo(ev.clientX); ev.preventDefault();
  }
  function finishDrag(ev, cancel = false) {
    if (drag.current?.pointer !== ev.pointerId) return;
    if (!cancel) dragTo(ev.clientX);
    const next = drag.current.next;
    drag.current = null; setVisual(null);
    if (cancel) setPreview(null); else chooseTier(next);
    if (ev.currentTarget.hasPointerCapture(ev.pointerId)) ev.currentTarget.releasePointerCapture(ev.pointerId);
  }
  function sliderKey(ev) {
    if (!canSlide) return;
    const at = supported.indexOf(tier);
    const keys = { ArrowRight: supported[Math.min(supported.length - 1, at + 1)], ArrowUp: supported[Math.min(supported.length - 1, at + 1)],
      ArrowLeft: supported[Math.max(0, at - 1)], ArrowDown: supported[Math.max(0, at - 1)], Home: supported[0], End: supported.at(-1) };
    if (ev.key in keys) { ev.preventDefault(); chooseTier(keys[ev.key]); }
  }
  function panelKey(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault(); ev.stopPropagation();
      if (modelsOpen) { setModelsOpen(false); modelButton.current?.focus(); } else close(true);
    }
    if (ev.key === 'Tab') {
      const focusable = [...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(el => getComputedStyle(el).visibility !== 'hidden' && el.getClientRects().length);
      const at = focusable.indexOf(document.activeElement);
      if (focusable.length && ((ev.shiftKey && at <= 0) || (!ev.shiftKey && at === focusable.length - 1))) {
        ev.preventDefault(); focusable[ev.shiftKey ? focusable.length - 1 : 0].focus();
      }
    }
  }
  function togglePower() {
    setPowered(value => {
      try { localStorage.setItem('dsh-reasoning-slider.lightning', value ? 'off' : 'on'); } catch {}
      return !value;
    });
  }
  const filteredGroups = (state.groups ?? []).map(group => ({ ...group, models: group.models.filter(model => `${model.name} ${model.id} ${group.name}`.toLowerCase().includes(query.toLowerCase())) })).filter(group => group.models.length);
  return <>
    <button type="button" className="drs-trigger" ref={trigger} disabled={locked || !available} data-tier={actualTier}
      aria-label={`模型 ${modelName}，推理强度 ${LEVELS[actualTier]?.name ?? '默认'}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}
      onClick={() => { if (open) close(); else { setPanelMounted(true); setOpen(true); load(); } }}>
      {powered && <span className="drs-pill-bolt"><Bolt/></span>}
      <span className="drs-model-label">{modelName}</span><span className="drs-pill-tier">{LEVELS[actualTier]?.name ?? state.retainedEffort ?? ''}</span>
      <span className={busy || state.status === 'loading' ? 'drs-spinner' : 'drs-chevron'}>{!busy && state.status !== 'loading' && <Chevron/>}</span>
    </button>
    {panelMounted && createPortal(<section id={id} ref={panel} role="dialog" aria-label="模型与推理强度" aria-hidden={!open} inert={!open ? '' : undefined} className="drs-panel" data-open={open} data-tier={tier}
      data-powered={powered} data-dragging={visual !== null} data-notice={notice || leaving} data-edge={edgeVisible && tier === 3}
      style={{ ...(position ?? { visibility: 'hidden', left: 0, top: 0 }), '--drs-particle-opacity': particleVisibility * .64, '--drs-ultra-progress': ultraProgress }} onKeyDown={panelKey}>
      <span className="drs-edge-ring" aria-hidden="true"/>
      <span className="drs-edge-glow" aria-hidden="true"/>
      {burst && <UltraBurst key={burst.id} x={burst.x} y={burst.y}/>}
      <button type="button" className="drs-bolt" aria-label="切换闪电装饰" aria-pressed={powered} onClick={togglePower}><Bolt/></button>
      <div className="drs-content">
      <div className="drs-meter">
        <span className="drs-title">{title}</span>
        <button type="button" className="drs-model" ref={modelButton} aria-expanded={modelsOpen} aria-controls={`${id}-models`} disabled={blocked}
          onClick={() => setModelsOpen(value => !value)}><span>{modelName}</span><Chevron/></button>
        <span role="status" className={`drs-notice${shimmer ? ' drs-shimmer' : ''}`} data-visible={notice}
          onAnimationEnd={ev => { if (ev.animationName === 'drs-shimmer') setShimmer(false); }}>{notice || leaving ? '更快消耗使用额度' : ''}
          {shimmer && <span className="drs-notice-glint" aria-hidden="true">更快消耗使用额度</span>}</span>
      </div>
      <div className="drs-track drs-hit" ref={node => { track.current = node; hit.current = node; }} style={{ '--pos': Math.max(0, visual ?? tier) / 3 }} data-disabled={sliderUnavailable}
        role="slider" tabIndex={0} aria-label="推理强度" aria-valuemin={0} aria-valuemax={3} aria-valuenow={Math.max(0, tier)} aria-valuetext={title}
        aria-disabled={!canSlide} onKeyDown={sliderKey} onPointerDown={pointerDown}
        onPointerMove={ev => { if (drag.current?.pointer === ev.pointerId) dragTo(ev.clientX); }}
        onPointerUp={ev => finishDrag(ev)} onPointerCancel={ev => finishDrag(ev, true)} onLostPointerCapture={ev => finishDrag(ev, true)}>
        <div className="drs-inner"><div className="drs-fill"><div className="drs-aurora"><ChromaAurora/></div></div><Particles position={sliderValue} powered={powered} persistence={particlePersistence}/>
          <div className="drs-ticks">{LEVELS.map((level, i) => <i key={level.id} style={{ '--i': i }} data-supported={supported.includes(i)} data-reached={i <= tier}/>)}</div>
        </div>
        <div className="drs-thumb"/>
      </div>
      {busy && <span className="drs-sr" role="status">正在保存设置</span>}
      {state.status === 'loading' && <span className="drs-sr" role="status">正在加载模型…</span>}
      {state.routable === false && <p className="drs-status">当前模型不可用，请选择其他模型。</p>}
      {!supported.length && state.status === 'ready' && <p className="drs-status">此模型不支持这四档推理强度。</p>}
      {(error || state.error) && <div className="drs-error" role="alert">{error || state.error}<button type="button" onClick={() => { setError(''); load(); }}>重试加载</button></div>}
      {!!state.failures?.length && <p className="drs-status">部分服务商加载失败，可使用已加载的模型。<button type="button" onClick={load}>重试</button></p>}
      {modelsOpen && <div id={`${id}-models`} className="drs-models">
        <input ref={search} aria-label="搜索模型" placeholder="搜索模型" value={query} onChange={ev => setQuery(ev.target.value)}/>
        <div role="menu" aria-label="选择模型" onKeyDown={ev => {
          if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(ev.key)) return;
          const options = [...ev.currentTarget.querySelectorAll('button:not(:disabled)')]; if (!options.length) return;
          ev.preventDefault(); const at = options.indexOf(document.activeElement);
          options[ev.key === 'Home' ? 0 : ev.key === 'End' ? options.length - 1 : (at + (ev.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length].focus();
        }}>
          {filteredGroups.map(group => <div key={group.id}>
            <div className="drs-group">{group.name ?? group.id}</div>
            {group.models.map(model => <button type="button" role="menuitemradio" key={model.id} disabled={blocked}
              aria-checked={state.current?.provider === group.id && state.current?.model === model.id}
              onClick={() => { setModelsOpen(false); modelButton.current?.focus(); void submit(selectionForModel(group, model, LEVELS[tier]?.id)); }}>
              <span>{model.name ?? model.id}</span>{state.current?.provider === group.id && state.current?.model === model.id && <span aria-hidden="true">✓</span>}
            </button>)}
          </div>)}
          {!filteredGroups.length && <p className="drs-status">没有匹配的模型</p>}
        </div>
      </div>}
      </div>
    </section>, document.body)}
  </>;
}

export const name = 'reasoning-slider-client';
export const inject = ['slots', 'modelDirectories', 'sessions', 'remote', 'remote.session'];
export function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement('style'); style.dataset.plugin = 'dsh-reasoning-slider'; style.textContent = css;
    document.head.append(style); return () => style.remove();
  });
  ctx.inject(['slots', 'modelDirectories'], scope => {
    scope.slots.inject('conversation.input.model', () => scope.slots.register({
      name: 'conversation.input.model', priority: -100,
      inject: sessionId => {
        const directory = scope.modelDirectories.directoryFor(sessionId);
        const available = scope.sessions.subagentAddress(sessionId) === undefined;
        return {
          available, directory: directory.store,
          load: () => { if (available) void directory.load().catch(() => {}); },
          select: selection => available ? directory.select(selection) : Promise.resolve({ ok: false, error: { message: '此会话不支持模型切换。' } }),
        };
      },
    }, ReasoningSlider));
  });
}
