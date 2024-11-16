chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchKagi",
    title: "Search Kagi for '%s'",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "searchOED",
    title: "Search OED for '%s'",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "searchWebsters",
    title: "Search Webster's 1913 for '%s'",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "searchUCSB",
    title: "Search UCSB Library for '%s'",
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

// Function to get search URL based on type
function getSearchUrl(searchText, searchType) {
  const query = encodeURIComponent(searchText);
  switch (searchType) {
    case 'kagi':
      return `https://kagi.com/search?q=${query}`;
    case 'oed':
      return `https://www.oed.com/search/dictionary/?scope=Entries&q=${query}`;
    case 'websters':
      return `https://www.websters1913.com/words/${query}`;
    case 'ucsb':
      return `https://search.library.ucsb.edu/discovery/search?query=any,contains,${query}&tab=Everything&search_scope=DN_and_CI&vid=01UCSB_INST:UCSB&lang=en&offset=0`;
    default:
      return `https://kagi.com/search?q=${query}`;
  }
}

// Modify the search function to accept search type
async function performSearch(searchText, searchType) {
  const settings = await getSettings();
  const searchUrl = getSearchUrl(searchText, searchType);
  
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
  if (info.menuItemId === "searchKagi") {
    performSearch(info.selectionText, 'kagi');
  } else if (info.menuItemId === "searchOED") {
    performSearch(info.selectionText, 'oed');
  } else if (info.menuItemId === "searchWebsters") {
    performSearch(info.selectionText, 'websters');
  } else if (info.menuItemId === "searchUCSB") {
    performSearch(info.selectionText, 'ucsb');
  }
});

// Update keyboard shortcut listener
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const [{result}] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.getSelection().toString()
  });
  
  if (result) {
    switch (command) {
      case 'search-kagi':
        performSearch(result, 'kagi');
        break;
      case 'search-oed':
        performSearch(result, 'oed');
        break;
      case 'search-websters':
        performSearch(result, 'websters');
        break;
      case 'search-ucsb':
        performSearch(result, 'ucsb');
        break;
    }
  }
}); 