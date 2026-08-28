import React, { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  tideHeight: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ tideHeight }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const phi = (1 + Math.sqrt(5)) / 2;
    const icoVerts = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];

    const anchors = icoVerts.map(v => {
      const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      return { x: v[0] / len, y: v[1] / len, z: v[2] / len };
    });

    const particles = Array.from({ length: 650 }, (_, i) => {
      const anchor = anchors[i % anchors.length];
      return {
        ax: anchor.x, ay: anchor.y, az: anchor.z,
        theta: Math.random() * Math.PI * 2,
        phi: Math.acos(2 * Math.random() - 1),
        radius: 0.22 + Math.random() * 0.18,
        speed: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        size: 1.2 + Math.random() * 2.8,
        life: Math.random(),
      };
    });

    let rotX = 0, rotY = 0, rotZ = 0;

    const project = (x: number, y: number, z: number) => {
      const fov = 380, dist = 2.5;
      const scale = fov / (dist + z);
      return {
        x: W * 0.5 + x * scale * (H / 420),
        y: H * 0.5 + y * scale * (H / 420),
        scale
      };
    };

    const rotate = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const cz = Math.cos(rz), sz = Math.sin(rz);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      const x3 = x1 * cz - y2 * sz;
      const y3 = x1 * sz + y2 * cz;
      return { x: x3, y: y3, z: z2 };
    };

    let rafId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(DPR, DPR);

      rotX += 0.25 * dt;
      rotY += 0.20 * dt;
      rotZ += 0.12 * dt;

      const projPoints = particles.map(pt => {
        pt.life += dt * pt.speed * 0.6;
        const breathe = Math.sin(pt.life + pt.phase) * 0.06;
        const r = pt.radius + breathe;
        const ox = r * Math.sin(pt.phi) * Math.cos(pt.theta + pt.life * pt.speed);
        const oy = r * Math.sin(pt.phi) * Math.sin(pt.theta + pt.life * pt.speed);
        const oz = r * Math.cos(pt.phi);
        const rot = rotate(pt.ax * 0.65 + ox, pt.ay * 0.65 + oy, pt.az * 0.65 + oz, rotX, rotY, rotZ);
        const pr = project(rot.x, rot.y, rot.z);
        return { x: pr.x, y: pr.y, scale: pr.scale, z: rot.z, pt };
      });

      projPoints.sort((a, b) => b.z - a.z);

      ctx.globalCompositeOperation = 'screen';

      // Draw constellation connections
      for (let i = 0; i < projPoints.length; i++) {
        const a = projPoints[i];
        if (a.z < -0.2) continue;
        for (let j = i + 1; j < Math.min(i + 6, projPoints.length); j++) {
          const b = projPoints[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 65) {
            const alpha = (1 - dist / 65) * 0.15;
            ctx.strokeStyle = `rgba(100, 220, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of projPoints) {
        const size = p.pt.size * (0.5 + p.scale * 0.003);
        const alpha = Math.min(1, (p.z + 1.5) / 2.5) * 0.75;
        const hue = 175 + p.pt.phase * 25 + (tideHeight > 1.5 ? 35 : 0);
        ctx.fillStyle = `hsla(${hue}, 85%, 72%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (size > 1.8) {
          ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [tideHeight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
};
