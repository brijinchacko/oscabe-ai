"use client";

interface AbstractBgProps {
  accentColor?: string;
  variant?: "hero" | "section" | "minimal";
}

const KEYFRAMES = `
@keyframes abstractFloat1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(12px, -18px) rotate(3deg); }
  50% { transform: translate(-8px, -30px) rotate(-2deg); }
  75% { transform: translate(16px, -12px) rotate(4deg); }
}
@keyframes abstractFloat2 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, 14px) rotate(-4deg); }
  66% { transform: translate(10px, -20px) rotate(3deg); }
}
@keyframes abstractFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(8px, -16px) scale(1.06); }
}
@keyframes abstractSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

function HexagonPath({ size }: { size: number }) {
  const r = size / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
  }).join(" ");
  return <polygon points={points} />;
}

function TrianglePath({ size }: { size: number }) {
  const h = (size * Math.sqrt(3)) / 2;
  return <polygon points={`${size / 2},0 ${size},${h} 0,${h}`} />;
}

export function AbstractBg({ accentColor = "#6C63FF", variant = "section" }: AbstractBgProps) {
  const isHero = variant === "hero";
  const isMinimal = variant === "minimal";

  const baseOpacity = isHero ? 0.06 : isMinimal ? 0.025 : 0.04;

  const shapes = isMinimal
    ? [
        { type: "circle" as const, cx: "15%", cy: "30%", r: 40, anim: "abstractFloat3", dur: "18s", opacity: baseOpacity },
        { type: "circle" as const, cx: "85%", cy: "70%", r: 28, anim: "abstractFloat2", dur: "22s", opacity: baseOpacity * 0.8 },
      ]
    : isHero
      ? [
          { type: "circle" as const, cx: "8%", cy: "20%", r: 60, anim: "abstractFloat1", dur: "20s", opacity: baseOpacity },
          { type: "circle" as const, cx: "92%", cy: "15%", r: 35, anim: "abstractFloat2", dur: "26s", opacity: baseOpacity * 0.7 },
          { type: "hexagon" as const, cx: "75%", cy: "75%", r: 50, anim: "abstractFloat3", dur: "24s", opacity: baseOpacity * 0.6 },
          { type: "triangle" as const, cx: "20%", cy: "80%", r: 36, anim: "abstractFloat2", dur: "28s", opacity: baseOpacity * 0.5 },
          { type: "circle" as const, cx: "50%", cy: "50%", r: 80, anim: "abstractFloat1", dur: "30s", opacity: baseOpacity * 0.3 },
          { type: "hexagon" as const, cx: "35%", cy: "10%", r: 28, anim: "abstractFloat3", dur: "22s", opacity: baseOpacity * 0.5 },
          { type: "circle" as const, cx: "60%", cy: "90%", r: 24, anim: "abstractFloat2", dur: "18s", opacity: baseOpacity * 0.6 },
          { type: "triangle" as const, cx: "88%", cy: "45%", r: 32, anim: "abstractSpin", dur: "60s", opacity: baseOpacity * 0.3 },
        ]
      : [
          { type: "circle" as const, cx: "10%", cy: "25%", r: 45, anim: "abstractFloat1", dur: "22s", opacity: baseOpacity },
          { type: "hexagon" as const, cx: "85%", cy: "20%", r: 38, anim: "abstractFloat2", dur: "26s", opacity: baseOpacity * 0.6 },
          { type: "circle" as const, cx: "70%", cy: "80%", r: 30, anim: "abstractFloat3", dur: "20s", opacity: baseOpacity * 0.7 },
          { type: "triangle" as const, cx: "25%", cy: "75%", r: 28, anim: "abstractFloat2", dur: "24s", opacity: baseOpacity * 0.5 },
          { type: "circle" as const, cx: "50%", cy: "40%", r: 55, anim: "abstractFloat1", dur: "28s", opacity: baseOpacity * 0.35 },
        ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {shapes.map((shape, i) => {
          const style: React.CSSProperties = {
            animation: `${shape.anim} ${shape.dur} ease-in-out infinite`,
            opacity: shape.opacity,
          };

          if (shape.type === "circle") {
            return (
              <circle
                key={i}
                cx={shape.cx}
                cy={shape.cy}
                r={shape.r}
                fill={accentColor}
                style={style}
              />
            );
          }

          const translateX = `calc(${shape.cx} - ${shape.r}px)`;
          const translateY = `calc(${shape.cy} - ${shape.r}px)`;

          if (shape.type === "hexagon") {
            return (
              <g
                key={i}
                style={{
                  ...style,
                  transform: `translate(${translateX}, ${translateY})`,
                }}
              >
                <g fill={accentColor}>
                  <HexagonPath size={shape.r * 2} />
                </g>
              </g>
            );
          }

          return (
            <g
              key={i}
              style={{
                ...style,
                transform: `translate(${translateX}, ${translateY})`,
              }}
            >
              <g fill={accentColor}>
                <TrianglePath size={shape.r * 2} />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
