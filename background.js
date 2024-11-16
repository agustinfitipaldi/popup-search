chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchKagi",
    title: "Search Kagi for '%s'",
    contexts: ["selection"]
  });
});

// Extract search functionality into a reusable function
function performKagiSearch(searchText) {
  const searchQuery = encodeURIComponent(searchText);
  const kagiUrl = `https://kagi.com/search?q=${searchQuery}`;
  console.log('Attempting to open URL:', kagiUrl);
  
  chrome.windows.getCurrent({}, (parentWindow) => {
    const width = 800;
    const height = 1000;
    
    const left = parentWindow.left + parentWindow.width - width - 20;
    const top = parentWindow.top + 50;

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

// Modify context menu listener to use the new function
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchKagi") {
    performKagiSearch(info.selectionText);
  }
});

// Add keyboard shortcut listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "search-kagi") {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Execute script to get selected text
    const [{result}] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => window.getSelection().toString()
    });
    
    if (result) {
      performKagiSearch(result);
    }
  }
}); 