class BJJWorkoutApp {
    constructor() {
        this.currentDay = null;
        this.currentWorkout = null;
        this.isRunning = false;
        this.currentPhase = 0;
        this.currentExercise = 0;
        this.timer = null;
        this.timeRemaining = 0;
        this.phaseStartTime = 0;
        this.phaseElapsedTime = 0;
        this.settings = {
            soundEnabled: true,
            vibrationEnabled: true,
            autoAdvance: true,
            voiceEnabled: true,
            voiceVolume: 0.8,
            voiceRate: 0.9
        };
        
        // Speech synthesis setup
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = null;
        this.speechQueue = [];
        this.isSpeaking = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.populateExerciseLibrary();
        
        // Initialize speech synthesis after a short delay to ensure it's ready
        setTimeout(() => {
            this.initializeSpeech();
            
            // Test voice after initialization
            setTimeout(() => {
                console.log('Running initial voice test...');
                this.speak("Voice system ready.", false);
            }, 2000);
        }, 1000);
    }

    initializeElements() {
        // Timer elements
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.timerLabelEl = document.getElementById('timer-label');
        this.phaseInfoEl = document.getElementById('phase-info');
        this.progressFillEl = document.getElementById('progress-fill');
        this.progressTextEl = document.getElementById('progress-text');

        // Control buttons
        this.startBtn = document.getElementById('start-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.backBtn = document.getElementById('back-btn');
        this.skipBtn = document.getElementById('skip-btn');

        // Day selection
        this.dayButtons = document.querySelectorAll('.day-btn');

        // Workout details
        this.workoutDetailsEl = document.getElementById('workout-details');

        // Exercise library
        this.exerciseGridEl = document.getElementById('exercise-grid');

        // Settings
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsContent = document.getElementById('settings-content');
        this.soundEnabledCheckbox = document.getElementById('sound-enabled');
        this.vibrationEnabledCheckbox = document.getElementById('vibration-enabled');
        this.autoAdvanceCheckbox = document.getElementById('auto-advance');
        this.voiceEnabledCheckbox = document.getElementById('voice-enabled');
        this.voiceVolumeSlider = document.getElementById('voice-volume');
        this.voiceRateSlider = document.getElementById('voice-rate');
        this.testVoiceBtn = document.getElementById('test-voice');
        this.testAnnouncementsBtn = document.getElementById('test-announcements');
        this.debugProgressBtn = document.getElementById('debug-progress');
        this.recoverAppBtn = document.getElementById('recover-app');

        // Modal
        this.modal = document.getElementById('exercise-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.modalCues = document.getElementById('modal-cues');
        this.closeModalBtn = document.getElementById('close-modal');

        // Audio
        this.notificationSound = document.getElementById('notification-sound');
    }

    bindEvents() {
        // Day selection
        this.dayButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectDay(parseInt(btn.dataset.day)));
        });

        // Timer controls
        this.startBtn.addEventListener('click', () => this.toggleWorkout());
        this.resetBtn.addEventListener('click', () => this.resetWorkout());
        this.backBtn.addEventListener('click', () => this.goBack());
        this.skipBtn.addEventListener('click', () => this.skipExercise());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.soundEnabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.vibrationEnabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.autoAdvanceCheckbox.addEventListener('change', () => this.saveSettings());
        this.voiceEnabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.voiceVolumeSlider.addEventListener('input', () => this.saveSettings());
        this.voiceRateSlider.addEventListener('input', () => this.saveSettings());
        this.testVoiceBtn.addEventListener('click', () => this.testVoice());
        this.testAnnouncementsBtn.addEventListener('click', () => this.testAnnouncements());
        this.debugProgressBtn.addEventListener('click', () => this.logWorkoutProgress());
        this.recoverAppBtn.addEventListener('click', () => this.recoverApp());
        
        // Update volume and rate displays
        this.voiceVolumeSlider.addEventListener('input', () => {
            document.getElementById('volume-display').textContent = Math.round(this.voiceVolumeSlider.value * 100) + '%';
        });
        this.voiceRateSlider.addEventListener('input', () => {
            document.getElementById('rate-display').textContent = this.voiceRateSlider.value + 'x';
        });

        // Modal
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !this.backBtn.disabled) {
                this.goBack();
            } else if (e.key === 'ArrowRight' && !this.skipBtn.disabled) {
                this.skipExercise();
            }
        });
    }

    selectDay(day) {
        console.log('=== SELECT DAY ===');
        console.log('Selected day:', day);
        
        this.currentDay = day;
        this.currentWorkout = this.getWorkoutData()[day];
        
        console.log('Current workout loaded:', this.currentWorkout);
        console.log('Workout name:', this.currentWorkout?.name);
        
        // Update active button
        this.dayButtons.forEach(btn => {
            const isActive = parseInt(btn.dataset.day) === day;
            if (isActive) {
                btn.classList.remove('border-gray-200', 'bg-white', 'hover:border-bjj-blue', 'hover:bg-blue-50');
                btn.classList.add('border-bjj-blue', 'bg-gradient-to-br', 'from-bjj-blue', 'to-bjj-light-blue', 'text-white', 'shadow-lg');
            } else {
                btn.classList.remove('border-bjj-blue', 'bg-gradient-to-br', 'from-bjj-blue', 'to-bjj-light-blue', 'text-white', 'shadow-lg');
                btn.classList.add('border-gray-200', 'bg-white', 'hover:border-bjj-blue', 'hover:bg-blue-50');
            }
        });

        // Update workout details
        this.displayWorkoutDetails();
        
        // Reset timer
        this.resetWorkout();
        this.updateNavigationButtons();
    }

    displayWorkoutDetails() {
        if (!this.currentWorkout) return;

        const workout = this.currentWorkout;
        this.workoutDetailsEl.innerHTML = `
            <div class="workout-overview">
                <h3 class="text-bjj-blue mb-4 text-xl font-semibold">${workout.name}</h3>
                <p class="text-gray-600 leading-relaxed mb-3"><strong>Focus:</strong> ${workout.focus}</p>
                <p class="text-gray-600 leading-relaxed mb-4"><strong>Duration:</strong> ${workout.duration} minutes</p>
            </div>
            ${workout.phases.map((phase, index) => `
                <div class="bg-gray-50 rounded-xl p-5 my-4 border-l-4 border-bjj-blue">
                    <h4 class="text-bjj-blue mb-3 text-lg font-semibold">${index + 1}. ${phase.name} (${phase.duration} min)</h4>
                    <ul class="list-none p-0">
                        ${phase.exercises.map(exercise => `
                            <li class="py-2 border-b border-gray-200 flex justify-between items-center last:border-b-0">
                                <span class="font-medium text-gray-800">${exercise.name}</span>
                                <span class="text-gray-600 text-sm">${exercise.duration}s - ${exercise.description}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('')}
        `;
    }

    populateExerciseLibrary() {
        const exercises = this.getExerciseLibrary();
        this.exerciseGridEl.innerHTML = Object.entries(exercises).map(([name, data]) => `
            <div class="bg-gray-50 rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-bjj-blue hover:bg-white hover:-translate-y-1 hover:shadow-lg" onclick="app.showExerciseModal('${name}')">
                <h4 class="text-bjj-blue mb-3 text-lg font-semibold">${name}</h4>
                <p class="text-gray-600 text-sm leading-relaxed mb-3">${data.description}</p>
                <span class="inline-block bg-bjj-blue text-white px-3 py-1 rounded-full text-xs font-medium">${data.type}</span>
            </div>
        `).join('');
    }

    showExerciseModal(exerciseName) {
        const exercise = this.getExerciseLibrary()[exerciseName];
        if (!exercise) return;

        this.modalTitle.textContent = exerciseName;
        this.modalDescription.textContent = exercise.description;
        this.modalCues.innerHTML = exercise.cues.map(cue => `<li class="py-2 border-b border-gray-200 text-gray-600 last:border-b-0 before:content-['•'] before:text-bjj-blue before:font-bold before:mr-3">${cue}</li>`).join('');
        
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }

    toggleWorkout() {
        if (this.isRunning) {
            this.pauseWorkout();
        } else {
            this.startWorkout();
        }
    }

    startWorkout() {
        console.log('=== START WORKOUT ===');
        console.log('Current workout:', this.currentWorkout);
        console.log('Is running:', this.isRunning);
        
        if (!this.currentWorkout) {
            console.log('No current workout selected');
            return;
        }

        this.isRunning = true;
        
        // Check if we're resuming from a pause or starting fresh
        const isResuming = this.currentPhase > 0 || this.currentExercise > 0 || this.timeRemaining > 0;
        console.log('Is resuming:', isResuming);
        console.log('Current phase:', this.currentPhase, 'Current exercise:', this.currentExercise, 'Time remaining:', this.timeRemaining);
        
        if (!isResuming) {
            // Starting fresh - reset to beginning
            console.log('Starting fresh workout');
            this.currentPhase = 0;
            this.currentExercise = 0;
            this.timeRemaining = 0;
            this.phaseStartTime = 0;
            this.phaseElapsedTime = 0;
            this.startNextPhase();
        } else {
            // Resuming from pause - just restart the timer
            console.log('Resuming from pause');
            this.startTimer();
        }
        
        this.startBtn.textContent = 'Pause';
        this.startBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        this.startBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }

    startNextPhase() {
        console.log('startNextPhase called, currentPhase:', this.currentPhase);
        if (!this.isRunning || !this.currentWorkout) return;

        const phases = this.currentWorkout.phases;
        console.log('Total phases:', phases.length);
        
        if (this.currentPhase >= phases.length) {
            console.log('All phases complete');
            this.completeWorkout();
            return;
        }

        const phase = phases[this.currentPhase];
        console.log('Starting phase:', phase.name, 'Phase duration:', phase.duration, 'minutes');
        
        // Initialize phase timing
        this.phaseStartTime = Date.now();
        this.phaseElapsedTime = 0;
        this.currentExercise = 0;
        console.log('Phase timing initialized - start time:', this.phaseStartTime);
        
        this.timerLabelEl.textContent = phase.name;
        this.phaseInfoEl.textContent = `Phase ${this.currentPhase + 1} of ${phases.length}`;
        
        // Announce the phase (not priority, so exercise will follow)
        console.log('Announcing phase:', phase.name);
        this.announcePhase(phase, false);
        
        this.startNextExercise();
    }

    startNextExercise() {
        console.log('startNextExercise called, currentExercise:', this.currentExercise);
        
        try {
            if (!this.isRunning || !this.currentWorkout) {
                console.log('Cannot start next exercise - not running or no workout');
                return;
            }

            const phases = this.currentWorkout.phases;
            
            // Validate current phase
            if (this.currentPhase >= phases.length) {
                console.log('Current phase out of bounds, completing workout');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.currentPhase];
            console.log('Current phase:', phase.name, 'Phase exercises:', phase.exercises.length);
            console.log('Current exercise index:', this.currentExercise);
            
            // Calculate phase elapsed time
            this.phaseElapsedTime = (Date.now() - this.phaseStartTime) / 1000; // Convert to seconds
            
            // Validate current exercise index
            if (this.currentExercise >= phase.exercises.length) {
                console.log('Current exercise index out of bounds, resetting to 0');
                this.currentExercise = 0;
            }

            const exercise = phase.exercises[this.currentExercise];
            console.log('Starting exercise:', exercise.name, 'Duration:', exercise.duration);
            
            // Calculate which round we're in (for display purposes)
            const roundDuration = phase.exercises.reduce((sum, ex) => sum + ex.duration, 0);
            const completedRounds = Math.floor(this.phaseElapsedTime / roundDuration);
            const currentRound = completedRounds + 1;
            
            this.timerLabelEl.textContent = exercise.name;
            this.phaseInfoEl.textContent = `${phase.name} - Round ${currentRound} (${Math.floor(this.phaseElapsedTime / 60)}:${Math.floor(this.phaseElapsedTime % 60).toString().padStart(2, '0')})`;
            
            // Set the exercise duration
            this.timeRemaining = exercise.duration;
            this.updateDisplay();
            
            // Announce the exercise and start timer immediately
            console.log('About to announce exercise:', exercise.name);
            console.log('Voice enabled:', this.settings.voiceEnabled);
            console.log('Speech synthesis available:', !!this.speechSynthesis);
            
            // Add a small delay to ensure speech synthesis is ready
            setTimeout(() => {
                this.announceExercise(exercise, phase.name, this.currentExercise + 1, phase.exercises.length);
                this.startTimer();
            }, 500);
            
            // Update navigation buttons
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error in startNextExercise:', error);
            // Try to recover
            this.isRunning = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(this.timer);
                this.timer = null;
                return;
            }
            
            this.timeRemaining--;
            this.phaseElapsedTime = (Date.now() - this.phaseStartTime) / 1000;
            this.updateDisplay();
            
            // 5-second countdown at the end of exercise
            if (this.timeRemaining === 5) {
                this.speak("Five seconds remaining", true);
            } else if (this.timeRemaining === 4) {
                this.speak("Four", true);
            } else if (this.timeRemaining === 3) {
                this.speak("Three", true);
            } else if (this.timeRemaining === 2) {
                this.speak("Two", true);
            } else if (this.timeRemaining === 1) {
                this.speak("One", true);
            }
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.notify();
                this.nextExercise();
            }
        }, 1000);
    }

    nextExercise() {
        console.log('nextExercise called');
        
        try {
            if (!this.isRunning) {
                console.log('Workout is not running, not proceeding');
                return;
            }
            
            if (!this.currentWorkout) {
                console.log('No current workout, not proceeding');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped in nextExercise');
            }

            this.currentExercise++;
            console.log('Incremented to exercise:', this.currentExercise);
            
            const phases = this.currentWorkout.phases;
            
            // Validate current phase
            if (this.currentPhase >= phases.length) {
                console.log('Current phase out of bounds, completing workout');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.currentPhase];
            console.log('Current phase:', phase.name, 'Total exercises in phase:', phase.exercises.length);
            
            // Check if phase duration has been reached
            this.phaseElapsedTime = (Date.now() - this.phaseStartTime) / 1000;
            const phaseDurationSeconds = phase.duration * 60;
            
            if (this.phaseElapsedTime >= phaseDurationSeconds) {
                console.log('Phase duration reached, moving to next phase');
                this.currentPhase++;
                if (this.settings.autoAdvance) {
                    this.startNextPhase();
                } else {
                    this.pauseWorkout();
                }
            } else {
                console.log('Continuing with next exercise in same phase');
                if (this.settings.autoAdvance) {
                    // Check if we need to cycle back to first exercise
                    if (this.currentExercise >= phase.exercises.length) {
                        console.log('Completed all exercises in phase, cycling back to first exercise');
                        this.currentExercise = 0;
                    }
                    this.startNextExercise();
                } else {
                    this.pauseWorkout();
                }
            }
            
        } catch (error) {
            console.error('Error in nextExercise:', error);
            // Try to recover
            this.isRunning = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    pauseWorkout() {
        console.log('=== PAUSE WORKOUT ===');
        this.isRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Clear any ongoing speech
        this.speechSynthesis.cancel();
        this.speechQueue = [];
        this.isSpeaking = false;
        
        this.startBtn.textContent = 'Resume';
        this.startBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        this.startBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        console.log('Workout paused');
    }

    resetWorkout() {
        console.log('=== RESET WORKOUT ===');
        this.pauseWorkout();
        this.currentPhase = 0;
        this.currentExercise = 0;
        this.timeRemaining = 0;
        this.phaseStartTime = 0;
        this.phaseElapsedTime = 0;
        
        console.log('Reset complete - Phase:', this.currentPhase, 'Exercise:', this.currentExercise, 'Time:', this.timeRemaining);
        
        this.startBtn.textContent = 'Start Workout';
        this.timerLabelEl.textContent = 'Select a workout';
        this.phaseInfoEl.textContent = '';
        this.progressTextEl.textContent = 'Ready to begin';
        this.progressFillEl.style.width = '0%';
        
        this.updateDisplay();
        this.updateNavigationButtons();
    }

    completeWorkout() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.timerLabelEl.textContent = 'Workout Complete!';
        this.phaseInfoEl.textContent = 'Great job!';
        this.progressTextEl.textContent = 'Workout finished';
        this.progressFillEl.style.width = '100%';
        
        this.startBtn.textContent = 'Start Workout';
        this.startBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        this.startBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        this.notify();
        this.announceWorkoutComplete();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress based on current phase
        if (this.currentWorkout && this.currentPhase < this.currentWorkout.phases.length) {
            const phase = this.currentWorkout.phases[this.currentPhase];
            const phaseDurationSeconds = phase.duration * 60;
            const phaseProgress = (this.phaseElapsedTime / phaseDurationSeconds) * 100;
            this.progressFillEl.style.width = Math.min(phaseProgress, 100) + '%';
            
            // Update progress text with current position
            const phases = this.currentWorkout.phases;
            if (this.currentPhase < phases.length) {
                const currentPhase = phases[this.currentPhase];
                const exercise = currentPhase.exercises[this.currentExercise];
                if (exercise) {
                    const phaseTimeRemaining = Math.max(0, phaseDurationSeconds - this.phaseElapsedTime);
                    const phaseMinutes = Math.floor(phaseTimeRemaining / 60);
                    const phaseSeconds = Math.floor(phaseTimeRemaining % 60);
                    this.progressTextEl.textContent = `Phase ${this.currentPhase + 1}/${phases.length} - ${phaseMinutes}:${phaseSeconds.toString().padStart(2, '0')} remaining`;
                }
            }
        }
    }

    notify() {
        if (this.settings.soundEnabled) {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(e => console.log('Audio play failed:', e));
        }
        
        if (this.settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    // Initialize speech synthesis
    initializeSpeech() {
        if ('speechSynthesis' in window) {
            // Wait for voices to load
            speechSynthesis.onvoiceschanged = () => {
                console.log('Speech synthesis ready');
            };
            
            // Force voices to load
            speechSynthesis.getVoices();
        } else {
            console.warn('Speech synthesis not supported');
        }
    }

    // Speech synthesis methods
    speak(text, priority = false) {
        console.log('=== SPEAK CALLED ===');
        console.log('Text:', text, 'Priority:', priority);
        console.log('Voice enabled:', this.settings.voiceEnabled);
        console.log('Speech synthesis available:', !!this.speechSynthesis);
        console.log('Speech synthesis speaking:', this.speechSynthesis ? this.speechSynthesis.speaking : 'N/A');
        console.log('Speech queue length:', this.speechQueue.length);
        console.log('Is speaking:', this.isSpeaking);
        
        if (!this.settings.voiceEnabled || !this.speechSynthesis) {
            console.log('Voice disabled or not supported');
            return;
        }
        
        // If priority, clear queue and current speech
        if (priority) {
            console.log('Priority speech - clearing queue and current speech');
            this.speechSynthesis.cancel();
            this.speechQueue = [];
            this.isSpeaking = false;
        }
        
        // Add to queue
        this.speechQueue.push(text);
        console.log('Added to queue. Queue length now:', this.speechQueue.length);
        
        // Process queue if not currently speaking
        if (!this.isSpeaking) {
            console.log('Not currently speaking, processing queue');
            this.processSpeechQueue();
        } else {
            console.log('Currently speaking, will process queue later');
        }
    }

    processSpeechQueue() {
        if (this.speechQueue.length === 0 || this.isSpeaking) {
            return;
        }
        
        this.isSpeaking = true;
        const text = this.speechQueue.shift();
        
        try {
            // Create new utterance
            this.speechUtterance = new SpeechSynthesisUtterance(text);
            this.speechUtterance.volume = this.settings.voiceVolume;
            this.speechUtterance.rate = this.settings.voiceRate;
            this.speechUtterance.pitch = 1.0;
            
            // Try to use a good voice
            const voices = this.speechSynthesis.getVoices();
            console.log('Available voices:', voices.length);
            if (voices.length > 0) {
                const preferredVoice = voices.find(voice => 
                    voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Microsoft'))
                ) || voices[0];
                this.speechUtterance.voice = preferredVoice;
                console.log('Using voice:', preferredVoice.name);
            }
            
            // Set up event handlers
            this.speechUtterance.onend = () => {
                console.log('Speech ended:', text);
                this.isSpeaking = false;
                // Process next item in queue
                setTimeout(() => this.processSpeechQueue(), 100);
            };
            
            this.speechUtterance.onerror = (error) => {
                console.error('Speech error:', error);
                this.isSpeaking = false;
                // Process next item in queue
                setTimeout(() => this.processSpeechQueue(), 100);
            };
            
            console.log('Speaking:', text);
            this.speechSynthesis.speak(this.speechUtterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            this.isSpeaking = false;
            // Process next item in queue
            setTimeout(() => this.processSpeechQueue(), 100);
        }
    }

    announcePhase(phase, priority = false) {
        console.log('announcePhase called with:', phase.name);
        const message = `${phase.name}.`;
        console.log('Speaking phase message:', message);
        this.speak(message, priority);
    }

    announceExercise(exercise, phaseName, exerciseNumber, totalExercises) {
        console.log('announceExercise called with:', exercise.name);
        console.log('Phase:', phaseName, 'Exercise:', exerciseNumber, 'of', totalExercises);
        const message = `${exercise.name}.`;
        console.log('Speaking exercise message:', message);
        console.log('Voice enabled:', this.settings.voiceEnabled);
        this.speak(message, true);
    }

    announceRest() {
        const message = `Rest.`;
        this.speak(message, true);
    }

    announceWorkoutComplete() {
        const message = "Workout complete! Great job!";
        this.speak(message, true);
    }

    testVoice() {
        console.log('=== VOICE TEST ===');
        console.log('Testing voice...');
        console.log('Voice enabled:', this.settings.voiceEnabled);
        console.log('Speech synthesis available:', !!this.speechSynthesis);
        console.log('Speech synthesis state:', this.speechSynthesis ? 'speaking: ' + this.speechSynthesis.speaking : 'N/A');
        
        // Force voice initialization
        this.initializeSpeech();
        
        const testMessage = "Voice test successful.";
        console.log('Attempting to speak:', testMessage);
        this.speak(testMessage, true);
        
        // Test if we can access voices
        const voices = this.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name + ' (' + v.lang + ')'));
    }

    testAnnouncements() {
        console.log('=== TEST ANNOUNCEMENTS ===');
        
        // Test phase announcement
        const testPhase = { name: "Warm-Up" };
        console.log('Testing phase announcement...');
        this.announcePhase(testPhase);
        
        // Test exercise announcement
        setTimeout(() => {
            const testExercise = { name: "Kettlebell Snatch" };
            console.log('Testing exercise announcement...');
            this.announceExercise(testExercise, "Warm-Up", 1, 3);
        }, 2000);
    }

    // Recovery method to reset app state if it gets stuck
    recoverApp() {
        console.log('=== APP RECOVERY ===');
        
        // Stop everything
        this.isRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Clear speech
        try {
            if (this.speechSynthesis) {
                this.speechSynthesis.cancel();
            }
        } catch (e) {
            console.log('Error clearing speech during recovery:', e);
        }
        
        this.speechQueue = [];
        this.isSpeaking = false;
        
        // Reset UI
        this.startBtn.textContent = 'Start Workout';
        this.startBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        this.startBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        
        this.timerLabelEl.textContent = 'Select a workout';
        this.phaseInfoEl.textContent = '';
        this.progressTextEl.textContent = 'Ready to begin';
        this.progressFillEl.style.width = '0%';
        
        this.updateDisplay();
        this.updateNavigationButtons();
        
        console.log('App recovered and reset');
    }

    toggleSettings() {
        this.settingsContent.classList.toggle('hidden');
    }

    loadSettings() {
        const saved = localStorage.getItem('bjjWorkoutSettings');
        console.log('Loading settings from localStorage:', saved);
        
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            console.log('Loaded settings:', this.settings);
        }
        
        // Apply settings to UI elements
        this.soundEnabledCheckbox.checked = this.settings.soundEnabled;
        this.vibrationEnabledCheckbox.checked = this.settings.vibrationEnabled;
        this.autoAdvanceCheckbox.checked = this.settings.autoAdvance;
        this.voiceEnabledCheckbox.checked = this.settings.voiceEnabled;
        this.voiceVolumeSlider.value = this.settings.voiceVolume;
        this.voiceRateSlider.value = this.settings.voiceRate;
        
        // Update displays
        document.getElementById('volume-display').textContent = Math.round(this.settings.voiceVolume * 100) + '%';
        document.getElementById('rate-display').textContent = this.settings.voiceRate + 'x';
        
        console.log('Voice enabled after loading:', this.settings.voiceEnabled);
    }

    saveSettings() {
        this.settings.soundEnabled = this.soundEnabledCheckbox.checked;
        this.settings.vibrationEnabled = this.vibrationEnabledCheckbox.checked;
        this.settings.autoAdvance = this.autoAdvanceCheckbox.checked;
        this.settings.voiceEnabled = this.voiceEnabledCheckbox.checked;
        this.settings.voiceVolume = parseFloat(this.voiceVolumeSlider.value);
        this.settings.voiceRate = parseFloat(this.voiceRateSlider.value);
        
        console.log('Saving settings:', this.settings);
        localStorage.setItem('bjjWorkoutSettings', JSON.stringify(this.settings));
    }

    // Workout Data
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
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" }
                        ],
                        repeat: 4
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

    // Exercise Library
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
                description: "Front-loaded squat with kettlebell held at chest",
                cues: [
                    "Hold KB at chest with elbows in",
                    "Keep chest up and core tight",
                    "Squat down with full depth",
                    "Drive through heels to stand",
                    "Maintain upright posture throughout"
                ]
            },
            "Kettlebell Clean": {
                type: "Power",
                description: "Explosive movement bringing kettlebell to rack position",
                cues: [
                    "Start with swing motion",
                    "Pull bell to chest explosively",
                    "Receive in rack position at shoulder",
                    "Keep elbow close to body",
                    "Control the movement smoothly"
                ]
            },
            "Overhead Press": {
                type: "Strength",
                description: "Strict press or push-press of kettlebell overhead",
                cues: [
                    "Start with KB in rack position",
                    "Brace core and maintain posture",
                    "Press directly overhead",
                    "Lock out arm at top",
                    "Control descent back to rack"
                ]
            },
            "Farmer's Carry": {
                type: "Endurance",
                description: "Unilateral carry exercise for grip and core stability",
                cues: [
                    "Hold KB in one hand like a suitcase",
                    "Keep shoulders level and core tight",
                    "Walk with good posture",
                    "Breathe steadily throughout",
                    "Switch hands for balance"
                ]
            },
            "Push-Up": {
                type: "Strength",
                description: "Bodyweight upper body pushing exercise",
                cues: [
                    "Start in plank position",
                    "Lower chest to ground",
                    "Keep body in straight line",
                    "Push back up explosively",
                    "Maintain core tension throughout"
                ]
            },
            "Burpee": {
                type: "Conditioning",
                description: "Full-body conditioning exercise combining squat, push-up, and jump",
                cues: [
                    "Start standing, drop to squat",
                    "Kick feet back to plank",
                    "Perform push-up",
                    "Jump feet back to squat",
                    "Explode up with jump"
                ]
            },
            "Kettlebell Halo": {
                type: "Mobility",
                description: "Shoulder mobility exercise with kettlebell rotation",
                cues: [
                    "Hold KB by the horns at chest",
                    "Circle around head in both directions",
                    "Keep core tight throughout",
                    "Maintain shoulder stability",
                    "Move slowly and controlled"
                ]
            },
            "One-Arm Kettlebell Row": {
                type: "Strength",
                description: "Unilateral rowing movement targeting upper back and grip",
                cues: [
                    "Staggered stance, hinge at hips",
                    "Row KB up with elbow close to ribs",
                    "Keep core braced and glutes engaged",
                    "Control the descent back down",
                    "Alternate sides for balance"
                ]
            },
            "Kettlebell Thruster": {
                type: "Power",
                description: "Combined goblet squat and push press for full-body power",
                cues: [
                    "Hold KB at chest, do full deep squat",
                    "Explode up and press KB overhead",
                    "Use leg drive to assist the press",
                    "Control descent back to squat",
                    "Maintain upright posture throughout"
                ]
            },
            "Towel Hang": {
                type: "Endurance",
                description: "Grip endurance exercise using towel and kettlebell",
                cues: [
                    "Loop towel through KB handle",
                    "Hold towel ends with both hands",
                    "Let KB hang while maintaining grip",
                    "Keep shoulders engaged and core tight",
                    "Hold for time or until grip fails"
                ]
            }
        };
    }

    logWorkoutProgress() {
        if (!this.currentWorkout) return;
        
        const phases = this.currentWorkout.phases;
        console.log('=== WORKOUT PROGRESS ===');
        console.log('Current phase:', this.currentPhase + 1, 'of', phases.length);
        console.log('Current exercise:', this.currentExercise + 1, 'of', phases[this.currentPhase]?.exercises.length || 0);
        console.log('Time remaining:', this.timeRemaining);
        console.log('Is running:', this.isRunning);
    }

    skipExercise() {
        console.log('=== SKIP EXERCISE ===');
        console.log('Current phase:', this.currentPhase, 'Current exercise:', this.currentExercise);
        
        try {
            if (!this.currentWorkout) {
                console.log('No current workout selected');
                return;
            }
            
            if (!this.isRunning) {
                console.log('Workout is not running');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped');
            }
            
            // Clear any ongoing speech safely
            try {
                if (this.speechSynthesis && this.speechSynthesis.speaking) {
                    this.speechSynthesis.cancel();
                }
            } catch (e) {
                console.log('Error clearing speech:', e);
            }
            
            this.speechQueue = [];
            this.isSpeaking = false;
            
            const phases = this.currentWorkout.phases;
            
            // Check if we've completed all phases
            if (this.currentPhase >= phases.length) {
                console.log('All phases complete');
                this.completeWorkout();
                return;
            }
            
            const phase = phases[this.currentPhase];
            
            // Move to next exercise within the current phase
            this.currentExercise++;
            
            // If we've completed all exercises in this phase, move to next phase
            if (this.currentExercise >= phase.exercises.length) {
                console.log('Completed all exercises in phase, moving to next phase');
                this.currentPhase++;
                this.currentExercise = 0;
                
                // Check if we've completed all phases
                if (this.currentPhase >= phases.length) {
                    console.log('All phases complete');
                    this.completeWorkout();
                    return;
                }
            }
            
            console.log('New position - Phase:', this.currentPhase, 'Exercise:', this.currentExercise);
            this.startNextExercise();
            
            // Update navigation buttons after the change
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('Error in skipExercise:', error);
            // Try to recover by resetting state
            this.isRunning = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    goBack() {
        console.log('=== GO BACK ===');
        
        try {
            if (!this.currentWorkout) {
                console.log('No current workout selected');
                return;
            }
            
            if (!this.isRunning) {
                console.log('Workout is not running');
                return;
            }
            
            // Stop current timer safely
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
                console.log('Timer stopped in goBack');
            }
            
            // Clear any ongoing speech safely
            try {
                if (this.speechSynthesis && this.speechSynthesis.speaking) {
                    this.speechSynthesis.cancel();
                }
            } catch (e) {
                console.log('Error clearing speech:', e);
            }
            
            this.speechQueue = [];
            this.isSpeaking = false;
            
            // Move directly to previous exercise without announcing
            console.log('Executing previousExercise after goBack');
            this.previousExercise();
            
        } catch (error) {
            console.error('Error in goBack:', error);
            // Try to recover by resetting state
            this.isRunning = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    previousExercise() {
        console.log('previousExercise called');
        
        try {
            if (!this.isRunning) {
                console.log('Workout is not running, not proceeding');
                return;
            }
            
            if (!this.currentWorkout) {
                console.log('No current workout, not proceeding');
                return;
            }

            // Move to previous exercise (could be in same phase or previous phase)
            this.currentExercise--;
            
            // Check if we need to move to previous phase
            if (this.currentExercise < 0) {
                this.currentPhase--;
                
                // Check if we've gone before the first phase
                if (this.currentPhase < 0) {
                    console.log('At the beginning, cannot go back further');
                    this.currentPhase = 0;
                    this.currentExercise = 0;
                } else {
                    // Go to last exercise of previous phase
                    const phase = this.currentWorkout.phases[this.currentPhase];
                    this.currentExercise = phase.exercises.length - 1;
                }
            }
            
            console.log('New position - Phase:', this.currentPhase, 'Exercise:', this.currentExercise);
            
            // Ensure we're still running before starting next exercise
            if (this.isRunning && this.currentWorkout) {
                this.startNextExercise();
            }
            
        } catch (error) {
            console.error('Error in previousExercise:', error);
            // Try to recover
            this.isRunning = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    updateNavigationButtons() {
        if (!this.currentWorkout) {
            this.backBtn.disabled = true;
            this.skipBtn.disabled = true;
            return;
        }
        
        const phases = this.currentWorkout.phases;
        
        // Back button is disabled if we're at the very beginning
        const isAtBeginning = this.currentPhase === 0 && this.currentExercise === 0;
        this.backBtn.disabled = isAtBeginning;
        
        // Skip button is disabled if we're at the very end (last exercise of last phase)
        const isAtLastPhase = this.currentPhase >= phases.length - 1;
        const isAtLastExercise = isAtLastPhase && this.currentExercise >= phases[this.currentPhase].exercises.length - 1;
        
        this.skipBtn.disabled = isAtLastExercise;
        
        console.log('Navigation buttons updated - Back disabled:', isAtBeginning, 'Skip disabled:', isAtLastExercise);
        console.log('Current phase:', this.currentPhase, 'Current exercise:', this.currentExercise);
    }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BJJWorkoutApp();
}); 