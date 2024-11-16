// Default settings
const DEFAULT_SETTINGS = {
  maxWindows: 3,
  closeKey: 'Escape'
};

// Load settings when the options page opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    document.getElementById('maxWindows').value = settings.maxWindows;
    document.getElementById('closeKey').value = settings.closeKey;
  });
});

// Save settings when the save button is clicked
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    maxWindows: parseInt(document.getElementById('maxWindows').value, 10),
    closeKey: document.getElementById('closeKey').value
  };

  chrome.storage.sync.set(settings, () => {
    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}); 