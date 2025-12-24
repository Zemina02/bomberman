import { useState, useCallback } from "react";

export function useHealth(initialHealth = 3) {
  const [health, setHealth] = useState(initialHealth);
  const [isGameOver, setIsGameOver] = useState(false);

  const takeDamage = useCallback((amount = 1) => {
    setHealth((prev) => {
      const newHealth = prev - amount;
      if (newHealth <= 0) {
        setIsGameOver(true);
        return 0;
      }
      return newHealth;
    });
  }, []);

  const resetHealth = () => {
    setHealth(initialHealth);
    setIsGameOver(false);
  };

  return { health, takeDamage, isGameOver, resetHealth };
}