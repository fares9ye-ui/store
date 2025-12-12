// ==================== 🔥 Confetti Canvas Setup 🔥 ==================== //

const canvas = document.createElement("canvas");
canvas.id = "confetti-canvas";
Object.assign(canvas.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: "10005" // Confete acima de tudo
});
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let cx = ctx.canvas.width / 2;
let cy = ctx.canvas.height / 2;

let confetti = [];
const confettiCount = 400;
const gravity = 0.6;
const terminalVelocity = 6;
const drag = 0.08;
const colors = [
  { front: "red", back: "darkred" },
  { front: "green", back: "darkgreen" },
  { front: "blue", back: "darkblue" },
  { front: "yellow", back: "goldenrod" },
  { front: "orange", back: "darkorange" },
  { front: "pink", back: "deeppink" },
  { front: "purple", back: "indigo" },
  { front: "turquoise", back: "darkturquoise" }
];

function initConfetti() {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      color: colors[Math.floor(Math.random() * colors.length)],
      dimensions: {
        x: Math.random() * 8 + 8,
        y: Math.random() * 16 + 8
      },
      position: {
        x: Math.random() * canvas.width,
        y: canvas.height - 1
      },
      rotation: Math.random() * 2 * Math.PI,
      scale: { x: 1, y: 1 },
      velocity: {
        x: Math.random() * 50 - 25,
        y: Math.random() * -50 - 15
      }
    });
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((confetto, index) => {
    const width = confetto.dimensions.x * confetto.scale.x;
    const height = confetto.dimensions.y * confetto.scale.y;

    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    confetto.velocity.x -= confetto.velocity.x * drag;
    confetto.velocity.y = Math.min(
      confetto.velocity.y + gravity,
      terminalVelocity
    );
    confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

    confetto.position.x += confetto.velocity.x;
    confetto.position.y += confetto.velocity.y;

    if (confetto.position.y >= canvas.height) confetti.splice(index, 1);
    if (confetto.position.x > canvas.width) confetto.position.x = 0;
    if (confetto.position.x < 0) confetto.position.x = canvas.width;

    confetto.scale.y = Math.cos(confetto.position.y * 0.1);
    ctx.fillStyle =
      confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  window.requestAnimationFrame(render);
}

initConfetti();
render();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cx = ctx.canvas.width / 2;
  cy = ctx.canvas.height / 2;
});

// ==================== 🎉 Welcome Overlay ==================== //
const userName = "{{USER:NAME}}";
const websiteTitle = "{{WEBSITE_TITLE}}";

// 🔲 Blur no fundo
const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backdropFilter: "blur(7px)",
  backgroundColor: "rgba(0,0,0,0.55)",
  zIndex: "10002",
  opacity: "0",
  transition: "opacity 0.7s ease"
});
document.body.appendChild(overlay);

// 🥳 Emoji
const emoji = document.createElement("div");
emoji.innerHTML = "🥳";
Object.assign(emoji.style, {
  position: "fixed",
  top: "28%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0.8)",
  fontSize: "130px",
  zIndex: "10003",
  opacity: "0",
  transition: "opacity 0.6s ease, transform 0.6s ease",
  animation: "bounce 1.2s ease infinite"
});
document.body.appendChild(emoji);

// 💌 Mensagem
const container = document.createElement("div");
Object.assign(container.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) scale(0.9)",
  background: "rgba(37,69,109,0.75)",
  color: "#FFF",
  padding: "45px 50px",
  borderRadius: "40px",
  boxShadow: "0 0 20px rgba(0,159,255,0.5)",
  zIndex: "10003",
  fontSize: "25px",
  textAlign: "center",
  opacity: "0",
  transition: "opacity 0.6s ease, transform 0.6s ease"
});
document.body.appendChild(container);

// 🎨 CSS animações
const style = document.createElement("style");
style.innerHTML = `
@keyframes bounce {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-12px) scale(1); }
}
`;
document.head.appendChild(style);

// ==================== 🚀 Sequência dos Efeitos ==================== //
const message = `🎉 Bem-vindo(a) ${userName}!<br><br>Estamos muito felizes por ter você aqui. 🤩`;

function showOverlay() {
  overlay.style.opacity = "1";
}

function showEmoji() {
  emoji.style.opacity = "1";
  emoji.style.transform = "translate(-50%, -50%) scale(1)";
}

function showMessage() {
  container.style.opacity = "1";
  container.style.transform = "translate(-50%, -50%) scale(1)";
  typeWriter();
}

let index = 0;
function typeWriter() {
  if (index < message.length) {
    const char = message.charAt(index);
    if (char === "<" && message.substr(index, 4) === "<br>") {
      container.innerHTML += "<br>";
      index += 4;
    } else {
      container.innerHTML += char;
      index++;
    }
    setTimeout(typeWriter, 25);
  }
}

// ▶️ Orquestração dos efeitos
showOverlay();

setTimeout(() => {
  showEmoji();
}, 200);

setTimeout(() => {
  showMessage();
}, 400);

// ⏳ Remoção após 5 segundos
setTimeout(() => {
  [container, emoji, overlay, canvas].forEach((el) => {
    el.style.transition = "opacity 0.6s ease";
    el.style.opacity = "0";
  });

  setTimeout(() => {
    [container, emoji, overlay, canvas].forEach((el) =>
      document.body.removeChild(el)
    );
  }, 800);
}, 5000);
