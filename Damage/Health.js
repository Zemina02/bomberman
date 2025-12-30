import { useState, useCallback, useEffect } from "react";

export function useHealth(numPlayers, initialHealth = 3) {
  const [healths, setHealths] = useState([]);

  // Inicializar vidas
  useEffect(() => {
    const initial = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      health: initialHealth,
      isDead: false,
    }));
    setHealths(initial);
  }, [numPlayers, initialHealth]);

  // Dano por jogador
  const takeDamage = useCallback((playerId, amount = 1) => {
    setHealths((prev) =>
      prev.map((p) => {
        if (p.id !== playerId || p.isDead) return p;

        const newHealth = p.health - amount;

        return {
          ...p,
          health: Math.max(0, newHealth),
          isDead: newHealth <= 0,
        };
      })
    );
  }, []);

  const resetHealth = useCallback(() => {
    setHealths((prev) =>
      prev.map((p) => ({
        ...p,
        health: initialHealth,
        isDead: false,
      }))
    );
  }, [initialHealth]);

  // ✅ CORRIGIDO: Verificar se há jogadores E se todos estão mortos
  const isGameOver = healths.length > 0 && healths.every((p) => p.isDead);

  return { healths, takeDamage, isGameOver, resetHealth };
}
