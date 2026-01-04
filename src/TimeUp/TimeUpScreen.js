import "./TimeUpScreen.css";

export function TimeUpScreen({ 
  score,
  onRetry,
  onMainMenu
}) {
  return (
    <div className="timeout-container">
      <div className="timeout-box">
        <h1 className="timeout-title">⏰ TEMPO ESGOTADO! ⏰</h1>
        
        <p className="timeout-subtitle">
          Não conseguiste eliminar o inimigo a tempo!
        </p>

        <div className="timeout-stats">
          <div className="stat-item">
            <span className="stat-label">⭐ Pontuação Final:</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>

        <div className="timeout-message">
          <p>Tenta novamente ou volta ao menu!</p>
        </div>

        <div className="timeout-buttons">
          <button 
            className="btn btn-retry"
            onClick={onRetry}
          >
            🔄 Tentar Novamente
          </button>
          
          <button 
            className="btn btn-menu"
            onClick={onMainMenu}
          >
            🏠 Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}