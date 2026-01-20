import { useEffect, useMemo, useState } from "react";

export function usePointerGlow() {
  const [pos, setPos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };

    window.addEventListener("pointermove", handler, { passive: true });
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return useMemo(
    () => ({
      style: {
        ["--glow-x" as any]: `${pos.x}%`,
        ["--glow-y" as any]: `${pos.y}%`,
      } as React.CSSProperties,
    }),
    [pos.x, pos.y],
  );
}
