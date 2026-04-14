// =====================================================
//  SOZLAMALAR — shu uch qiymatni to'ldiring
// =====================================================
const BOT_TOKEN = "8668333336:AAGs11a1jPV8ZDilm6nBkAzxgDDVeut9Xhg";
const CHANNEL_ID = "@mbsi_form";
const IMAGE_URL = "https://mbsi.fra1.cdn.digitaloceanspaces.com/others/1kb.png";
// =====================================================

const form = document.getElementById("regForm");
const submitBtn = document.getElementById("submitBtn");
const statusMsg = document.getElementById("statusMsg");

function showStatus(type, msg) {
  statusMsg.className = "status " + type;
  statusMsg.textContent = msg;
}

// +998 XX XXX XX XX formatida masking
const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", (e) => {
  const cursorPos = e.target.selectionStart;
  const raw = e.target.value.replace(/\D/g, "").replace(/^998/, "");
  const digits = raw.slice(0, 9);

  let formatted = "+998";
  if (digits.length > 0) formatted += " " + digits.slice(0, 2);
  if (digits.length > 2) formatted += " " + digits.slice(2, 5);
  if (digits.length > 5) formatted += " " + digits.slice(5, 7);
  if (digits.length > 7) formatted += " " + digits.slice(7, 9);

  e.target.value = formatted;
});

phoneInput.addEventListener("keydown", (e) => {
  // +998 prefiksi o'chirilmasin
  const minLen = "+998".length;
  if (
    (e.key === "Backspace" || e.key === "Delete") &&
    e.target.selectionEnd <= minLen
  ) {
    e.preventDefault();
  }
});

phoneInput.addEventListener("focus", () => {
  if (!phoneInput.value) phoneInput.value = "+998 ";
});

phoneInput.addEventListener("blur", () => {
  if (phoneInput.value === "+998 " || phoneInput.value === "+998")
    phoneInput.value = "";
});

function validatePhone(phone) {
  // +998 XX XXX XX XX — 9 ta raqam
  return /^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone.trim());
}

function escMd(str) {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
// ===================== SUCCESS MODAL =====================
const successModal = document.getElementById("successModal");
const modalClose = document.getElementById("modalClose");

function openSuccessModal() {
  successModal.classList.add("open");
  spawnConfetti();
}

modalClose.addEventListener("click", () => {
  successModal.classList.remove("open");
});

successModal.addEventListener("click", (e) => {
  if (e.target === successModal) successModal.classList.remove("open");
});

function spawnConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  canvas.innerHTML = "";
  const colors = [
    "#1a8cff",
    "#0044cc",
    "#33aaff",
    "#66ccff",
    "#fff",
    "#ffd700",
    "#ff6b6b",
  ];
  const count = 38;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${60 + Math.random() * 40}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      transform: rotate(${Math.random() * 360}deg);
      width: ${5 + Math.random() * 8}px;
      height: ${5 + Math.random() * 8}px;
      animation-delay: ${Math.random() * 0.6}s;
      animation-duration: ${0.9 + Math.random() * 0.7}s;
    `;
    canvas.appendChild(el);
  }
}
// =========================================================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const direction = document.querySelector(
    'input[name="direction"]:checked',
  ).value;

  if (!name) {
    showStatus("error", "Iltimos, ism va familiyangizni kiriting.");
    return;
  }
  if (!age || isNaN(age) || age < 5 || age > 80) {
    showStatus("error", "Iltimos, to'g'ri yoshni kiriting.");
    return;
  }
  if (!validatePhone(phone)) {
    showStatus("error", "Iltimos, to'g'ri telefon raqam kiriting.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Yuborilmoqda...";
  statusMsg.className = "status";

  const caption =
    `📋 *Yangi ariza*\n\n` +
    `👤 *Ism:* ${escMd(name)}\n` +
    `🎂 *Yosh:* ${escMd(age)}\n` +
    `📞 *Telefon:* ${escMd(phone)}\n` +
    `🎓 *Yo'nalish:* ${escMd(direction)} tili`;

  try {
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        photo: IMAGE_URL,
        caption: caption,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (result.ok) {
      form.reset();
      document.getElementById("dir_rus").checked = true;
      openSuccessModal();
    } else {
      console.error("Telegram error:", result);
      showStatus(
        "error",
        "❌ Xatolik yuz berdi: " + (result.description || "Noma'lum xato"),
      );
    }
  } catch (err) {
    console.error(err);
    showStatus("error", "❌ Tarmoq xatosi. Iltimos qayta urinib ko'ring.");
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Yuborish";
});
