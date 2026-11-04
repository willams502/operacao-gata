(function () {
  "use strict";
  const scenes = [
    { id: "beginning", title: "O começo", tag: "MUNDO DOS SONHOS", kicker: "CAPÍTULO 01", mission: "Encontre a estrela e o bilhete brilhante", objects: [
      { id: "star", x: .25, icon: "✦", name: "Estrela perdida", text: "A estrelinha pousa na sua mão. Ela parece sussurrar: «Você já ilumina tudo por aqui, sabia?»", item: "Estrela-guia" },
      { id: "letter", x: .75, icon: "✉", name: "Bilhete brilhante", text: "O bilhete diz: «Missão de hoje: não derrotar nenhum monstro. Só lembrar que você é incrível.»", item: "Bilhete de missão" }
    ] },
    { id: "powers", title: "O poder dela", tag: "SALA DE HABILIDADES", kicker: "CAPÍTULO 02", mission: "Desbloqueie os três poderes", objects: [
      { id: "power-smile", x: .23, icon: "☼", name: "Poder do Sorriso" },
      { id: "power-shield", x: .50, icon: "♡", name: "Escudo do Amor" },
      { id: "power-courage", x: .77, icon: "✧", name: "Magia da Coragem" }
    ] },
    { id: "memories", title: "Nossa história", tag: "JARDIM DAS LEMBRANÇAS", kicker: "CAPÍTULO 03", mission: "Abra os quatro baús de lembranças", objects: [
      { id: "chest-1", x: .20, icon: "▣", name: "Baú de lembrança 1" },
      { id: "chest-2", x: .40, icon: "▣", name: "Baú de lembrança 2" },
      { id: "chest-3", x: .60, icon: "▣", name: "Baú de lembrança 3" },
      { id: "chest-4", x: .80, icon: "▣", name: "Baú de lembrança 4" }
    ] },
    { id: "hug", title: "O abraço", tag: "REFÚGIO ACONCHEGANTE", kicker: "CAPÍTULO 04", mission: "Aceite um abraço quentinho", objects: [
      { id: "window", x: .25, icon: "▦", name: "Janela chuvosa" },
      { id: "hug", x: .68, icon: "♡", name: "Um abraço quentinho" }
    ] },
    { id: "peidaru", title: "O segredo PEIDARU", tag: "CÂMARA LENDÁRIA", kicker: "CAPÍTULO 05", mission: "Desperte a magia lendária", objects: [
      { id: "pedestal", x: .50, icon: "✹", name: "Pedestal do PEIDARU" }
    ] },
    { id: "final", title: "Nosso universo", tag: "ALÉM DAS ESTRELAS", kicker: "CAPÍTULO FINAL", mission: "Leia a carta de amor", objects: [
      { id: "letter-final", x: .50, icon: "✉", name: "Carta de amor" }
    ] }
  ];
  window.GameScenes = scenes;
})();
