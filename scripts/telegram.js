const tgApp = window.Telegram.WebApp;

// Initialize Telegram Mini App
function initTelegramApp() {
    // Ensure the Telegram WebApp is ready
    tgApp.ready();
    
    // Expand the app to full screen
    tgApp.expand();
    
    // Optionally: Set the header color and background color
    tgApp.setHeaderColor('#ffffff'); // Set header color to white
    tgApp.setBackgroundColor('#f0f0f0'); // Set background color

    // Log to console for debugging purposes
    console.log("Telegram Mini App Initialized");

    // Adjust canvas size based on the viewport dimensions
    resizeCanvas();
}

// Resize the canvas based on the current viewport
function resizeCanvas() {
    if (window.game) {
        const viewportHeight = tgApp.viewportStableHeight || window.innerHeight;
        const viewportWidth = tgApp.viewportStableWidth || window.innerWidth;
        window.game.resizeCanvas(viewportWidth, viewportHeight);
    }
}

// Handle viewport changes and adjust canvas accordingly
function handleViewportChange() {
    resizeCanvas(); // Reuse the resizeCanvas function when the viewport changes
}

// Set up Telegram Mini App event listeners
tgApp.onEvent('viewportChanged', handleViewportChange);

// Initialize the Telegram app when the document is fully loaded
document.addEventListener('DOMContentLoaded', initTelegramApp);
