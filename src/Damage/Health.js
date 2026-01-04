import { useState, useCallback, useEffect } from "react";
import { SoundManager } from "../Sound/SoundManager";
  
  
export function useHealth(numPlayers, initialHealth = 3) {
  const [healths, setHealths] = useState([]);
  const [lastDamagedPlayer, setLastDamagedPlayer] = useState(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [deadPlayers, setDeadPlayers] = useState([]); 

  // Inicializar vidas
  useEffect(() => {
    const initial = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      health: initialHealth,
      isDead: false,
    }));
    setHealths(initial);
    setDeadPlayers([]); 
  }, [numPlayers, initialHealth]);

  // Dano por jogador
  const takeDamage = useCallback((playerId, amount = 1) => {
    SoundManager.damage();
    
    // Trigger flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 400);
    
    // Track which player was damaged
    setLastDamagedPlayer(playerId);
    setTimeout(() => setLastDamagedPlayer(null), 400);

    setHealths((prev) =>
      prev.map((p) => {
        if (p.id !== playerId || p.isDead) return p;

        const newHealth = p.health - amount;

        
        if (newHealth <= 0) {
          setDeadPlayers((prevDead) => {
            if (!prevDead.includes(playerId)) {
              return [...prevDead, playerId];
            }
            return prevDead;
          });
        }

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
    setDeadPlayers([]); // ✅ Reset também
  }, [initialHealth]);

  // Verificar se há jogadores E se todos estão mortos
  const isGameOver = healths.length > 0 && healths.every((p) => p.isDead);

  return { 
    healths, 
    takeDamage, 
    isGameOver, 
    resetHealth,
    lastDamagedPlayer,
    flashEffect,
    deadPlayers // ✅ NOVO: Retorna quem morreu
  };
}