import React, { useEffect, useRef } from 'react';

interface HorizonPlasmaShaderProps {
  tideHeight: number; // 0 to 1 normalized or actual depth e.g. 1.8
  scrollIntensity?: number; // 0 to 1
  audioBass?: number; // 0 to 1 for live audio reactive pulse
}

export const HorizonPlasmaShader: React.FC<HorizonPlasmaShaderProps> = ({
  tideHeight,
  scrollIntensity = 0.5,
  audioBass = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const propsRef = useRef({ tideHeight, scrollIntensity, audioBass });

  // Keep props ref updated for high FPS loop without re-subscribing shader
  useEffect(() => {
    propsRef.current = { tideHeight, scrollIntensity, audioBass };
  }, [tideHeight, scrollIntensity, audioBass]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) return;

    let W = 0, H = 0, DPR = 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      W = parent.clientWidth;
      H = parent.clientHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
    };

    resize();
    window.addEventListener('resize', resize);

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vsSrc = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec2 u_mouse;
      uniform float u_intensity;
      uniform float u_audioLow;
      uniform float u_tideHeight;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 6; i++) {
          v += a * noise(p);
          p *= 2.03;
          a *= 0.49;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 p = uv * 3.5;
        vec2 mouse = u_mouse / u_res;
        float md = length(uv - mouse);
        float mi = smoothstep(0.45, 0.0, md) * u_intensity;

        float t = u_time * 0.22;
        float n1 = fbm(p + vec2(t, t * 0.7));
        float n2 = fbm(p * 1.4 - vec2(t * 0.6, t) + 4.0);
        float n3 = fbm(p * 2.1 + vec2(n1 * 1.5, n2 * 1.5) + t * 0.3);

        n3 += u_audioLow * 0.35 * sin(uv.x * 24.0 + u_time * 4.0);
        n3 += mi * sin(md * 40.0 - u_time * 6.0) * 0.5;
        n3 += mi * sin(md * 25.0 + u_time * 4.0) * 0.3;

        // Tide-reactive Palette
        // Low tide -> Amber/Rose glow; High tide -> Deep Emerald/Cyan plasma
        float normTide = clamp((u_tideHeight - 0.8) / 1.6, 0.0, 1.0);
        vec3 c1 = vec3(0.01, 0.02, 0.08); // Deep abyssal space
        vec3 c2 = mix(vec3(0.0, 0.35, 0.55), vec3(0.0, 0.65, 0.42), normTide); // Emerald-cyan
        vec3 c3 = mix(vec3(0.55, 0.12, 0.35), vec3(0.85, 0.45, 0.05), 1.0 - normTide); // Amber-rose
        vec3 c4 = vec3(0.88, 0.96, 1.0); // White-cyan highlights

        vec3 col = mix(c1, c2, n1);
        col = mix(col, c3, n2 * 0.65);
        col = mix(col, c4, pow(max(n3 - 0.28, 0.0), 2.0) * 2.8);

        // Vignette & Scanline feel
        float vig = 1.0 - length(uv - 0.5) * 0.75;
        col *= vig;
        col *= 0.96 + 0.04 * sin(uv.y * u_res.y * 0.8);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vs = compileShader(gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uIntensity = gl.getUniformLocation(prog, 'u_intensity');
    const uAudioLow = gl.getUniformLocation(prog, 'u_audioLow');
    const uTideHeight = gl.getUniformLocation(prog, 'u_tideHeight');

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.tx = (e.clientX - rect.left) * DPR;
      mouseRef.current.ty = (H - (e.clientY - rect.top)) * DPR;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const render = (now: number) => {
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.08;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uIntensity, 0.4 + propsRef.current.scrollIntensity * 0.6);
      gl.uniform1f(uAudioLow, propsRef.current.audioBass);
      gl.uniform1f(uTideHeight, propsRef.current.tideHeight);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, pointerEvents: 'auto' }}
    />
  );
};
