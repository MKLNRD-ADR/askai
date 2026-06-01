const chatContainer = document.getElementById("chatContainer");
const messagesEl = document.getElementById("messages");
const welcomeEl = document.getElementById("welcome");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChat");

let isLoading = false;

// Auto-resize textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 140) + "px";
});

// Send on Enter, newline on Shift+Enter
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

// Suggestion chips
document.querySelectorAll(".suggestion").forEach((btn) => {
  btn.addEventListener("click", () => {
    userInput.value = btn.dataset.text;
    sendMessage();
  });
});

// New chat
newChatBtn.addEventListener("click", async () => {
  await fetch("/clear", { method: "POST" });
  messagesEl.innerHTML = "";
  welcomeEl.style.display = "flex";
  welcomeEl.style.opacity = "1";
});

// Load existing history on page load
async function loadHistory() {
  try {
    const res = await fetch("/history");
    const history = await res.json();
    if (history.length > 0) {
      hideWelcome();
      history.forEach((msg) => {
        appendMessage(msg.role, msg.content, "", false);
      });
      scrollToBottom();
    }
  } catch (e) {
    console.error("Failed to load history", e);
  }
}

function hideWelcome() {
  welcomeEl.style.opacity = "0";
  setTimeout(() => (welcomeEl.style.display = "none"), 300);
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatContent(text) {
  // Basic markdown-like formatting
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function appendMessage(role, content, time = "", animate = true) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  if (!animate) div.style.animation = "none", div.style.opacity = "1";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  if (content.startsWith("⚠")) bubble.classList.add("error-bubble");
  bubble.innerHTML = formatContent(content);

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  meta.textContent = role === "user" ? `You · ${time || formatTime()}` : `AskAI · ${time || formatTime()}`;

  const wrapper = document.createElement("div");
  wrapper.style.maxWidth = "680px";
  wrapper.style.width = role === "assistant" ? "100%" : "auto";
  wrapper.appendChild(bubble);
  wrapper.appendChild(meta);

  div.appendChild(wrapper);
  messagesEl.appendChild(div);
  scrollToBottom();
}

function showThinking() {
  const div = document.createElement("div");
  div.className = "thinking";
  div.id = "thinking";
  div.innerHTML = `
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    <span>AskAI is thinking...</span>
  `;
  messagesEl.appendChild(div);
  scrollToBottom();
}

function hideThinking() {
  const el = document.getElementById("thinking");
  if (el) el.remove();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  hideWelcome();
  isLoading = true;
  sendBtn.disabled = true;
  userInput.disabled = true;

  appendMessage("user", text);
  userInput.value = "";
  userInput.style.height = "auto";

  showThinking();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    hideThinking();

    if (data.error) {
      appendMessage("assistant", `⚠ ${data.error}`, data.timestamp);
    } else {
      appendMessage("assistant", data.response, data.timestamp);
    }
  } catch (err) {
    hideThinking();
    appendMessage("assistant", "⚠ Network error. Please check your connection.");
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

loadHistory();
