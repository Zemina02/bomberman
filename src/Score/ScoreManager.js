import { useState, useCallback, useEffect } from "react";

export function useScore(initialLevel = 1, timeLimit = 60) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(initialLevel);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [boxesDestroyed, setBoxesDestroyed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Adicionar pontos (genérico)
  const addScore = useCallback((points) => {
    setScore((prev) => prev + points);
  }, []);

  // Inimigo eliminado = 100 pontos
  const killEnemy = useCallback(() => {
    setEnemiesKilled((prev) => prev + 1);
    addScore(100);
    console.log("Inimigo eliminado! +100 pts");
  }, [addScore]);

  // Caixa destruída = 10 pontos
  const destroyBox = useCallback(() => {
    setBoxesDestroyed((prev) => prev + 1);
    addScore(10);
    console.log("Caixa destruída! +10 pts");
  }, [addScore]);

  // Incrementar timer (chamar a cada segundo)
  const incrementTime = useCallback(() => {
    setTimeElapsed((prev) => prev + 1);
    setTimeRemaining((prev) => {
      const newTime = Math.max(0, prev - 1);
      if (newTime === 0) {
        setIsTimeUp(true);
      }
      return newTime;
    });
  }, []);

  // Reset para novo nível
  const resetForNewLevel = useCallback((newLevel, newTimeLimit = 60) => {
    setLevel(newLevel);
    setTimeElapsed(0);
    setEnemiesKilled(0);
    setBoxesDestroyed(0);
    setTimeRemaining(newTimeLimit);
    setIsTimeUp(false);
    // NÃO reseta score - mantém pontos acumulados!
  }, []);

  // Reset completo (nova partida)
  const resetComplete = useCallback((newTimeLimit = 60) => {
    setScore(0);
    setLevel(initialLevel);
    setTimeElapsed(0);
    setEnemiesKilled(0);
    setBoxesDestroyed(0);
    setTimeRemaining(newTimeLimit);
    setIsTimeUp(false);
  }, [initialLevel]);

  return {
    // Estado
    score,
    level,
    enemiesKilled,
    timeElapsed,
    boxesDestroyed,
    timeRemaining,
    isTimeUp,

    // Funções
    addScore,
    killEnemy,
    destroyBox,
    incrementTime,
    resetForNewLevel,
    resetComplete,
  };
}