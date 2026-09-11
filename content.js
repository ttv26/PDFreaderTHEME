function applyDarkTheme() {
    let existingStyle = document.getElementById('warm-dark-pdf-style');
    if (existingStyle) return; // Prevent duplicates

    let style = document.createElement('style');
    style.id = 'warm-dark-pdf-style';
    style.innerHTML = `
        html {
            filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%) sepia(30%) !important;
            background-color: #121212 !important;
        }
        embed, canvas, img {
            filter: invert(100%) hue-rotate(180deg) sepia(20%) !important;
        }
    `;
    document.head.appendChild(style);
}

function removeDarkTheme() {
    let existingStyle = document.getElementById('warm-dark-pdf-style');
    if (existingStyle) {
        existingStyle.remove();
    }
}

// 1. Check storage for saved preference on load (defaults to true)
chrome.storage.local.get({ isDarkThemeEnabled: true }, (result) => {
    if (result.isDarkThemeEnabled) {
        applyDarkTheme();
    }
});

// 2. Listen for messages from the popup menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleTheme') {
        if (request.enabled) {
            applyDarkTheme();
        } else {
            removeDarkTheme();
        }
        sendResponse({status: "success"});
    }
});
