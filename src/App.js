import { useState } from "react";

function Options({ value, onClick}) {
  return (
    <button className="escolhas" onClick={onClick}>
      {value}
    </button>
  );
}

export default function Menu() {

  const [isMenuListVisible, setIsMenuListVisible] = useState(true);
  const [isPlayersListVisible, setIsPlayersListVisible] = useState(false);

  function handleClick(action) 
  {
    if (action === "Jogar")
    {
      setIsMenuListVisible(false);
      setIsPlayersListVisible(true);
    }
    else if (action === "Sair")
    {
        alert("A sair do jogo...");
    }
    else if (action === "Voltar")
    {
      setIsPlayersListVisible(false);
      setIsMenuListVisible(true);
    }
  }

  return( 
  <>
      {isMenuListVisible && (
        <>
            <Options value="Jogar" onClick={() => handleClick("Jogar")} />
            <Options value="Sair" onClick={() => handleClick("Sair")} />
        </>
      )}

      {isPlayersListVisible && (
        <>
            <ul className="lista-jogadores">
                <li><Options value="1 jogadores" onClick={() => alert("Começar jogo 1P")}/></li>
                <li><Options value="2 jogadores" onClick={() =>alert("Começar jogo 2P") }/></li>
                <li><Options value="3 jogadores" onClick={() =>alert("Começar jogo 3P")}/></li>
                <li><Options value="4 jogadores" onClick={() =>alert("Começar jogo 4P") }/></li>
            </ul>
            <Options value="Voltar" onClick={() => handleClick("Voltar")} />
        </>
      )}
  </>
  );
}