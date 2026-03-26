import React, { useRef, useEffect, useState, createElement, useMemo, useCallback, memo } from "react";

export enum Tag {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  P = "p",
}

type VaporizeTextCycleProps = {
  texts: string[];
  font?: { fontFamily?: string; fontSize?: string; fontWeight?: number };
  color?: string;
  spread?: number;
  density?: number;
  animation?: { vaporizeDuration?: number; fadeInDuration?: number; waitDuration?: number };
  direction?: "left-to-right" | "right-to-left";
  alignment?: "left" | "center" | "right";
  tag?: Tag;
};

type Particle = {
  x: number; y: number; originalX: number; originalY: number;
  color: string; opacity: number; originalAlpha: number;
  velocityX: number; velocityY: number; angle: number; speed: number;
  shouldFadeQuickly?: boolean;
};

type TextBoundaries = { left: number; right: number; width: number };

declare global {
  interface HTMLCanvasElement { textBoundaries?: TextBoundaries }
}

function useIsInView(ref: React.RefObject<HTMLElement>) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0, rootMargin: "50px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isInView;
}

function transformValue(input: number, inputRange: number[], outputRange: number[], clamp = false): number {
  const progress = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
  let result = outputRange[0] + progress * (outputRange[1] - outputRange[0]);
  if (clamp) result = Math.min(Math.max(result, Math.min(...outputRange)), Math.max(...outputRange));
  return result;
}

function calculateVaporizeSpread(fontSize: number) {
  const points = [{ size: 20, spread: 0.2 }, { size: 50, spread: 0.5 }, { size: 100, spread: 1.5 }];
  if (fontSize <= points[0].size) return points[0].spread;
  if (fontSize >= points[points.length - 1].size) return points[points.length - 1].spread;
  let i = 0;
  while (i < points.length - 1 && points[i + 1].size < fontSize) i++;
  return points[i].spread + (fontSize - points[i].size) * (points[i + 1].spread - points[i].spread) / (points[i + 1].size - points[i].size);
}

function parseColor(color: string) {
  const rgba = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${rgba[4]})`;
  const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, 1)`;
  return "rgba(255,255,255,1)";
}

function createParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, text: string, textX: number, textY: number, font: string, color: string, alignment: "left" | "center" | "right") {
  const particles: Particle[] = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = alignment; ctx.textBaseline = "middle";
  ctx.imageSmoothingQuality = "high"; ctx.imageSmoothingEnabled = true;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textLeft = alignment === "center" ? textX - textWidth / 2 : alignment === "right" ? textX - textWidth : textX;
  const textBoundaries = { left: textLeft, right: textLeft + textWidth, width: textWidth };
  ctx.fillText(text, textX, textY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const currentDPR = canvas.width / parseInt(canvas.style.width);
  const sampleRate = Math.max(1, Math.round(Math.max(1, Math.round(currentDPR / 3))));
  for (let y = 0; y < canvas.height; y += sampleRate) {
    for (let x = 0; x < canvas.width; x += sampleRate) {
      const index = (y * canvas.width + x) * 4;
      const alpha = data[index + 3];
      if (alpha > 0) {
        const originalAlpha = alpha / 255 * (sampleRate / currentDPR);
        particles.push({ x, y, originalX: x, originalY: y, color: `rgba(${data[index]}, ${data[index + 1]}, ${data[index + 2]}, ${originalAlpha})`, opacity: originalAlpha, originalAlpha, velocityX: 0, velocityY: 0, angle: 0, speed: 0 });
      }
    }
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return { particles, textBoundaries };
}

function updateParticles(particles: Particle[], vaporizeX: number, deltaTime: number, MULTIPLIED_VAPORIZE_SPREAD: number, VAPORIZE_DURATION: number, direction: string, density: number) {
  let allVaporized = true;
  particles.forEach(p => {
    const shouldVaporize = direction === "left-to-right" ? p.originalX <= vaporizeX : p.originalX >= vaporizeX;
    if (shouldVaporize) {
      if (p.speed === 0) {
        p.angle = Math.random() * Math.PI * 2;
        p.speed = (Math.random() * 1 + 0.5) * MULTIPLIED_VAPORIZE_SPREAD;
        p.velocityX = Math.cos(p.angle) * p.speed;
        p.velocityY = Math.sin(p.angle) * p.speed;
        p.shouldFadeQuickly = Math.random() > density;
      }
      if (p.shouldFadeQuickly) {
        p.opacity = Math.max(0, p.opacity - deltaTime);
      } else {
        const dx = p.originalX - p.x, dy = p.originalY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const damp = Math.max(0.95, 1 - dist / (100 * MULTIPLIED_VAPORIZE_SPREAD));
        const rs = MULTIPLIED_VAPORIZE_SPREAD * 3;
        p.velocityX = (p.velocityX + (Math.random() - 0.5) * rs + dx * 0.002) * damp;
        p.velocityY = (p.velocityY + (Math.random() - 0.5) * rs + dy * 0.002) * damp;
        const mv = MULTIPLIED_VAPORIZE_SPREAD * 2;
        const cv = Math.sqrt(p.velocityX ** 2 + p.velocityY ** 2);
        if (cv > mv) { p.velocityX *= mv / cv; p.velocityY *= mv / cv; }
        p.x += p.velocityX * deltaTime * 20;
        p.y += p.velocityY * deltaTime * 10;
        p.opacity = Math.max(0, p.opacity - deltaTime * 0.25 * (2000 / VAPORIZE_DURATION));
      }
      if (p.opacity > 0.01) allVaporized = false;
    } else { allVaporized = false; }
  });
  return allVaporized;
}

function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], globalDpr: number) {
  ctx.save(); ctx.scale(globalDpr, globalDpr);
  particles.forEach(p => {
    if (p.opacity > 0) {
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity})`);
      ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1, 1);
    }
  });
  ctx.restore();
}

function resetParticles(particles: Particle[]) {
  particles.forEach(p => { p.x = p.originalX; p.y = p.originalY; p.opacity = p.originalAlpha; p.speed = 0; p.velocityX = 0; p.velocityY = 0; });
}

const SeoElement = memo(({ tag = Tag.P, texts }: { tag: Tag; texts: string[] }) =>
  createElement(tag, { style: { position: "absolute", width: 0, height: 0, overflow: "hidden", userSelect: "none", pointerEvents: "none" } }, texts?.join(" ") ?? "")
);

export default function VaporizeTextCycle({
  texts = ["Next.js", "React"],
  font = { fontFamily: "sans-serif", fontSize: "50px", fontWeight: 400 },
  color = "rgb(255, 255, 255)",
  spread = 5, density = 5,
  animation = { vaporizeDuration: 2, fadeInDuration: 1, waitDuration: 0.5 },
  direction = "left-to-right",
  alignment = "center",
  tag = Tag.P,
}: VaporizeTextCycleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useIsInView(wrapperRef as React.RefObject<HTMLElement>);
  const lastFontRef = useRef<string | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [animationState, setAnimationState] = useState<"static" | "vaporizing" | "fadingIn" | "waiting">("static");
  const vaporizeProgressRef = useRef(0);
  const fadeOpacityRef = useRef(0);
  const [wrapperSize, setWrapperSize] = useState({ width: 0, height: 0 });

  const globalDpr = useMemo(() => typeof window !== "undefined" ? window.devicePixelRatio * 1.5 || 1 : 1, []);
  const transformedDensity = transformValue(density, [0, 10], [0.3, 1], true);
  const animDur = useMemo(() => ({
    VAPORIZE: (animation.vaporizeDuration ?? 2) * 1000,
    FADE_IN: (animation.fadeInDuration ?? 1) * 1000,
    WAIT: (animation.waitDuration ?? 0.5) * 1000,
  }), [animation.vaporizeDuration, animation.fadeInDuration, animation.waitDuration]);

  const fontSize = parseInt(font.fontSize?.replace("px", "") || "50");
  const SPREAD = calculateVaporizeSpread(fontSize) * spread;

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !wrapperSize.width || !wrapperSize.height) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.style.width = `${wrapperSize.width}px`; canvas.style.height = `${wrapperSize.height}px`;
    canvas.width = Math.floor(wrapperSize.width * globalDpr); canvas.height = Math.floor(wrapperSize.height * globalDpr);
    const f = `${font.fontWeight ?? 400} ${fontSize * globalDpr}px ${font.fontFamily ?? "sans-serif"}`;
    const c = parseColor(color);
    const tx = alignment === "center" ? canvas.width / 2 : alignment === "left" ? 0 : canvas.width;
    const { particles, textBoundaries } = createParticles(ctx, canvas, texts[currentTextIndex] || "", tx, canvas.height / 2, f, c, alignment);
    particlesRef.current = particles; canvas.textBoundaries = textBoundaries;
  }, [wrapperSize, currentTextIndex, globalDpr, font, color, alignment, texts, fontSize]);

  useEffect(() => { doRender(); }, [doRender]);

  useEffect(() => {
    const currentFont = font.fontFamily || "sans-serif";
    if (currentFont !== lastFontRef.current) {
      lastFontRef.current = currentFont;
      const t = setTimeout(doRender, 1000);
      return () => clearTimeout(t);
    }
  }, [font.fontFamily, doRender]);

  useEffect(() => {
    const container = wrapperRef.current; if (!container) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWrapperSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(container);
    if (container) setWrapperSize({ width: container.clientWidth, height: container.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) { setTimeout(() => setAnimationState("vaporizing"), 0); }
    else { setAnimationState("static"); }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();
    let frameId: number;
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000; lastTime = now;
      const canvas = canvasRef.current; const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !particlesRef.current.length) { frameId = requestAnimationFrame(animate); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (animationState === "static" || animationState === "waiting") {
        renderParticles(ctx, particlesRef.current, globalDpr);
      } else if (animationState === "vaporizing") {
        vaporizeProgressRef.current += dt * 100 / (animDur.VAPORIZE / 1000);
        const tb = canvas.textBoundaries; if (!tb) { frameId = requestAnimationFrame(animate); return; }
        const prog = Math.min(100, vaporizeProgressRef.current);
        const vx = direction === "left-to-right" ? tb.left + tb.width * prog / 100 : tb.right - tb.width * prog / 100;
        const done = updateParticles(particlesRef.current, vx, dt, SPREAD, animDur.VAPORIZE, direction, transformedDensity);
        renderParticles(ctx, particlesRef.current, globalDpr);
        if (vaporizeProgressRef.current >= 100 && done) {
          setCurrentTextIndex(p => (p + 1) % texts.length);
          setAnimationState("fadingIn"); fadeOpacityRef.current = 0;
        }
      } else if (animationState === "fadingIn") {
        fadeOpacityRef.current += dt * 1000 / animDur.FADE_IN;
        ctx.save(); ctx.scale(globalDpr, globalDpr);
        particlesRef.current.forEach(p => {
          p.x = p.originalX; p.y = p.originalY;
          const op = Math.min(fadeOpacityRef.current, 1) * p.originalAlpha;
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${op})`);
          ctx.fillRect(p.x / globalDpr, p.y / globalDpr, 1, 1);
        });
        ctx.restore();
        if (fadeOpacityRef.current >= 1) {
          setAnimationState("waiting");
          setTimeout(() => { setAnimationState("vaporizing"); vaporizeProgressRef.current = 0; resetParticles(particlesRef.current); }, animDur.WAIT);
        }
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [animationState, isInView, texts.length, direction, globalDpr, SPREAD, transformedDensity, animDur]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
      <canvas ref={canvasRef} style={{ minWidth: "30px", minHeight: "20px", pointerEvents: "none" }} />
      <SeoElement tag={tag} texts={texts} />
    </div>
  );
}

