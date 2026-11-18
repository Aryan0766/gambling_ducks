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
loadSprite("common1", "tcg-packs/common1.png");
loadSprite("uncommon1", "tcg-packs/uncommon1.png");
loadSprite("spacePack", "tcg-packs/spacePack.png");

// Loading audio assests
loadSound("bgm", "sounds/casino_ambiance.mp3");
loadSound("rip", "sounds/rippingSound.mp3");
loadSound("shake", "sounds/shakingSound.mp3");

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
  let isTwist = false;
  let isOpen = false;
  
  const machine = add([
    sprite("basic-machine"),
    pos(center()),
    anchor("center"),
    scale(2.4),
  ]);
  
  const capsules = machine.add([
    sprite("capsules"),
    pos(),
    anchor("center"),
  ]);
  
  const twist = machine.add([
    sprite("twist"),
    pos(0,0),
    //rotate(),
    anchor("center"),
  ]);
  
  // Player presses enter to insert coin
  onButtonPress("enter", () => {
    if (isTwist) return;
    
    isTwist = true;
    let timer = 0;
    const spinTime = 4;
    
    // Sounds of the capsules moving in the machine
    const shake = play("shake", {
    volume: 0.6,
    });
    
    // Animates machine to show capsule is being fetches
    const spin = onUpdate(() => {
      timer += dt();
      twist.angle += 2;
      
      // Makes capsules shake when machine is played
      capsules.pos = vec2(rand(-2, 2), rand(-2, 2));
      
      // Checks if machine is done getting pack and stops animation
      if(timer >= spinTime){
        spin.cancel();
        
        twist.angle = 0;
        capsules.pos = vec2(0, 0);
        
        const pack = add([
          sprite("spacePack"),
          pos(center()),
          anchor("center"),
          scale(1.2),
          z(10),
        ]);
      }
      
    });  
  });
  
});

// Claw Machine Scene
scene("claw-machine-scene", () => {
  
});

// Coin Machine Scene
scene("coin-machine-scene", () =>{
  
});

// Starts game at arcade lobby
go("arcade-scene");