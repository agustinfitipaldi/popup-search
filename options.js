// Default settings
const DEFAULT_SETTINGS = {
  maxWindows: 3,
  closeKey: 'Escape',
  searchOptions: [
    {
      id: 'kagi',
      name: 'Kagi',
      url: 'https://kagi.com/search?q={query}',
      shortcut: '1',
      quickKey: 'K'
    },
    {
      id: 'oed',
      name: 'Oxford English Dictionary',
      url: 'https://www.oed.com/search/dictionary/?scope=Entries&q={query}',
      shortcut: '2',
      quickKey: 'O'
    },
    {
      id: 'websters1913',
      name: "Webster's 1913",
      url: 'https://www.websters1913.com/words/{query}',
      shortcut: '3',
      quickKey: 'W'
    },
    {
      id: 'ucsb',
      name: 'UCSB Library',
      url: 'https://search.library.ucsb.edu/discovery/search?query=any,contains,{query}&tab=Everything&search_scope=DN_and_CI&vid=01UCSB_INST:UCSB&lang=en&offset=0',
      shortcut: '',
      quickKey: 'U'
    }
  ]
};

function createSearchOptionElement(option, usedShortcuts) {
    const div = document.createElement('div');
    div.className = 'search-option';
    div.dataset.id = option.id || generateUniqueId();
    
    // Create shortcut select options - now only 3 options
    const shortcutOptions = ['1', '2', '3']
        .map(s => `<option value="${s}" ${option.shortcut === s ? 'selected' : ''} ${usedShortcuts.has(s) && option.shortcut !== s ? 'disabled' : ''}>${s}</option>`)
        .join('');

    div.innerHTML = `
        <button class="delete-btn">Delete</button>
        <label>Name:
            <input type="text" class="name-input" value="${option.name || ''}" placeholder="Search Engine Name">
        </label>
        <label>URL:
            <input type="text" class="url-input" value="${option.url || ''}" placeholder="https://example.com/search?q={query}">
        </label>
        <label>Primary Shortcut (Alt+1/2/3):
            <select class="shortcut-input">
                <option value="">None</option>
                ${shortcutOptions}
            </select>
        </label>
        <label>Quick Select Key:
            <input type="text" class="quick-key-input" 
                   maxlength="1" 
                   value="${option.quickKey || ''}" 
                   placeholder="Single letter">
            <div class="hint">Letter to press when selector popup is open (Alt+S)</div>
        </label>
    `;

    div.querySelector('.delete-btn').addEventListener('click', () => div.remove());
    return div;
}

function generateUniqueId() {
    return 'search_' + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Load settings when the options page opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    document.getElementById('maxWindows').value = settings.maxWindows;
    document.getElementById('closeKey').value = settings.closeKey;

    const searchOptionsContainer = document.getElementById('searchOptions');
    const usedShortcuts = new Set(settings.searchOptions.map(opt => opt.shortcut));
    
    settings.searchOptions.forEach(option => {
      searchOptionsContainer.appendChild(
        createSearchOptionElement(option, usedShortcuts)
      );
    });
  });
});

// Add new search option
document.getElementById('addSearch').addEventListener('click', () => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    const usedShortcuts = new Set(
      Array.from(document.querySelectorAll('.search-option'))
        .map(el => el.querySelector('.shortcut-input').value)
    );
    
    const searchOptionsContainer = document.getElementById('searchOptions');
    searchOptionsContainer.appendChild(
      createSearchOptionElement(
        { id: generateUniqueId() },
        usedShortcuts
      )
    );
  });
});

// Save settings
document.getElementById('save').addEventListener('click', () => {
  const searchOptions = Array.from(document.querySelectorAll('.search-option')).map(el => ({
    id: el.dataset.id || generateUniqueId(),
    name: el.querySelector('.name-input').value,
    url: el.querySelector('.url-input').value,
    shortcut: el.querySelector('.shortcut-input').value,
    quickKey: el.querySelector('.quick-key-input').value.toUpperCase()
  }));

  const settings = {
    maxWindows: parseInt(document.getElementById('maxWindows').value, 10),
    closeKey: document.getElementById('closeKey').value,
    searchOptions: searchOptions
  };

  // Validate settings
  const errors = [];
  const shortcuts = new Set();
  const quickKeys = new Set();
  
  settings.searchOptions.forEach(option => {
    if (!option.name) errors.push('Name is required for all search options');
    if (!option.url) errors.push('URL is required for all search options');
    if (!option.url.includes('{query}')) errors.push(`URL for ${option.name} must include {query}`);
    if (option.shortcut && shortcuts.has(option.shortcut)) errors.push(`Duplicate primary shortcut: Alt+${option.shortcut}`);
    if (option.shortcut) shortcuts.add(option.shortcut);
    if (!option.quickKey) errors.push(`Quick select key is required for ${option.name}`);
    if (option.quickKey && quickKeys.has(option.quickKey)) errors.push(`Duplicate quick select key: ${option.quickKey}`);
    if (option.quickKey) quickKeys.add(option.quickKey);
  });

  if (errors.length > 0) {
    const status = document.getElementById('status');
    status.textContent = errors[0];
    status.className = 'error';
    return;
  }

  chrome.storage.sync.set(settings, () => {
    // Recreate context menus
    chrome.contextMenus.removeAll(() => {
      settings.searchOptions.forEach(option => {
        chrome.contextMenus.create({
          id: option.id,
          title: `Search ${option.name} for '%s'`,
          contexts: ["selection"]
        });
      });
    });

    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    status.className = 'success';
    setTimeout(() => {
        status.className = '';
        status.textContent = '';
    }, 2000);
  });
});

// Export settings
document.getElementById('export').addEventListener('click', () => {
    chrome.storage.sync.get(null, (settings) => {
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'popup-search-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});

// Import settings
document.getElementById('import').addEventListener('click', () => {
    document.getElementById('importInput').click();
});

document.getElementById('importInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Validate the imported settings
                if (!settings.searchOptions || !Array.isArray(settings.searchOptions)) {
                    throw new Error('Invalid settings format');
                }

                // Save the imported settings
                chrome.storage.sync.set(settings, () => {
                    // Reload the page to show the imported settings
                    window.location.reload();
                });
            } catch (error) {
                const status = document.getElementById('status');
                status.textContent = 'Error importing settings: Invalid file format';
                status.className = 'error';
                setTimeout(() => {
                    status.className = '';
                    status.textContent = '';
                }, 3000);
            }
        };
        reader.readAsText(file);
    }
}); 