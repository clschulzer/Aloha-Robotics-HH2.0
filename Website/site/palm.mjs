/**
 * ALOHA palm exhibit. Original geometry + native WebGL, no runtime dependency.
 * TALOS (https://github.com/ibrahimify/talos) informed the restrained exhibit
 * composition; no TALOS source or geometry is included here.
 *
 * mountPalm(element, { reducedMotion: boolean })
 *   -> { setTechnical(boolean), setPaused(boolean), destroy() }
 */
const FALLBACK = new URL('./palm-fallback.svg', import.meta.url).href;
const TAU = Math.PI * 2;
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const mix = (a, b, t) => a + (b - a) * t;
const add = (a, b) => a.map((v, i) => v + b[i]);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const mul = (a, n) => a.map(v => v * n);
const dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = a => mul(a, 1 / (Math.hypot(...a) || 1));
const color = (hex, alpha = 1) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).concat(alpha);

const VERTEX = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aMotion;
uniform mat4 uViewProjection;
uniform float uTime;
uniform float uMotion;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
void main() {
  vec3 p = aPosition;
  float height = pow(max(p.y - 0.18, 0.0) / 3.0, 2.0);
  p.x += sin(uTime * 0.48) * height * 0.045 * uMotion;
  p.z += cos(uTime * 0.41) * height * 0.025 * uMotion;
  p.y += sin(uTime * 0.72 + aMotion.y) * aMotion.x * 0.022 * uMotion;
  p.x += cos(uTime * 0.65 + aMotion.y) * aMotion.x * 0.018 * uMotion;
  vPosition = p;
  vNormal = aNormal;
  vColor = aColor;
  gl_Position = uViewProjection * vec4(p, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uEye;
uniform float uTechnical;
uniform float uLines;
uniform float uUnlit;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec4 vColor;
void main() {
  if (uLines > 0.5) {
    gl_FragColor = vec4(0.08, 0.26, 0.23, uTechnical * 0.56);
    return;
  }
  vec3 normal = normalize(vNormal);
  if (!gl_FrontFacing) normal = -normal;
  vec3 sun = normalize(vec3(-3.0, 7.0, 5.0));
  float diffuse = max(dot(normal, sun), 0.0);
  float hemisphere = normal.y * 0.11 + 0.82;
  float rim = pow(1.0 - max(dot(normal, normalize(uEye - vPosition)), 0.0), 3.0);
  vec3 lit = vColor.rgb * (hemisphere + diffuse * 0.28);
  lit += vec3(0.12, 0.11, 0.07) * rim * 0.18;
  lit = mix(lit, vColor.rgb, uUnlit);
  vec3 technical = mix(vec3(0.94, 0.93, 0.88), vColor.rgb, 0.12);
  lit = mix(lit, technical, uTechnical * (1.0 - uUnlit));
  gl_FragColor = vec4(lit, vColor.a);
}`;

class Geometry {
  constructor() {
    this.vertices = [];
    this.edges = new Map();
  }
  triangle(a, b, c, tint, motion = [[0, 0], [0, 0], [0, 0]], vertexColors) {
    const normal = unit(cross(sub(b, a), sub(c, a)));
    const points = [a, b, c];
    for (let i = 0; i < 3; i++) {
      this.vertices.push(...points[i], ...normal, ...(vertexColors?.[i] || tint), ...motion[i]);
      const j = (i + 1) % 3;
      const ids = [points[i], points[j]].map(p => p.map(n => n.toFixed(5)).join(','));
      const key = ids.slice().sort().join('|');
      if (!this.edges.has(key)) this.edges.set(key, [
        ...points[i], 0, 1, 0, 0, 0, 0, 1, ...motion[i],
        ...points[j], 0, 1, 0, 0, 0, 0, 1, ...motion[j],
      ]);
    }
  }
  quad(a, b, c, d, tint, motion = [[0, 0], [0, 0], [0, 0], [0, 0]]) {
    this.triangle(a, b, c, tint, motion.slice(0, 3));
    this.triangle(a, c, d, tint, [motion[0], motion[2], motion[3]]);
  }
  get array() { return new Float32Array(this.vertices); }
  get lines() { return new Float32Array([...this.edges.values()].flat()); }
}

function cylinder(mesh, a, b, radiusA, radiusB, tint, segments = 12) {
  const axis = unit(sub(b, a));
  const u = unit(cross(axis, Math.abs(axis[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
  const v = cross(axis, u);
  const ring = (center, radius, angle) => add(center, add(mul(u, Math.cos(angle) * radius), mul(v, Math.sin(angle) * radius)));
  for (let i = 0; i < segments; i++) {
    const angle = i / segments * TAU, next = (i + 1) / segments * TAU;
    const p = ring(a, radiusA, angle), q = ring(a, radiusA, next);
    const r = ring(b, radiusB, next), s = ring(b, radiusB, angle);
    mesh.quad(p, q, r, s, tint);
    mesh.triangle(a, q, p, tint); mesh.triangle(b, s, r, tint);
  }
}

function ring(mesh, radius, width, y, tint, segments = 96, start = 0, end = TAU) {
  for (let i = 0; i < segments; i++) {
    const a = mix(start, end, i / segments), b = mix(start, end, (i + 1) / segments);
    const p = (r, angle) => [Math.cos(angle) * r, y, Math.sin(angle) * r];
    mesh.quad(p(radius - width / 2, a), p(radius - width / 2, b), p(radius + width / 2, b), p(radius + width / 2, a), tint);
  }
}

function orb(mesh, center, radius, tint, stretch = [1, 1, 1]) {
  const point = (latitude, longitude) => add(center, [
    Math.cos(latitude) * Math.cos(longitude) * radius * stretch[0],
    Math.sin(latitude) * radius * stretch[1],
    Math.cos(latitude) * Math.sin(longitude) * radius * stretch[2],
  ]);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + j / 6 * Math.PI, b = -Math.PI / 2 + (j + 1) / 6 * Math.PI;
    const u = i / 10 * TAU, v = (i + 1) / 10 * TAU;
    mesh.quad(point(a, u), point(a, v), point(b, v), point(b, u), tint);
  }
}

function buildExhibit() {
  const sculpture = new Geometry(), furniture = new Geometry(), shadow = new Geometry(), guides = new Geometry();
  const sand = color('#e5cfaa'), porcelain = color('#efeadb');
  cylinder(furniture, [0, -0.03, 0], [0, 0.09, 0], 1.13, 1.13, sand, 96);
  cylinder(furniture, [0, 0.09, 0], [0, 0.115, 0], 1.13, 1.105, porcelain, 96);
  ring(furniture, 1.07, 0.014, 0.119, color('#bbac8c'));
  ring(furniture, 0.97, 0.006, 0.12, color('#d4c7ac'));
  ring(furniture, 1.132, 0.016, 0.028, color('#ce6144'));

  // Fine index marks make the plinth feel like an engineering exhibit.
  for (let i = 0; i < 48; i++) {
    const angle = i / 48 * TAU, length = i % 4 === 0 ? 0.065 : 0.023;
    const r = [Math.cos(angle), 0, Math.sin(angle)], tangent = [-r[2], 0, r[0]];
    const p = mul(r, 1.04), q = mul(r, 1.04 - length);
    p[1] = q[1] = 0.121;
    furniture.quad(add(p, mul(tangent, 0.002)), add(q, mul(tangent, 0.002)), add(q, mul(tangent, -0.002)), add(p, mul(tangent, -0.002)), color('#a9a38c'));
  }

  // An actual translucent ground shadow, with a radial falloff.
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU, b = (i + 1) / 72 * TAU;
    const p = (r, t) => [Math.cos(t) * r, -0.049, Math.sin(t) * r * 0.92];
    const inner = color('#52685c', 0.12), outer = color('#52685c', 0);
    shadow.triangle(p(0.72, a), p(1.44, a), p(1.44, b), inner, undefined, [inner, outer, outer]);
    shadow.triangle(p(0.72, a), p(1.44, b), p(0.72, b), inner, undefined, [inner, outer, inner]);
  }

  const trunk = t => [-0.33 + 0.73 * t * t - 0.18 * t * t * t, 0.125 + t * 2.18, 0.06 + Math.sin(t * Math.PI) * 0.11];
  for (let i = 0; i < 24; i++) {
    const t = i / 24, next = (i + 1) / 24;
    const a = trunk(t), b = trunk(next);
    const ra = mix(0.115, 0.062, t), rb = mix(0.115, 0.062, next);
    cylinder(sculpture, a, b, ra, rb, color(i % 3 === 0 ? '#a88659' : i % 3 === 1 ? '#ba9967' : '#c1a273'), 10);
    const rimA = trunk(t + 0.01), rimB = trunk(t + 0.029);
    cylinder(sculpture, rimA, rimB, ra * 1.06, ra * 1.04, color('#8e7954'), 10);
  }
  const crown = trunk(1);
  cylinder(sculpture, add(crown, [0, -0.1, 0]), add(crown, [0, 0.22, 0]), 0.1, 0.066, color('#718a54'), 10);
  const leaves = ['#1d5148', '#286957', '#326e59', '#174c43', '#3b785f', '#255d50'];

  // Ten separate pinnate fronds: a curved central rib with paired folded
  // leaflets. Every leaf is a small 3D faceted blade, not a billboard.
  for (let frond = 0; frond < 10; frond++) {
    const theta = frond / 10 * TAU + 0.14;
    const radial = [Math.cos(theta), 0, Math.sin(theta)], side = [-Math.sin(theta), 0, Math.cos(theta)];
    const length = 1.35 + (frond % 3) * 0.15;
    const rise = 0.46 + (frond % 2) * 0.14;
    const droop = frond % 3 === 0 ? 0.48 : 0.27;
    const root = add(crown, [0, 0.12 + (frond % 2) * 0.035, 0]);
    const spine = t => add(root, add(mul(radial, length * t), [0, rise * Math.sin(t * Math.PI * 0.85) - droop * t * t, 0]));
    const phase = theta * 1.3;
    for (let i = 0; i < 14; i++) {
      const t = i / 14, u = (i + 1) / 14;
      const a = spine(t), b = spine(u), width = mix(0.023, 0.003, t);
      sculpture.quad(add(a, mul(side, width)), add(b, mul(side, width * 0.9)), add(b, mul(side, -width * 0.9)), add(a, mul(side, -width)), color('#629078'), [[t, phase], [u, phase], [u, phase], [t, phase]]);
    }
    for (let i = 0; i < 12; i++) {
      const t = 0.13 + i * 0.067;
      for (const sign of [-1, 1]) {
        const start = spine(t);
        const span = (0.13 + Math.sin(t * Math.PI) * 0.34) * (1 - 0.1 * (frond % 2));
        const end = add(start, add(mul(side, span * sign), add(mul(radial, 0.22 + 0.17 * t), [0, -0.1 - 0.13 * t, 0])));
        const mid = add(add(start, mul(sub(end, start), 0.46)), [0, 0.027, 0]);
        const width = 0.028 + Math.sin(t * Math.PI) * 0.025;
        const left = add(mid, mul(radial, -width));
        const right = add(mid, mul(radial, width));
        const ridge = add(mid, [0, 0.038, 0]);
        const tint = color(leaves[(frond + (sign === 1 ? 0 : 1)) % leaves.length]);
        const m = [[t * 0.5, phase], [t + 0.3, phase + sign * 0.25], [t * 0.8, phase]];
        sculpture.triangle(start, left, ridge, tint, [m[0], m[2], m[2]]);
        sculpture.triangle(left, end, ridge, tint, [m[2], m[1], m[2]]);
        sculpture.triangle(start, ridge, right, tint, [m[0], m[2], m[2]]);
        sculpture.triangle(ridge, end, right, tint, [m[2], m[1], m[2]]);
      }
    }
  }
  // Two fresh upright spears give the crown a natural, asymmetric silhouette.
  for (let i = 0; i < 2; i++) {
    const a = add(crown, [0, 0.09, 0]), b = add(crown, [i ? -0.3 : 0.22, 0.8, i ? 0.19 : -0.14]);
    const mid = add(mul(add(a, b), 0.5), [0, 0.03, 0]), width = i ? [0, 0, 0.065] : [0.075, 0, 0];
    sculpture.triangle(a, add(mid, width), b, color('#558067'), [[0, i], [0.6, i], [1.2, i]]);
    sculpture.triangle(a, b, sub(mid, width), color('#376855'), [[0, i], [1.2, i], [0.6, i]]);
  }

  for (const [x, y, z, r] of [[-0.1, -0.04, 0.08, 0.095], [0.075, -0.05, 0.12, 0.086], [0.055, 0.005, -0.085, 0.079]]) {
    orb(sculpture, add(crown, [x, y, z]), r, color('#a99358'), [0.85, 1.12, 0.85]);
  }
  orb(furniture, [-0.69, 0.165, 0.23], 0.105, color('#d8c9a7'), [1.3, 0.52, 0.8]);
  orb(furniture, [-0.54, 0.147, 0.39], 0.064, color('#baad8b'), [1.1, 0.48, 0.8]);
  // The coral marker is the only saturated accent.
  cylinder(furniture, [0.61, 0.122, 0.37], [0.61, 0.145, 0.37], 0.042, 0.042, color('#ce6144'), 20);
  ring(furniture, 1.07, 0.023, 0.124, color('#ce6144'), 16, 0.3, 0.55);

  // Technical mode reveals a quiet polar measurement grid.
  for (const radius of [0.4, 0.7, 1.42]) ring(guides, radius, 0.003, 0.127, color('#527f70', 0.32), 96);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, r = [Math.cos(a), 0, Math.sin(a)], side = [-r[2] * 0.0015, 0, r[0] * 0.0015];
    const p = mul(r, 0.2), q = mul(r, 1.5); p[1] = q[1] = 0.13;
    guides.quad(add(p, side), add(q, side), sub(q, side), sub(p, side), color('#527f70', 0.26));
  }
  return { sculpture, furniture, shadow, guides };
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column++) for (let row = 0; row < 4; row++) {
    for (let k = 0; k < 4; k++) out[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
  }
  return out;
}
function cameraMatrix(eye, target, aspect) {
  const z = unit(sub(eye, target)), x = unit(cross([0, 1, 0], z)), y = cross(z, x);
  const view = new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  const vertical = aspect < 1.1 ? 4.35 : 4.05;
  const right = vertical * aspect / 2, top = vertical / 2;
  const projection = new Float32Array([1 / right, 0, 0, 0, 0, 1 / top, 0, 0, 0, 0, -2 / 30, 0, 0, 0, -1, 1]);
  return multiply(projection, view);
}

function compile(gl, kind, source) {
  const shader = gl.createShader(kind);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(error || 'Shader compilation failed');
  }
  return shader;
}

/**
 * Mounts one scene. The host owns its heading, motion and technical controls.
 * This module only appends its accessible canvas and vector fallback.
 */
export function mountPalm(container, { reducedMotion = false } = {}) {
  if (!(container instanceof Element)) throw new TypeError('mountPalm needs a DOM element');
  const canvas = document.createElement('canvas');
  canvas.className = 'palm-canvas';
  canvas.setAttribute('aria-label', 'Interactive three-dimensional palm sculpture. Drag horizontally or use left and right arrow keys to rotate.');
  canvas.setAttribute('role', 'img');
  canvas.tabIndex = 0;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab;outline-offset:-5px;';
  const fallback = document.createElement('img');
  fallback.className = 'palm-fallback';
  fallback.src = FALLBACK;
  fallback.alt = 'A sculptural teal palm tree on a circular sand-colored pedestal.';
  fallback.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;';
  container.append(fallback, canvas);
  canvas.hidden = true;
  canvas.style.display = 'none';
  let destroyed = false, lost = false, paused = false, technical = false, currentTechnical = 0;
  let gl, program, shaders = [], gpu = [], attrs, uniforms, geometries;
  let frame = 0, lastFrame = 0, time = 0, visible = true;
  let yaw = -0.52, targetYaw = yaw, elevation = 0.31, targetElevation = elevation;
  let width = 1, height = 1, pointer = null, resizeObserver, intersectionObserver;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = Boolean(reducedMotion || media.matches);
  const listeners = [];
  const listen = (element, name, fn, options) => { element.addEventListener(name, fn, options); listeners.push(() => element.removeEventListener(name, fn, options)); };
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; lastFrame = 0; };
  const showFallback = () => {
    stop(); fallback.style.display = 'block'; fallback.hidden = false;
    canvas.style.display = 'none'; canvas.hidden = true;
    container.dataset.palmRenderer = 'svg';
  };

  function upload(geometry, lines = false) {
    const data = lines ? geometry.lines : geometry.array;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gpu.push(buffer); return { buffer, count: data.length / 12 };
  }
  function initialize() {
    gl = canvas.getContext('webgl', { alpha: true, antialias: true, depth: true, stencil: false, powerPreference: 'low-power', premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL unavailable');
    shaders = [compile(gl, gl.VERTEX_SHADER, VERTEX), compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)];
    program = gl.createProgram();
    shaders.forEach(shader => gl.attachShader(program, shader)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'WebGL program linking failed');
    gl.useProgram(program);
    attrs = ['Position', 'Normal', 'Color', 'Motion'].map(name => gl.getAttribLocation(program, `a${name}`));
    uniforms = Object.fromEntries(['ViewProjection', 'Time', 'Motion', 'Eye', 'Technical', 'Lines', 'Unlit'].map(name => [name, gl.getUniformLocation(program, `u${name}`)]));
    const scene = buildExhibit();
    geometries = {
      sculpture: upload(scene.sculpture), wire: upload(scene.sculpture, true),
      furniture: upload(scene.furniture), shadow: upload(scene.shadow), guides: upload(scene.guides),
    };
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    canvas.hidden = false; canvas.style.display = 'block';
    fallback.hidden = true; fallback.style.display = 'none';
    container.dataset.palmRenderer = 'webgl';
    container.dataset.palmTriangles = String((geometries.sculpture.count + geometries.furniture.count) / 3);
    resize(); render(); schedule();
  }
  function draw(shape, mode = gl.TRIANGLES) {
    gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
    const sizes = [3, 3, 4, 2], offsets = [0, 3, 6, 10];
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i] < 0) continue;
      gl.enableVertexAttribArray(attrs[i]);
      gl.vertexAttribPointer(attrs[i], sizes[i], gl.FLOAT, false, 48, offsets[i] * 4);
    }
    gl.drawArrays(mode, 0, shape.count);
  }
  function render() {
    if (!gl || !program || lost || destroyed) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    const target = [0.07, 1.42, 0];
    const eye = add(target, [Math.sin(yaw) * Math.cos(elevation) * 8, Math.sin(elevation) * 8, Math.cos(yaw) * Math.cos(elevation) * 8]);
    gl.uniformMatrix4fv(uniforms.ViewProjection, false, cameraMatrix(eye, target, width / height));
    gl.uniform3fv(uniforms.Eye, eye);
    gl.uniform1f(uniforms.Time, time);
    gl.uniform1f(uniforms.Motion, reduced ? 0 : 1);
    gl.uniform1f(uniforms.Technical, currentTechnical);
    gl.uniform1f(uniforms.Lines, 0); gl.uniform1f(uniforms.Unlit, 1);
    gl.depthMask(false); draw(geometries.shadow); gl.depthMask(true);
    gl.uniform1f(uniforms.Unlit, 0);
    draw(geometries.furniture);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
    draw(geometries.sculpture);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    if (currentTechnical > 0.01) {
      gl.depthMask(false);
      gl.uniform1f(uniforms.Lines, 1); draw(geometries.wire, gl.LINES);
      gl.uniform1f(uniforms.Lines, 0); gl.uniform1f(uniforms.Unlit, 1);
      draw(geometries.guides);
      gl.depthMask(true);
    }
  }
  function animate(now) {
    frame = 0;
    if (destroyed || lost || document.hidden || !visible) return;
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.06) : 0;
    lastFrame = now;
    if (!paused && !reduced) time += dt;
    const smoothing = reduced || paused ? 1 : 1 - Math.exp(-dt * 8);
    yaw = mix(yaw, targetYaw, smoothing);
    elevation = mix(elevation, targetElevation, smoothing);
    currentTechnical = mix(currentTechnical, technical ? 1 : 0, smoothing);
    render(); schedule();
  }
  function unsettled() { return Math.abs(yaw - targetYaw) + Math.abs(elevation - targetElevation) + Math.abs(currentTechnical - (technical ? 1 : 0)) > 0.001; }
  function schedule() {
    if (frame || destroyed || lost || !gl || document.hidden || !visible) return;
    if ((!paused && !reduced) || unsettled()) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
    render();
  }
  function settleInput() {
    if (reduced || paused) { yaw = targetYaw; elevation = targetElevation; }
    render(); schedule();
  }
  listen(canvas, 'pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: targetYaw, elevation: targetElevation, touch: event.pointerType === 'touch' };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
  });
  listen(canvas, 'pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    // Vertical touch remains page scrolling; horizontal drags inspect the tree.
    if (pointer.touch && Math.abs(dy) > Math.abs(dx) * 1.15) return;
    targetYaw = pointer.yaw + dx / Math.max(width, 200) * 3;
    if (!pointer.touch) targetElevation = clamp(pointer.elevation + dy / Math.max(height, 200) * 0.55, 0.12, 0.57);
    settleInput();
  });
  const release = () => { pointer = null; canvas.style.cursor = 'grab'; };
  listen(canvas, 'pointerup', release); listen(canvas, 'pointercancel', release); listen(canvas, 'lostpointercapture', release);
  listen(canvas, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return;
    event.preventDefault();
    targetYaw = event.key === 'Home' ? -0.52 : targetYaw + (event.key === 'ArrowRight' ? 0.16 : -0.16);
    if (event.key === 'Home') targetElevation = 0.31;
    settleInput();
  });
  listen(document, 'visibilitychange', () => { stop(); if (!document.hidden) { render(); schedule(); } });
  listen(media, 'change', () => { reduced = Boolean(reducedMotion || media.matches); stop(); render(); schedule(); });
  listen(canvas, 'webglcontextlost', event => { event.preventDefault(); lost = true; showFallback(); });
  listen(canvas, 'webglcontextrestored', () => {
    if (destroyed) return;
    lost = false; gpu = []; shaders = []; program = null;
    try { initialize(); } catch { showFallback(); }
  });
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  } else listen(window, 'resize', resize);
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      stop(); if (visible) { render(); schedule(); }
    }, { threshold: 0.01 });
    intersectionObserver.observe(container);
  }
  try { initialize(); } catch { showFallback(); }

  return Object.freeze({
    setTechnical(value) {
      technical = Boolean(value);
      container.dataset.palmTechnical = String(technical);
      fallback.src = technical ? `${FALLBACK}#wireframe` : FALLBACK;
      if (paused || reduced) currentTechnical = technical ? 1 : 0;
      render(); schedule();
    },
    setPaused(value) {
      paused = Boolean(value); container.dataset.palmPaused = String(paused);
      stop(); render(); schedule();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true; stop();
      resizeObserver?.disconnect(); intersectionObserver?.disconnect();
      listeners.forEach(remove => remove());
      if (gl && !lost) {
        gpu.forEach(buffer => gl.deleteBuffer(buffer));
        if (program) gl.deleteProgram(program);
        shaders.forEach(shader => gl.deleteShader(shader));
      }
      canvas.remove(); fallback.remove();
      delete container.dataset.palmRenderer; delete container.dataset.palmTriangles;
      delete container.dataset.palmTechnical; delete container.dataset.palmPaused;
    },
  });
}
