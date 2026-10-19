import { useEffect, useRef } from 'react'

// Blue/cyan light flowing up from the bottom of a dark field, ported from the
// Longrun page. A small WebGL shader draws it; the CSS blobs underneath are the
// fallback when WebGL is unavailable. Scoped to its parent (not the viewport)
// and paused while off-screen.
const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// Domain-warped fbm flowing upward; brightest along the bottom edge and the
// two sides, with a darker dip in the middle. Grain added per pixel.
const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float time;
uniform vec2 ptr;
uniform vec3 c1;
uniform vec3 c2;
uniform vec3 c3;
uniform vec3 c4;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  float aspect = res.x / res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = time;

  vec2 q = vec2(fbm(p * 1.4 + vec2(0.0, -t * 0.09)), fbm(p * 1.4 + vec2(5.2, 1.3) - vec2(0.0, t * 0.07)));
  float r = fbm(p * 1.8 + 2.4 * q + vec2(t * 0.03, -t * 0.22));

  // Height of the light: higher at the sides, lower in the centre.
  float side = smoothstep(0.08, 0.5, abs(uv.x - 0.5));
  float reach = 0.28 + 0.32 * side + 0.22 * (r - 0.5);
  float body = smoothstep(reach, 0.0, uv.y);
  float v = body * (0.5 + 1.25 * r * r + 0.3 * q.x);

  // Brighter flares where the warp folds.
  v += 0.6 * smoothstep(0.58, 0.88, r) * smoothstep(reach + 0.1, 0.0, uv.y);

  // Soft light following the pointer.
  vec2 d = vec2((uv.x - ptr.x) * aspect, uv.y - ptr.y);
  v += 0.22 * exp(-dot(d, d) * 9.0);

  v = clamp(v, 0.0, 1.35);
  vec3 bg = vec3(0.020, 0.027, 0.051);
  vec3 col = mix(bg, c1, smoothstep(0.0, 0.35, v));
  col = mix(col, c2, smoothstep(0.3, 0.7, v));
  col = mix(col, c3, smoothstep(0.65, 1.0, v));
  col = mix(col, c4, smoothstep(1.0, 1.35, v));

  col += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.045;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Colour ramps, darkest to brightest. Each page has its own tone.
const TONES = {
  blue: [
    [0.043, 0.122, 0.541],
    [0.184, 0.388, 1.0],
    [0.435, 0.847, 1.0],
    [0.9, 0.98, 1.0],
  ],
  purple: [
    [0.2, 0.055, 0.47],
    [0.47, 0.22, 0.98],
    [0.78, 0.56, 1.0],
    [0.97, 0.92, 1.0],
  ],
  green: [
    [0.016, 0.24, 0.17],
    [0.05, 0.6, 0.4],
    [0.42, 0.93, 0.68],
    [0.9, 1.0, 0.95],
  ],
}

// variant="fall" mirrors it so the light comes down from the top edge.
export default function Glow({ variant = 'rise', tone = 'blue', className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!canvas || !gl) return

    const compile = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'res')
    const uTime = gl.getUniformLocation(prog, 'time')
    const uPtr = gl.getUniformLocation(prog, 'ptr')
    const ramp = TONES[tone] || TONES.blue
    ;['c1', 'c2', 'c3', 'c4'].forEach((name, i) => gl.uniform3fv(gl.getUniformLocation(prog, name), ramp[i]))

    // Render below device resolution: the image is soft, so this is invisible and cheap.
    const scale = 0.5
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // Pointer glow eases toward the cursor; rests below the frame.
    const target = { x: 0.5, y: -1 }
    const ptr = { x: 0.5, y: -1 }
    const move = (e) => {
      const r = canvas.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width
      const fromTop = (e.clientY - r.top) / r.height
      target.y = variant === 'fall' ? fromTop : 1 - fromTop
    }
    window.addEventListener('pointermove', move, { passive: true })

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    let raf = 0
    let visible = true
    const frame = (now) => {
      ptr.x += (target.x - ptr.x) * 0.06
      ptr.y += (target.y - ptr.y) * 0.06
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduced ? 12 : (now - start) / 1000)
      gl.uniform2f(uPtr, ptr.x, ptr.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const restart = () => {
      cancelAnimationFrame(raf)
      if (visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      restart()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', restart)
    raf = requestAnimationFrame(frame)
    canvas.dataset.ready = '1'

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('visibilitychange', restart)
    }
  }, [variant, tone])

  return (
    <div className={`glow glow-${variant} tone-${tone} ${className}`} aria-hidden="true">
      <span className="g g-base" />
      <span className="g g-left" />
      <span className="g g-right" />
      <span className="g g-dip" />
      <span className="g g-flare-a" />
      <span className="g g-flare-b" />
      <span className="grain" />
      <canvas ref={ref} className="glow-canvas" />
    </div>
  )
}

// CSS-only version for small surfaces (cards). Blend it over line art with
// mix-blend-mode: screen, so black turns to light and white lines stay white.
export function CardGlow() {
  return (
    <div className="card-glow" aria-hidden="true">
      <span className="cg cg-a" />
      <span className="cg cg-b" />
      <span className="cg cg-c" />
    </div>
  )
}
