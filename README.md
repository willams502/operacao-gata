# Operação Gata

Uma aventura romântica em HTML, CSS e JavaScript puro. Não usa frameworks, backend nem arquivos de mídia de terceiros. O avatar original é desenhado em pixel art no Canvas; a música e os efeitos são sintetizados localmente com Web Audio.

## Jogar

- Abra `index.html` em um navegador moderno ou publique a pasta no GitHub Pages.
- O áudio começa desligado e só é ativado após tocar no botão **Áudio** (exigência comum dos navegadores para reprodução).
- Use as setas na tela ou `←` / `→` para explorar e **Interagir** ou `Espaço` para conversar com o objeto próximo.
- Complete os objetivos mostrados acima do mapa para revelar a portinha e abrir a próxima fase. Você pode voltar às fases já visitadas pelo seletor abaixo do mapa.
- O sprite transparente da protagonista usa uma grade de 64 × 64 pixels e é ampliado sem suavização. O mapa e o progresso são salvos no LocalStorage do navegador.

Para executar um servidor local opcional: `python3 -m http.server 8000` e abra `http://localhost:8000`.

## Personalizar

Edite [`js/config.js`](./js/config.js) para alterar nome, apelido, carta, textos e lembranças. Não há lembranças pessoais pré-preenchidas. Para adicionar uma fotografia, coloque o arquivo em `assets/photos/` e informe um caminho relativo, por exemplo:

```js
memories: [
  { title: "Uma lembrança nossa", date: "Data opcional", photo: "assets/photos/foto.jpg", note: "Escreva aqui a história real." }
]
```

Baús sem configuração mostram uma mensagem explicando como preenchê-los. Se uma foto configurada não existir ou não carregar, o jogo mostra um aviso no lugar dela.

A fotografia enviada para esta aventura já está em `assets/photos/nosso-universo.png` e aparece na celebração final. O companheiro em pixel art só aparece depois de **Celebrar**, no fim do jogo. Para trocar ou remover a foto, edite `finalPhoto` em `js/config.js`. As qualidades celebradas e as mensagens do guia também podem ser editadas nesse arquivo.

O guia é **Mew**, desenhado em pixel art no Canvas (com imagem de referência também disponível em `assets/characters/mew.png`); ele oferece dicas de movimento, objetivos e portinhas. A protagonista tem longos cabelos ruivos acobreados, óculos redondos dourados, olhos castanhos delineados, sardas, adesivos de estrelinha lilás na bochecha, piercing dourado na orelha, tatuagem de gato no pescoço e look preto com kimono estrelado. Seu sprite frontal idle é desenhado em coordenadas inteiras sobre um Canvas transparente de 64 × 64, sem suavização nem sombra externa. Cada missão concluída revela uma qualidade da Gata. A personalização da declaração final fica em `finalDeclaration` e `partnerName`.

Datas especiais podem ser escritas em `dates` como uma lista de textos. As melodias sintetizadas podem ser personalizadas alterando as frequências (Hz) em `music.adventure` e `music.romance`. O apelido configurado também aparece na narração.

## Estrutura

```text
index.html
css/style.css
js/config.js
js/game.js
js/dialogue.js
js/scenes.js
js/audio.js
js/storage.js
assets/characters/
assets/backgrounds/
assets/music/
assets/sounds/
assets/photos/
```

As pastas em `assets/` ficam disponíveis para futuras fotos e personalizações; o jogo não depende de assets externos para funcionar.
