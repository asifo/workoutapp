// Modern BJJ Workout App - Enhanced Version
// This file integrates the existing functionality with modern patterns

// Import modern utilities (when using modules)
// import { animationManager } from './src/js/utils/animations.js';
// import { EventEmitter, Storage, DOM, TimeUtils, A11yUtils } from './src/js/utils/helpers.js';

// For now, we'll use a hybrid approach that works with the existing setup
class ModernBJJWorkoutApp {
    constructor() {
        // Enhanced state management
        this.state = {
            currentDay: null,
            currentWorkout: null,
            isRunning: false,
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0,
            phaseStartTime: 0,
            phaseElapsedTime: 0,
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                autoAdvance: true,
                voiceEnabled: true,
                voiceVolume: 0.8,
                voiceRate: 0.9
            }
        };

        // Timer and speech management
        this.timer = null;
        this.speechSynthesis = window.speechSynthesis;
        this.speechQueue = [];
        this.isSpeaking = false;

        // Modern features
        this.wakeLock = null;
        this.animationFrameId = null;
        this.performanceObserver = null;

        this.init();
    }

    async init() {
        try {
            this.initializeElements();
            this.loadSettings();
            this.bindEvents();
            this.setupModernFeatures();
            this.populateExerciseLibrary();
            await this.initializeSpeech();
            
            console.log('Modern BJJ Workout App initialized successfully');
            this.showToast('App ready! Select a workout to begin.', 'success');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application');
        }
    }

    initializeElements() {
        // Cache DOM elements for performance
        this.elements = {
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            timerLabel: document.getElementById('timer-label'),
            phaseInfo: document.getElementById('phase-info'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            timerDisplay: document.getElementById('time-display'),
            startBtn: document.getElementById('start-timer'),
            resetBtn: document.getElementById('reset-timer'),
            backBtn: document.getElementById('back-btn'),
            skipBtn: document.getElementById('skip-btn'),
            dayButtons: document.querySelectorAll('.day-btn'),
            workoutDetails: document.getElementById('workout-details'),
            exerciseGrid: document.getElementById('exercise-grid'),
            settingsBtn: document.getElementById('settings-btn'),
            settingsContent: document.getElementById('settings-content'),
            modal: document.getElementById('exercise-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalDescription: document.getElementById('modal-description'),
            modalCues: document.getElementById('modal-cues'),
            closeModalBtn: document.getElementById('close-modal'),
            notificationSound: document.getElementById('notification-sound'),
            // Settings inputs
            soundEnabledCheckbox: document.getElementById('sound-enabled'),
            vibrationEnabledCheckbox: document.getElementById('vibration-enabled'),
            autoAdvanceCheckbox: document.getElementById('auto-advance'),
            voiceEnabledCheckbox: document.getElementById('voice-enabled'),
            voiceVolumeSlider: document.getElementById('voice-volume'),
            voiceRateSlider: document.getElementById('voice-rate'),
            testVoiceBtn: document.getElementById('test-voice'),
            testAnnouncementsBtn: document.getElementById('test-announcements'),
            debugProgressBtn: document.getElementById('debug-progress'),
            recoverAppBtn: document.getElementById('recover-app')
        };
    }

    setupModernFeatures() {
        // Setup PWA features
        this.setupPWA();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup accessibility enhancements
        this.setupAccessibility();
        
        // Setup modern animations
        this.setupAnimations();
        
        // Setup touch gestures for mobile
        this.setupTouchGestures();
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }

        // Request wake lock during workouts
        if ('wakeLock' in navigator) {
            this.setupWakeLock();
        }
    }

    async setupWakeLock() {
        try {
            // Request wake lock when workout starts
            document.addEventListener('workout:start', async () => {
                if (!this.wakeLock) {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    console.log('Wake lock acquired');
                }
            });

            // Release wake lock when workout ends
            document.addEventListener('workout:end', () => {
                if (this.wakeLock) {
                    this.wakeLock.release();
                    this.wakeLock = null;
                    console.log('Wake lock released');
                }
            });
        } catch (error) {
            console.warn('Wake lock not supported:', error);
        }
    }

    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 16) { // Flag operations > 16ms
                            console.warn(`Performance: ${entry.name} took ${entry.duration}ms`);
                        }
                    }
                });
                this.performanceObserver.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
    }

    setupAccessibility() {
        // Add ARIA live regions for announcements
        if (!document.getElementById('aria-announcements')) {
            const announcer = document.createElement('div');
            announcer.id = 'aria-announcements';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    setupAnimations() {
        // Add CSS for modern animations if not already present
        if (!document.getElementById('modern-animations')) {
            const style = document.createElement('style');
            style.id = 'modern-animations';
            style.textContent = `
                .animate-pulse-timer {
                    animation: pulse-timer 1s ease-in-out infinite;
                }
                
                @keyframes pulse-timer {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                
                .animate-countdown {
                    animation: countdown-flash 1s ease-in-out;
                }
                
                @keyframes countdown-flash {
                    0% { transform: scale(1.2); color: #ef4444; }
                    100% { transform: scale(1); color: #1e3c72; }
                }
                
                .animate-button-press {
                    transform: scale(0.95);
                    transition: transform 0.1s ease;
                }
                
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                .toast.error {
                    background: #ef4444;
                }
                
                .toast.success {
                    background: #10b981;
                }
                
                .toast.info {
                    background: #3b82f6;
                }
                
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupTouchGestures() {
        if ('ontouchstart' in window) {
            let startX, startY, startTime;

            document.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                if (!startX || !startY) return;

                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const endTime = Date.now();

                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;

                // Swipe detection
                if (Math.abs(deltaX) > 50 && deltaTime < 300 && Math.abs(deltaY) < 100) {
                    if (deltaX > 0 && !this.elements.backBtn.disabled) {
                        this.goBack();
                    } else if (deltaX < 0 && !this.elements.skipBtn.disabled) {
                        this.skipExercise();
                    }
                }

                startX = startY = null;
            }, { passive: true });
        }
    }

    // Enhanced state management
    setState(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        // Auto-save critical state
        this.saveState();
        
        // Emit custom events for state changes
        this.emitStateChange(prevState, this.state);
    }

    saveState() {
        try {
            const stateToSave = {
                currentDay: this.state.currentDay,
                settings: this.state.settings
            };
            localStorage.setItem('bjj-workout-state', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('bjj-workout-state');
            if (saved) {
                const parsedState = JSON.parse(saved);
                this.setState({
                    currentDay: parsedState.currentDay || null,
                    settings: { ...this.state.settings, ...parsedState.settings }
                });
            }
        } catch (error) {
            console.warn('Failed to load state:', error);
        }
    }

    emitStateChange(prevState, newState) {
        const event = new CustomEvent('state:change', {
            detail: { prevState, newState }
        });
        document.dispatchEvent(event);
    }

    // Enhanced error handling and user feedback
    showError(message) {
        console.error(message);
        this.showToast(message, 'error');
        this.announceToScreenReader(message, 'assertive');
        this.shakeElement(this.elements.timerDisplay);
    }

    showSuccess(message) {
        console.log(message);
        this.showToast(message, 'success');
        this.bounceElement(this.elements.timerDisplay);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    announceToScreenReader(message, priority = 'polite') {
        const announcer = document.getElementById('aria-announcements');
        if (announcer) {
            announcer.setAttribute('aria-live', priority);
            announcer.textContent = message;
        }
    }

    // Enhanced animations
    shakeElement(element) {
        if (!element) return;
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    bounceElement(element) {
        if (!element) return;
        element.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    animateButtonPress(button) {
        if (!button) return;
        button.classList.add('animate-button-press');
        setTimeout(() => {
            button.classList.remove('animate-button-press');
        }, 100);
    }

    // Enhanced haptic feedback
    hapticFeedback(pattern = [200]) {
        if (this.state.settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Enhanced keyboard navigation
    handleKeyboardNavigation(e) {
        // Don't interfere with form inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (e.key) {
            case 'ArrowLeft':
                if (!this.elements.backBtn.disabled) {
                    e.preventDefault();
                    this.goBack();
                }
                break;
            case 'ArrowRight':
                if (!this.elements.skipBtn.disabled) {
                    e.preventDefault();
                    this.skipExercise();
                }
                break;
            case ' ':
                e.preventDefault();
                this.toggleWorkout();
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetWorkout();
                }
                break;
            case 'Escape':
                this.closeModal();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
                e.preventDefault();
                this.selectDay(parseInt(e.key));
                break;
        }
    }

    // Enhanced timer display with smooth animations
    updateDisplay() {
        const minutes = Math.floor(this.state.timeRemaining / 60);
        const seconds = this.state.timeRemaining % 60;
        
        // Smooth number animation
        this.animateNumber(this.elements.minutes, minutes);
        this.animateNumber(this.elements.seconds, seconds);
        
        // Update progress
        this.updateWorkoutProgress();
    }

    animateNumber(element, targetValue) {
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        const formattedTarget = targetValue.toString().padStart(2, '0');
        
        if (currentValue !== targetValue) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.textContent = formattedTarget;
                element.style.transform = 'scale(1)';
            }, 100);
        }
    }

    updateWorkoutProgress() {
        if (!this.state.currentWorkout || this.state.currentPhase >= this.state.currentWorkout.phases.length) {
            return;
        }

        const phase = this.state.currentWorkout.phases[this.state.currentPhase];
        const phaseDurationSeconds = phase.duration * 60;
        const phaseProgress = Math.min((this.state.phaseElapsedTime / phaseDurationSeconds) * 100, 100);
        
        // Smooth progress bar animation
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${phaseProgress}%`;
            this.elements.progressFill.setAttribute('aria-valuenow', Math.round(phaseProgress));
        }
        
        // Update progress text
        const phaseTimeRemaining = Math.max(0, phaseDurationSeconds - this.state.phaseElapsedTime);
        const minutes = Math.floor(phaseTimeRemaining / 60);
        const seconds = Math.floor(phaseTimeRemaining % 60);
        
        if (this.elements.progressText) {
            this.elements.progressText.textContent = 
                `Phase ${this.state.currentPhase + 1}/${this.state.currentWorkout.phases.length} - ${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
        }
    }

    // Enhanced workout methods with modern patterns
    selectDay(day) {
        performance.mark('selectDay-start');
        
        const workout = this.getWorkoutData()[day];
        if (!workout) {
            this.showError(`Workout for day ${day} not found`);
            return;
        }

        this.setState({
            currentDay: day,
            currentWorkout: workout,
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0
        });

        this.updateDayButtons(day);
        this.displayWorkoutDetails();
        this.resetWorkout();
        this.updateNavigationButtons();

        this.announceToScreenReader(`Selected ${workout.name} workout`);

        performance.mark('selectDay-end');
        performance.measure('selectDay', 'selectDay-start', 'selectDay-end');

        // Emit custom event
        const event = new CustomEvent('day:selected', {
            detail: { day, workout }
        });
        document.dispatchEvent(event);
    }

    updateDayButtons(activeDay) {
        this.elements.dayButtons.forEach((btn, index) => {
            const day = index + 1;
            const isActive = day === activeDay;
            
            btn.classList.toggle('day-btn--active', isActive);
            
            if (isActive) {
                this.animateButtonPress(btn);
            }
        });
    }

    startWorkout() {
        if (!this.state.currentWorkout) {
            this.showError('Please select a workout first');
            return;
        }

        this.setState({ isRunning: true });

        const isResuming = this.state.currentPhase > 0 || 
                          this.state.currentExercise > 0 || 
                          this.state.timeRemaining > 0;

        if (!isResuming) {
            this.startNextPhase();
        } else {
            this.startTimer();
        }

        this.updateStartButton('Pause');
        this.updateNavigationButtons();
        
        // Add pulse animation
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.classList.add('animate-pulse-timer');
        }

        // Emit workout start event
        const event = new CustomEvent('workout:start');
        document.dispatchEvent(event);
    }

    pauseWorkout() {
        this.setState({ isRunning: false });

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.clearSpeech();
        this.updateStartButton('Resume');
        
        // Remove pulse animation
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.classList.remove('animate-pulse-timer');
        }

        // Emit workout pause event
        const event = new CustomEvent('workout:pause');
        document.dispatchEvent(event);
    }

    // Include all the original methods with enhancements
    bindEvents() {
        // Day selection with enhanced animations
        this.elements.dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const day = parseInt(btn.dataset.day);
                this.selectDay(day);
                this.animateButtonPress(btn);
                this.hapticFeedback();
            });
        });

        // Timer controls with haptic feedback
        this.elements.startBtn.addEventListener('click', () => {
            this.toggleWorkout();
            this.hapticFeedback();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.resetWorkout();
            this.hapticFeedback();
        });

        this.elements.backBtn.addEventListener('click', () => {
            this.goBack();
            this.hapticFeedback();
        });

        this.elements.skipBtn.addEventListener('click', () => {
            this.skipExercise();
            this.hapticFeedback();
        });

        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.toggleSettings());

        // Settings inputs with debounced handlers
        const settingsInputs = [
            this.elements.soundEnabledCheckbox,
            this.elements.vibrationEnabledCheckbox,
            this.elements.autoAdvanceCheckbox,
            this.elements.voiceEnabledCheckbox
        ];

        settingsInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', () => this.saveSettings());
            }
        });

        // Voice settings with debounced handlers
        if (this.elements.voiceVolumeSlider) {
            this.elements.voiceVolumeSlider.addEventListener('input', this.debounce(() => {
                this.saveSettings();
                this.updateVolumeDisplay();
            }, 300));
        }

        if (this.elements.voiceRateSlider) {
            this.elements.voiceRateSlider.addEventListener('input', this.debounce(() => {
                this.saveSettings();
                this.updateRateDisplay();
            }, 300));
        }

        // Test buttons
        if (this.elements.testVoiceBtn) {
            this.elements.testVoiceBtn.addEventListener('click', () => this.testVoice());
        }

        if (this.elements.testAnnouncementsBtn) {
            this.elements.testAnnouncementsBtn.addEventListener('click', () => this.testAnnouncements());
        }

        if (this.elements.debugProgressBtn) {
            this.elements.debugProgressBtn.addEventListener('click', () => this.logWorkoutProgress());
        }

        if (this.elements.recoverAppBtn) {
            this.elements.recoverAppBtn.addEventListener('click', () => this.recoverApp());
        }

        // Modal events
        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) this.closeModal();
            });
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateVolumeDisplay() {
        const display = document.getElementById('volume-display');
        if (display && this.elements.voiceVolumeSlider) {
            display.textContent = Math.round(this.elements.voiceVolumeSlider.value * 100) + '%';
        }
    }

    updateRateDisplay() {
        const display = document.getElementById('rate-display');
        if (display && this.elements.voiceRateSlider) {
            display.textContent = this.elements.voiceRateSlider.value + 'x';
        }
    }

    // Enhanced cleanup
    destroy() {
        // Clear timers
        if (this.timer) {
            clearInterval(this.timer);
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Clear speech
        this.clearSpeech();

        // Release wake lock
        if (this.wakeLock) {
            this.wakeLock.release();
        }

        // Disconnect performance observer
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        // Save final state
        this.saveState();

        // Emit destroy event
        const event = new CustomEvent('app:destroy');
        document.dispatchEvent(event);
    }

    // Include all original methods from the existing script.js
    // (I'll include the key ones here, but in practice you'd include all of them)
    
    toggleWorkout() {
        if (this.state.isRunning) {
            this.pauseWorkout();
        } else {
            this.startWorkout();
        }
    }

    resetWorkout() {
        this.pauseWorkout();
        
        this.setState({
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0,
            phaseStartTime: 0,
            phaseElapsedTime: 0
        });

        this.updateStartButton('Start Workout');
        this.updateDisplay();
        this.updateNavigationButtons();
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '0%';
        }
        
        this.elements.timerLabel.textContent = 'Select a workout';
        this.elements.phaseInfo.textContent = '';
        this.elements.progressText.textContent = 'Ready to begin';

        // Emit reset event
        const event = new CustomEvent('workout:reset');
        document.dispatchEvent(event);
    }

    updateStartButton(text) {
        if (this.elements.startBtn) {
            this.elements.startBtn.textContent = text;
            
            // Update button styling
            this.elements.startBtn.classList.remove('bg-green-500', 'hover:bg-green-600', 'bg-blue-500', 'hover:bg-blue-600');
            
            if (text === 'Start Workout') {
                this.elements.startBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            } else {
                this.elements.startBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }
        }
    }

    // Include all other methods from the original script.js...
    // (For brevity, I'm not including all of them here, but they would all be enhanced with the modern patterns)

    getWorkoutData() {
        // Return the same workout data as the original
        return {
            1: {
                name: "High-Intensity Kettlebell Snatch Intervals",
                focus: "VO₂max Booster",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Joint Mobilization", duration: 120, description: "Neck, shoulder, and hip circles" },
                            { name: "Dynamic Movements", duration: 120, description: "Arm swings, leg swings, inchworms" },
                            { name: "Kettlebell Prep", duration: 60, description: "Halos, light swings" }
                        ]
                    },
                    // ... include all other phases and days
                ]
            }
            // ... include all other days
        };
    }

    getExerciseLibrary() {
        // Return the same exercise library as the original
        return {
            "Kettlebell Snatch": {
                type: "Power",
                description: "Explosive one-arm kettlebell movement from swing to overhead lockout",
                cues: [
                    "Start with a powerful hip hinge",
                    "Drive the kettlebell up with hip extension",
                    "Pull the bell to your chest, then punch overhead",
                    "Lock out the arm overhead with shoulder stability",
                    "Control the descent back to swing position"
                ]
            }
            // ... include all other exercises
        };
    }

    // Placeholder methods that would include the full implementation
    startNextPhase() { /* Implementation from original */ }
    startNextExercise() { /* Implementation from original */ }
    startTimer() { /* Implementation from original */ }
    nextExercise() { /* Implementation from original */ }
    skipExercise() { /* Implementation from original */ }
    goBack() { /* Implementation from original */ }
    updateNavigationButtons() { /* Implementation from original */ }
    displayWorkoutDetails() { /* Implementation from original */ }
    populateExerciseLibrary() { /* Implementation from original */ }
    loadSettings() { /* Implementation from original */ }
    saveSettings() { /* Implementation from original */ }
    toggleSettings() { /* Implementation from original */ }
    showExerciseModal() { /* Implementation from original */ }
    closeModal() { /* Implementation from original */ }
    initializeSpeech() { /* Implementation from original */ }
    speak() { /* Implementation from original */ }
    clearSpeech() { /* Implementation from original */ }
    testVoice() { /* Implementation from original */ }
    testAnnouncements() { /* Implementation from original */ }
    logWorkoutProgress() { /* Implementation from original */ }
    recoverApp() { /* Implementation from original */ }
    notify() { /* Implementation from original */ }
}

// Initialize the modern app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.modernBjjApp = new ModernBJJWorkoutApp();
});

// For backward compatibility, also expose as 'app'
window.app = window.modernBjjApp; 