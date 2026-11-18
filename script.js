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

// Loading claw machince assets
loadSprite("claw_bg", "blind_boxes/claw_machine.png");
loadSprite("claw", "blind_boxes/claw_sheet.png", {sliceX: 2});
loadSprite("claw_box", "blind_boxes/claw_box.png");

// loading tcg machine assets
loadSprite("capsules", "tcg-packs/tcgCapsules.png");
loadSprite("basic-machine", "tcg-packs/tcgMachineBasic.png");
loadSprite("twist", "tcg-packs/tcgTwist.png");
loadSprite("common1", "tcg-packs/common1.png");
loadSprite("uncommon1", "tcg-packs/uncommon1.png");

// Loading audio assests
loadSound("bgm", "sounds/casino_ambiance.mp3");
loadSound("rip", "sounds/rippingSound.mp3");

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
  const TOP = 200; // where the claw is hanging
  const FLOOR = 467; // bottom of the glass in the machine
  const LEFT_WALL = 243; // furthest left the claw can go
  const RIGHT_WALL = 557; // furthest right the claw can go
  const SPEED = 250; // speed of claw moving
  // claw machine background
  add([
    sprite("claw_bg"),
    pos(center()),
    anchor("center"),
    scale(0.9)
  ]);
  // rand placement of blind boxes
  for (let i = 0; i < 20; i++) {
    add([
      sprite("claw_box"),
      pos(rand(300, 560), FLOOR - rand(0,40)),
      anchor("bot"),
      scale(0.9),
      area(),
      "box"
    ]);
  }
    // the claw of the machine, framw 0 = open, framw 1 = close
  const claw = add([
    sprite("claw", {frame: 0}),
    pos(400, TOP),
    anchor("top"),
    scale(0.9),
    area(),
  ]);
  
  onButtonDown("moveLeft", () => claw.move(-SPEED, 0));
  onButtonDown("moveRight", () => claw.move(SPEED, 0));
  onUpdate(() => {
    claw.pos.x = clamp(claw.pos.x, LEFT_WALL, RIGHT_WALL);
  });
  
  onButtonPress("back", () => go("arcade-scene"));
});

// Coin Machine Scene
scene("coin-machine-scene", () =>{
  
});

// Starts game at arcade lobby
go("arcade-scene");