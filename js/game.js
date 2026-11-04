(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const config = window.GATA_CONFIG;
  const scenes = window.GameScenes;
  const state = window.GameStorage.load();
  const canvas = $("world"), ctx = canvas.getContext("2d");
  let frame = 0, toastTimer = null, walkTimer = null, dialogueIndex = 0, activeLines = [], dialogueSpeaker = null, modalAction = null, interactionCooldown = false, renderActive = false, mewX = null, lastDirection = 1;
  const WORLD_WIDTH = 800, WORLD_HEIGHT = 420;
  const palette = ["#ff88bd", "#83e5dc", "#c5a5ff", "#ffd38a", "#95a9ff"];
  const defaultMemories = [
    {
      title: "Nossas loucuras e cosplays",
      photo: "assets/photos/lembranca-1.jpg",
      note: "Porque com você qualquer rolê vira a melhor diversão do mundo — até de Akatsuki!"
    },
    {
      title: "Nossos passeios ao sol",
      photo: "assets/photos/lembranca-2.jpg",
      note: "Qualquer estrada e qualquer lugar ficam incríveis quando estou ao seu lado."
    },
    {
      title: "Pertinho um do outro",
      photo: "assets/photos/lembranca-3.jpg",
      note: "O meu lugar favorito no universo inteiro sempre vai ser bem pertinho de você."
    },
    {
      title: "Nossos sorrisos por aí",
      photo: "assets/photos/lembranca-4.jpg",
      note: "Do passeio mais simples aos nossos melhores momentos: amo cada segundo com você."
    }
  ];
  function getMemories() {
    return Array.isArray(config.memories) && config.memories.length ? config.memories : defaultMemories;
  }
  const memoryImages = getMemories().map(memory => {
    if (!memory || !memory.photo) return null;
    const img = new Image();
    img.src = memory.photo;
    return img;
  });

  function objectIsComplete(phaseIndex, object) {
    if (phaseIndex === 0) {
      const item = object.id === "star" ? "Estrela-guia" : "Bilhete de missão";
      return state.completedObjects.includes(object.id) || state.inventory.includes(item);
    }
    if (phaseIndex === 1) return state.powers.includes(object.id.slice(6));
    if (phaseIndex === 2) {
      const index = Number(object.id.slice(-1)) - 1;
      return state.openedMemories.includes(`memory-${index}`);
    }
    if (phaseIndex === 3) {
      if (object.id === "window") return state.completedObjects.includes("window") || state.inventory.includes("Uma pausa sem pressa");
      return object.id === "hug" && state.flags.hugged;
    }
    if (phaseIndex === 4) return object.id === "pedestal" && state.flags.peidaru;
    return object.id === "letter-final" && state.flags.finalRead;
  }
  function phaseIsComplete(index) {
    if (index === 0) return scenes[index].objects.every(object => objectIsComplete(index, object));
    if (index === 1) return window.GameDialogue.powers.every(power => state.powers.includes(power.id));
    if (index === 2) return scenes[index].objects.every(object => objectIsComplete(index, object));
    if (index === 3) return state.flags.hugged;
    if (index === 4) return state.flags.peidaru;
    return state.flags.finalRead;
  }
  function missionProgress(index) {
    if (index === 0 || index === 2) return scenes[index].objects.filter(object => objectIsComplete(index, object)).length;
    if (index === 1) return window.GameDialogue.powers.filter(power => state.powers.includes(power.id)).length;
    return phaseIsComplete(index) ? 1 : 0;
  }
  function syncCompletedPhases() {
    const qualityByPhase = ["courage", "creativity", "care", "tenderness", "humor", "love"];
    scenes.forEach((scene, index) => {
      if (!phaseIsComplete(index)) return;
      if (!state.completedPhases.includes(index)) state.completedPhases.push(index);
      const quality = qualityByPhase[index];
      if (Array.isArray(config.qualities) && config.qualities.some(item => item.id === quality) && !state.qualities.includes(quality)) {
        state.qualities.push(quality);
      }
    });
  }
  function playerWorldX() { return 95 + state.position * (WORLD_WIDTH - 190); }

  const mewPixels = [
    ["#8c5f78", "24.3,24.8,31.9.2,29.10,20.12,16.15,9.16,8.17,11.17,32.17,9.18,33.18,8.19,17.19,6.20,45.21.10,39.22.7,56.22,58.22,36.23.4,58.23.2,4.24,22.24,32.24.4,59.24,4.25,19.25,31.25,34.25.2,40.25.2,3.26,30.26,3.27,23.27.2,29.27,58.27,3.28,20.28.3,25.28,36.28,41.28,17.29.3,5.30.3,11.30.6,28.30,8.31.5,53.32,29.33,50.33,49.34.2,29.35,47.35.3,29.36,44.36.4,45.37.2,45.38,28.39,45.39,28.40,28.41,45.41,39.42,28.43,40.43.4,30.44,39.44,31.45.2,47.45,29.47,45.52,33.55.2,51.59,48.60,50.60"],
    ["#e4aec4", "25.3,23.4,20.6,19.8.4,17.9.4,22.9,33.9,21.10,30.10,24.11.2,34.11,22.12,33.12,17.13,20.13.2,33.13,16.14,14.15,33.15,35.15,30.16,32.16,34.16,9.17,28.17.2,31.17,33.17,36.17,28.18.3,19.19,22.19.2,28.19.2,34.19,36.19,17.20,20.20,23.20,28.20.2,34.20,17.21,19.21,23.21,31.21,33.21,35.21,19.22,23.22,29.22.4,34.22,19.23.3,30.23.3,21.24,29.24,20.25,30.25,37.25.2,29.26,42.26,26.27.2,34.27.7,33.28,35.28,24.29.5,30.29.3,36.29,23.30,26.30,35.30,37.30,24.31,38.31,39.32,36.36.2,36.37.2,44.37,29.38,36.38.2,37.40.2,30.41,37.41,39.41,43.41.2,30.42,36.42,41.42,31.43,33.43.4,38.43,35.44.3,45.45.2,45.46.2,31.47,45.47.3,30.48.2,48.48,30.49.3,45.49,30.50.3,45.50,32.51.3,32.52.3,31.53.4,50.53,32.54,34.54,46.55,46.56,51.56,46.57,50.57,47.58,50.58.2,48.59,50.59"],
    ["#bf88a2", "26.3,26.4,21.5,25.6,18.7,17.8,16.9,21.9,23.9,15.10.6,22.10,34.10,14.11.8,13.12.7,34.12,12.13.5,34.13,11.14.5,10.15.4,15.15,10.16.4,31.16,36.16,10.17,17.17,30.17,8.18,31.18,7.19,20.19.2,7.20,19.20,21.20.2,36.20,6.21,29.21,55.21.2,5.22,17.22,57.22,5.23,23.23,33.23,18.24,23.24,31.24,32.25.2,36.25,39.25,58.25.2,23.26,31.26.4,58.26,25.27,28.27,30.27.4,42.27,57.27,26.28.7,56.28.2,4.29,29.29,55.29.2,27.30,29.30,54.30.2,22.31,25.31,53.31.2,23.32,52.32,41.33,51.33,42.34,43.35,29.37,37.39,45.40,38.41,31.42,37.42.2,40.42,42.42.4,29.43,32.43,37.43,39.43,44.43.3,29.44,31.44.4,38.44,44.44.3,29.45.2,44.45,29.46.3,47.46,30.47,32.47,29.48,45.48,29.49,33.49,49.50,30.51,45.51,30.52,50.52,51.55,46.58,47.59,49.60"],
    ["#523548", "22.4,26.5,19.6,25.7,15.9,34.9,14.10,27.10.2,13.11,12.12,21.12,35.12,11.13,35.13,35.14,14.16,7.18,17.18,5.21,22.21,43.21.2,57.21,6.22,35.22,38.22,46.22.2,55.22,4.23,17.23,34.23.2,40.23,5.24,36.24,58.24,3.25,4.26,22.26,59.26,4.27,22.27,4.28,19.28,23.28,3.29,5.29,16.29,20.29,4.30,8.30.3,17.30,22.30,7.31,13.31.2,26.31,52.31,22.32,40.32,51.32,52.33,29.34,48.34,46.35,28.38,28.42,46.42,28.44,40.44,28.45,35.45.3,28.46,32.46,44.46,44.47,48.47,33.48,49.49,29.50,34.50,35.52,35.53,45.53,31.54,35.54,51.54,32.55"],
    ["#f7c7db", "24.4,22.5.4,22.6.3,19.7.6,18.8,23.8,26.11.3,30.11.4,26.12.7,18.13.2,24.13.2,27.13.6,18.14.3,22.14,27.14.8,18.15.5,26.15.7,34.15,17.16.13,33.16,35.16,19.17.9,34.17.2,18.18,20.18.8,34.18.3,24.19.4,35.19,24.20.4,35.20,18.21,24.21.5,34.21,18.22,24.22.5,33.22,24.23.6,20.24,24.24.5,30.24,21.25,23.25.7,24.26.5,35.26.6,34.28,33.29.3,24.30.2,30.30.5,36.30,30.31.8,30.32.8,30.33.11,31.34.11,31.35.12,31.36.5,38.36.6,31.37.5,38.37.6,30.38.6,38.38.7,29.39.8,38.39.6,29.40.8,39.40.6,29.41,31.41.6,40.41.3,29.42,32.42.4,30.43,32.48,46.48.2,46.49.3,33.50,47.50,31.51,47.51.3,31.52,46.52.3,46.53.4,33.54,46.54,48.56.2,47.57.3,51.57,48.58"],
    ["#ffe0ee", "25.4,21.6,31.10.3,29.11,23.12.3,22.13.2,26.13,17.14,21.14,23.14.4,17.15,23.15.3,18.17,19.18,18.19,18.20,18.23,19.24,22.25,41.26,41.27,23.31,38.32,30.34,30.35,30.36,30.37,44.39,46.50,48.50,46.51,49.52,47.54.4,47.55.4,47.56,50.56,49.58,49.59"],
    ["#20263e", "32.18"],
    ["#f8f9ff", "30.19,30.20,20.21,30.21,20.22"],
    ["#2d5c94", "31.19.3,22.22"],
    ["#6298d0", "31.20.3,21.21,32.21,21.22,22.23"]
  ];

  function drawMew(context, x, y, scale, flipHorizontal) {
    context.save();
    context.translate(x + (flipHorizontal ? 64 * scale : 0), y + Math.sin(frame * .07) * 3.5);
    context.scale(flipHorizontal ? -scale : scale, scale);
    const pixel = (px, py, width, height, color) => {
      context.fillStyle = color;
      context.fillRect(px, py, width, height);
    };
    mewPixels.forEach(([color, runs]) => {
      context.fillStyle = color;
      runs.split(",").forEach(token => {
        const parts = token.split(".");
        context.fillRect(Number(parts[0]), Number(parts[1]), parts[2] ? Number(parts[2]) : 1, 1);
      });
    });
    const sparkle = Math.sin(frame * .09) > 0;
    pixel(5, 13, 2, 2, sparkle ? "#ffe5f4" : "#8ce9e2");
    pixel(54, 11, 2, 2, sparkle ? "#8ce9e2" : "#ffb9df");
    pixel(9, 46, 2, 2, "#ffb9df");
    pixel(55, 44, 2, 2, "#ffe0ee");
    context.restore();
  }
  const drawNubi = drawMew;
  function drawPartner(context, x, y, scale) {
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    const pixel = (px, py, width, height, color) => {
      context.fillStyle = color;
      context.fillRect(px, py, width, height);
    };
    const c = {
      hairDeep: "#1f1512", hair: "#33221d", hairLight: "#4d332b", hairGlint: "#66453b",
      skinShade: "#c79274", skin: "#e0ab8b", skinLight: "#f0bfa1",
      glasses: "#191820", glassesGlint: "#9ab3cf",
      eyeBrown: "#5c3624", eyeDark: "#241612", white: "#ffffff", stubble: "#4a352d",
      hoodieDark: "#1f212b", hoodie: "#2c2f3d", hoodieLight: "#3d4154", string: "#70758c",
      shirt: "#14151c", octocat: "#e8edf5",
      jeans: "#2a476e", jeansLight: "#3c608f",
      shoe: "#1a1921", shoeWhite: "#f2f0f7", tattoo: "#4f4644"
    };
    // Legs (blue jeans) & Converse sneakers
    pixel(21, 48, 9, 9, c.jeans); pixel(22, 48, 3, 8, c.jeansLight);
    pixel(34, 48, 9, 9, c.jeans); pixel(35, 48, 3, 8, c.jeansLight);
    pixel(19, 56, 11, 4, c.shoe); pixel(18, 58, 4, 2, c.shoeWhite); pixel(18, 60, 12, 2, c.shoeWhite);
    pixel(34, 56, 11, 4, c.shoe); pixel(42, 58, 4, 2, c.shoeWhite); pixel(34, 60, 12, 2, c.shoeWhite);

    // Neck
    pixel(26, 28, 12, 6, c.skinShade); pixel(27, 28, 10, 5, c.skin);

    // Torso: Black GitHub T-shirt + Dark Hoodie with drawstrings
    pixel(17, 32, 30, 17, c.hoodie);
    pixel(15, 31, 34, 4, c.hoodieLight);
    pixel(25, 33, 14, 16, c.shirt);
    pixel(23, 33, 2, 16, c.hoodieLight); pixel(39, 33, 2, 16, c.hoodieLight);
    pixel(25, 34, 1, 8, c.string); pixel(38, 34, 1, 8, c.string);

    // GitHub Octocat emblem on chest
    pixel(29, 38, 6, 6, c.octocat); pixel(28, 39, 8, 4, c.octocat);
    pixel(30, 39, 1, 1, c.shirt); pixel(33, 39, 1, 1, c.shirt);
    pixel(30, 40, 4, 2, c.shirt); pixel(31, 42, 2, 2, c.shirt);

    // Arms + Signature Thumbs-up + Hand Tattoo
    pixel(13, 34, 5, 11, c.hoodieDark); pixel(14, 34, 3, 10, c.hoodie);
    pixel(13, 45, 4, 4, c.skin); pixel(14, 46, 2, 2, c.tattoo);
    pixel(46, 34, 5, 8, c.hoodie); pixel(48, 36, 5, 5, c.skin);
    pixel(50, 33, 2, 3, c.skinLight); pixel(49, 37, 3, 2, c.tattoo);

    // Head & Face
    pixel(19, 12, 26, 15, c.skin); pixel(21, 27, 22, 2, c.skin); pixel(24, 29, 16, 1, c.skin);
    pixel(17, 19, 2, 5, c.skinShade); pixel(45, 19, 2, 5, c.skinShade);

    // Chin Stubble, Moustache & Smile
    pixel(25, 29, 14, 1, c.stubble); pixel(22, 28, 3, 1, c.stubble); pixel(39, 28, 3, 1, c.stubble);
    pixel(27, 24, 10, 1, c.stubble);
    pixel(27, 25, 10, 2, c.white);
    pixel(26, 25, 1, 1, c.stubble); pixel(37, 25, 1, 1, c.stubble);

    // Eyebrows & Brown Eyes
    pixel(21, 15, 6, 1, c.hairDeep); pixel(37, 15, 6, 1, c.hairDeep);
    pixel(21, 18, 6, 3, c.white); pixel(22, 18, 4, 3, c.eyeBrown); pixel(23, 18, 2, 2, c.eyeDark); pixel(22, 18, 1, 1, c.white);
    pixel(37, 18, 6, 3, c.white); pixel(38, 18, 4, 3, c.eyeBrown); pixel(39, 18, 2, 2, c.eyeDark); pixel(38, 18, 1, 1, c.white);

    // Rectangular Dark-Framed Glasses
    pixel(19, 16, 10, 1, c.glasses); pixel(19, 21, 10, 1, c.glasses);
    pixel(19, 17, 1, 4, c.glasses); pixel(28, 17, 1, 4, c.glasses); pixel(26, 17, 1, 1, c.glassesGlint);
    pixel(35, 16, 10, 1, c.glasses); pixel(35, 21, 10, 1, c.glasses);
    pixel(35, 17, 1, 4, c.glasses); pixel(44, 17, 1, 4, c.glasses); pixel(42, 17, 1, 1, c.glassesGlint);
    pixel(29, 17, 6, 1, c.glasses); pixel(17, 17, 2, 1, c.glasses); pixel(45, 17, 2, 1, c.glasses);

    // Messy Spiky Dark Brown Hair
    pixel(18, 5, 28, 7, c.hair); pixel(15, 8, 34, 6, c.hair);
    pixel(22, 3, 7, 3, c.hair); pixel(31, 2, 8, 4, c.hair); pixel(40, 4, 5, 3, c.hair);
    pixel(13, 10, 4, 4, c.hair); pixel(47, 10, 4, 4, c.hair);
    pixel(15, 13, 4, 6, c.hairDeep); pixel(45, 13, 4, 6, c.hairDeep);
    pixel(19, 12, 5, 3, c.hair); pixel(26, 12, 6, 2, c.hairDeep); pixel(34, 12, 5, 3, c.hair); pixel(41, 12, 4, 2, c.hair);
    pixel(23, 6, 16, 3, c.hairLight); pixel(26, 5, 8, 2, c.hairGlint);
    pixel(18, 9, 6, 2, c.hairLight); pixel(38, 9, 7, 2, c.hairLight);
    context.restore();
  }
  function guideTip() {
    const tips = [
      state.phase === 0
        ? phaseIsComplete(0)
          ? "Boa! Os brilhos já acenderam a portinha. Vá até ela e toque em Interagir!"
          : "Encontre os dois brilhos. Toque em Interagir perto de cada um!"
        : "A portinha abriu! Ande até ela e toque em Interagir para seguir.",
      "Cada poder é um brilho no mapa. Explore os três para revelar a portinha!",
      "Abra os quatro baús. Cada um guarda uma foto e uma lembrança especial de vocês!",
      state.flags.hugged
        ? "A portinha já está brilhando! Chegue pertinho dela para continuar."
        : "O abraço está esperando mais à direita. Depois, procure a portinha!",
      state.flags.peidaru
        ? "PEIDARU liberado! A portinha para o último capítulo apareceu!"
        : "Aproxime-se do pedestal dourado e prepare-se para a magia mais inesperada.",
      state.flags.finalRead
        ? "Missão cumprida! A carta e a foto de vocês ficam guardadas aqui."
        : "Encontre a carta no jardim estrelado. A última surpresa está esperando!"
    ];
    return `Dica do Mew: ${tips[state.phase]}`;
  }
  function finalPhotoMarkup() {
    if (!config.finalPhoto) return "";
    return `<img class="final-couple-photo" src="${escapeHtml(config.finalPhoto)}" alt="Uma fotografia de vocês dois juntos" onerror="this.replaceWith(Object.assign(document.createElement('p'),{textContent:'A foto não carregou. Confira o caminho em js/config.js.'}))">`;
  }

  function drawAvatar(context, x, y, scale, pose) {
    context.save(); context.translate(x, y); context.scale(scale, scale);
    const pixel = (px, py, w, h, color) => { context.fillStyle = color; context.fillRect(px, py, w, h); };
    const c = {
      hairDeep: "#6e2214", hairShade: "#9c341c", hair: "#cc5026", hairLight: "#e66d35", hairGlint: "#f79752",
      skinShade: "#dfb8a2", skin: "#f6d7c4", skinLight: "#ffeadc", blush: "#f2aba0", freckle: "#c47255",
      starPatch: "#a97ef5", starPatchLight: "#decfff",
      lash: "#1c1522", eyeBrownDark: "#45291c", eyeBrown: "#73462f", eyeAmber: "#9e6646", white: "#ffffff",
      glasses: "#cfa556", glassesGlint: "#f5df9d", glassesShade: "#9e7938",
      lips: "#d86b7d", lipsLight: "#eb8898",
      tattooDark: "#252734", tattooMid: "#3f4354", tattooEye: "#f5be42", armTattoo: "#7d645e",
      shirt: "#191822", shirtLight: "#272536", kimono: "#242134", kimonoEdge: "#3a3452", kimonoStar: "#dcd4f5",
      pants: "#1d1c29", pantsLight: "#2d2b3d", shoe: "#14131c", shoeSole: "#f2effa", piercing: "#f7d36a"
    };
    const step = pose === "walk" ? Math.floor(frame / 8) % 2 : 0;
    const cheer = pose === "cheer";
    const legL = pose === "walk" ? (step === 0 ? 1 : -1) : 0;
    const legR = -legL;

    // Back hair layer (long sleek ginger-copper hair)
    pixel(13, 12, 38, 34, c.hairDeep);
    pixel(12, 16, 40, 28, c.hairShade);
    pixel(14, 10, 36, 35, c.hair);

    // Legs & Sneakers
    pixel(23, 48 + legL, 7, 9, c.pants);
    pixel(24, 48 + legL, 2, 8, c.pantsLight);
    pixel(34, 48 + legR, 7, 9, c.pants);
    pixel(35, 48 + legR, 2, 8, c.pantsLight);
    pixel(21, 56 + legL, 10, 4, c.shoe);
    pixel(23, 56 + legL, 4, 1, c.pantsLight);
    pixel(20, 60 + legL, 11, 2, c.shoeSole);
    pixel(33, 56 + legR, 10, 4, c.shoe);
    pixel(37, 56 + legR, 4, 1, c.pantsLight);
    pixel(33, 60 + legR, 11, 2, c.shoeSole);

    // Neck & Grinning Cat Neck Tattoo
    pixel(26, 29, 12, 7, c.skinShade);
    pixel(27, 29, 10, 6, c.skin);
    pixel(27, 30, 2, 2, c.tattooDark);
    pixel(35, 30, 2, 2, c.tattooDark);
    pixel(27, 31, 10, 4, c.tattooDark);
    pixel(28, 32, 8, 3, c.tattooMid);
    pixel(29, 32, 2, 1, c.tattooEye);
    pixel(33, 32, 2, 1, c.tattooEye);
    pixel(29, 34, 6, 1, c.skinLight);
    pixel(30, 34, 1, 1, c.tattooDark);
    pixel(32, 34, 1, 1, c.tattooDark);
    pixel(34, 34, 1, 1, c.tattooDark);

    // Torso: Black top + celestial starry kimono
    pixel(19, 35, 26, 14, c.shirt);
    pixel(25, 35, 14, 2, c.skinShade);
    pixel(26, 35, 12, 1, c.skin);
    pixel(27, 37, 10, 11, c.shirtLight);
    pixel(18, 35, 7, 15, c.kimono);
    pixel(39, 35, 7, 15, c.kimono);
    pixel(24, 35, 2, 15, c.kimonoEdge);
    pixel(38, 35, 2, 15, c.kimonoEdge);
    pixel(20, 39, 2, 2, c.kimonoStar);
    pixel(42, 41, 2, 2, c.kimonoStar);
    pixel(21, 45, 1, 1, c.kimonoStar);
    pixel(41, 46, 1, 1, c.kimonoStar);

    if (!cheer) {
      pixel(15, 36, 4, 7, c.kimono);
      pixel(15, 43, 4, 6, c.skin);
      pixel(16, 44, 2, 1, c.armTattoo);
      pixel(16, 46, 1, 1, c.armTattoo);
      pixel(16, 47, 3, 2, c.skinLight);
      pixel(45, 36, 4, 7, c.kimono);
      pixel(45, 43, 4, 6, c.skin);
      pixel(46, 44, 2, 1, c.armTattoo);
      pixel(47, 46, 1, 1, c.armTattoo);
      pixel(45, 47, 3, 2, c.skinLight);
    }

    // Front hair strands falling over shoulders/chest
    pixel(13, 22, 5, 22, c.hairShade);
    pixel(14, 18, 5, 24, c.hair);
    pixel(15, 20, 3, 19, c.hairLight);
    pixel(16, 24, 2, 10, c.hairGlint);
    pixel(15, 42, 3, 3, c.hair);
    pixel(46, 22, 5, 22, c.hairShade);
    pixel(45, 18, 5, 24, c.hair);
    pixel(46, 20, 3, 19, c.hairLight);
    pixel(46, 24, 2, 10, c.hairGlint);
    pixel(46, 42, 3, 3, c.hair);

    // Head & Face shape + Ears + Gold Piercing
    pixel(19, 12, 26, 15, c.skin);
    pixel(20, 27, 24, 2, c.skin);
    pixel(23, 29, 18, 1, c.skin);
    pixel(21, 13, 22, 2, c.skinLight);
    pixel(16, 19, 3, 6, c.skinShade);
    pixel(17, 20, 2, 4, c.skin);
    pixel(17, 22, 2, 2, c.piercing);
    pixel(45, 19, 3, 6, c.skinShade);
    pixel(45, 20, 2, 4, c.skin);
    pixel(46, 22, 1, 2, c.piercing);

    // Blush & Freckles
    pixel(20, 23, 5, 3, c.blush);
    pixel(39, 23, 5, 3, c.blush);
    [[22, 23], [26, 24], [28, 23], [31, 23], [35, 23], [37, 24], [39, 23], [41, 24], [42, 23]].forEach(([fx, fy]) => {
      pixel(fx, fy, 1, 1, c.freckle);
    });

    // Two Purple Star Stickers on her right cheek
    pixel(19, 24, 3, 1, c.starPatch);
    pixel(20, 23, 1, 3, c.starPatch);
    pixel(20, 24, 1, 1, c.starPatchLight);
    pixel(23, 25, 3, 1, c.starPatch);
    pixel(24, 24, 1, 3, c.starPatch);
    pixel(24, 25, 1, 1, c.starPatchLight);

    // Eyebrows & Brown Eyes with Winged Eyeliner
    pixel(21, 14, 6, 1, c.hairShade);
    pixel(37, 14, 6, 1, c.hairShade);
    pixel(20, 17, 7, 1, c.lash);
    pixel(19, 16, 2, 1, c.lash);
    pixel(21, 18, 6, 4, c.white);
    pixel(22, 18, 4, 4, c.eyeBrownDark);
    pixel(22, 19, 4, 3, c.eyeBrown);
    pixel(23, 20, 2, 2, c.eyeAmber);
    pixel(23, 18, 2, 2, c.lash);
    pixel(22, 18, 1, 1, c.white);

    pixel(37, 17, 7, 1, c.lash);
    pixel(43, 16, 2, 1, c.lash);
    pixel(37, 18, 6, 4, c.white);
    pixel(38, 18, 4, 4, c.eyeBrownDark);
    pixel(38, 19, 4, 3, c.eyeBrown);
    pixel(39, 20, 2, 2, c.eyeAmber);
    pixel(39, 18, 2, 2, c.lash);
    pixel(38, 18, 1, 1, c.white);

    // Nose, Silver Septum Piercing & Smile
    pixel(31, 20, 2, 3, c.skinShade);
    pixel(31, 21, 1, 1, c.skinLight);
    pixel(31, 23, 2, 1, "#e2e8f5");
    pixel(28, 26, 8, 2, c.lips);
    pixel(29, 26, 6, 1, c.lipsLight);
    pixel(27, 25, 1, 1, c.lips);
    pixel(36, 25, 1, 1, c.lips);

    // Iconic Round Wire-Frame Glasses
    pixel(21, 15, 6, 1, c.glasses);
    pixel(22, 15, 3, 1, c.glassesGlint);
    pixel(21, 23, 6, 1, c.glasses);
    pixel(19, 17, 1, 5, c.glasses);
    pixel(28, 17, 1, 5, c.glasses);
    pixel(20, 16, 1, 1, c.glasses);
    pixel(27, 16, 1, 1, c.glasses);
    pixel(20, 22, 1, 1, c.glasses);
    pixel(27, 22, 1, 1, c.glasses);

    pixel(37, 15, 6, 1, c.glasses);
    pixel(38, 15, 3, 1, c.glassesGlint);
    pixel(37, 23, 6, 1, c.glasses);
    pixel(35, 17, 1, 5, c.glasses);
    pixel(44, 17, 1, 5, c.glasses);
    pixel(36, 16, 1, 1, c.glasses);
    pixel(43, 16, 1, 1, c.glasses);
    pixel(36, 22, 1, 1, c.glasses);
    pixel(43, 22, 1, 1, c.glasses);

    pixel(29, 18, 6, 1, c.glasses);
    pixel(31, 18, 2, 1, c.glassesGlint);
    pixel(17, 18, 2, 1, c.glassesShade);
    pixel(45, 18, 2, 1, c.glassesShade);

    // Top Hair & Side-Swept Copper Bangs
    pixel(20, 5, 24, 4, c.hairShade);
    pixel(17, 7, 30, 5, c.hair);
    pixel(15, 10, 34, 4, c.hair);
    pixel(22, 6, 18, 3, c.hairLight);
    pixel(25, 6, 10, 2, c.hairGlint);
    pixel(15, 12, 7, 4, c.hair);
    pixel(16, 12, 5, 3, c.hairLight);
    pixel(14, 15, 5, 5, c.hair);
    pixel(41, 11, 8, 4, c.hair);
    pixel(42, 12, 5, 2, c.hairLight);
    pixel(44, 14, 5, 6, c.hair);
    pixel(36, 10, 8, 2, c.hairShade);

    if (cheer) {
      pixel(13, 33, 5, 6, c.kimono);
      pixel(10, 24, 4, 10, c.skin);
      pixel(11, 27, 2, 1, c.armTattoo);
      pixel(11, 29, 1, 2, c.armTattoo);
      pixel(10, 21, 4, 4, c.skinLight);
      pixel(46, 33, 5, 6, c.kimono);
      pixel(50, 24, 4, 10, c.skin);
      pixel(51, 27, 2, 1, c.armTattoo);
      pixel(51, 29, 1, 2, c.armTattoo);
      pixel(50, 21, 4, 4, c.skinLight);
    }
    context.restore();
  }
  function drawBackground(sceneIndex) {
    const w = WORLD_WIDTH, h = WORLD_HEIGHT, scene = scenes[sceneIndex];
    const gradients = [
      ["#171936", "#40305f", "#282449"], ["#201b43", "#533b76", "#2c2451"],
      ["#162d42", "#4d4b77", "#263447"], ["#26223d", "#715069", "#40354a"],
      ["#21133c", "#783b82", "#342450"], ["#101b3b", "#49437b", "#283157"]
    ][sceneIndex];
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, gradients[0]); sky.addColorStop(.68, gradients[1]); sky.addColorStop(1, gradients[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 62; i++) {
      const x = (i * 137 + 41) % w, y = (i * 79 + 23) % 245;
      const twinkle = .35 + .65 * Math.abs(Math.sin(frame * .035 + i));
      ctx.globalAlpha = twinkle; ctx.fillStyle = i % 4 === 0 ? "#ffc2e4" : "#e4dcff";
      ctx.fillRect(x, y, i % 9 === 0 ? 3 : 2, i % 9 === 0 ? 3 : 2);
    }
    ctx.globalAlpha = 1;
    if (sceneIndex === 3) {
      ctx.fillStyle = "#19182c"; ctx.fillRect(66, 68, 182, 143); ctx.fillStyle = "#4d6880"; ctx.fillRect(76, 78, 162, 123);
      ctx.fillStyle = "#30243d"; ctx.fillRect(151, 78, 8, 123); ctx.fillRect(76, 137, 162, 7);
      ctx.fillStyle = "#ffe6ab"; ctx.fillRect(529, 197, 67, 45); ctx.fillStyle = "#ffc777"; ctx.fillRect(543, 171, 37, 30);
      ctx.globalAlpha = .25; ctx.fillStyle = "#ffd19b"; ctx.beginPath(); ctx.arc(562, 183, 70, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      for (let i = 0; i < 26; i++) { ctx.strokeStyle = "#bcd6ef88"; ctx.beginPath(); const x = (i * 47 + frame * .9) % w; ctx.moveTo(x, 70); ctx.lineTo(x - 9, 97); ctx.stroke(); }
    } else if (sceneIndex === 2 || sceneIndex === 5) {
      for (let i = 0; i < 9; i++) {
        const x = (i * 103 + 28) % w, y = 235 + Math.sin(frame * .025 + i) * 9;
        ctx.fillStyle = i % 2 ? "#e68ebc" : "#a8d1d1"; ctx.fillRect(x, y, 4, 10); ctx.fillRect(x - 3, y - 4, 10, 6);
      }
    }
    ctx.fillStyle = "#19172d"; ctx.fillRect(0, 295, w, 125);
    ctx.fillStyle = sceneIndex === 3 ? "#544054" : "#2b2947"; ctx.fillRect(0, 295, w, 11);
    for (let tile = 0; tile < 20; tile++) {
      const tileX = tile * 43 - 3;
      ctx.fillStyle = tile % 2 ? "#24223f" : "#292643";
      ctx.fillRect(tileX, 306, 41, 5);
      ctx.fillStyle = "#211f39";
      ctx.fillRect(tileX + 5, 332, 29, 4);
      ctx.fillRect(tileX + 20, 365, 18, 4);
    }
    for (let i = 0; i < 11; i++) {
      const x = i * 82 + 10, glow = .7 + Math.sin(frame * .06 + i) * .3;
      ctx.globalAlpha = glow; ctx.fillStyle = palette[i % palette.length]; ctx.fillRect(x, 282 - (i % 3) * 17, 3, 3); ctx.globalAlpha = 1;
    }
    if (sceneIndex === 4 && state.flags.peidaru) {
      for (let i = 0; i < 22; i++) {
        const x = (frame * (i % 3 + 1) + i * 71) % w, y = 90 + ((frame + i * 37) % 190);
        ctx.globalAlpha = .32; ctx.fillStyle = "#c8a9a0"; ctx.beginPath(); ctx.arc(x, y, 5 + i % 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    scene.objects.forEach((object, index) => {
      if (objectIsComplete(sceneIndex, object)) return;
      const x = object.x * w, y = sceneIndex === 2 ? 267 : sceneIndex === 4 ? 235 : 255;
      if (sceneIndex === 2) {
        const memImg = memoryImages[index];
        const floatY = y - 62 + Math.sin(frame * .06 + index) * 3;
        if (memImg && memImg.complete && memImg.naturalWidth > 0) {
          ctx.fillStyle = "#fff5fb";
          ctx.fillRect(x - 24, floatY - 2, 48, 42);
          ctx.drawImage(memImg, x - 21, floatY + 1, 42, 34);
          ctx.fillStyle = "#ff88bd";
          ctx.fillRect(x - 3, floatY + 36, 6, 3);
        }
        ctx.fillStyle = "#704c69"; ctx.fillRect(x - 25, y - 15, 50, 37); ctx.fillStyle = "#d6a86e"; ctx.fillRect(x - 27, y - 19, 54, 9);
        ctx.fillStyle = "#f4d294"; ctx.fillRect(x - 3, y - 5, 7, 8);
      } else if (sceneIndex === 4) {
        ctx.fillStyle = "#be8b59"; ctx.fillRect(x - 27, y + 18, 54, 9); ctx.fillStyle = "#f7d38a"; ctx.fillRect(x - 21, y - 3, 42, 21);
        ctx.fillStyle = "#ffe8a6"; ctx.fillRect(x - 4, y + 4, 8, 9);
      } else if (sceneIndex === 0 && index === 1) {
        ctx.fillStyle = "#a5758e"; ctx.fillRect(x - 16, y - 27, 31, 52); ctx.fillStyle = "#f2c5e0"; ctx.fillRect(x - 10, y - 21, 19, 39);
      } else {
        ctx.fillStyle = palette[index % palette.length]; ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = palette[index % palette.length]; ctx.fillRect(x - 9, y - 9, 18, 18);
        ctx.fillStyle = "#fff1ff"; ctx.fillRect(x - 3, y - 14, 6, 6); ctx.fillRect(x - 14, y - 3, 6, 6);
        ctx.fillRect(x + 8, y - 3, 6, 6); ctx.fillRect(x - 3, y + 8, 6, 6);
      }
    });
    const doorAvailable = sceneIndex < scenes.length - 1 && phaseIsComplete(sceneIndex);
    const doorX = Math.floor(w * .94);
    if (doorAvailable) {
      const x = doorX - 29;
      ctx.fillStyle = "#bd9bff33"; ctx.fillRect(x - 9, 199, 76, 106);
      ctx.fillStyle = "#18132b"; ctx.fillRect(x - 4, 207, 63, 98);
      ctx.fillStyle = "#d5a5ff"; ctx.fillRect(x + 3, 215, 49, 90);
      ctx.fillStyle = "#774f9b"; ctx.fillRect(x + 8, 220, 39, 85);
      ctx.fillStyle = "#9c6eb9"; ctx.fillRect(x + 13, 226, 29, 73);
      ctx.fillStyle = "#d59bd4"; ctx.fillRect(x + 17, 234, 21, 30);
      ctx.fillStyle = "#281d3b"; ctx.fillRect(x + 21, 238, 13, 22);
      ctx.fillStyle = "#ffe49a"; ctx.fillRect(x + 34, 272, 5, 7);
      ctx.fillStyle = "#ffb9df"; ctx.fillRect(x + 19, 201, 6, 6); ctx.fillRect(x + 40, 193, 5, 5);
      ctx.fillStyle = "#fff0bc"; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText("PORTINHA →", doorX, 188);
    }
    const px = playerWorldX();
    const mewScale = 1.25;
    const followLeft = (sceneIndex === 5 && state.flags.finalCelebrated) || lastDirection >= 0;
    const targetMewX = followLeft
      ? Math.max(10, px - 64)
      : Math.min(w - 64 * mewScale - 10, px + 60);
    if (mewX === null) mewX = targetMewX;
    else mewX += (targetMewX - mewX) * (state.moving ? .18 : .1);
    const flipMew = mewX + 32 * mewScale < px + 32 * 1.3;
    drawMew(ctx, mewX, 200, mewScale, flipMew);
    const activeObjects = scene.objects.filter(object => !objectIsComplete(sceneIndex, object));
    const near = activeObjects.length
      ? activeObjects.reduce((best, object) => Math.abs(object.x * w - px) < Math.abs(best.x * w - px) ? object : best, activeObjects[0])
      : null;
    ctx.globalAlpha = .22; ctx.fillStyle = "#ffe7ad"; ctx.beginPath(); ctx.ellipse(px + 22, 302, 22, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    const avatarScale = 1.3;
    const avatarY = 295 - 64 * avatarScale + Math.sin(frame * .08) * 2;
    drawAvatar(ctx, px, avatarY, avatarScale, frame % 40 < 10 && state.moving ? "walk" : (state.pose || "idle"));
    ctx.fillStyle = "#fff"; ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillText(config.name, px + 32 * avatarScale, avatarY - 8);
    if (sceneIndex === 5 && state.flags.finalCelebrated) {
      drawPartner(ctx, px + 83, avatarY, avatarScale);
      ctx.fillStyle = "#fff"; ctx.font = "11px monospace"; ctx.textAlign = "center";
      ctx.fillText(config.partnerName || "Meu amor", px + 83 + 32 * avatarScale, avatarY - 8);
      drawFinalSpeech();
    }
    const doorNear = doorAvailable && Math.abs(doorX - px) < 110;
    const objectNear = near && Math.abs(near.x * w - px) < 110;
    if (doorNear || objectNear) {
      const focusX = doorNear ? doorX : near.x * w;
      const focusName = doorNear ? "PORTINHA →" : near.name;
      ctx.globalAlpha = .9; ctx.fillStyle = "#120f25"; ctx.fillRect(focusX - 67, 321, 134, 22); ctx.globalAlpha = 1;
      ctx.fillStyle = doorNear ? "#ffe4a0" : "#f5e8ff"; ctx.font = "10px monospace"; ctx.fillText("✦ " + focusName, focusX, 336);
    }
    function drawFinalSpeech() {
      const speech = config.finalDeclaration || "Gata, eu escolheria você em cada capítulo. Eu te amo.";
      const lines = [];
      let line = "";
      speech.split(/\s+/).forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > 42 && line) { lines.push(line); line = word; }
        else line = candidate;
      });
      if (line) lines.push(line);
      const boxX = 240, boxY = 76, boxWidth = 520, boxHeight = 38 + lines.length * 21;
      ctx.fillStyle = "#0e1028"; ctx.fillRect(boxX - 4, boxY - 4, boxWidth + 8, boxHeight + 8);
      ctx.fillStyle = "#e9c2ff"; ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fillStyle = "#1a1730"; ctx.fillRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);
      ctx.fillStyle = "#ffb9df"; ctx.fillRect(boxX + 15, boxY + boxHeight - 2, 8, 8);
      ctx.fillStyle = "#a9f3e5"; ctx.font = "bold 14px monospace"; ctx.textAlign = "left";
      ctx.fillText((config.partnerName || "MEU AMOR").toLocaleUpperCase("pt-BR") + " DIZ:", boxX + 14, boxY + 20);
      ctx.fillStyle = "#fff3fb"; ctx.font = "16px monospace";
      lines.forEach((text, index) => {
        ctx.fillText(text, boxX + 14, boxY + 48 + index * 21);
      });
    }
  }
  function render() {
    if (renderActive) return;
    renderActive = true;
    const tick = () => {
      if ($("game-screen").hidden) { renderActive = false; return; }
      frame++;
      drawBackground(state.phase);
      requestAnimationFrame(tick);
    };
    tick();
  }
  function renderAvatarCanvases() {
    ["title-avatar", "hud-avatar"].forEach(id => {
      const target = $(id), c = target.getContext("2d");
      c.clearRect(0, 0, target.width, target.height);
      drawAvatar(c, 0, 0, 1, "idle");
    });
  }
  function showToast(message) {
    const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function save() {
    syncCompletedPhases();
    if (!window.GameStorage.save(state)) showToast("Não foi possível salvar neste navegador.");
    updateHud();
  }
  function addXp(amount) {
    const previousLevel = Math.floor(state.xp / 100);
    state.xp += amount;
    if (Math.floor(state.xp / 100) > previousLevel) showToast("Subiu de nível! Nível " + (Math.floor(state.xp / 100) + 1));
  }
  function completePhase(index) {
    if (!state.completedPhases.includes(index)) state.completedPhases.push(index);
  }
  function completeObject(id) {
    if (!state.completedObjects.includes(id)) state.completedObjects.push(id);
  }
  function unlock(id) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id); window.GameAudio.effect("achievement");
      const achievement = window.GameDialogue.achievements.find(item => item.id === id);
      if (achievement) showToast("Conquista desbloqueada: " + achievement.name);
    }
  }
  function updateHud() {
    $("player-name").textContent = config.name;
    $("phase-label").textContent = `FASE ${state.phase + 1} · ${window.GameDialogue.phaseNames[state.phase]}`;
    $("chapter-kicker").textContent = scenes[state.phase].kicker;
    $("scene-title").textContent = scenes[state.phase].title;
    $("scene-tag").textContent = scenes[state.phase].tag;
    $("health-bar").style.width = `${Math.max(0, Math.min(100, state.health))}%`;
    $("love-bar").style.width = `${Math.max(0, Math.min(100, state.love))}%`;
    $("health-value").textContent = state.health; $("love-value").textContent = state.love;
    $("level-value").textContent = String(Math.floor(state.xp / 100) + 1).padStart(2, "0");
    $("xp-value").textContent = `${state.xp % 100} XP`; $("xp-bar").style.width = `${state.xp % 100}%`;
    const memories = getMemories();
    $("inventory").innerHTML = state.inventory.length ? state.inventory.map(item => {
      const memIndex = memories.findIndex(m => m && m.title === item);
      if (memIndex >= 0) {
        return `<button type="button" class="inventory-item" data-memory-index="${memIndex}" title="Clique para rever a foto">📷 ${escapeHtml(item)}</button>`;
      }
      return `<span class="inventory-item">${escapeHtml(item)}</span>`;
    }).join("") : '<p class="empty-note">Sua aventura começa aqui.</p>';
    $("inventory").querySelectorAll("[data-memory-index]").forEach(btn => {
      btn.addEventListener("click", () => openMemory(Number(btn.dataset.memoryIndex)));
    });
    $("achievements").innerHTML = window.GameDialogue.achievements.map(item => `<div class="achievement ${state.achievements.includes(item.id) ? "unlocked" : ""}"><i>${item.icon}</i><span>${escapeHtml(item.name)}</span></div>`).join("");
    $("achievement-count").textContent = `${state.achievements.length}/6`;
    syncCompletedPhases();
    const phaseDone = phaseIsComplete(state.phase);
    const progress = missionProgress(state.phase);
    const target = state.phase === 0 || state.phase === 1 || state.phase === 2 ? scenes[state.phase].objects.length : 1;
    $("mission-status").classList.toggle("complete", phaseDone);
    $("mission-status").innerHTML = `<span>MISSÃO: ${escapeHtml(scenes[state.phase].mission)}</span><strong>${phaseDone ? (state.phase < 5 ? "PORTINHA ABERTA →" : "MISSÃO CONCLUÍDA") : `${progress}/${target}`}</strong>`;
    $("guide-bubble").hidden = state.phase === 5 && state.flags.finalCelebrated;
    $("guide-tip").textContent = guideTip();
    const qualities = Array.isArray(config.qualities) ? config.qualities : [];
    $("qualities").innerHTML = qualities.map(quality => {
      const unlocked = state.qualities.includes(quality.id);
      return `<span class="quality-chip ${unlocked ? "unlocked" : ""}" title="${escapeHtml(quality.description || quality.name)}">${escapeHtml(quality.name)}</span>`;
    }).join("");
    $("quality-count").textContent = `${state.qualities.length}/${qualities.length}`;
    $("phase-nav").innerHTML = scenes.map((scene, index) => {
      const locked = index > state.phase;
      return `<button type="button" data-phase="${index}" class="${index === state.phase ? "active" : ""} ${state.completedPhases.includes(index) ? "completed" : ""}" aria-current="${index === state.phase ? "step" : "false"}" ${locked ? "disabled" : ""}>${String(index + 1).padStart(2, "0")} · ${window.GameDialogue.phaseNames[index]}</button>`;
    }).join("");
    document.querySelectorAll("[data-phase]").forEach(button => button.addEventListener("click", () => changePhase(Number(button.dataset.phase))));
  }
  function escapeHtml(text) { return String(text).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
  function setDialogue(lines, choices, speaker) {
    activeLines = Array.isArray(lines) ? lines : [lines]; dialogueIndex = 0;
    dialogueSpeaker = speaker || null;
    $("choice-list").innerHTML = "";
    $("next-dialogue").disabled = false;
    if (choices && choices.length) {
      $("next-dialogue").disabled = true;
      $("choice-list").innerHTML = choices.map((choice, index) => `<button class="choice-button" type="button" data-choice="${index}">${escapeHtml(choice.label)}</button>`).join("");
      $("choice-list").querySelectorAll("[data-choice]").forEach(button => button.addEventListener("click", () => {
        const choice = choices[Number(button.dataset.choice)]; window.GameAudio.effect("click");
        if (choice.action) choice.action();
        if (choice.text) { setDialogue(choice.text); }
        else renderDialogue();
      }));
    }
    renderDialogue();
  }
  function renderDialogue() {
    const line = activeLines[dialogueIndex] || "";
    $("dialogue-content").innerHTML = `<span class="speaker">${escapeHtml(dialogueSpeaker || (state.phase === 0 ? "✦ NARRADOR" : "✦ DIÁRIO DA AVENTURA"))}</span>${escapeHtml(line).replace(/\n/g, "<br>")}`;
    $("dialogue-count").textContent = activeLines.length > 1 ? `${dialogueIndex + 1}/${activeLines.length}` : "";
    $("next-dialogue").disabled = dialogueIndex >= activeLines.length - 1;
  }
  function startPhaseDialogue() {
    const lines = [
      state.flags.greeted ? "A estrela-guia conhece o caminho. A aventura continua no seu ritmo." : config.phases.opening,
      "O mundo é seu, " + (config.nickname || config.name) + ". Explore, encontre os brilhos e siga apenas quando quiser.",
      "Uma dica do Mew: coragem não é fazer tudo de uma vez — é poder avançar no seu próprio ritmo."
    ];
    if (state.phase === 1) lines.splice(0, lines.length, "Dizem que toda aventureira tem poderes especiais. Os seus vêm de fábrica — e nenhum precisa de capa.");
    if (state.phase === 2) {
      lines.splice(0, lines.length, "Cada baú neste jardim guarda um pedacinho especial da nossa história e dos nossos momentos juntos.");
      if (Array.isArray(config.dates) && config.dates.length) lines.push("Datas especiais: " + config.dates.join(" · "));
    }
    if (state.phase === 1) lines.push("O Mew acredita na sua criatividade: experimente cada poder e veja qual combina mais com você.");
    if (state.phase === 2) lines.push("Cada lembrança conta uma história. Escolha as que quiser guardar; não existe resposta errada.");
    if (state.phase === 3) lines.splice(0, lines.length, config.phases.hug, "Respira. Aqui não tem pressa nem missão para cumprir. Só um lugar seguro e um abraço quando você quiser.", "Lembrete do Mew: aceitar cuidado também é uma forma de coragem.");
    if (state.phase === 4) lines.splice(0, lines.length, state.flags.peidaru ? "A Câmara Lendária ainda ecoa com risadinhas. O PEIDARU está sob controle. Mais ou menos." : "Uma energia suspeitamente épica vibra neste pedestal. Aproximar-se é uma decisão corajosa — e talvez barulhenta.");
    if (state.phase === 5) lines.splice(0, lines.length, state.flags.finalRead ? "A carta continua aqui. E a aventura de vocês também." : "Há uma carta esperando. Não tem pressa para ler — este pedacinho do universo é todo seu.");
    if (state.phase === 0 && !state.flags.greeted) {
      setDialogue(lines, [
        { label: "Vou explorar no meu ritmo.", text: "Sem pressa, " + config.name + ". O mundo inteiro espera por você." },
        { label: "Missão aceita: descobrir meu brilho!", text: "Essa é a atitude! Sua primeira estrela está brilhando no mapa." }
      ]);
    } else setDialogue(lines);
  }
  function changePhase(index, throughDoor = false) {
    if (!Number.isInteger(index) || index < 0 || index >= scenes.length) return;
    if (index > state.phase && (!throughDoor || index !== state.phase + 1 || !phaseIsComplete(state.phase))) return;
    state.phase = index; state.position = .5; state.pose = "idle"; lastDirection = 1; mewX = playerWorldX() - 64;
    if (index === 5) window.GameAudio.setMode("romance"); else window.GameAudio.setMode("adventure");
    updateHud(); startPhaseDialogue(); save(); render();
  }
  function move(direction) {
    if (direction !== 0) lastDirection = direction < 0 ? -1 : 1;
    state.position = Math.max(.04, Math.min(.96, state.position + direction * .055));
    state.moving = true; state.pose = "walk"; window.GameAudio.effect("click"); drawBackground(state.phase);
    clearTimeout(walkTimer);
    walkTimer = setTimeout(() => { state.moving = false; state.pose = "idle"; }, 230);
  }
  function interact() {
    if (interactionCooldown) return;
    interactionCooldown = true; setTimeout(() => interactionCooldown = false, 450);
    const x = playerWorldX();
    const doorX = WORLD_WIDTH * .94;
    if (state.phase < scenes.length - 1 && phaseIsComplete(state.phase) && Math.abs(doorX - x) < 115) {
      completePhase(state.phase);
      interactionCooldown = false;
      changePhase(state.phase + 1, true);
      window.GameAudio.effect("achievement");
      return;
    }
    const activeObjects = scenes[state.phase].objects.filter(object => !objectIsComplete(state.phase, object));
    if (!activeObjects.length) {
      showToast(state.phase < scenes.length - 1 ? "Tudo recolhido! Vá até a portinha à direita." : "Todos os itens já foram recolhidos!");
      return;
    }
    const target = activeObjects.reduce((best, object) => Math.abs(object.x * WORLD_WIDTH - x) < Math.abs(best.x * WORLD_WIDTH - x) ? object : best, activeObjects[0]);
    if (Math.abs(target.x * WORLD_WIDTH - x) > 125) { showToast("Chegue mais perto do brilho para interagir."); return; }
    handleObject(target);
  }
  function addItem(item) {
    if (!state.inventory.includes(item)) state.inventory.push(item);
  }
  function handleObject(object) {
    window.GameAudio.effect("magic");
    if (object.id === "star" || object.id === "letter") {
      const text = object.id === "star" ? object.text : object.text;
      openModal(object.name, text, "GUARDAR NA MOCHILA", () => {
        completeObject(object.id);
        addItem(object.item); state.love = Math.min(100, state.love + 10); addXp(20); state.flags.greeted = true;
        unlock("first-step"); save(); showToast("Item adicionado à mochila.");
      });
    } else if (object.id.startsWith("power-")) {
      const power = window.GameDialogue.powers.find(item => item.id === object.id.slice(6));
      if (state.powers.includes(power.id)) { showToast(power.name + " já está desbloqueado!"); return; }
      openModal(power.name, power.description, "DESBLOQUEAR PODER", () => {
        state.powers.push(power.id); addItem(power.name); state.love = Math.min(100, state.love + 8); addXp(25);
        if (state.powers.length === 3) unlock("power-up");
        save(); window.GameAudio.effect("achievement"); showToast(power.name + " desbloqueado!");
      });
    } else if (object.id.startsWith("chest-")) openMemory(Number(object.id.slice(-1)) - 1);
    else if (object.id === "window") openModal("Chuva na janela", "Lá fora, a chuva faz trilha sonora. Aqui dentro, a única tarefa é descansar um pouquinho.", "GUARDAR MOMENTO", () => { completeObject("window"); addItem("Uma pausa sem pressa"); save(); showToast("Momento guardado. Pode descansar."); });
    else if (object.id === "hug") {
      openModal("Um abraço quentinho", config.phases.hug, "ACEITAR O ABRAÇO", () => {
        state.flags.hugged = true; state.health = 100; state.love = Math.min(100, state.love + 18); addXp(20); addItem("Abraço quentinho");
        completeObject("hug"); unlock("soft-place"); save(); showToast("Vida restaurada. Abraço recebido."); state.pose = "cheer"; drawBackground(state.phase); setTimeout(() => { state.pose = "idle"; }, 1500);
      });
    } else if (object.id === "pedestal") revealPeidaru();
    else if (object.id === "letter-final") finalLetter();
  }
  function openMemory(index) {
    const memories = getMemories();
    const memory = memories[index] || memories[index % memories.length];
    const html = `<p>${escapeHtml(memory.note || "Uma lembrança de vocês.")}</p>${memory.date ? `<p><strong>Data:</strong> ${escapeHtml(memory.date)}</p>` : ""}${memory.photo ? `<img src="${escapeHtml(memory.photo)}" alt="Fotografia: ${escapeHtml(memory.title || "lembrança")}" onerror="this.replaceWith(Object.assign(document.createElement('p'),{textContent:'Foto não encontrada. Confira o caminho no js/config.js.'}))">` : "<p>Esta lembrança não tem fotografia anexada.</p>"}`;
    openModal(memory.title || "Lembrança de vocês", html, "GUARDAR LEMBRANÇA", () => {
      const token = "memory-" + index;
      if (!state.openedMemories.includes(token)) { state.openedMemories.push(token); completeObject("chest-" + (index + 1)); addItem(memory.title || "Lembrança de vocês"); addXp(15); state.love = Math.min(100, state.love + 7); }
      unlock("memory-keeper"); save(); showToast("Lembrança guardada na mochila.");
    }, true);
  }
  function revealPeidaru() {
    if (state.flags.peidaru) { showToast("PEIDARU continua lendário. E continua causando risadas."); return; }
    $("modal-kicker").textContent = "MAGIA PROIBIDA · RARIDADE LENDÁRIA";
    $("modal-title").textContent = "PEIDARU";
    $("modal-content").innerHTML = `<p><strong>DANO: 999</strong><br>Efeito especial: risadas incontroláveis.</p><p>Somente os casais com intimidade nível máximo conseguem dominar essa habilidade.</p><p>VOCÊ DESBLOQUEOU O PEIDARU!</p>`;
    $("modal-action").textContent = "LIBERAR O PODER";
    modalAction = () => {
      state.flags.peidaru = true; state.pose = "cheer"; addItem("PEIDARU · magia lendária"); state.love = 100; addXp(50);
      unlock("peidaru-master"); save(); $("modal").hidden = true; window.GameAudio.effect("peidaru"); showToast("PFFFFFFFFT! A magia lendária foi liberada!");
      const start = frame; const burst = () => { drawBackground(state.phase); if (frame - start < 100) requestAnimationFrame(burst); else state.pose = "idle"; };
      burst();
    };
    $("modal").hidden = false;
  }
  function finalLetter() {
    if (state.flags.finalRead) {
      openModal("Nossa história continua", `${escapeHtml(config.finalLetter).replace(/\n/g, "<br>")}<p>E essa é uma das nossas lembranças favoritas.</p>${finalPhotoMarkup()}`, "FECHAR CARTA", () => { $("modal").hidden = true; }, true);
      return;
    }
    openModal("Minha Gata", config.finalLetter, "TERMINAR A AVENTURA", () => {
      state.flags.finalRead = true; state.completedPhases = Array.from(new Set([...state.completedPhases, 5]));
      state.love = 100; addXp(40); unlock("our-universe"); save();
      $("modal-kicker").textContent = "✦ MISSÃO CONCLUÍDA ✦";
      $("modal-title").textContent = "NOSSO AMOR";
      $("modal-content").innerHTML = `<p>Você desbloqueou a conquista mais importante: NOSSO AMOR.</p><p>E no fim dessa aventura, olha quem veio ficar ao seu lado.</p>${finalPhotoMarkup()}`;
      $("modal-action").textContent = "CELEBRAR";
      modalAction = () => {
        $("modal").hidden = true; state.pose = "cheer"; state.flags.finalCelebrated = true;
        save();
        setDialogue(config.finalDeclaration || "Gata, eu escolheria você em cada capítulo. Eu te amo.", null, config.partnerName || "MEU AMOR");
        showToast("MISSÃO CONCLUÍDA ♥ NOSSO AMOR"); drawBackground(state.phase);
      };
      $("modal").hidden = false;
    });
  }
  function openModal(title, content, actionText, action, isHtml) {
    $("modal-kicker").textContent = "LEMBRANÇA DA AVENTURA";
    $("modal-title").textContent = title;
    const contentBox = $("modal-content");
    if (isHtml) contentBox.innerHTML = content;
    else contentBox.textContent = content;
    $("modal-action").textContent = actionText;
    modalAction = action;
    $("modal").hidden = false; $("modal-close").focus();
  }
  $("modal-action").addEventListener("click", () => {
    if (!modalAction) return;
    const action = modalAction;
    $("modal").hidden = true;
    action();
  });
  $("modal-close").addEventListener("click", () => { $("modal").hidden = true; });
  $("modal").addEventListener("click", event => { if (event.target === $("modal")) $("modal").hidden = true; });
  $("next-dialogue").addEventListener("click", () => {
    if (dialogueIndex < activeLines.length - 1) dialogueIndex++;
    else return;
    renderDialogue(); window.GameAudio.effect("click");
  });
  document.querySelectorAll("[data-move]").forEach(button => {
    button.addEventListener("click", () => move(Number(button.dataset.move)));
    button.addEventListener("pointerdown", () => { button._hold = setInterval(() => move(Number(button.dataset.move)), 170); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(event => button.addEventListener(event, () => clearInterval(button._hold)));
  });
  $("interact-button").addEventListener("click", interact);
  $("audio-toggle").addEventListener("click", () => {
    try {
      const enabled = window.GameAudio.setEnabled(!window.GameAudio.enabled);
      $("audio-toggle").setAttribute("aria-pressed", String(enabled));
      $("audio-toggle").setAttribute("aria-label", enabled ? "Desligar áudio" : "Ligar áudio");
      $("audio-toggle").querySelector("span").textContent = "Áudio: " + (enabled ? "on" : "off");
      window.GameAudio.effect("click");
    } catch (error) {
      console.error("Não foi possível ativar o áudio:", error);
      showToast("Áudio indisponível neste navegador.");
    }
  });
  $("start-button").addEventListener("click", () => {
    window.GameAudio.effect("click"); state.started = true;
    $("title-screen").hidden = true; $("game-screen").hidden = false;
    updateHud(); startPhaseDialogue(); save(); render();
  });
  $("menu-toggle").addEventListener("click", () => {
    const menu = $("game-menu"), open = menu.hidden;
    menu.hidden = !open; $("menu-toggle").setAttribute("aria-expanded", String(open));
  });
  $("resume-button").addEventListener("click", () => { $("game-menu").hidden = true; $("menu-toggle").setAttribute("aria-expanded", "false"); });
  $("restart-button").addEventListener("click", () => {
    if (!window.confirm("Recomeçar apaga o progresso salvo neste aparelho. Quer continuar?")) return;
    Object.assign(state, window.GameStorage.reset()); mewX = null; lastDirection = 1; $("game-menu").hidden = true; $("menu-toggle").setAttribute("aria-expanded", "false");
    $("game-screen").hidden = true; $("title-screen").hidden = false; updateHud(); renderAvatarCanvases();
  });
  document.addEventListener("keydown", event => {
    if (!$("modal").hidden) { if (event.key === "Escape") $("modal").hidden = true; return; }
    if ($("game-screen").hidden) return;
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { event.preventDefault(); move(-1); }
    else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { event.preventDefault(); move(1); }
    else if (event.key === " " || event.key === "Enter") { event.preventDefault(); interact(); }
  });
  window.addEventListener("resize", () => { if (!$("game-screen").hidden) drawBackground(state.phase); });
  renderAvatarCanvases();
  if (state.started) {
    $("title-screen").hidden = true; $("game-screen").hidden = false;
    updateHud(); startPhaseDialogue();
    if (state.phase === 5) window.GameAudio.setMode("romance");
    render();
  } else updateHud();
})();
