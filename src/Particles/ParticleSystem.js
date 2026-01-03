import { useState, useEffect } from "react";
import { TILE_SIZE} from "../constants.js";

export function Particle({ x, y, id }) {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => Math.max(0, prev - 0.1));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      key={id}
      style={{
        position: "absolute",
        left: x * TILE_SIZE + Math.random() * 10 - 5,
        top: y * TILE_SIZE + Math.random() * 10 - 5,
        width: "12px",
        height: "12px",
        backgroundColor: `hsl(${Math.random() * 60 + 20}, 100%, 50%)`,
        borderRadius: "50%",
        opacity: opacity,
        pointerEvents: "none",
        boxShadow: `0 0 ${5 + Math.random() * 5}px rgba(255, 123, 0, ${opacity})`,
      }}
    />
  );
}

export function useParticles() {
  const [particles, setParticles] = useState([]);

  const createExplosion = (x, y) => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: `${x}-${y}-${i}-${Date.now()}`,
      x: x,
      y: y,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove after animation
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 500);
  };

  return { particles, createExplosion };
}