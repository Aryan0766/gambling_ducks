// wait for the pixel font to load, then start the game
document.fonts.load('16px "Press Start 2P"').finally(startGame);

function startGame () {
  // make the canvas (the font option makes ALL text pixelated)
  kaplay({
    width: 900,
    height: 540,
    letterbox: true,
    background: [20, 10, 40],
    crisp: true,
    font: "'Press Start 2P', monospace",
    buttons: {
      moveDown: { keyboard: ["down", "s"], gamepad: ["dpad-down"]},
      moveLeft: { keyboard: ["left", "a"], gamepad: ["dpad-left"]},
      moveRight: { keyboard: ["right", "d"], gamepad: ["dpad-right"]},
      enter: { keyboard: ["enter", "space"], gamepad: ["east"]},
      back: { keyboard: ["escape"], gamepad: ["south"]}
    }
  });

  // load the files from the repo
  loadSprite("pack", "tcg-packs/spacePack.png");
  loadSound("casino", "sounds/casino_ambiance.mp3");
  loadSound("rip", "sounds/rippingSound.mp3");
  loadSound("shake","sounds/shakingSound.mp3");
  
  // loading claw machine assets
  loadSprite("blind_box", "blind_boxes/blind_box.png");
  loadSprite("claw_bg", "blind_boxes/claw_machine.png");
  loadSprite("claw", "blind_boxes/claw_sheet.png", {sliceX: 2});
  loadSprite("claw_box", "blind_boxes/claw_box.png");
  loadSprite("bow", "blind_boxes/bow.png");
  loadSprite("party_hat", "blind_boxes/party_hat.png");
  loadSprite("gold_crown", "blind_boxes/gold_crown.png");
  loadSprite("flower_pin", "blind_boxes/flower_pin.png");
  loadSprite("sweater", "blind_boxes/sweater.png");
  loadSprite("cape", "blind_boxes/cape.png");
  loadSprite("golden_duck", "blind_boxes/golden_duck.png");
  
  const SKINS = ["bow", "party_hat", "gold_crown", "flower_pin", "sweater", "cape"];

  // loading tcg machine assets
  loadSprite("spacePack", "tcg-packs/spacePack.png");
  loadSprite("capsules", "tcg-packs/tcgCapsules.png");
  loadSprite("gacha-machine", "tcg-packs/tcgMachine.png");
  loadSprite("basic-machine", "tcg-packs/tcgMachineBasic.png");
  loadSprite("twist", "tcg-packs/tcgTwist.png");
  loadSprite("common1", "tcg-packs/common1.png");
  loadSprite("uncommon1", "tcg-packs/uncommon1.png");


  // the slot symbols sheet
  loadSprite("symbols", "ducks/symbols.png", {
    sliceX: 5
  });

  // the duck sprite sheet
  loadSprite("duck", "ducks/duck_spritesheet.png", {
    sliceX: 6,
    sliceY: 5,
    anims: {
      idle: {
        from: 0,
        to: 5,
        loop: true,
        speed: 4
      }, // standing still
      left: {
        from: 6,
        to: 11,
        loop: true,
        speed: 10
      }, // walking left
      right: {
        from: 12,
        to: 17,
        loop: true,
        speed: 10
      }, // walking right
      jump: {
        from: 18,
        to: 23,
        speed: 12
      }, // hop
      happy: {
        from: 24,
        to: 29,
        loop: true,
        speed: 8
      }, // celebrate
    },
  });



  // game variables

  let coins = 100; // base coins player starts out with
  let music = null; // bg music
  let won_boxes = 0; // boxes won from the claw machine
  let collection = []; // aquired/saved skins
  let equipped = null; // current skin of the duck



  // sounds

  const SOUND_FILES = {
    spin: "", 
    reelStop: "", 
    win: "sounds/money-soundfx.mp3", 
    jackpot: "sounds/here-come-the-money-casinoze.mp3", 
    lose: "sounds/downer_noise.mp3",
    betUp: "", 
    betDown: "", 
  };

  // load all sound files
  for (const name in SOUND_FILES) {
    if (SOUND_FILES[name] !== "") loadSound(name, SOUND_FILES[name]);
  }

  // plays a sound by name 
  function playSound (name, options) {
    if (SOUND_FILES[name] === "") return null;
    return play(name, options);
  }


  // helper functions

  // buttons
  function makeButton (words, x, y, w, h, btnColor, action) {
    const button = add([rect(w, h), pos(x, y), anchor("center"), color(btnColor), area()]);
    const label = add([text(words, {
      size: 16
    }), pos(x, y), anchor("center")]);
    button.onClick(action);
    return label;
  }

  // bg music can turn it on or off
  function startMusic () {
    if (!music) music = play("casino", {
      loop: true
    });
  }

  function stopMusic () {
    if (music) {
      music.stop();
      music = null;
    }
  }

  // on off music switch
  function makeMusicSwitch (x, y) {
    add([text("MUSIC", {
      size: 12
    }), pos(x - 85, y), anchor("center"), color(255, 255, 255)]);
    const track = add([rect(90, 36), pos(x, y), anchor("center"), color(60, 60, 120), outline(3, rgb(255, 255, 255)), area()]);
    const knob = add([rect(28, 28), pos(x, y), anchor("center"), color(255, 255, 255)]);
    const word = add([text("", {
      size: 12
    }), pos(x, y), anchor("center"), color(255, 255, 255)]);

    // show the switch the right way round
    function refresh () {
      if (music) {
        track.color = rgb(70, 160, 90);
        knob.pos.x = x + 22;
        word.pos.x = x - 14;
        word.text = "ON";
      } else {
        track.color = rgb(60, 60, 120);
        knob.pos.x = x - 22;
        word.pos.x = x + 14;
        word.text = "OFF";
      }
    }

    function toggle () {
      if (music) stopMusic();
      else startMusic();
      refresh();
    }

    track.onClick(toggle);
    onKeyPress("m", toggle);
    refresh();
  }

  // the neon signs
  function makeSign (words, x, y, signColor) {
    add([rect(230, 50), pos(x, y), anchor("center"), color(20, 10, 40), outline(4, signColor)]);
    add([text(words, {
      size: 20
    }), pos(x, y), anchor("center"), color(signColor)]);
  }

  // makes machine in the lobby
  function makeCabinet (x, words, spriteName, spriteScale, bodyColor, action, screenWords = "?") {
    
    add([rect(170, 250), pos(x, 270), anchor("center"), color(bodyColor), outline(4, rgb(255, 80, 200))]);

    add([rect(170, 34), pos(x, 162), anchor("center"), color(20, 10, 40), outline(4, rgb(90, 220, 255))]);
    add([text(words, {
      size: 12
    }), pos(x, 162), anchor("center"), color(90, 220, 255)]);

    add([rect(130, 120), pos(x, 255), anchor("center"), color(10, 10, 30), outline(4, rgb(90, 220, 255))]);
    if (spriteName) {
      add([sprite(spriteName), pos(x, 255), anchor("center"), scale(spriteScale)]);
    } else {
      add([text(screenWords, {
        size: 24
      }), pos(x, 255), anchor("center"), color(255, 214, 102)]);
    }
    // controls
    add([rect(150, 36), pos(x, 345), anchor("center"), color(60, 50, 120)]);
    add([circle(8), pos(x - 30, 345), color(255, 60, 160)]);
    add([circle(8), pos(x + 30, 345), color(90, 220, 255)]);

    // remember where this machine is, so the duck can find it
    return {
      x: x,
      action: action
    };
  }



  function makeDuck (x, y) {
    return add([sprite("duck", {
      anim: "idle"
    }), pos(x, y), anchor("bot"), scale(1.3), z(10)]);
  }


  // slot machine

  const SYMBOLS = ["duck", "gem", "bow", "coin", "egg"];
  const BET_STEPS = [5, 10, 25, 50, 100]; // the bets you can pick
  let betIndex = 1; // starts at 10

  // pick any symbol at random
  function randomSymbol () {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }


  function getPayout (reels) {
    const a = reels[0];
    const b = reels[1];
    const c = reels[2];

    if (a === b && b === c) {
      if (a === "duck") return {
        times: 25,
        text: "3 DUCKS! JACKPOT x25",
        sound: "jackpot"
      };
      return {
        times: 5,
        text: "3 " + a.toUpperCase() + "S! x5",
        sound: "win"
      };
    }
    if (a === b || b === c || a === c) {
      return {
        times: 1,
        text: "PAIR! BET BACK",
        sound: "win"
      };
    }
    return {
      times: 0,
      text: "NO LUCK",
      sound: "lose"
    };
  }

  // shows a symbol on the slot reel
  function makeSymbol (name, x, y) {
    return add([sprite("symbols", {
      frame: SYMBOLS.indexOf(name)
    }), pos(x, y), anchor("center"), scale(2), z(5)]);
  }


  // start screen

  scene("start", () => {
    const title = add([text("DUCK CASINO", {
      size: 48
    }), pos(450, 70), anchor("center"), color(255, 80, 200), opacity(1)]);
    add([text("~ the quack box casino ~", {
      size: 16
    }), pos(450, 125), anchor("center"), color(90, 220, 255)]);
   

    
    add([sprite("pack"), pos(450, 300), anchor("center"), scale(0.45)]);

    makeButton("PLAY", 450, 490, 200, 50, rgb(236, 64, 160), () => {
      startMusic(); 
      go("lobby");
    });
    makeMusicSwitch(790, 500);
  });



  // lobby

  scene("lobby", () => {
    // back wall
    add([rect(900, 230), pos(0, 0), color(25, 20, 70)]);
    add([rect(900, 8), pos(0, 0), color(90, 220, 255)]);

    // signs on the wall
    makeSign("CASINO", 150, 70, rgb(255, 80, 200));
    makeSign("ARCADE", 750, 70, rgb(90, 220, 255));
    add([text("COINS: " + coins, {
      size: 14
    }), pos(450, 30), anchor("center"), color(255, 214, 102)]);
    add([text("WALK UP TO A MACHINE", {
      size: 14
    }), pos(450, 62), anchor("center"), color(255, 214, 102)]);
    add([text("ARROWS / WASD + SPACE", {
      size: 12
    }), pos(450, 90), anchor("center"), color(90, 220, 255)]);

    // checkered floor
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 15; col++) {
        const dark = (row + col) % 2 === 0;
        add([rect(60, 60), pos(col * 60, 230 + row * 60), color(dark ? rgb(20, 40, 110) : rgb(30, 60, 150))]);
      }
    }
    // machines in the lobby
    const slotMachine = makeCabinet(130, "DUCK SLOTS", null, 0, rgb(40, 30, 100), () => go("slots"), "777");
    const tcgMachine = makeCabinet(340, "TCG Gacha", null, 0, rgb(50, 50, 60), () => go("tcg-gacha-scene"), "TCG");
    const clawMachine = makeCabinet(550, "Claw Machine", null, 0, rgb(50, 50, 60), () => go("claw-machine-scene"), "Claw");
    makeCabinet(760, "COMING SOON", null, 0, rgb(50, 50, 60), null);
    const machines = [slotMachine, tcgMachine, clawMachine];

    // msg when duck is at machine
    const duck = makeDuck(450, 505);
    let facing = "left"; 
    let currentAnim = "idle";

    function setAnim (name) {
      if (currentAnim === name) return;
      duck.play(name);
      currentAnim = name;
    }

    const prompt = add([text("PRESS SPACE", {
      size: 12
    }), anchor("center"), color(255, 214, 102), z(20)]);
    let near = null;

    onUpdate(() => {
      let dx = 0;
      let dy = 0;
      if (isKeyDown("left") || isKeyDown("a")) dx = -1;
      if (isKeyDown("right") || isKeyDown("d")) dx = 1;
      if (isKeyDown("up") || isKeyDown("w")) dy = -1;
      if (isKeyDown("down") || isKeyDown("s")) dy = 1;

      duck.pos.x = clamp(duck.pos.x + dx * 200 * dt(), 30, 870);
      duck.pos.y = clamp(duck.pos.y + dy * 200 * dt(), 420, 505);

      if (dx < 0) facing = "left";
      if (dx > 0) facing = "right";
      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        duck.flipX = false;
        setAnim(facing); // left or right facing animation
      } else {
        setAnim("idle");
        duck.flipX = facing === "right"; // the idle row looks left, so flip it to look right
      }

      near = null;
      for (const m of machines) {
        if (duck.pos.dist(vec2(m.x, 400)) < 70) near = m;
      }
      prompt.hidden = near === null;
      prompt.pos = vec2(duck.pos.x, duck.pos.y + 20);
    });

    onKeyPress("space", () => {
      if (near) near.action();
    });

    makeButton("BACK", 80, 520, 130, 32, rgb(60, 60, 120), () => go("start"));
    makeMusicSwitch(790, 520);
  });

  // slots

  scene("slots", () => {
    add([text("DUCK SLOTS", {
      size: 28
    }), pos(450, 45), anchor("center"), color(255, 80, 200)]);

    add([rect(540, 230), pos(450, 205), anchor("center"), color(30, 20, 80), outline(6, rgb(255, 80, 200))]);
    const reelX = [310, 450, 590];
    const reelY = 205;
    for (const x of reelX) {
      add([rect(130, 170), pos(x, reelY), anchor("center"), color(245, 240, 225), outline(4, rgb(90, 220, 255))]);
    }

    add([polygon([vec2(0, -12), vec2(18, 0), vec2(0, 12)]), pos(190, reelY), color(255, 214, 102)]);
    add([polygon([vec2(0, -12), vec2(-18, 0), vec2(0, 12)]), pos(710, reelY), color(255, 214, 102)]);

    // display of each reel
    const shown = [null, null, null];

    function showSymbol (i, name) {
      if (shown[i]) destroy(shown[i]);
      shown[i] = makeSymbol(name, reelX[i], reelY);
    }
    showSymbol(0, "duck");
    showSymbol(1, "coin");
    showSymbol(2, "egg");

    // the text on screen
    const message = add([text("PRESS SPIN!", {
      size: 16
    }), pos(450, 350), anchor("center"), color(255, 214, 102)]);
    const coinText = add([text("", {
      size: 16
    }), pos(150, 400), anchor("center"), color(255, 214, 102)]);
    const winText = add([text("LAST WIN: 0", {
      size: 16
    }), pos(750, 400), anchor("center"), color(90, 220, 255)]);
    const betText = add([text("", {
      size: 16
    }), pos(450, 460), anchor("center"), color(255, 255, 255)]);

    function updateHud () {
      coinText.text = "COINS: " + coins;
      betText.text = "BET " + BET_STEPS[betIndex];
    }
    updateHud();

    let spinning = false;
    function changeBet (direction) {
      if (spinning) return;
      const newIndex = clamp(betIndex + direction, 0, BET_STEPS.length - 1);
      if (newIndex === betIndex) return;
      betIndex = newIndex;
      playSound(direction > 0 ? "betUp" : "betDown");
      updateHud();
    }

    let spinSound = null;

    function spin () {
      if (spinning) return;

      const bet = BET_STEPS[betIndex];
      if (coins < bet) {
        message.text = "NOT ENOUGH COINS";
        message.color = rgb(255, 90, 90);
        return;
      }

      coins -= bet;
      updateHud();
      spinning = true;
      message.text = "SPINNING...";
      message.color = rgb(90, 220, 255);
      spinSound = playSound("spin", {
        loop: true
      });

      // decide the result first
      const reels = [randomSymbol(), randomSymbol(), randomSymbol()];

      for (let i = 0; i < 3; i++) {
        const flicker = loop(0.05, () => showSymbol(i, randomSymbol()));
        wait(1 + i * 0.7, () => {
          flicker.cancel();
          showSymbol(i, reels[i]);
          playSound("reelStop");
        });
      }

      // once the last reel has stopped, pay out
      wait(2.5, () => finish(reels, bet));
    }

    function finish (reels, bet) {
      spinning = false;
      if (spinSound) {
        spinSound.stop();
        spinSound = null;
      }

      const result = getPayout(reels);
      const winnings = result.times * bet;
      coins += winnings;
      winText.text = "LAST WIN: " + winnings;

      if (winnings > 0) {
        message.text = result.text + "  +" + winnings;
        message.color = rgb(255, 214, 102);
      } else {
        message.text = result.text;
        message.color = rgb(255, 90, 160);
      }
      playSound(result.sound); 

      // if you are broke, here is a free refill
      if (coins < BET_STEPS[0]) {
        coins += 20;
        message.text = "OUT OF COINS! +20 FREE";
      }
      updateHud();
    }

    //buttons
    makeButton("SPIN", 450, 400, 300, 50, rgb(236, 64, 160), spin);
    makeButton("-", 350, 460, 50, 44, rgb(60, 60, 120), () => changeBet(-1));
    makeButton("+", 550, 460, 50, 44, rgb(60, 60, 120), () => changeBet(1));
    onKeyPress("space", spin);

    makeButton("BACK", 80, 520, 130, 32, rgb(60, 60, 120), () => {
      if (!spinning) go("lobby"); // can't leave in the middle of a spin
    });
    makeMusicSwitch(790, 520);
  });
  
  // TCG Gacha Scene
  scene("tcg-gacha-scene", () => {
    let isTwist = false;
    let isOpen = false;
  
    const machine = add([
      sprite("basic-machine"),
      pos(center()),
      anchor("center"),
      scale(1.7),
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
            scale(0.8),
            z(10),
          ]);
        }
      
      });  
    });
  });

  // Claw Machine Scene
  scene("claw-machine-scene", () => {
    const TOP = 137; // where the claw is hanging
    const FLOOR = 315; // bottom of the glass in the machine
    const LEFT_WALL = 345; // furthest left the claw can go
    const RIGHT_WALL = 555; // furthest right the claw can go
    const SPEED = 170; // speed of claw moving
    const BOTTOM = FLOOR - 47; // lowest the claw goes
    const CHUTE = 355; // the dropped prize goes here
    let mode = "move";
    let grabbed = null; // box being grabbed
    let dropped = null; // box falling into chute
    
    // claw machine background
    add([
      sprite("claw_bg"),
      pos(center()),
      anchor("center"),
      scale(0.6)
    ]);
    // rand placement of blind boxes
    for (let i = 0; i < 13; i++) {
      add([
      sprite("claw_box"),
      pos(rand(383, 557), FLOOR - rand(0,27)),
      anchor("bot"),
      scale(0.6),
      area(),
      "box"
    ]);
  }
    // the claw of the machine, frame 0 = open, framw 1 = close
    const claw = add([
      sprite("claw", {frame: 0}),
      pos(400, TOP),
      anchor("top"),
      scale(0.6),
      area(),
    ]);
    // claw moves left or right
    onButtonDown("moveLeft", () => {
      if (mode === "move") {
        claw.move(-SPEED, 0)
      }
    });
    onButtonDown("moveRight", () => {
      if (mode === "move") {
        claw.move(SPEED, 0)
      }
    });
    // when the claw is touching a box
    claw.onCollide("box", (box) => {
      if (mode === "down" && !grabbed) {
        claw.frame = 1;
        if (rand() < 0.4) {
          grabbed = box;
        }
        mode = "up";
      }
    })
    
    function release() {
      dropped = grabbed; // remember picked box
      grabbed = null; // has not grabbed anything yet
      claw.frame = 0; // open the claw
      mode = "drop"; // box is dropping
      won_boxes++;
    }
    
    // limits claw to left and right wall of machine
    onUpdate(() => {
      claw.pos.x = clamp(claw.pos.x, LEFT_WALL, RIGHT_WALL);
      if (mode === "down") {
        claw.move(0, SPEED);
        if (claw.pos.y >= BOTTOM) {
          claw.frame = 1; 
          mode = "up";
        }
      } else if (mode === "up") {
        claw.move(0, -SPEED);
        if (claw.pos.y <= TOP) {
          claw.pos.y = TOP;
          if (grabbed) {
            mode = "return"; // grabs a box and drops
          } else {
            claw.frame = 0;
            mode = "move"; // misses so try again
          }
        }
      } else if (mode === "return") {
        claw.move(-SPEED, 0);
        if (claw.pos.x <= CHUTE) {
          release();
        }
      } else if (mode === "drop") {
        dropped.move(0, 300); // box falls down
        if (dropped.pos.y >= FLOOR + 10) { // box reaches the chute
          destroy(dropped);
          mode = "done"; // only runs once
          
          add([
            sprite("claw_box"),
            pos(387, 450),
            anchor("bot"),
            scale(0.6)
          ]);
          
          let prize = choose(SKINS);
          if (won_boxes > 5 && rand() < 0.03) { // golden duck rand
            prize = "golden_duck";
          }
          // wait(0.6, () => go("box-reveal", prize));
        }
      }
      if (grabbed) {
        grabbed.pos = claw.pos.add(0, 50); // box with claw
      }
    });
    onButtonPress("enter", () => {
      if (mode === "move") {
        mode = "down";
      }
    });
    
    onButtonPress("back", () => go("lobby"));
  });

//scene("blind-box-reveal", () => {

  //});
  
  go("start");
}
