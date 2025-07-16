console.log('=== APP DEBUG START ===');

// Test 1: Basic imports
console.log('Testing basic imports...');
try {
    import('./utils/animations.js').then(module => {
        console.log('✅ animations.js imported successfully');
        return import('./utils/helpers.js');
    }).then(module => {
        console.log('✅ helpers.js imported successfully');
        return import('./config/tts-config.js');
    }).then(module => {
        console.log('✅ tts-config.js imported successfully');
        return import('./utils/tts-service.js');
    }).then(module => {
        console.log('✅ tts-service.js imported successfully');
        console.log('✅ All imports successful!');
        
        // Now try to create the app
        console.log('Creating app instance...');
        import('./app.js').then(appModule => {
            console.log('✅ app.js imported successfully');
            console.log('App should be running now!');
        }).catch(error => {
            console.error('❌ app.js import failed:', error);
        });
        
    }).catch(error => {
        console.error('❌ Import failed:', error);
    });
} catch (error) {
    console.error('❌ Import test failed:', error);
}

console.log('=== APP DEBUG END ==='); 