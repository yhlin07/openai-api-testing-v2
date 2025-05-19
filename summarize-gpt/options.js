const keyInput = document.getElementById("key");

chrome.storage.local.get("apiKey", ({ apiKey }) => keyInput.value = apiKey || "");

document.getElementById("save").onclick = () => {
  chrome.storage.local.set({ apiKey: keyInput.value.trim() }, () =>
    alert("\u5df2\u5132\u5b58！"));
};
