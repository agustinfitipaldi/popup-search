// Default settings
const DEFAULT_SETTINGS = {
  maxWindows: 3,
  closeKey: 'Escape',
  availableShortcuts: ['K', 'O', 'W', 'U'], // These must match manifest.json
  searchOptions: [
    {
      id: 'kagi',
      name: 'Kagi',
      url: 'https://kagi.com/search?q={query}',
      shortcut: 'K'
    },
    {
      id: 'oed',
      name: 'Oxford English Dictionary',
      url: 'https://www.oed.com/search/dictionary/?scope=Entries&q={query}',
      shortcut: 'O'
    }
    // ... other default search options ...
  ]
};

function createSearchOptionElement(option, availableShortcuts, usedShortcuts) {
    const div = document.createElement('div');
    div.className = 'search-option';
    div.dataset.id = option.id || generateUniqueId();
    
    // Create shortcut select options
    const shortcutOptions = availableShortcuts
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
        <label>Keyboard Shortcut:
            <span>Alt+</span>
            <select class="shortcut-input">
                <option value="">Select...</option>
                ${shortcutOptions}
            </select>
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
        createSearchOptionElement(option, settings.availableShortcuts, usedShortcuts)
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
        settings.availableShortcuts,
        usedShortcuts
      )
    );
  });
});

// Save settings
document.getElementById('save').addEventListener('click', async () => {
  const searchOptions = Array.from(document.querySelectorAll('.search-option')).map(el => ({
    id: el.dataset.id || generateUniqueId(),
    name: el.querySelector('.name-input').value,
    url: el.querySelector('.url-input').value,
    shortcut: el.querySelector('.shortcut-input').value.toUpperCase()
  }));

  const settings = {
    maxWindows: parseInt(document.getElementById('maxWindows').value, 10),
    closeKey: document.getElementById('closeKey').value,
    searchOptions: searchOptions
  };

  // Validate settings before saving
  const errors = [];
  const shortcuts = new Set();
  
  settings.searchOptions.forEach(option => {
    if (!option.name) errors.push('Name is required for all search options');
    if (!option.url) errors.push('URL is required for all search options');
    if (!option.url.includes('{query}')) errors.push(`URL for ${option.name} must include {query}`);
    if (!option.shortcut) errors.push('Shortcut is required for all search options');
    if (shortcuts.has(option.shortcut)) errors.push(`Duplicate shortcut: Alt+${option.shortcut}`);
    shortcuts.add(option.shortcut);
  });

  if (errors.length > 0) {
    const status = document.getElementById('status');
    status.textContent = errors[0];
    status.className = 'error';
    return;
  }

  // Get all unique shortcuts
  const allShortcuts = Array.from(shortcuts);
  
  // Update manifest
  const manifestUpdated = await updateManifest(allShortcuts);
  
  if (!manifestUpdated) {
    const status = document.getElementById('status');
    status.textContent = 'Error updating manifest. Please check console.';
    status.className = 'error';
    return;
  }

  chrome.storage.sync.set(settings, () => {
    const status = document.getElementById('status');
    status.innerHTML = `
        Settings saved! <br>
        Please save the downloaded manifest.json file to your extension directory 
        and reload the extension from chrome://extensions
    `;
    status.className = 'success';
    setTimeout(() => {
        status.className = '';
        status.textContent = '';
    }, 2000);
  });
});

async function updateManifest(shortcuts) {
    try {
        // Get the current manifest
        const response = await fetch(chrome.runtime.getURL('manifest.json'));
        const manifest = await response.json();
        
        // Update commands section
        manifest.commands = {};
        shortcuts.forEach(shortcut => {
            manifest.commands[`search-${shortcut}`] = {
                suggested_key: {
                    default: `Alt+${shortcut}`
                },
                description: `Search with shortcut ${shortcut}`
            };
        });

        // Convert manifest to blob
        const manifestBlob = new Blob(
            [JSON.stringify(manifest, null, 2)], 
            { type: 'application/json' }
        );

        // Create download link and trigger download
        const downloadUrl = URL.createObjectURL(manifestBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'manifest.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('Error updating manifest:', error);
        return false;
    }
} 