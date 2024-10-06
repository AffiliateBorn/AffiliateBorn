const tgApp = window.Telegram.WebApp;

// Initialize Telegram Mini App
function initTelegramApp() {
    tgApp.ready();
    tgApp.expand();

    // You can add more Telegram-specific functionality here
    // For example, handling user data, payments, etc.
}

// Set up Telegram Mini App event listeners
tgApp.onEvent('viewportChanged', handleViewportChange);

function handleViewportChange() {
    // Adjust game canvas size if viewport changes
    if (window.game) {
        window.game.resizeCanvas(tgApp.viewportHeight, tgApp.viewportHeight);
    }
}

// Call this function when the document is loaded
document.addEventListener('DOMContentLoaded', initTelegramApp);