const root = document.documentElement;
const cursor = document.querySelector(".cursor");
const cursorRing = document.querySelector(".cursor-ring");
const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let mouseX = 0;
let mouseY = 0;

const particles = [];
const particleCount = 80;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function createParticles() {
  particles.length = 0;
  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 1 + Math.random() * 2,
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const alpha = Math.max(0, 1 - dist / 220);

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + alpha * 0.6})`;
    ctx.arc(p.x, p.y, p.r + alpha * 1.4, 0, Math.PI * 2);
    ctx.fill();

    for (const other of particles) {
      const d2x = p.x - other.x;
      const d2y = p.y - other.y;
      const d2 = Math.sqrt(d2x * d2x + d2y * d2y);
      if (d2 < 110) {
        const lineAlpha = (1 - d2 / 110) * 0.25;
        ctx.strokeStyle = `rgba(68, 210, 255, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(updateParticles);
}

function handleMouseMove(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  const x = mouseX / window.innerWidth;
  const y = mouseY / window.innerHeight;
  root.style.setProperty("--mx", x.toFixed(3));
  root.style.setProperty("--my", y.toFixed(3));

  cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  cursorRing.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
}

function setupTilt() {
  const tiltCards = document.querySelectorAll("[data-tilt]");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function setupMagnet() {
  const magnets = document.querySelectorAll("[data-magnet]");
  magnets.forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0px, 0px)";
    });
  });
}

function setupReveal() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((item) => observer.observe(item));
}

window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

resizeCanvas();
createParticles();
updateParticles();
setupTilt();
setupMagnet();
setupReveal();
