document.addEventListener('DOMContentLoaded', async () => {
    const { selectorData } = await chrome.storage.session.get('selectorData');
    const { searchOptions } = await chrome.storage.sync.get({ searchOptions: [] });
    
    const optionsContainer = document.getElementById('options');
    
    searchOptions.forEach(option => {
        const div = document.createElement('div');
        div.className = 'search-option';
        div.innerHTML = `
            ${option.name}
            <span class="shortcut">${option.quickKey || ''}</span>
        `;
        div.addEventListener('click', () => {
            chrome.runtime.sendMessage({
                action: 'performSearch',
                searchText: selectorData.selectedText,
                searchType: option.id
            });
            window.close();
        });
        optionsContainer.appendChild(div);
    });

    // Update the keyboard event handler
    document.addEventListener('keydown', (e) => {
        // Convert to uppercase for consistent comparison
        const pressedKey = e.key.toUpperCase();
        
        const option = searchOptions.find(opt => 
            opt.quickKey && opt.quickKey.toUpperCase() === pressedKey
        );
        
        if (option) {
            e.preventDefault(); // Prevent any default behavior
            chrome.runtime.sendMessage({
                action: 'performSearch',
                searchText: selectorData.selectedText,
                searchType: option.id
            });
            window.close();
        }
    });
}); 