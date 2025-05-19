// ---- 1. \u5efa\u7acb\u53f3\u9375\u9078\u55ae ----
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize \u9019\u6bb5\u6587\u5b57\uff08\u7e41\u4e2d\uff09",
    contexts: ["selection"]
  })
);

// ---- 2. \u9ede\u64ca\u5f8c\u6d41\u7a0b ----
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "summarize") return;

  // (2-1) \u6293\u9078\u53d6\u6587\u5b57
  const [{ result: text }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });
  if (!text.trim()) return;

  // (2-2) \u8b80 API Key
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }

  // (2-3) \u7d44 prompt
  const prompt = `\u7528\u7e41\u9ad4\u4e2d\u6587\u7e3d\u7d50\u6709\u6df1\u523b\u6d1e\u5bdf\u7684\u91cd\u9ede
\u6700\u5f8c\u7d66\u4e00\u500b ascii \u5716\u7d50\u69cb\u5316\u7e3d\u7d50\uff0c\u6839\u64da\u5167\u5bb9\u81ea\u9078\u6700\u9069\u5408\u7684\u5716\u5f62\uff08\u5fc3\u667a\u5716 / \u6d41\u7a0b\u5716 / \u9577\u689d\u5716 / \u7db2\u8def\u5716 / \u6a39\u72c0\u5716\uff09

Title: "${tab.title}"
Text: """${text.replace(/\n+/g, " ").slice(0, 8000)}"""`;

  // (2-4) \u547c\u53eb OpenAI
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    })
  });
  const j = await r.json();
  const answer = j.choices?.[0]?.message?.content ?? "\uff08\u751f\u6210\u5931\u6557\uff09";

  // (2-5) \u5f48\u51fa\u65b0\u8996\u7a97\u986f\u793a
  const html = `
    <html><meta charset="utf-8"/>
    <style>body{white-space:pre-wrap;font-family:monospace;padding:16px;}</style>
    <body>${answer.replace(/</g, "&lt;")}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  chrome.windows.create({ url, type: "popup", width: 600, height: 800 });
});
