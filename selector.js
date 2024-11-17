document.addEventListener('DOMContentLoaded', () => {
    const optionsContainer = document.getElementById('options');

    // Fetch search options and dimensions from storage
    chrome.storage.sync.get({ searchOptions: [], selectorDimensions: { width: 300, height: 160 } }, (settings) => {
        settings.searchOptions.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'search-option';
            optionDiv.dataset.id = option.id;
            optionDiv.textContent = option.name;

            // Add shortcut label if available
            if (option.quickKey) {
                const shortcutSpan = document.createElement('span');
                shortcutSpan.className = 'shortcut';
                shortcutSpan.textContent = `${option.quickKey}`;
                optionDiv.appendChild(shortcutSpan);
            }

            // Add click event to perform search
            optionDiv.addEventListener('click', () => {
                performSearch(option.id);
            });

            optionsContainer.appendChild(optionDiv);
        });
        
        // Set the window size using stored dimensions
        const { width, height } = settings.selectorDimensions;
        window.resizeTo(width, height);
        
        // Update the grid columns based on number of options
        if (settings.searchOptions.length > 10) {
            optionsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    });

    // Listen for key presses
    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        chrome.storage.sync.get({ searchOptions: [] }, (settings) => {
            const matchedOption = settings.searchOptions.find(opt => opt.quickKey === key);
            if (matchedOption) {
                performSearch(matchedOption.id);
            }
        });
    });
});

// Function to perform search
function performSearch(searchType) {
    chrome.storage.session.get(['selectorData'], (data) => {
        const { selectedText, parentTabId } = data.selectorData || {};
        if (selectedText && searchType) {
            // Send message to background.js to perform search
            chrome.runtime.sendMessage({
                action: 'performSearch',
                searchText: selectedText,
                searchType: searchType
            }, () => {
                // Close the selector popup after initiating search
                window.close();
            });
        } else {
            console.error('Missing selectedText or searchType');
        }
    });
}