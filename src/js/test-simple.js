console.log('Simple test script loaded!');

// Test basic functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in test script');
    
    // Create a simple element to show it's working
    const testDiv = document.createElement('div');
    testDiv.textContent = 'Test script is working!';
    testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 10000;';
    document.body.appendChild(testDiv);
});

// Test if we can access the API key
console.log('Testing API key access...');
try {
    // This should work even without the full app
    const apiKey = 'AIzaSyCwoDXjDlyqGcfPpUuhjfWaVyDOHOym-Ks';
    console.log('API key available:', !!apiKey);
} catch (error) {
    console.error('API key test failed:', error);
} 