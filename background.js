chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchKagi",
    title: "Search Kagi for '%s'",
    contexts: ["selection"]
  });
});

// Keep track of open search windows
let searchWindows = [];

// Get settings with defaults
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      maxWindows: 3,
      closeKey: 'Escape'
    }, resolve);
  });
}

// Extract search functionality into a reusable function
async function performKagiSearch(searchText) {
  const settings = await getSettings();
  const searchQuery = encodeURIComponent(searchText);
  const kagiUrl = `https://kagi.com/search?q=${searchQuery}`;
  
  // Clean up old windows that might have been closed manually
  searchWindows = searchWindows.filter(windowId => {
    try {
      chrome.windows.get(windowId);
      return true;
    } catch {
      return false;
    }
  });

  // Limit number of open windows based on settings
  if (searchWindows.length >= settings.maxWindows) {
    chrome.windows.remove(searchWindows.shift());
  }
  
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
    }, (window) => {
      // Store the window ID
      searchWindows.push(window.id);
      
      // Add keyboard listener for this window
      chrome.tabs.query({ windowId: window.id }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: (closeKey) => {
            document.addEventListener('keydown', (e) => {
              if (e.key === closeKey) {
                window.close();
              }
            });
          },
          args: [settings.closeKey]
        });
      });
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