// Modern BJJ Workout App - Enhanced Vanilla JavaScript
import { animationManager } from './utils/animations.js';
import { 
    EventEmitter, 
    Storage, 
    DOM, 
    TimeUtils, 
    DeviceUtils, 
    A11yUtils,
    debounce,
    throttle 
} from './utils/helpers.js';

class ModernBJJWorkoutApp extends EventEmitter {
    constructor() {
        super();
        
        // State management
        this.state = {
            currentDay: null,
            currentWorkout: null,
            isRunning: false,
            isPaused: false,
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0,
            phaseStartTime: 0,
            phaseElapsedTime: 0,
            totalWorkoutTime: 0,
            completedExercises: 0,
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                autoAdvance: true,
                voiceEnabled: true,
                voiceVolume: 0.8,
                voiceRate: 0.9,
                theme: 'light',
                animations: true
            }
        };

        // Timer and speech management
        this.timer = null;
        this.speechSynthesis = window.speechSynthesis;
        this.speechQueue = [];
        this.isSpeaking = false;
        this.wakeLock = null;

        // Event handlers (bound methods)
        this.handleResize = throttle(this.onResize.bind(this), 250);
        this.handleVisibilityChange = this.onVisibilityChange.bind(this);
        this.handleKeydown = this.onKeydown.bind(this);

        // Initialize app
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize components
            this.initializeElements();
            this.loadSettings();
            this.bindEvents();
            this.setupAccessibility();
            this.setupPerformanceOptimizations();
            this.populateExerciseLibrary();
            
            // Initialize speech synthesis
            await this.initializeSpeech();
            
            // Setup PWA features
            this.setupPWA();
            
            // Emit ready event
            this.emit('app:ready');
            
            console.log('BJJ Workout App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application');
        }
    }

    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    initializeElements() {
        // Cache DOM elements for performance
        this.elements = {
            // Timer elements
            minutes: DOM.$('#minutes'),
            seconds: DOM.$('#seconds'),
            timerLabel: DOM.$('#timer-label'),
            phaseInfo: DOM.$('#phase-info'),
            progressFill: DOM.$('#progress-fill'),
            progressText: DOM.$('#progress-text'),
            timerDisplay: DOM.$('#time-display'),

            // Control buttons
            startBtn: DOM.$('#start-timer'),
            resetBtn: DOM.$('#reset-timer'),
            backBtn: DOM.$('#back-btn'),
            skipBtn: DOM.$('#skip-btn'),
            fullscreenBtn: DOM.$('#fullscreen-btn'),

            // Day selection
            dayButtons: DOM.$$('.day-btn'),

            // Workout details
            workoutDetails: DOM.$('#workout-details'),
            exerciseGrid: DOM.$('#exercise-grid'),

            // Settings
            settingsBtn: DOM.$('#settings-btn'),
            settingsContent: DOM.$('#settings-content'),
            settingsInputs: {
                soundEnabled: DOM.$('#sound-enabled'),
                vibrationEnabled: DOM.$('#vibration-enabled'),
                autoAdvance: DOM.$('#auto-advance'),
                voiceEnabled: DOM.$('#voice-enabled'),
                voiceVolume: DOM.$('#voice-volume'),
                voiceRate: DOM.$('#voice-rate')
            },

            // Modal
            modal: DOM.$('#exercise-modal'),
            modalTitle: DOM.$('#modal-title'),
            modalDescription: DOM.$('#modal-description'),
            modalCues: DOM.$('#modal-cues'),
            closeModalBtn: DOM.$('#close-modal'),

            // Audio
            notificationSound: DOM.$('#notification-sound')
        };

        // Validate critical elements
        this.validateElements();
    }

    validateElements() {
        const critical = ['minutes', 'seconds', 'startBtn', 'resetBtn'];
        const missing = critical.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            throw new Error(`Critical elements missing: ${missing.join(', ')}`);
        }
        
        // Log fullscreen button status for debugging
        console.log('Fullscreen button element:', this.elements.fullscreenBtn);
    }

    bindEvents() {
        // Day selection with enhanced animations
        this.elements.dayButtons.forEach(btn => {
            DOM.on(btn, 'click', (e) => {
                const day = parseInt(btn.dataset.day);
                this.selectDay(day);
                animationManager.animateButtonPress(btn);
            });
        });

        // Timer controls with haptic feedback
        DOM.on(this.elements.startBtn, 'click', () => {
            this.toggleWorkout();
            this.hapticFeedback();
        });

        DOM.on(this.elements.resetBtn, 'click', () => {
            this.resetWorkout();
            this.hapticFeedback();
        });

        DOM.on(this.elements.backBtn, 'click', () => {
            this.goBack();
            this.hapticFeedback();
        });

        DOM.on(this.elements.skipBtn, 'click', () => {
            this.skipExercise();
            this.hapticFeedback();
        });

        if (this.elements.fullscreenBtn) {
            // Use both DOM helper and direct addEventListener for reliability
            DOM.on(this.elements.fullscreenBtn, 'click', () => {
                console.log('Fullscreen button clicked via DOM helper');
                this.toggleFullscreen();
                this.hapticFeedback();
            });
            
            // Also try direct event listener as backup
            this.elements.fullscreenBtn.addEventListener('click', () => {
                console.log('Fullscreen button clicked via direct listener');
                this.toggleFullscreen();
                this.hapticFeedback();
            });
        } else {
            console.warn('Fullscreen button not found in DOM');
            // Try to find it directly
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                console.log('Found fullscreen button directly, binding event');
                fullscreenBtn.addEventListener('click', () => {
                    console.log('Fullscreen button clicked via direct finder');
                    this.toggleFullscreen();
                    this.hapticFeedback();
                });
                // Update the cached element
                this.elements.fullscreenBtn = fullscreenBtn;
            }
        }

        // Settings with debounced handlers
        DOM.on(this.elements.settingsBtn, 'click', () => {
            this.toggleSettings();
        });

        // Settings inputs with real-time updates
        Object.entries(this.elements.settingsInputs).forEach(([key, element]) => {
            if (element) {
                const handler = key.includes('voice') 
                    ? debounce(() => this.saveSettings(), 300)
                    : () => this.saveSettings();
                DOM.on(element, 'change', handler);
                DOM.on(element, 'input', handler);
            }
        });

        // Modal events
        if (this.elements.closeModalBtn) {
            DOM.on(this.elements.closeModalBtn, 'click', () => this.closeModal());
        }

        if (this.elements.modal) {
            DOM.on(this.elements.modal, 'click', (e) => {
                if (e.target === this.elements.modal) this.closeModal();
            });
        }

        // Global event listeners
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));

        // Touch/swipe gestures for mobile
        if (DeviceUtils.isTouchDevice()) {
            this.setupTouchGestures();
        }
    }

    setupAccessibility() {
        // Add screen reader only class
        const srOnlyCSS = `
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
        
        const style = document.createElement('style');
        style.textContent = srOnlyCSS;
        document.head.appendChild(style);

        // Add ARIA labels and roles
        this.enhanceAccessibility();
    }

    enhanceAccessibility() {
        // Timer display
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.setAttribute('role', 'timer');
            this.elements.timerDisplay.setAttribute('aria-live', 'polite');
            this.elements.timerDisplay.setAttribute('aria-label', 'Workout timer');
        }

        // Progress bar
        if (this.elements.progressFill) {
            this.elements.progressFill.setAttribute('role', 'progressbar');
            this.elements.progressFill.setAttribute('aria-valuemin', '0');
            this.elements.progressFill.setAttribute('aria-valuemax', '100');
        }

        // Buttons
        this.elements.dayButtons.forEach((btn, index) => {
            btn.setAttribute('aria-label', `Select day ${index + 1} workout`);
        });

        // Settings panel
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.setAttribute('aria-label', 'Open settings');
            this.elements.settingsBtn.setAttribute('aria-expanded', 'false');
        }

        // Initialize fullscreen button
        if (this.elements.fullscreenBtn) {
            this.updateFullscreenButton(false);
        }

        // Add a delayed backup binding for fullscreen
        setTimeout(() => {
            this.ensureFullscreenFunctionality();
        }, 500); // Reduced delay since main issues are fixed
    }

    setupPerformanceOptimizations() {
        // Intersection observer for animations
        this.elements.dayButtons.forEach(btn => {
            animationManager.observeElement(btn);
        });

        // Preload critical resources
        this.preloadResources();

        // Setup performance monitoring
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
    }

    preloadResources() {
        // Preload notification sound
        if (this.elements.notificationSound) {
            this.elements.notificationSound.load();
        }

        // Preload speech synthesis voices
        if (this.speechSynthesis) {
            this.speechSynthesis.getVoices();
        }

        // Ensure fullscreen styles are loaded
        this.ensureFullscreenStyles();
    }

    setupPerformanceObserver() {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure') {
                        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['measure'] });
        } catch (error) {
            console.warn('Performance Observer not supported:', error);
        }
    }

    setupTouchGestures() {
        let startX, startY, startTime;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;

            // Swipe detection
            if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                if (deltaX > 0 && !this.elements.backBtn.disabled) {
                    this.goBack();
                } else if (deltaX < 0 && !this.elements.skipBtn.disabled) {
                    this.skipExercise();
                }
            }

            startX = startY = null;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Fullscreen functionality
    toggleFullscreen() {
        console.log('toggleFullscreen called, isFullscreen:', this.isFullscreen());
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    async enterFullscreen() {
        console.log('enterFullscreen called');
        try {
            const timerContainer = DOM.$('#timer-container') || this.elements.timerDisplay.parentElement;
            console.log('Timer container found:', !!timerContainer);
            
            if (!timerContainer) {
                console.warn('Timer container not found for fullscreen');
                return;
            }

            // Add fullscreen class before entering fullscreen
            DOM.addClass(document.body, 'fullscreen-mode');
            DOM.addClass(timerContainer, 'timer-fullscreen');
            
            // Ensure timer container has the necessary structure for fullscreen
            this.prepareTimerForFullscreen(timerContainer);

            // Request fullscreen using the most compatible method
            console.log('Requesting fullscreen...');
            let fullscreenRequested = false;
            
            if (timerContainer.requestFullscreen) {
                console.log('Using requestFullscreen');
                await timerContainer.requestFullscreen();
                fullscreenRequested = true;
            } else if (timerContainer.webkitRequestFullscreen) {
                console.log('Using webkitRequestFullscreen');
                await timerContainer.webkitRequestFullscreen();
                fullscreenRequested = true;
            } else if (timerContainer.mozRequestFullScreen) {
                console.log('Using mozRequestFullScreen');
                await timerContainer.mozRequestFullScreen();
                fullscreenRequested = true;
            } else if (timerContainer.msRequestFullscreen) {
                console.log('Using msRequestFullscreen');
                await timerContainer.msRequestFullscreen();
                fullscreenRequested = true;
            } else {
                console.log('No fullscreen API available, using CSS fallback');
                // Fallback: simulate fullscreen with CSS
                this.simulateFullscreen(timerContainer);
            }

            if (fullscreenRequested || DOM.hasClass(timerContainer, 'timer-fullscreen-simulated')) {
                this.updateFullscreenButton(true);
                A11yUtils.announceToScreenReader('Entered fullscreen mode');
                this.emit('fullscreen:enter');
                console.log('Fullscreen mode activated');
            }
            
        } catch (error) {
            console.warn('Fullscreen request failed:', error);
            // Fallback to CSS-only fullscreen
            console.log('Falling back to CSS-only fullscreen');
            this.simulateFullscreen(timerContainer);
            this.updateFullscreenButton(true);
        }
    }

    exitFullscreen() {
        try {
            // Remove CSS classes
            DOM.removeClass(document.body, 'fullscreen-mode');
            const timerContainer = DOM.$('#timer-container') || this.elements.timerDisplay.parentElement;
            if (timerContainer) {
                DOM.removeClass(timerContainer, 'timer-fullscreen');
                DOM.removeClass(timerContainer, 'timer-fullscreen-simulated');
            }

            // Exit fullscreen using the most compatible method
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            this.updateFullscreenButton(false);
            A11yUtils.announceToScreenReader('Exited fullscreen mode');
            
            this.emit('fullscreen:exit');
            
        } catch (error) {
            console.warn('Exit fullscreen failed:', error);
        }
    }

    simulateFullscreen(container) {
        console.log('simulateFullscreen called');
        if (!container) {
            container = DOM.$('#timer-container') || this.elements.timerDisplay.parentElement;
        }
        
        console.log('Container for simulated fullscreen:', container);
        
        if (container) {
            DOM.addClass(document.body, 'fullscreen-mode');
            DOM.addClass(container, 'timer-fullscreen');
            DOM.addClass(container, 'timer-fullscreen-simulated');
            console.log('CSS classes added for simulated fullscreen');
        } else {
            console.error('No container found for simulated fullscreen');
        }
    }

    isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            DOM.hasClass(document.body, 'fullscreen-mode')
        );
    }

    handleFullscreenChange() {
        const isFullscreen = this.isFullscreen();
        
        if (!isFullscreen) {
            // Clean up when exiting fullscreen
            DOM.removeClass(document.body, 'fullscreen-mode');
            const timerContainer = DOM.$('#timer-container') || this.elements.timerDisplay.parentElement;
            if (timerContainer) {
                DOM.removeClass(timerContainer, 'timer-fullscreen');
                DOM.removeClass(timerContainer, 'timer-fullscreen-simulated');
            }
        }
        
        this.updateFullscreenButton(isFullscreen);
        this.emit('fullscreen:change', { isFullscreen });
    }

    prepareTimerForFullscreen(container) {
        // Ensure the timer container has proper classes and structure for fullscreen
        if (!container) return;
        
        // Add timer controls to the container if they exist
        const timerControls = DOM.$('.timer-controls') || this.createTimerControls();
        if (timerControls && !container.contains(timerControls)) {
            container.appendChild(timerControls);
        }
        
        // Make sure progress elements are accessible
        const progressContainer = DOM.$('.progress-container');
        if (progressContainer && !container.contains(progressContainer)) {
            // Create a clone or ensure progress is visible
            const progressElements = container.querySelectorAll('.progress-bar, #progress-text');
            if (progressElements.length === 0) {
                console.warn('Progress elements not found in timer container for fullscreen');
            }
        }
    }

    createTimerControls() {
        // Create timer controls container if it doesn't exist
        const controlsDiv = DOM.create('div', {
            className: 'timer-controls'
        });
        
        // Move existing buttons to the controls container
        const buttons = [
            this.elements.startBtn,
            this.elements.resetBtn,
            this.elements.backBtn,
            this.elements.skipBtn,
            this.elements.fullscreenBtn
        ].filter(btn => btn);
        
        buttons.forEach(btn => {
            if (btn && btn.parentNode) {
                controlsDiv.appendChild(btn.cloneNode(true));
            }
        });
        
        return controlsDiv;
    }

    updateFullscreenButton(isFullscreen) {
        console.log('updateFullscreenButton called with:', isFullscreen);
        if (!this.elements.fullscreenBtn) {
            console.warn('No fullscreen button to update');
            return;
        }
        
        const icon = this.elements.fullscreenBtn.querySelector('.fullscreen-icon');
        const text = this.elements.fullscreenBtn.querySelector('.fullscreen-text');
        
        console.log('Fullscreen button elements - icon:', !!icon, 'text:', !!text);
        
        if (isFullscreen) {
            this.elements.fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
            if (icon) icon.textContent = '⏹️'; // Exit fullscreen icon (changed from ⏸️)
            if (text) text.textContent = 'Exit Fullscreen';
            DOM.addClass(this.elements.fullscreenBtn, 'btn--active');
        } else {
            this.elements.fullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
            if (icon) icon.textContent = '🔳'; // Fullscreen icon
            if (text) text.textContent = 'Fullscreen';
            DOM.removeClass(this.elements.fullscreenBtn, 'btn--active');
        }
        
        console.log('Fullscreen button updated successfully');
    }

    async setupPWA() {
        // Register service worker - disabled until sw.js is created
        // if ('serviceWorker' in navigator) {
        //     try {
        //         await navigator.serviceWorker.register('/sw.js');
        //         console.log('Service Worker registered');
        //     } catch (error) {
        //         console.warn('Service Worker registration failed:', error);
        //     }
        // }

        // Request wake lock for workout sessions
        if ('wakeLock' in navigator) {
            this.on('workout:start', async () => {
                try {
                    this.wakeLock = await navigator.wakeLock.request('screen');
                    console.log('Wake lock acquired');
                } catch (error) {
                    console.warn('Wake lock failed:', error);
                }
            });

            this.on('workout:end', () => {
                if (this.wakeLock) {
                    this.wakeLock.release();
                    this.wakeLock = null;
                    console.log('Wake lock released');
                }
            });
        }
    }

    // Enhanced state management
    setState(updates, emit = true) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        
        if (emit) {
            this.emit('state:change', { prevState, newState: this.state, updates });
        }
        
        // Auto-save critical state
        this.saveState();
    }

    saveState() {
        const stateToSave = {
            currentDay: this.state.currentDay,
            settings: this.state.settings
        };
        Storage.set('bjj-workout-state', stateToSave);
    }

    loadState() {
        const savedState = Storage.get('bjj-workout-state', {});
        if (savedState.currentDay) {
            this.setState({ currentDay: savedState.currentDay }, false);
        }
        if (savedState.settings) {
            this.setState({ settings: { ...this.state.settings, ...savedState.settings } }, false);
        }
    }

    // Enhanced workout selection with animations
    selectDay(day) {
        performance.mark('selectDay-start');
        
        const workout = this.getWorkoutData()[day];
        if (!workout) {
            this.showError(`Workout for day ${day} not found`);
            return;
        }

        // Update state
        this.setState({
            currentDay: day,
            currentWorkout: workout,
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0
        });

        // Update UI with animations
        this.updateDayButtons(day);
        this.displayWorkoutDetails();
        this.resetWorkout();
        this.updateNavigationButtons();

        // Announce to screen readers
        A11yUtils.announceToScreenReader(`Selected ${workout.name} workout`);

        performance.mark('selectDay-end');
        performance.measure('selectDay', 'selectDay-start', 'selectDay-end');

        this.emit('day:selected', { day, workout });
    }

    updateDayButtons(activeDay) {
        this.elements.dayButtons.forEach((btn, index) => {
            const day = index + 1;
            const isActive = day === activeDay;
            
            // Remove all state classes
            DOM.removeClass(btn, 'day-btn--active');
            
            if (isActive) {
                DOM.addClass(btn, 'day-btn--active');
                animationManager.animateCardFlip(btn, true);
            }
        });
    }

    displayWorkoutDetails() {
        if (!this.state.currentWorkout || !this.elements.workoutDetails) {
            return;
        }

        const workout = this.state.currentWorkout;
        const detailsHTML = `
            <div class="workout-header">
                <h3 class="workout-title">${workout.name}</h3>
                <p class="workout-focus">${workout.focus}</p>
                <p class="workout-duration">${workout.duration} minutes</p>
            </div>
            <div class="workout-phases">
                ${workout.phases.map((phase, index) => `
                    <div class="phase-card ${phase.optional ? 'phase-card--optional' : ''}">
                        <h4 class="phase-title">${phase.name}</h4>
                        <p class="phase-duration">${phase.duration} minutes</p>
                        ${phase.repeat ? `<p class="phase-repeat">Repeat ${phase.repeat} times</p>` : ''}
                        <div class="phase-exercises">
                            ${phase.exercises.slice(0, 3).map(exercise => `
                                <span class="exercise-tag">${exercise.name}</span>
                            `).join('')}
                            ${phase.exercises.length > 3 ? `<span class="exercise-more">+${phase.exercises.length - 3} more</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.elements.workoutDetails.innerHTML = detailsHTML;
        
        // Animate in the details
        animationManager.slideIn(this.elements.workoutDetails, 'up', 300);
    }

    populateExerciseLibrary() {
        if (!this.elements.exerciseGrid) {
            return;
        }

        const exerciseLibrary = this.getExerciseLibrary();
        const exerciseHTML = Object.entries(exerciseLibrary).map(([name, exercise]) => `
            <div class="exercise-card" data-exercise="${name}">
                <div class="exercise-header">
                    <h4 class="exercise-name">${name}</h4>
                    <span class="exercise-type exercise-type--${exercise.type.toLowerCase()}">${exercise.type}</span>
                </div>
                <p class="exercise-description">${exercise.description}</p>
                <button class="btn btn--secondary btn--sm" onclick="bjjApp.showExerciseModal('${name}')">
                    View Details
                </button>
            </div>
        `).join('');

        this.elements.exerciseGrid.innerHTML = exerciseHTML;
        
        // Add stagger animation
        const exerciseCards = this.elements.exerciseGrid.querySelectorAll('.exercise-card');
        animationManager.staggerAnimation(exerciseCards, 'animate-in', 100);
    }

    // Enhanced workout progression methods
    startNextPhase() {
        console.log('startNextPhase called, currentPhase:', this.state.currentPhase);
        if (!this.state.isRunning || !this.state.currentWorkout) return;

        const phases = this.state.currentWorkout.phases;
        console.log('Total phases:', phases.length);
        
        if (this.state.currentPhase >= phases.length) {
            console.log('All phases complete');
            this.completeWorkout();
            return;
        }

        const phase = phases[this.state.currentPhase];
        console.log('Starting phase:', phase.name, 'Phase duration:', phase.duration, 'minutes');
        
        // Initialize phase timing
        this.setState({
            phaseStartTime: Date.now(),
            phaseElapsedTime: 0,
            currentExercise: 0
        });
        
        console.log('Phase timing initialized - start time:', this.state.phaseStartTime);
        
        this.elements.timerLabel.textContent = phase.name;
        this.elements.phaseInfo.textContent = `Phase ${this.state.currentPhase + 1} of ${phases.length}`;
        
        // Announce the phase (not priority, so exercise will follow)
        console.log('Announcing phase:', phase.name);
        this.speak(`Starting ${phase.name}`, false);
        
        this.startNextExercise();
    }

    startNextExercise() {
        console.log('startNextExercise called, currentExercise:', this.state.currentExercise);
        
        try {
            if (!this.state.isRunning || !this.state.currentWorkout) {
                console.log('Cannot start next exercise - not running or no workout');
                return;
            }

            const phases = this.state.currentWorkout.phases;
            
            // Validate current phase
            if (this.state.currentPhase >= phases.length) {
                console.log('Current phase out of bounds, completing workout');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.state.currentPhase];
            console.log('Current phase:', phase.name, 'Phase exercises:', phase.exercises.length);
            console.log('Current exercise index:', this.state.currentExercise);
            
            // Calculate phase elapsed time
            const phaseElapsedTime = (Date.now() - this.state.phaseStartTime) / 1000;
            this.setState({ phaseElapsedTime });
            
            // Validate current exercise index
            if (this.state.currentExercise >= phase.exercises.length) {
                console.log('Current exercise index out of bounds, resetting to 0');
                this.setState({ currentExercise: 0 });
            }

            const exercise = phase.exercises[this.state.currentExercise];
            console.log('Starting exercise:', exercise.name, 'Duration:', exercise.duration);
            
            // Calculate which round we're in (for display purposes)
            const roundDuration = phase.exercises.reduce((sum, ex) => sum + ex.duration, 0);
            const completedRounds = Math.floor(this.state.phaseElapsedTime / roundDuration);
            const currentRound = completedRounds + 1;
            
            this.elements.timerLabel.textContent = exercise.name;
            this.elements.phaseInfo.textContent = `${phase.name} - Round ${currentRound} (${Math.floor(this.state.phaseElapsedTime / 60)}:${Math.floor(this.state.phaseElapsedTime % 60).toString().padStart(2, '0')})`;
            
            // Set the exercise duration
            this.setState({ timeRemaining: exercise.duration });
            this.updateDisplay();
            
            // Announce the exercise and start timer immediately
            console.log('About to announce exercise:', exercise.name);
            console.log('Voice enabled:', this.state.settings.voiceEnabled);
            
            // Add a small delay to ensure speech synthesis is ready
            setTimeout(() => {
                this.speak(`${exercise.name}. ${exercise.description}`, true);
                this.startTimer();
            }, 500);
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error in startNextExercise:', error);
            // Try to recover
            this.setState({ isRunning: false });
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    nextExercise() {
        console.log('nextExercise called');
        
        try {
            if (!this.state.isRunning) {
                console.log('Workout is not running, not proceeding');
                return;
            }
            
            if (!this.state.currentWorkout) {
                console.log('No current workout, not proceeding');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped in nextExercise');
            }

            // Simple increment to next exercise
            this.setState({ currentExercise: this.state.currentExercise + 1 });
            console.log('Incremented to exercise:', this.state.currentExercise);
            
            const phases = this.state.currentWorkout.phases;
            
            // Validate current phase
            if (this.state.currentPhase >= phases.length) {
                console.log('Current phase out of bounds, completing workout');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.state.currentPhase];
            console.log('Current phase:', phase.name, 'Total exercises in phase:', phase.exercises.length);
            
            // Check if we've completed all exercises in current phase
            if (this.state.currentExercise >= phase.exercises.length) {
                console.log('Completed all exercises in phase, moving to next phase');
                this.setState({ 
                    currentPhase: this.state.currentPhase + 1,
                    currentExercise: 0
                });
                
                // Check if we've completed all phases
                if (this.state.currentPhase >= phases.length) {
                    console.log('All phases complete');
                    this.completeWorkout();
                    return;
                }
                
                if (this.state.settings.autoAdvance) {
                    this.startNextPhase();
                } else {
                    this.pauseWorkout();
                }
            } else {
                console.log('Continuing with next exercise in same phase');
                if (this.state.settings.autoAdvance) {
                    this.startNextExercise();
                } else {
                    this.pauseWorkout();
                }
            }
        } catch (error) {
            console.error('Error in nextExercise:', error);
            this.showError('Error during exercise transition');
        }
    }

    completeWorkout() {
        console.log('Workout completed!');
        this.setState({
            isRunning: false,
            isPaused: false
        });

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Clear speech
        this.clearSpeech();

        // Update UI
        this.updateStartButton('Start Workout');
        this.elements.timerLabel.textContent = 'Workout Complete!';
        this.elements.phaseInfo.textContent = 'Great job!';
        
        // Show completion message
        this.showSuccess('Workout completed successfully!');
        this.speak('Workout complete! Great job!', true);
        
        // Celebration animation
        animationManager.celebrationAnimation(this.elements.timerDisplay);

        this.emit('workout:complete');
    }

    updateNavigationButtons() {
        // Implementation for navigation button updates
        if (this.elements.backBtn) {
            this.elements.backBtn.disabled = this.state.currentExercise === 0 && this.state.currentPhase === 0;
        }
        
        if (this.elements.skipBtn) {
            this.elements.skipBtn.disabled = !this.state.isRunning;
        }
    }

    // Core workout methods (enhanced versions of existing methods)
    toggleWorkout() {
        if (this.state.isRunning) {
            this.pauseWorkout();
        } else {
            this.startWorkout();
        }
    }

    // Enhanced workout functionality with smooth animations
    startWorkout() {
        if (!this.state.currentWorkout) {
            this.showError('Please select a workout first');
            return;
        }

        this.setState({
            isRunning: true,
            isPaused: false,
            totalWorkoutTime: Date.now()
        });

        // Check if resuming or starting fresh
        const isResuming = this.state.currentPhase > 0 || 
                          this.state.currentExercise > 0 || 
                          this.state.timeRemaining > 0;

        if (!isResuming) {
            // Initialize workout state
            this.setState({
                currentPhase: 0,
                currentExercise: 0,
                timeRemaining: 0,
                phaseStartTime: Date.now(),
                phaseElapsedTime: 0,
                completedExercises: 0
            });
            this.startNextPhase();
        } else {
            this.startTimer();
        }

        // Update UI
        this.updateStartButton('Pause');
        this.updateNavigationButtons();
        
        // Start timer pulse animation
        animationManager.pulseTimer(this.elements.timerDisplay, true);

        this.emit('workout:start');
    }

    pauseWorkout() {
        this.setState({
            isRunning: false,
            isPaused: true
        });

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Clear speech
        this.clearSpeech();

        // Update UI
        this.updateStartButton('Resume');
        animationManager.pulseTimer(this.elements.timerDisplay, false);

        this.emit('workout:pause');
    }

    resetWorkout() {
        this.pauseWorkout();
        
        this.setState({
            currentPhase: 0,
            currentExercise: 0,
            timeRemaining: 0,
            phaseStartTime: 0,
            phaseElapsedTime: 0,
            completedExercises: 0,
            isPaused: false
        });

        // Update UI
        this.updateStartButton('Start Workout');
        this.updateDisplay();
        this.updateNavigationButtons();
        
        // Reset progress
        this.updateProgress(0);
        
        // Update labels
        this.elements.timerLabel.textContent = 'Select a workout';
        this.elements.phaseInfo.textContent = '';
        this.elements.progressText.textContent = 'Ready to begin';

        this.emit('workout:reset');
    }

    // Enhanced timer with smooth number animations
    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.state.isRunning) {
                clearInterval(this.timer);
                this.timer = null;
                return;
            }
            
            this.setState({
                timeRemaining: this.state.timeRemaining - 1,
                phaseElapsedTime: (Date.now() - this.state.phaseStartTime) / 1000
            });

            this.updateDisplay();
            
            // Countdown announcements with animations
            if (this.state.timeRemaining <= 5 && this.state.timeRemaining > 0) {
                this.announceCountdown(this.state.timeRemaining);
                animationManager.countdownAnimation(this.elements.timerDisplay);
            }
            
            if (this.state.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.notify();
                this.nextExercise();
            }
        }, 1000);
    }

    // Enhanced display updates with smooth animations
    updateDisplay() {
        const time = TimeUtils.formatTime(this.state.timeRemaining);
        
        // Animate number changes
        if (this.elements.minutes.textContent !== time.minutes) {
            animationManager.animateNumber(
                this.elements.minutes, 
                parseInt(this.elements.minutes.textContent) || 0,
                parseInt(time.minutes),
                200
            );
        }
        
        if (this.elements.seconds.textContent !== time.seconds) {
            animationManager.animateNumber(
                this.elements.seconds,
                parseInt(this.elements.seconds.textContent) || 0,
                parseInt(time.seconds),
                200
            );
        }

        // Update progress
        this.updateWorkoutProgress();
    }

    updateWorkoutProgress() {
        if (!this.state.currentWorkout || this.state.currentPhase >= this.state.currentWorkout.phases.length) {
            return;
        }

        const phase = this.state.currentWorkout.phases[this.state.currentPhase];
        const phaseDurationSeconds = phase.duration * 60;
        const phaseProgress = Math.min((this.state.phaseElapsedTime / phaseDurationSeconds) * 100, 100);
        
        // Animate progress bar
        animationManager.animateProgress(this.elements.progressFill, phaseProgress);
        
        // Update progress text
        const phaseTimeRemaining = Math.max(0, phaseDurationSeconds - this.state.phaseElapsedTime);
        const time = TimeUtils.formatTime(Math.floor(phaseTimeRemaining));
        this.elements.progressText.textContent = 
            `Phase ${this.state.currentPhase + 1}/${this.state.currentWorkout.phases.length} - ${time.display} remaining`;
    }

    updateProgress(percentage) {
        animationManager.animateProgress(this.elements.progressFill, percentage);
        
        if (this.elements.progressFill) {
            this.elements.progressFill.setAttribute('aria-valuenow', percentage.toString());
        }
    }

    updateStartButton(text) {
        this.elements.startBtn.textContent = text;
        
        // Update button styling based on state
        DOM.removeClass(this.elements.startBtn, 'btn--success', 'btn--primary');
        
        if (text === 'Start Workout') {
            DOM.addClass(this.elements.startBtn, 'btn--success');
        } else {
            DOM.addClass(this.elements.startBtn, 'btn--primary');
        }
    }

    // Enhanced error handling and user feedback
    showError(message) {
        console.error(message);
        
        // Create toast notification
        this.showToast(message, 'error');
        
        // Announce to screen readers
        A11yUtils.announceToScreenReader(message, 'assertive');
        
        // Shake animation for visual feedback
        animationManager.shakeElement(this.elements.timerDisplay);
    }

    showSuccess(message) {
        console.log(message);
        
        // Create toast notification
        this.showToast(message, 'success');
        
        // Bounce animation for visual feedback
        animationManager.bounceElement(this.elements.timerDisplay);
    }

    showToast(message, type = 'info') {
        const toast = DOM.create('div', {
            className: `toast toast--${type}`,
            textContent: message
        });
        
        // Add toast styles if not already present
        this.ensureToastStyles();
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => DOM.addClass(toast, 'toast--show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            DOM.removeClass(toast, 'toast--show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    ensureToastStyles() {
        if (document.querySelector('#toast-styles')) return;
        
        const toastCSS = `
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
            .toast--show {
                transform: translateX(0);
            }
            .toast--error {
                background: var(--color-error-500);
            }
            .toast--success {
                background: var(--color-success-500);
            }
            .toast--info {
                background: var(--color-info-500);
            }
        `;
        
        const style = DOM.create('style', { id: 'toast-styles', textContent: toastCSS });
        document.head.appendChild(style);
    }

    ensureFullscreenStyles() {
        if (document.querySelector('#fullscreen-styles')) return;
        
        const fullscreenCSS = `
            /* Fullscreen Mode Styles */
            .fullscreen-mode {
                overflow: hidden;
            }
            
            /* Accent button style for fullscreen button */
            .btn--accent {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                color: white !important;
                border: 2px solid transparent !important;
                transition: all 0.3s ease !important;
            }
            
            .btn--accent:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
            }
            
            .btn--accent:active {
                transform: translateY(0) !important;
            }
            
            .timer-fullscreen {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 999999 !important;
                padding: 2rem !important;
                box-sizing: border-box !important;
            }
            
            .timer-fullscreen-simulated {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 999999 !important;
            }
            
            .timer-fullscreen .timer-display {
                font-size: min(20vw, 200px) !important;
                text-align: center !important;
                margin-bottom: 2rem !important;
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3) !important;
            }
            
            .timer-fullscreen .timer-display .minutes,
            .timer-fullscreen .timer-display .seconds {
                font-size: inherit !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                text-shadow: 0 0 30px rgba(255, 255, 255, 0.5) !important;
            }
            
            .timer-fullscreen .timer-display .separator {
                font-size: inherit !important;
                color: #ffffff !important;
                opacity: 0.8 !important;
                animation: blink 1s infinite !important;
            }
            
            .timer-fullscreen .timer-label {
                font-size: min(5vw, 48px) !important;
                color: #ffffff !important;
                text-align: center !important;
                margin-bottom: 1rem !important;
                font-weight: 600 !important;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3) !important;
            }
            
            .timer-fullscreen .phase-info {
                font-size: min(3vw, 24px) !important;
                color: rgba(255, 255, 255, 0.8) !important;
                text-align: center !important;
                margin-bottom: 3rem !important;
                font-weight: 400 !important;
            }
            
            .timer-fullscreen .progress-container {
                width: 80% !important;
                max-width: 600px !important;
                margin: 2rem auto !important;
            }
            
            .timer-fullscreen .progress-bar {
                height: 8px !important;
                background: rgba(255, 255, 255, 0.2) !important;
                border-radius: 4px !important;
                overflow: hidden !important;
            }
            
            .timer-fullscreen .progress-fill {
                height: 100% !important;
                background: linear-gradient(90deg, #4CAF50, #8BC34A) !important;
                border-radius: 4px !important;
                transition: width 0.3s ease !important;
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.4) !important;
            }
            
            .timer-fullscreen .progress-text {
                color: rgba(255, 255, 255, 0.7) !important;
                font-size: min(2.5vw, 18px) !important;
                text-align: center !important;
                margin-top: 1rem !important;
            }
            
            .timer-fullscreen .timer-controls {
                position: absolute !important;
                bottom: 2rem !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                display: flex !important;
                gap: 1rem !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
            }
            
            .timer-fullscreen .btn {
                padding: 0.75rem 1.5rem !important;
                font-size: min(2.5vw, 16px) !important;
                border-radius: 8px !important;
                border: 2px solid rgba(255, 255, 255, 0.3) !important;
                background: rgba(255, 255, 255, 0.1) !important;
                color: #ffffff !important;
                backdrop-filter: blur(10px) !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
            }
            
            .timer-fullscreen .btn:hover {
                background: rgba(255, 255, 255, 0.2) !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
                transform: translateY(-2px) !important;
            }
            
            .timer-fullscreen .btn:active {
                transform: translateY(0) !important;
            }
            
            .timer-fullscreen .btn--primary {
                background: rgba(33, 150, 243, 0.3) !important;
                border-color: rgba(33, 150, 243, 0.5) !important;
            }
            
            .timer-fullscreen .btn--success {
                background: rgba(76, 175, 80, 0.3) !important;
                border-color: rgba(76, 175, 80, 0.5) !important;
            }
            
            .timer-fullscreen .btn--active {
                background: rgba(255, 255, 255, 0.3) !important;
                border-color: rgba(255, 255, 255, 0.7) !important;
            }
            
            /* Fullscreen button styles */
            .fullscreen-btn {
                position: relative !important;
                overflow: hidden !important;
            }
            
            .fullscreen-btn .fullscreen-icon {
                margin-right: 0.5rem !important;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }
            
            /* Hide non-essential elements in fullscreen */
            .fullscreen-mode .day-selection,
            .fullscreen-mode .workout-details,
            .fullscreen-mode .exercise-grid,
            .fullscreen-mode .settings-panel,
            .fullscreen-mode .app-header,
            .fullscreen-mode .app-footer {
                display: none !important;
            }
            
            /* Responsive adjustments for fullscreen */
            @media (max-width: 768px) {
                .timer-fullscreen {
                    padding: 1rem !important;
                }
                
                .timer-fullscreen .timer-display {
                    font-size: min(25vw, 150px) !important;
                    margin-bottom: 1rem !important;
                }
                
                .timer-fullscreen .timer-label {
                    font-size: min(6vw, 32px) !important;
                }
                
                .timer-fullscreen .phase-info {
                    font-size: min(4vw, 18px) !important;
                    margin-bottom: 2rem !important;
                }
                
                .timer-fullscreen .timer-controls {
                    bottom: 1rem !important;
                    gap: 0.5rem !important;
                }
                
                .timer-fullscreen .btn {
                    padding: 0.5rem 1rem !important;
                    font-size: min(3vw, 14px) !important;
                }
            }
            
            @media (max-width: 480px) {
                .timer-fullscreen .timer-display {
                    font-size: min(30vw, 120px) !important;
                }
                
                .timer-fullscreen .timer-controls {
                    flex-direction: column !important;
                    width: 100% !important;
                    max-width: 300px !important;
                }
                
                .timer-fullscreen .btn {
                    width: 100% !important;
                    text-align: center !important;
                }
            }
        `;
        
        const style = DOM.create('style', { id: 'fullscreen-styles', textContent: fullscreenCSS });
        document.head.appendChild(style);
    }

    ensureFullscreenFunctionality() {
        console.log('=== ENSURING FULLSCREEN FUNCTIONALITY ===');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        console.log('Fullscreen button found:', !!fullscreenBtn);
        
        if (fullscreenBtn) {
            // Remove any existing event listeners and add fresh ones
            const newBtn = fullscreenBtn.cloneNode(true);
            fullscreenBtn.parentNode.replaceChild(newBtn, fullscreenBtn);
            
            // Add click handler
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('FULLSCREEN BUTTON CLICKED - BACKUP HANDLER');
                
                // Simple test - just toggle CSS classes
                const timerContainer = document.getElementById('timer-container');
                if (timerContainer) {
                    if (timerContainer.classList.contains('timer-fullscreen')) {
                        // Exit fullscreen
                        console.log('Exiting fullscreen mode');
                        document.body.classList.remove('fullscreen-mode');
                        timerContainer.classList.remove('timer-fullscreen', 'timer-fullscreen-simulated');
                        newBtn.querySelector('.fullscreen-text').textContent = 'Fullscreen';
                        newBtn.querySelector('.fullscreen-icon').textContent = '🔳';
                    } else {
                        // Enter fullscreen
                        console.log('Entering fullscreen mode');
                        document.body.classList.add('fullscreen-mode');
                        timerContainer.classList.add('timer-fullscreen', 'timer-fullscreen-simulated');
                        newBtn.querySelector('.fullscreen-text').textContent = 'Exit Fullscreen';
                        newBtn.querySelector('.fullscreen-icon').textContent = '⏹️';
                    }
                } else {
                    console.error('Timer container not found');
                }
                
                // Haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
            });
            
            // Update the cached element
            this.elements.fullscreenBtn = newBtn;
            console.log('Fullscreen functionality ensured with backup handler');
        } else {
            console.error('Fullscreen button not found even with backup search');
        }
    }

    // Enhanced haptic feedback
    hapticFeedback(pattern = [200]) {
        if (this.state.settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Enhanced speech synthesis with better error handling
    async initializeSpeech() {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Wait for voices to load
        return new Promise((resolve) => {
            const loadVoices = () => {
                const voices = this.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    console.log('Speech synthesis ready with', voices.length, 'voices');
                    resolve();
                } else {
                    setTimeout(loadVoices, 100);
                }
            };
            
            if (this.speechSynthesis.onvoiceschanged !== undefined) {
                this.speechSynthesis.onvoiceschanged = loadVoices;
            }
            
            loadVoices();
        });
    }

    speak(text, priority = false) {
        if (!this.state.settings.voiceEnabled || !this.speechSynthesis) {
            return;
        }
        
        if (priority) {
            this.clearSpeech();
        }
        
        this.speechQueue.push(text);
        this.processSpeechQueue();
    }

    processSpeechQueue() {
        if (this.speechQueue.length === 0 || this.isSpeaking) {
            return;
        }
        
        this.isSpeaking = true;
        const text = this.speechQueue.shift();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.state.settings.voiceVolume;
        utterance.rate = this.state.settings.voiceRate;
        
        // Select best voice
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Google')
        ) || voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.onend = () => {
            this.isSpeaking = false;
            setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        utterance.onerror = (error) => {
            console.warn('Speech synthesis error:', error);
            this.isSpeaking = false;
            setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        this.speechSynthesis.speak(utterance);
    }

    clearSpeech() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        this.speechQueue = [];
        this.isSpeaking = false;
    }

    announceCountdown(seconds) {
        const words = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
        if (seconds <= 5 && seconds > 0) {
            this.speak(words[seconds], true);
        }
    }

    // Event handlers
    onResize() {
        // Handle responsive updates
        const viewport = DeviceUtils.getViewportSize();
        this.emit('viewport:change', viewport);
    }

    onVisibilityChange() {
        if (document.hidden && this.state.isRunning) {
            // Optionally pause when tab is hidden
            console.log('App hidden while workout running');
        } else if (!document.hidden && this.state.isPaused) {
            console.log('App visible again');
        }
    }

    onKeydown(e) {
        // Enhanced keyboard shortcuts
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return; // Don't interfere with form inputs
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
                if (this.isFullscreen()) {
                    this.exitFullscreen();
                } else {
                    this.closeModal();
                }
                break;
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
        }
    }

    // Enhanced settings management
    loadSettings() {
        const savedSettings = Storage.get('bjj-workout-settings', {});
        const settings = { ...this.state.settings, ...savedSettings };
        
        this.setState({ settings }, false);
        this.applySettingsToUI();
    }

    saveSettings() {
        const settings = {};
        
        // Collect settings from UI
        Object.entries(this.elements.settingsInputs).forEach(([key, element]) => {
            if (element) {
                if (element.type === 'checkbox') {
                    settings[key] = element.checked;
                } else if (element.type === 'range') {
                    settings[key] = parseFloat(element.value);
                }
            }
        });

        this.setState({ settings: { ...this.state.settings, ...settings } });
        Storage.set('bjj-workout-settings', this.state.settings);
        
        this.emit('settings:changed', this.state.settings);
    }

    applySettingsToUI() {
        Object.entries(this.elements.settingsInputs).forEach(([key, element]) => {
            if (element && this.state.settings[key] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = this.state.settings[key];
                } else if (element.type === 'range') {
                    element.value = this.state.settings[key];
                }
            }
        });

        // Update displays
        const volumeDisplay = DOM.$('#volume-display');
        const rateDisplay = DOM.$('#rate-display');
        
        if (volumeDisplay) {
            volumeDisplay.textContent = Math.round(this.state.settings.voiceVolume * 100) + '%';
        }
        
        if (rateDisplay) {
            rateDisplay.textContent = this.state.settings.voiceRate + 'x';
        }
    }

    // Enhanced modal functionality
    showExerciseModal(exerciseName) {
        const exercise = this.getExerciseLibrary()[exerciseName];
        if (!exercise) return;

        this.elements.modalTitle.textContent = exerciseName;
        this.elements.modalDescription.textContent = exercise.description;
        this.elements.modalCues.innerHTML = exercise.cues
            .map(cue => `<li class="py-2 border-b border-gray-200 text-gray-600 last:border-b-0">${cue}</li>`)
            .join('');

        // Show modal with animation
        animationManager.animateModal(this.elements.modal, true);
        
        // Trap focus
        this.modalFocusTrap = A11yUtils.trapFocus(this.elements.modal);
        
        this.emit('modal:open', { exercise: exerciseName });
    }

    closeModal() {
        animationManager.animateModal(this.elements.modal, false);
        
        // Release focus trap
        if (this.modalFocusTrap) {
            this.modalFocusTrap();
            this.modalFocusTrap = null;
        }
        
        this.emit('modal:close');
    }

    toggleSettings() {
        const isOpen = DOM.hasClass(this.elements.settingsContent, 'settings-content--open');
        
        DOM.toggleClass(this.elements.settingsContent, 'settings-content--open');
        DOM.toggleClass(this.elements.settingsBtn, 'settings-toggle--active');
        
        A11yUtils.setAriaExpanded(this.elements.settingsBtn, !isOpen);
        
        this.emit('settings:toggle', { open: !isOpen });
    }

    // Enhanced notification system
    notify() {
        // Sound notification using Web Audio API
        if (this.state.settings.soundEnabled) {
            this.playNotificationBeep();
        }
        
        // Haptic feedback
        this.hapticFeedback();
        
        // Visual feedback
        animationManager.bounceElement(this.elements.timerDisplay);
    }

    playNotificationBeep() {
        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz tone
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Web Audio API beep failed, trying fallback:', error);
            // Fallback: try to play the audio element if it exists
            if (this.elements.notificationSound) {
                this.elements.notificationSound.play().catch(e => 
                    console.warn('Audio element fallback also failed:', e)
                );
            }
        }
    }

    // Cleanup method
    destroy() {
        // Clear timers
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Clear speech
        this.clearSpeech();
        
        // Release wake lock
        if (this.wakeLock) {
            this.wakeLock.release();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
        
        // Cleanup animations
        animationManager.cleanup();
        
        // Save final state
        this.saveState();
        
        this.emit('app:destroy');
    }

    // Navigation methods for skipping exercises
    skipExercise() {
        console.log('=== SKIP EXERCISE ===');
        console.log('Current phase:', this.state.currentPhase, 'Current exercise:', this.state.currentExercise);
        
        try {
            if (!this.state.currentWorkout) {
                console.log('No current workout selected');
                return;
            }
            
            if (!this.state.isRunning) {
                console.log('Workout is not running');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped');
            }
            
            // Clear any ongoing speech
            this.clearSpeech();
            
            const phases = this.state.currentWorkout.phases;
            
            // Check if we've completed all phases
            if (this.state.currentPhase >= phases.length) {
                console.log('All phases complete');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.state.currentPhase];
            
            // Move to next exercise within the current phase
            let nextExercise = this.state.currentExercise + 1;
            
            // If we've completed all exercises in this phase, move to next phase
            if (nextExercise >= phase.exercises.length) {
                console.log('Completed all exercises in phase, moving to next phase');
                this.setState({ 
                    currentPhase: this.state.currentPhase + 1,
                    currentExercise: 0
                });
                
                // Check if we've completed all phases
                if (this.state.currentPhase >= phases.length) {
                    console.log('All phases complete');
                    this.completeWorkout();
                    return;
                }
                
                this.startNextPhase();
                return;
            }
            
            this.setState({ currentExercise: nextExercise });
            
            console.log('New position - Phase:', this.state.currentPhase, 'Exercise:', this.state.currentExercise);
            this.startNextExercise();
            
            // Update navigation buttons after the change
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error in skipExercise:', error);
            this.showError('Error skipping exercise');
            // Try to recover by pausing
            this.pauseWorkout();
        }
    }

    goBack() {
        console.log('=== GO BACK ===');
        
        try {
            if (!this.state.currentWorkout) {
                console.log('No current workout selected');
                return;
            }
            
            if (!this.state.isRunning) {
                console.log('Workout is not running');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped in goBack');
            }
            
            // Clear any ongoing speech
            this.clearSpeech();
            
            // Move to previous exercise
            let prevExercise = this.state.currentExercise - 1;
            let prevPhase = this.state.currentPhase;
            
            // Check if we need to move to previous phase
            if (prevExercise < 0) {
                prevPhase--;
                
                // Check if we've gone before the first phase
                if (prevPhase < 0) {
                    console.log('At the beginning, cannot go back further');
                    this.showToast('Already at the beginning', 'info');
                    return;
                } else {
                    // Go to last exercise of previous phase
                    const phase = this.state.currentWorkout.phases[prevPhase];
                    prevExercise = phase.exercises.length - 1;
                }
            }
            
            this.setState({ 
                currentPhase: prevPhase, 
                currentExercise: prevExercise 
            });
            
            console.log('New position - Phase:', this.state.currentPhase, 'Exercise:', this.state.currentExercise);
            
            // Start the previous exercise
            this.startNextExercise();
            
            // Update navigation buttons after the change
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error in goBack:', error);
            this.showError('Error going back');
            this.pauseWorkout();
        }
    }

    // Include all existing workout data methods
    getWorkoutData() {
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
                    {
                        name: "15:15 Snatch Intervals",
                        duration: 10,
                        exercises: [
                            // Round 1
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 2
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 3
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 4
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 5
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 6
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 7
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 8
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 9
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            // Round 10
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work" },
                            { name: "Rest", duration: 15, description: "15 seconds rest" }
                        ]
                    },
                    {
                        name: "Recovery",
                        duration: 3,
                        exercises: [
                            { name: "Active Recovery", duration: 180, description: "Walk, shake out arms, hydrate" }
                        ]
                    },
                    {
                        name: "Optional Finisher",
                        duration: 4,
                        exercises: [
                            { name: "Tabata Swings", duration: 240, description: "8 rounds: 20s work, 10s rest" }
                        ],
                        optional: true
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Light Stretching", duration: 180, description: "Shoulders, hamstrings, forearms" },
                            { name: "Breathing", duration: 120, description: "Deep diaphragmatic breathing" }
                        ]
                    }
                ]
            },
            2: {
                name: "EMOM Strength-Endurance Circuit",
                focus: "Anaerobic Threshold Training",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 180, description: "Joint mobility and movement prep" },
                            { name: "Practice Swings", duration: 120, description: "Light swings and push-ups" }
                        ]
                    },
                    {
                        name: "12-Minute EMOM Circuit",
                        duration: 12,
                        exercises: [
                            // Round 1
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" },
                            // Round 2
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" },
                            // Round 3
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" },
                            // Round 4
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" },
                            // Round 5
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" },
                            // Round 6
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" }
                        ]
                    },
                    {
                        name: "Farmer's Carry",
                        duration: 3,
                        exercises: [
                            { name: "Right Arm Carry", duration: 30, description: "30 seconds per arm" },
                            { name: "Left Arm Carry", duration: 30, description: "30 seconds per arm" }
                        ]
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Stretching", duration: 300, description: "Legs, chest, forearms" }
                        ]
                    }
                ]
            },
            3: {
                name: "Low-Intensity Aerobic + Core",
                focus: "Active Recovery",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Mobility Work", duration: 180, description: "Slow arm/leg swings, torso twists" },
                            { name: "Turkish Get-Up Practice", duration: 120, description: "Light TGU rehearsal" }
                        ]
                    },
                    {
                        name: "20-Minute Continuous Flow",
                        duration: 20,
                        exercises: [
                            // Round 1
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
                            // Round 2
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
                            // Round 3
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
                            // Round 4
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" }
                        ]
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Static Stretching", duration: 300, description: "Cobra, figure-4, neck stretches" }
                        ]
                    }
                ]
            },
            4: {
                name: "Kettlebell Complex for Power-Endurance",
                focus: "Full-Body Conditioning",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 180, description: "Joint mobility and movement prep" },
                            { name: "Complex Practice", duration: 120, description: "Light practice of complex movements" }
                        ]
                    },
                    {
                        name: "Kettlebell Complex",
                        duration: 15,
                        exercises: [
                            // Round 1
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            // Round 2
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            // Round 3
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            // Round 4
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            // Round 5
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" }
                        ]
                    },
                    {
                        name: "Optional Finisher",
                        duration: 2,
                        exercises: [
                            { name: "30-20-10 Ladder", duration: 120, description: "High-pulls and burpees" }
                        ],
                        optional: true
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Active Stretching", duration: 300, description: "Shoulders, forearms, legs" }
                        ]
                    }
                ]
            },
            5: {
                name: "High-Intensity Grappling Circuit",
                focus: "AMRAP Rounds for Fight Conditioning",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 180, description: "Joint mobility and movement prep" },
                            { name: "Burst Drills", duration: 120, description: "Short high-intensity bursts" }
                        ]
                    },
                    {
                        name: "Sparring Rounds Circuit",
                        duration: 12,
                        exercises: [
                            { name: "AMRAP Round 1", duration: 180, description: "3 minutes: 5 rows per side, 5 thrusters, 5 burpees, 10 swings" },
                            { name: "Rest", duration: 60, description: "1 minute recovery" },
                            { name: "AMRAP Round 2", duration: 180, description: "3 minutes: 5 rows per side, 5 thrusters, 5 burpees, 10 swings" },
                            { name: "Rest", duration: 60, description: "1 minute recovery" },
                            { name: "AMRAP Round 3", duration: 180, description: "3 minutes: 5 rows per side, 5 thrusters, 5 burpees, 10 swings" },
                            { name: "Rest", duration: 60, description: "1 minute recovery" }
                        ]
                    },
                    {
                        name: "Grip Burnout",
                        duration: 3,
                        exercises: [
                            { name: "Towel Hang", duration: 30, description: "30 seconds per set" },
                            { name: "Rest", duration: 30, description: "30 seconds rest" }
                        ],
                        repeat: 2
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Active Recovery", duration: 300, description: "Walking, stretching, rehydration" }
                        ]
                    }
                ]
            },
            6: {
                name: "BJJ Sparring and Skill Training",
                focus: "Sport-Specific Day",
                duration: 90,
                phases: [
                    {
                        name: "Pre-Class Warm-Up",
                        duration: 10,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 300, description: "Joint mobility and movement prep" },
                            { name: "Light Kettlebell Work", duration: 300, description: "Light swings and drills" }
                        ]
                    },
                    {
                        name: "BJJ Training",
                        duration: 60,
                        exercises: [
                            { name: "Technique Practice", duration: 1200, description: "Drill techniques and movements" },
                            { name: "Live Sparring", duration: 1800, description: "Intense rolling rounds" },
                            { name: "Conditioning", duration: 600, description: "Additional conditioning work" }
                        ]
                    },
                    {
                        name: "Post-Class Cooldown",
                        duration: 20,
                        exercises: [
                            { name: "Stretching", duration: 600, description: "Neck, forearms, back stretches" },
                            { name: "Light Aerobic", duration: 600, description: "Easy movement for recovery" }
                        ]
                    }
                ]
            },
            7: {
                name: "Rest and Recovery",
                focus: "Mobility Focus",
                duration: 30,
                phases: [
                    {
                        name: "Active Recovery",
                        duration: 30,
                        exercises: [
                            { name: "Light Walk/Jog", duration: 600, description: "Easy movement for blood flow" },
                            { name: "Yoga/Stretching", duration: 600, description: "Gentle stretching routine" },
                            { name: "Mobility Work", duration: 600, description: "Joint mobility and range of motion" }
                        ]
                    }
                ]
            }
        };
    }

    getExerciseLibrary() {
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
            },
            "Kettlebell Swing": {
                type: "Power",
                description: "Fundamental hip hinge movement with explosive hip extension",
                cues: [
                    "Stand with feet shoulder-width apart",
                    "Hinge at hips, not waist",
                    "Drive hips forward explosively",
                    "Let arms follow the momentum",
                    "Control the backswing between legs"
                ]
            },
            "Turkish Get-Up": {
                type: "Strength",
                description: "Complex full-body movement requiring stability and coordination",
                cues: [
                    "Start lying on back with KB locked out overhead",
                    "Roll to elbow, then to hand",
                    "Bridge up and sweep leg through",
                    "Lunge up to standing position",
                    "Reverse the movement back to start"
                ]
            },
            "Goblet Squat": {
                type: "Strength",
                description: "Squat holding kettlebell at chest level",
                cues: [
                    "Hold kettlebell by the horns at chest",
                    "Feet slightly wider than shoulder-width",
                    "Squat down keeping chest up",
                    "Drive through heels to stand",
                    "Keep elbows inside knees at bottom"
                ]
            },
            "Kettlebell Press": {
                type: "Strength",
                description: "Overhead pressing movement with kettlebell",
                cues: [
                    "Start with KB in rack position",
                    "Press straight up, not forward",
                    "Lock out arm completely overhead",
                    "Keep core tight throughout",
                    "Lower with control to rack position"
                ]
            },
            "Kettlebell Clean": {
                type: "Power",
                description: "Explosive movement bringing KB to rack position",
                cues: [
                    "Start with KB between legs",
                    "Drive hips forward explosively",
                    "Guide KB to rack position",
                    "Catch with soft knees",
                    "KB should rest on forearm, not wrist"
                ]
            },
            "Plank": {
                type: "Core",
                description: "Isometric core strengthening exercise",
                cues: [
                    "Start in push-up position",
                    "Keep body in straight line",
                    "Engage core and glutes",
                    "Breathe normally",
                    "Don't let hips sag or pike up"
                ]
            },
            "Burpee": {
                type: "Conditioning",
                description: "Full-body exercise combining squat, plank, and jump",
                cues: [
                    "Start standing, drop to squat",
                    "Jump feet back to plank",
                    "Do push-up (optional)",
                    "Jump feet back to squat",
                    "Jump up with arms overhead"
                ]
            },
            "Kettlebell Row": {
                type: "Strength",
                description: "Rowing movement with kettlebell",
                cues: [
                    "Hinge at hips, keep back straight",
                    "Pull KB to ribs, not chest",
                    "Squeeze shoulder blade back",
                    "Control the lowering phase",
                    "Keep core engaged throughout"
                ]
            },
            "Farmer's Carry": {
                type: "Strength",
                description: "Walking with heavy weight for grip and core strength",
                cues: [
                    "Stand tall with weight at sides",
                    "Keep shoulders back and down",
                    "Take controlled steps",
                    "Breathe normally",
                    "Maintain good posture throughout"
                ]
            }
        };
    }
}

// Initialize the app when DOM is ready
DOM.ready(() => {
    window.bjjApp = new ModernBJJWorkoutApp();
});

export default ModernBJJWorkoutApp; 