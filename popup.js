document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const slidersDiv = document.getElementById('sliders');
    const resetBtn = document.getElementById('resetBtn');
    
    const inputs = {
        brightness: document.getElementById('brightness'),
        contrast: document.getElementById('contrast'),
        warmth: document.getElementById('warmth'),
        graininess: document.getElementById('graininess')
    };
    const labels = {
        brightness: document.getElementById('val-brightness'),
        contrast: document.getElementById('val-contrast'),
        warmth: document.getElementById('val-warmth'),
        graininess: document.getElementById('val-graininess')
    };

    const defaultSettings = {
        isDarkThemeEnabled: true,
        brightness: 95, contrast: 90, warmth: 30, graininess: 0
    };

    let currentSettings = {};

    chrome.storage.local.get(defaultSettings, (settings) => {
        currentSettings = settings;
        updateUI();
    });

    toggleBtn.addEventListener('click', () => {
        currentSettings.isDarkThemeEnabled = !currentSettings.isDarkThemeEnabled;
        saveAndApplySettings();
        updateUI();
    });

    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', (e) => {
            currentSettings[key] = Number(e.target.value);
            labels[key].innerText = e.target.value + '%';
            saveAndApplySettings();
        });
    });

    resetBtn.addEventListener('click', () => {
        currentSettings = { ...defaultSettings, isDarkThemeEnabled: currentSettings.isDarkThemeEnabled };
        saveAndApplySettings();
        updateUI();
    });

    function updateUI() {
        toggleBtn.textContent = currentSettings.isDarkThemeEnabled ? 'Turn OFF Dark Theme' : 'Turn ON Dark Theme';
        toggleBtn.className = currentSettings.isDarkThemeEnabled ? 'active' : 'inactive';
        
        slidersDiv.style.opacity = currentSettings.isDarkThemeEnabled ? '1' : '0.3';
        slidersDiv.style.pointerEvents = currentSettings.isDarkThemeEnabled ? 'auto' : 'none';
        
        Object.keys(inputs).forEach(key => {
            inputs[key].value = currentSettings[key];
            labels[key].innerText = currentSettings[key] + '%';
        });
    }

    function saveAndApplySettings() {
        chrome.storage.local.set(currentSettings);
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].url.toLowerCase().endsWith('.pdf')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateTheme', 
                    settings: currentSettings
                }).catch(() => {});
            }
        });
    }
});
