// Configurações de dificuldade por nível
export const DIFFICULTY_SETTINGS = {
  1: {
    level: 1,
    enemySpeed: 60,      // Frames entre movimentos (maior = mais lento)
    enemiesCount: 1,     // Número de inimigos
    bombTimer: 1500,     // Tempo até explodir (ms)
    timeLimit: 60,       // Tempo disponível (segundos)
    description: "Nível Fácil - 1 inimigo lento"
  },
  2: {
    level: 2,
    enemySpeed: 40,      // Mais rápido que nível 1
    enemiesCount: 2,     // 2 inimigos
    bombTimer: 1000,     // Explode mais rápido
    timeLimit: 60,
    description: "Nível Médio - 2 inimigos"
  },
  3: {
    level: 3,
    enemySpeed: 25,      // Muito rápido
    enemiesCount: 3,     // 3 inimigos
    bombTimer: 800,      // Explode muito rápido
    timeLimit: 60,
    description: "Nível Difícil - 3 inimigos rápidos"
  },
};

export function getDifficultySettings(levelNumber) {
  return DIFFICULTY_SETTINGS[levelNumber] || DIFFICULTY_SETTINGS[1];
}

export function isLevelComplete(levelNumber) {
  return levelNumber >= 3;
}