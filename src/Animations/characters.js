
const directionSprite = {
  up: "magobackview.png",
  down: "mago.png",
  left: "magovistalateralesquerda.png",
  right: "magovistalateral.png",
};

export function spriteSheet(direction) {
  return {
    backgroundImage: `url(${directionSprite[direction]})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
	backgroundPosition: "center",
  };
}