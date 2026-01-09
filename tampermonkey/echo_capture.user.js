// ==UserScript==
// @name         EchoMemory Capture
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Capture LLM conversations with on/off toggle
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://claude.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const FLASK_URL = "http://127.0.0.1:5005";
    const PING_INTERVAL = 15000;

    if (window._echoMemoryInstalled) return;
    window._echoMemoryInstalled = true;

    let isEnabled = true;
    let isConnected = false;
    let lastAssistantText = "";

    const isClaude = window.location.hostname.includes("claude.ai");
    const isChatGPT = window.location.hostname.includes("chatgpt.com") || 
                      window.location.hostname.includes("chat.openai.com");

    try { isEnabled = GM_getValue("echoEnabled", true); } catch(e) {}

    function saveEnabled() {
        try { GM_setValue("echoEnabled", isEnabled); } catch(e) {}
    }

    function createToggleUI() {
        const container = document.createElement("div");
        container.id = "echo-memory-ui";
        container.innerHTML = `
            <style>
                #echo-memory-ui {
                    position: fixed;
                    bottom: 15px;
                    right: 15px;
                    z-index: 99999;
                    font-family: monospace;
                    font-size: 12px;
                }
                #echo-toggle-btn {
                    background: #333;
                    color: #fff;
                    border: none;
                    padding: 8px 14px;
                    b
ls -la
cat > tampermonkey/echo_capture.user.js << 'EOF'
// ==UserScript==
// @name         EchoMemory Capture
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Capture LLM conversations with on/off toggle
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://claude.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const FLASK_URL = "http://127.0.0.1:5005";
    const PING_INTERVAL = 15000;

    if (window._echoMemoryInstalled) return;
    window._echoMemoryInstalled = true;

    let isEnabled = true;
    let isConnected = false;
    let lastAssistantText = "";

    const isClaude = window.location.hostname.includes("claude.ai");
    const isChatGPT = window.location.hostname.includes("chatgpt.com") || 
                      window.location.hostname.includes("chat.openai.com");

    try { isEnabled = GM_getValue("echoEnabled", true); } catch(e) {}

    function saveEnabled() {
        try { GM_setValue("echoEnabled", isEnabled); } catch(e) {}
    }

    function createToggleUI() {
        const container = document.createElement("div");
        container.id = "echo-memory-ui";
        container.innerHTML = `
            <style>
                #echo-memory-ui {
                    position: fixed;
                    bottom: 15px;
                    right: 15px;
                    z-index: 99999;
                    font-family: monospace;
                    font-size: 12px;
                }
                #echo-toggle-btn {
                    background: #333;
                    color: #fff;
                    border: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #echo-toggle-btn:hover { background: #444; }
                #echo-status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #888;
                }
            </style>
            <button id="echo-toggle-btn">
                <span id="echo-status-dot"></span>
                <span id="echo-status-text">Echo</span>
            </button>
        `;
        document.body.appendChild(container);
        document.getElementById("echo-toggle-btn").addEventListener("click", toggleEnabled);
        updateUI();
    }

    function updateUI() {
        const dot = document.getElementById("echo-status-dot");
        const text = document.getElementById("echo-status-text");
        if (!dot || !text) return;

        if (!isEnabled) {
            dot.style.background = "#888";
            text.textContent = "Echo: OFF";
        } else if (!isConnected) {
            dot.style.background = "#f44336";
            text.textContent = "Echo: NO SERVER";
        } else {
            dot.style.background = "#4caf50";
            text.textContent = "Echo: ON";
        }
    }

    function toggleEnabled() {
        isEnabled = !isEnabled;
        saveEnabled();
        updateUI();
    }

    async function checkConnection() {
        try {
            const res = await fetch(`${FLASK_URL}/ping`, { method: "GET" });
            isConnected = res.ok;
        } catch (e) {
            isConnected = false;
        }
        updateUI();
    }

    function startHeartbeat() {
        checkConnection();
        setInterval(checkConnection, PING_INTERVAL);
    }

    function sendCapture(role, content) {
        if (!isEnabled || !isConnected) return;
        const text = (content || "").trim();
        if (!text || text.length < 5) return;

        fetch(`${FLASK_URL}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ts: new Date().toISOString(),
                role: role,
                content: text,
                source: isClaude ? "claude" : "chatgpt"
            })
        }).catch(err => console.warn("[EchoMemory] Send error:", err));
    }

    function getUserInputText() {
        const textarea = document.querySelector("textarea");
        if (textarea && textarea.value) return textarea.value;
        const editable = document.querySelector("[contenteditable='true']");
        if (editable) return editable.innerText || "";
        return "";
    }

    function installUserCapture() {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
            const text = getUserInputText();
            if (text.trim()) sendCapture("user", text);
        }, true);
    }

    function getLatestAssistantText() {
        let messages = [];
        if (isChatGPT) {
            messages = document.querySelectorAll('[data-message-author-role="assistant"]');
        } else if (isClaude) {
            messages = document.querySelectorAll('[data-testid="chat-message-content"]');
            if (!messages.length) messages = document.querySelectorAll('.font-claude-message');
            if (!messages.length) messages = document.querySelectorAll('[class*="prose"]');
        }
        if (!messages.length) return "";
        const latest = messages[messages.length - 1];
        return latest.innerText || latest.textContent || "";
    }

    function installAssistantCapture() {
        const observer = new MutationObserver(() => {
            clearTimeout(window._echoDebounce);
            window._echoDebounce = setTimeout(() => {
                const currentText = getLatestAssistantText();
                if (currentText && currentText.length > 50 && currentText !== lastAssistantText) {
                    setTimeout(() => {
                        const textAfterDelay = getLatestAssistantText();
                        if (textAfterDelay === currentText) {
                            sendCapture("assistant", currentText);
                            lastAssistantText = currentText;
                        }
                    }, 800);
                }
            }, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    function init() {
        createToggleUI();
        startHeartbeat();
        installUserCapture();
        installAssistantCapture();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
