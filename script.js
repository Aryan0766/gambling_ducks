kaplay({
  // Button Setup
  buttons: {
    moveUp: {
      keyboard: ["up", "w"],
      gamepad: ["dpad-up"],
    },
    moveDown: {
      keyboard: ["down", "s"],
      gamepad: ["dpad-down"],
    },
    moveLeft: {
      keyboard: ["left", "a"],
      gamepad: ["dpad-left"],
    },
    moveRight: {
      keyboard: ["right", "d"],
      gamepad: ["dpad-right"],
    },
    enter:{
      keyboard: ["enter"],
      gamepad: ["east"],
    },
  },

  // Background Setup
  width: 800,
  height: 800,
  background: [26, 20, 44],
});

// Global Variables
let chaseCard = 0.05;

// Loading game assets
loadSprite("gacha-machine", "tcg-packs/tcgMachine.png");
loadSprite("claw-machine", "tcg-packs/tcgMachine.png");
loadSprite("coin-machine", "tcg-packs/tcgMachine.png");

// loading tcg machine assets
loadSprite("capsules", "tcg-packs/tcgCapsules.png");
loadSprite("basic-machine", "tcg-packs/tcgMachineBasic.png");
loadSprite("twist", "tcg-packs/tcgTwist.png");

// Loading audio assests
loadSound("bgm", "sounds/casino_ambiance.mp3");

// Arcade Scene
scene("arcade-scene", () => {
  let gameSelected = 0;
  const space = 200;
  
  // Arcade Background Sound
  const bgm = play("bgm", {
    loop: true,
    volume: 0.2,
  });
  
  // Array of games
  const games = [
    {sprite: "gacha-machine", scene: "tcg-gacha-scene"},
    {sprite: "claw-machine", scene: "claw-machine-scene"},
    {sprite: "coin-machine", scene: "coin-machine-scene"},
  ];
  
  // Calculated the x-coord to center machines
  const startX = center().x - ((games.length - 1) * space) / 2;
  
  // Loops through each game machine and adds it to map
  const machineSprites = games.map((game, i) => {
    return add([
      sprite(game.sprite),
      pos(startX + (i * space), center().y),
      anchor("center"),
      scale(0.7),
      opacity(0.6)
    ])
  })
  
  // Emphasizes/Highlights the game that is hovered
  function updateHover(){
    machineSprites.forEach((g, i) => {
      if (i === gameSelected){
        g.opacity = 1;
        g.scale = vec2(0.8);
      }
      else{
        g.opacity = 0.6;
        g.scale = vec2(0.7);
      }
    });
  }
  
  updateHover();
  
  // Lets player click or move left to hover over previous game
  onButtonPress("moveLeft", () => {
    gameSelected = (gameSelected - 1 + games.length) % games.length;
    updateHover();
  });
  
  // Lets player click or move right to hover over next game
  onButtonPress("moveRight", () => {
    gameSelected = (gameSelected + 1) % games.length;
    updateHover();
  });
  
  // Takes player to game that was chosen
  onButtonPress("enter", () => {
    bgm.stop();
    go(games[gameSelected].scene);
  });
});

// TCG Gacha Scene
scene("tcg-gacha-scene", () => {
  
});

// Claw Machine Scene
scene("claw-machine-scene", () => {
  
});

// Coin Machine Scene
scene("coin-machine-scene", () =>{
  
});

// Starts game at arcade lobby
go("arcade-scene");