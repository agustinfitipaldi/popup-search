chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchKagi",
    title: "Search Kagi for '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchKagi") {
    const searchQuery = encodeURIComponent(info.selectionText);
    const kagiUrl = `https://kagi.com/search?q=${searchQuery}`;
    
    // Use Edge's split view API
    chrome.windows.get(tab.windowId, {}, (window) => {
      chrome.tabs.update(tab.id, {
        url: kagiUrl,
        splitType: "vertical"
      });
    });
  }
}); 