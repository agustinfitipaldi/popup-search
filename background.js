chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ searchOptions: [] }, (settings) => {
    settings.searchOptions.forEach(option => {
      chrome.contextMenus.create({
        id: option.id,
        title: `Search ${option.name} for '%s'`,
        contexts: ["selection"]
      });
    });
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

// Function to get search URL based on type
function getSearchUrl(searchText, searchType) {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ searchOptions: [] }, (settings) => {
      const option = settings.searchOptions.find(opt => opt.id === searchType);
      if (option) {
        resolve(option.url.replace('{query}', encodeURIComponent(searchText)));
      } else {
        resolve(`https://kagi.com/search?q=${encodeURIComponent(searchText)}`);
      }
    });
  });
}

// Modify the search function to accept search type
async function performSearch(searchText, searchType) {
  const settings = await getSettings();
  const searchUrl = await getSearchUrl(searchText, searchType);
  
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
      url: searchUrl,
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

// Update context menu listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  performSearch(info.selectionText, info.menuItemId);
});

// Update keyboard command listener
chrome.commands.onCommand.addListener(async (command) => {
    // Extract the shortcut letter from the command (e.g., "search-K" -> "K")
    const shortcut = command.split('-')[1];
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const [{result}] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    });
    
    if (result) {
        chrome.storage.sync.get({ searchOptions: [] }, (settings) => {
            const option = settings.searchOptions.find(opt => opt.shortcut === shortcut);
            if (option) {
                performSearch(result, option.id);
            }
        });
    }
}); 