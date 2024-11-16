chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchKagi",
    title: "Search Kagi for '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info, tab);
  if (info.menuItemId === "searchKagi") {
    const searchQuery = encodeURIComponent(info.selectionText);
    const kagiUrl = `https://kagi.com/search?q=${searchQuery}`;
    console.log('Attempting to open URL:', kagiUrl);
    
    // Get the current window to position the popup relative to it
    chrome.windows.get(tab.windowId, {}, (parentWindow) => {
      const width = 800;
      const height = 600;
      
      // Position the popup on the right side of the current window
      const left = parentWindow.left + parentWindow.width - width;
      const top = parentWindow.top;

      chrome.windows.create({
        url: kagiUrl,
        type: 'popup',
        width: width,
        height: height,
        left: left,
        top: top,
        focused: true
      });
    });
  }
}); 