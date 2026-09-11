document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');

    // Load initial state when menu opens
    chrome.storage.local.get({ isDarkThemeEnabled: true }, (result) => {
        updateButtonStatus(result.isDarkThemeEnabled);
    });

    // Handle button click
    toggleBtn.addEventListener('click', () => {
        chrome.storage.local.get({ isDarkThemeEnabled: true }, (result) => {
            let newState = !result.isDarkThemeEnabled;
            
            // Save the new state so it applies to future PDFs
            chrome.storage.local.set({ isDarkThemeEnabled: newState });
            updateButtonStatus(newState);

            // Send a message to the active tab to change right now
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                // Only send if it's a PDF tab
                if (tabs[0].url.toLowerCase().endsWith('.pdf')) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleTheme', 
                        enabled: newState
                    });
                }
            });
        });
    });

    function updateButtonStatus(isEnabled) {
        toggleBtn.textContent = isEnabled ? 'Turn OFF Dark Theme' : 'Turn ON Dark Theme';
        toggleBtn.style.background = isEnabled ? '#d32f2f' : '#2e7d32';
    }
});
