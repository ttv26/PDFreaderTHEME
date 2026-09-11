const defaultSettings = {
    isDarkThemeEnabled: true,
    brightness: 95, contrast: 90, warmth: 30, graininess: 0
};

function applyDarkTheme(settings) {
    let style = document.getElementById('warm-dark-pdf-style');
    
    // 1. Handle CSS injection
    if (!style) {
        style = document.createElement('style');
        style.id = 'warm-dark-pdf-style';
        document.head.appendChild(style);
    }

    if (!settings.isDarkThemeEnabled) {
        style.remove();
        let overlay = document.getElementById('pdf-grain-overlay');
        if (overlay) overlay.remove();
        return;
    }

    style.innerHTML = `
        :root {
            --pdf-brightness: ${settings.brightness}%;
            --pdf-contrast: ${settings.contrast}%;
            --pdf-warmth: ${settings.warmth}%;
        }
        html {
            filter: invert(90%) hue-rotate(180deg) brightness(var(--pdf-brightness)) contrast(var(--pdf-contrast)) sepia(var(--pdf-warmth)) !important;
            background-color: #121212 !important;
        }
        embed, canvas, img {
            filter: invert(100%) hue-rotate(180deg) sepia(var(--pdf-warmth)) !important;
        }
    `;

    // 2. Handle Grain Overlay
    let overlay = document.getElementById('pdf-grain-overlay');
    
    if (settings.graininess > 0) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'pdf-grain-overlay';
            
            // Using baseFrequency='0.8' for very fine grain.
            // Added feColorMatrix to force the noise to be grayscale.
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                pointer-events: none; z-index: 2147483647;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            `;
            // Append to HTML root to ensure it covers the whole viewer
            document.documentElement.appendChild(overlay);
        }
        // Max graininess (100) = 15% opacity, which is enough to look textured without ruining text readability.
        overlay.style.opacity = (settings.graininess / 100) * 0.15; 
    } else if (overlay) {
        overlay.remove();
    }
}

// Load initial settings
chrome.storage.local.get(defaultSettings, (settings) => {
    applyDarkTheme(settings);
});

// Listen for updates from the slider
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateTheme') {
        applyDarkTheme(request.settings);
        sendResponse({status: "success"});
    }
});
