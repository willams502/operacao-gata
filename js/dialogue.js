(function () {
  "use strict";
  const powers = [
    { id: "smile", name: "Poder do Sorriso", description: "Transforma até uma terça-feira sem graça em motivo para sorrir. Efeito colateral: bochechas doloridas." },
    { id: "shield", name: "Escudo do Amor", description: "Uma barreira quentinha contra dias difíceis. Recarga: um abraço demorado (ou dois)." },
    { id: "courage", name: "Magia da Coragem", description: "Dá coragem para ser você, pedir colo e encarar qualquer dragão — inclusive a caixa de entrada." }
  ];
  const achievements = [
    { id: "first-step", name: "Primeiro passo", icon: "➤" },
    { id: "power-up", name: "Três poderes", icon: "✧" },
    { id: "memory-keeper", name: "Guardadora de memórias", icon: "♧" },
    { id: "soft-place", name: "Lugar seguro", icon: "♡" },
    { id: "peidaru-master", name: "Mestra do PEIDARU", icon: "☄" },
    { id: "our-universe", name: "Nosso universo", icon: "✦" }
  ];
  const phaseNames = ["O COMEÇO", "O PODER DELA", "NOSSA HISTÓRIA", "O ABRAÇO", "O SEGREDO PEIDARU", "NOSSO UNIVERSO"];
  window.GameDialogue = { powers, achievements, phaseNames };
})();
