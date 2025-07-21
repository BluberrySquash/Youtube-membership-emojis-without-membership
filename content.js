console.log("✅ Emoji injector script running!");

const emojiMap = {};
let alertContainer = null;

// 🧩 Floating UI panel for discovered emojis
function createAlertContainer() {
  if (alertContainer) return;
  alertContainer = document.createElement("div");
  alertContainer.style.position = "fixed";
  alertContainer.style.top = "12px";
  alertContainer.style.right = "12px";
  alertContainer.style.padding = "10px";
  alertContainer.style.background = "#fff";
  alertContainer.style.border = "1px solid #ccc";
  alertContainer.style.borderRadius = "8px";
  alertContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  alertContainer.style.fontSize = "14px";
  alertContainer.style.zIndex = "9999";
  alertContainer.style.maxWidth = "280px";
  alertContainer.style.lineHeight = "1.6";
  alertContainer.textContent = "🧩 Discovered emojis:";
  document.body.appendChild(alertContainer);
}

// 🖼️ Display discovered emoji in the panel
function displayEmoji(code, url) {
  if (document.querySelector(`#emoji-${CSS.escape(code)}`)) return;

  const line = document.createElement("div");
  line.id = `emoji-${code}`;
  line.style.display = "flex";
  line.style.alignItems = "center";
  line.style.marginBottom = "6px";

  const img = document.createElement("img");
  img.src = url;
  img.alt = code;
  img.style.height = "16px";
  img.style.width = "16px";
  img.style.marginRight = "8px";

  const label = document.createElement("span");
  label.textContent = code;
  label.style.fontFamily = "monospace";

  line.appendChild(img);
  line.appendChild(label);
  alertContainer.appendChild(line);

  console.log(`✅ Displayed emoji: ${code}`);
}

// 🚦 Wait for comments section to be ready
function waitForComments(callback) {
  const check = setInterval(() => {
    if (document.querySelector('ytd-comments')) {
      clearInterval(check);
      callback();
    }
  }, 500);
}

// 🕵️ Discover emojis in visible comments
function scanCommentEmojis() {
  document.querySelectorAll('#content-text img[alt]').forEach(img => {
    const code = `:${img.alt.trim()}:`;
    const src = img.src;
    if (
      code &&
      src &&
      !emojiMap[code] &&
      src.includes('yt3.googleusercontent.com') &&
      !src.includes('photo.jpg') &&
      !img.closest('ytd-author-comment-badge')
    ) {
      emojiMap[code] = src;
      displayEmoji(code, src);
    }
  });
}

// 🔓 Discover emojis from upsell picker
function scanEmojiPickerPanel() {
  document.querySelectorAll('yt-emoji-picker-upsell-category-renderer img[alt][src]').forEach(img => {
    const code = `:${img.alt.trim()}:`;
    const src = img.src;
    if (!emojiMap[code]) {
      emojiMap[code] = src;
      displayEmoji(code, src);
      console.log(`🔐 Scraped from picker: ${code}`);
    }
  });
}

// 🔁 Replace shortcodes in comments with actual emojis
function injectEmojisIntoComments() {
  document.querySelectorAll('#content-text').forEach(node => {
    if (node.dataset.emojiProcessed) return;

    const content = node.textContent;
    let changed = false;

    Object.entries(emojiMap).forEach(([code, url]) => {
      if (content.includes(code)) {
        node.textContent = "";
        const segments = content.split(code);
        segments.forEach((seg, i) => {
          node.appendChild(document.createTextNode(seg));
          if (i < segments.length - 1) {
            const emojiImg = document.createElement("img");
            emojiImg.src = url;
            emojiImg.alt = code;
            emojiImg.style.height = "16px";
            emojiImg.style.width = "16px";
            emojiImg.style.verticalAlign = "middle";
            node.appendChild(emojiImg);
          }
        });
        changed = true;
      }
    });

    if (changed) node.dataset.emojiProcessed = "true";
  });
}

// 🚀 Init everything
waitForComments(() => {
  console.log("🧠 YouTube comments detected.");
  createAlertContainer();

  setInterval(() => {
    scanCommentEmojis();
    scanEmojiPickerPanel();
    injectEmojisIntoComments();
  }, 1000);
});