import { useEffect, useRef } from 'react';
import './CanvasField.css';

/**
 * A soft, pointer-reactive particle field. It is decoration only: the canvas is
 * aria-hidden, it stops drawing when scrolled out of view, and it respects
 * prefers-reduced-motion by painting a single static frame.
 */
export default function CanvasField({ density = 1, tone = 'violet', className = '', trackRef }) {
  const canvasRef = useRef(null);
  const toneRef = useRef(tone);
  const trackRefRef = useRef(trackRef);
  toneRef.current = tone;
  trackRefRef.current = trackRef;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let dots = [];
    let frame = 0;
    let running = true;
    let visible = true;

    const PALETTES = {
      violet: ['#ffc247', '#ff2d95', '#8f7bff'],
      gold: ['#ffc247', '#ff9d3d', '#fff0c4'],
      dusk: ['#8ad14f', '#31d0aa', '#d8f7ff'],
      // Warm, low-contrast specks that stay readable on a light stage.
      sand: ['#b9791a', '#c2410c', '#7c3aed'],
    };

    const ALPHA = { violet: 1, gold: 1, dusk: 1, sand: 0.62 };

    const build = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || canvas.offsetWidth || 1;
      const height = canvas.clientHeight || canvas.offsetHeight || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = Math.round(Math.min(120, Math.max(28, (width * height) / 15000)) * density);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.9,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.05 - Math.random() * 0.22,
        hue: Math.floor(Math.random() * 3),
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const paint = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      const colors = PALETTES[toneRef.current] || PALETTES.violet;
      context.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];

        if (!calm) {
          dot.x += dot.vx;
          dot.y += dot.vy;
          dot.tw += 0.02;

          if (dot.y < -8) { dot.y = height + 8; dot.x = Math.random() * width; }
          if (dot.x < -8) dot.x = width + 8;
          if (dot.x > width + 8) dot.x = -8;

          // A gentle pull toward the cursor, capped so it never snaps.
          const dx = pointer.x - dot.x;
          const dy = pointer.y - dot.y;
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 260);
          dot.x += dx * near * 0.012;
          dot.y += dy * near * 0.012;
        }

        const alpha = (calm ? 0.5 : 0.32 + Math.sin(dot.tw) * 0.22) * (ALPHA[toneRef.current] ?? 1);
        context.beginPath();
        context.fillStyle = colors[dot.hue];
        context.globalAlpha = Math.max(0.08, alpha);
        context.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const loop = () => {
      if (!running) return;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      paint();
      frame = window.requestAnimationFrame(loop);
    };
    // The canvas itself never takes pointer events, so the listener can be
    // parked on an interactive ancestor instead.
    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = event.clientX - rect.left;
      pointer.ty = event.clientY - rect.top;
    };

    const onLeave = () => { pointer.tx = 0; pointer.ty = 0; };
    const source = trackRefRef.current?.current || canvas;
    source.addEventListener('pointermove', onMove);
    source.addEventListener('pointerleave', onLeave);

    build();
    paint();

    // A canvas with no layout has nothing to show, so it never starts a loop.
    const sized = canvas.clientWidth > 0 && canvas.clientHeight > 0;
    if (!calm && sized) frame = window.requestAnimationFrame(loop);

    const resize = window.ResizeObserver ? new ResizeObserver(() => {
      build();
      paint();
      const now = canvas.clientWidth > 0 && canvas.clientHeight > 0;
      if (!calm && now && !frame && running) frame = window.requestAnimationFrame(loop);
    }) : null;
    resize?.observe(canvas);

    const intersection = window.IntersectionObserver
      ? new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !calm && !frame) frame = window.requestAnimationFrame(loop);
        if (!visible && frame) { window.cancelAnimationFrame(frame); frame = 0; }
      })
      : null;
    intersection?.observe(canvas);

    return () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      resize?.disconnect();
      intersection?.disconnect();
      source.removeEventListener('pointermove', onMove);
      source.removeEventListener('pointerleave', onLeave);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={`canvas-field ${className}`.trim()} aria-hidden="true" />;
}
