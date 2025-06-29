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
        
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = null;
        this.speechQueue = [];
        this.isSpeaking = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.populateExerciseLibrary();
        this.initializeSpeech();
    }

    initializeElements() {
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.timerLabelEl = document.getElementById('timer-label');
        this.phaseInfoEl = document.getElementById('phase-info');
        this.progressFillEl = document.getElementById('progress-fill');
        this.progressTextEl = document.getElementById('progress-text');
        this.startBtn = document.getElementById('start-timer');
        this.resetBtn = document.getElementById('reset-timer');
        this.backBtn = document.getElementById('back-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.dayButtons = document.querySelectorAll('.day-btn');
        this.workoutDetailsEl = document.getElementById('workout-details');
        this.exerciseGridEl = document.getElementById('exercise-grid');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsContent = document.getElementById('settings-content');
        this.soundEnabledCheckbox = document.getElementById('sound-enabled');
        this.vibrationEnabledCheckbox = document.getElementById('vibration-enabled');
        this.autoAdvanceCheckbox = document.getElementById('auto-advance');
        this.voiceEnabledCheckbox = document.getElementById('voice-enabled');
        this.voiceVolumeSlider = document.getElementById('voice-volume');
        this.voiceRateSlider = document.getElementById('voice-rate');
        this.modal = document.getElementById('exercise-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.modalCues = document.getElementById('modal-cues');
        this.closeModalBtn = document.getElementById('close-modal');
        this.notificationSound = document.getElementById('notification-sound');
    }

    bindEvents() {
        this.dayButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectDay(parseInt(btn.dataset.day)));
        });
        this.startBtn.addEventListener('click', () => this.toggleWorkout());
        this.resetBtn.addEventListener('click', () => this.resetWorkout());
        this.backBtn.addEventListener('click', () => this.goBack());
        this.skipBtn.addEventListener('click', () => this.skipExercise());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    selectDay(day) {
        this.currentDay = day;
        this.currentWorkout = this.getWorkoutData()[day];
        
        this.dayButtons.forEach(btn => {
            const isActive = parseInt(btn.dataset.day) === day;
            if (isActive) {
                btn.classList.remove('border-gray-200', 'bg-white');
                btn.classList.add('border-bjj-blue', 'bg-gradient-to-br', 'from-bjj-blue', 'to-bjj-light-blue', 'text-white', 'shadow-lg');
            } else {
                btn.classList.remove('border-bjj-blue', 'bg-gradient-to-br', 'from-bjj-blue', 'to-bjj-light-blue', 'text-white', 'shadow-lg');
                btn.classList.add('border-gray-200', 'bg-white');
            }
        });

        this.displayWorkoutDetails();
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
            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-bjj-blue hover:shadow-lg transition-all duration-300 cursor-pointer" 
                 onclick="app.showExerciseModal('${name}')">
                <h4 class="text-bjj-blue mb-3 text-lg font-semibold">${name}</h4>
                <p class="text-gray-600 text-sm mb-3">${data.description}</p>
                <span class="inline-block bg-bjj-blue text-white px-3 py-1 rounded-full text-xs font-medium">${data.type}</span>
            </div>
        `).join('');
    }

    showExerciseModal(exerciseName) {
        const exercise = this.getExerciseLibrary()[exerciseName];
        if (!exercise) return;

        this.modalTitle.textContent = exerciseName;
        this.modalDescription.textContent = exercise.description;
        this.modalCues.innerHTML = exercise.cues.map(cue => 
            `<li class="py-2 border-b border-gray-200 text-gray-600 last:border-b-0">${cue}</li>`
        ).join('');

        this.modal.classList.add('modal--active');
        this.modal.setAttribute('aria-hidden', 'false');
    }

    closeModal() {
        this.modal.classList.remove('modal--active');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    toggleWorkout() {
        if (this.isRunning) {
            this.pauseWorkout();
        } else {
            this.startWorkout();
        }
    }

    startWorkout() {
        if (!this.currentWorkout) {
            alert('Please select a workout first');
            return;
        }

        this.isRunning = true;
        this.startBtn.innerHTML = '<i data-lucide="pause" class="w-5 h-5 mr-2"></i>Pause';
        
        // Reinitialize Lucide icons after HTML change
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        if (this.currentPhase === 0 && this.currentExercise === 0) {
            this.startNextPhase();
        } else {
            this.startTimer();
        }

        this.updateNavigationButtons();
    }

    startNextPhase() {
        const phases = this.currentWorkout.phases;
        
        if (this.currentPhase >= phases.length) {
            this.completeWorkout();
            return;
        }

        const phase = phases[this.currentPhase];
        this.phaseStartTime = Date.now();
        this.currentExercise = 0;
        this.phaseInfoEl.textContent = `Phase ${this.currentPhase + 1}: ${phase.name}`;
        
        this.startNextExercise();
    }

    startNextExercise() {
        const phases = this.currentWorkout.phases;
        const phase = phases[this.currentPhase];
        
        if (this.currentExercise >= phase.exercises.length) {
            this.currentPhase++;
            this.startNextPhase();
            return;
        }

        const exercise = phase.exercises[this.currentExercise];
        this.timeRemaining = exercise.duration;
        this.timerLabelEl.textContent = `${exercise.name} - ${exercise.description}`;
        
        this.updateDisplay();
        this.startTimer();
        
        if (this.settings.voiceEnabled) {
            this.speak(`${exercise.name}. ${exercise.description}`);
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.currentExercise++;
                
                if (this.settings.autoAdvance) {
                    this.startNextExercise();
                } else {
                    this.pauseWorkout();
                }
            }
        }, 1000);
    }

    pauseWorkout() {
        this.isRunning = false;
        
        // Stop any current speech when pausing
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
            this.speechQueue = [];
            this.isSpeaking = false;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.startBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 mr-2"></i>Resume';
        
        // Reinitialize Lucide icons after HTML change
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    resetWorkout() {
        this.pauseWorkout();
        
        // Stop any current speech when resetting
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
            this.speechQueue = [];
            this.isSpeaking = false;
        }
        
        this.currentPhase = 0;
        this.currentExercise = 0;
        this.timeRemaining = 0;
        this.phaseStartTime = 0;
        this.phaseElapsedTime = 0;
        
        this.startBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 mr-2"></i>Start Workout';
        this.timerLabelEl.textContent = this.currentWorkout ? 'Ready to start' : 'Select a workout';
        this.phaseInfoEl.textContent = '';
        
        // Reinitialize Lucide icons after HTML change
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
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
        this.startBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 mr-2"></i>Start Workout';
        
        // Reinitialize Lucide icons after HTML change
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        if (this.settings.voiceEnabled) {
            this.speak('Workout complete! Great job!');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        if (this.currentWorkout) {
            const totalExercises = this.currentWorkout.phases.reduce((sum, phase) => sum + phase.exercises.length, 0);
            const completedExercises = this.currentWorkout.phases.slice(0, this.currentPhase).reduce((sum, phase) => sum + phase.exercises.length, 0) + this.currentExercise;
            const progress = (completedExercises / totalExercises) * 100;
            
            this.progressFillEl.style.width = `${progress}%`;
            this.progressTextEl.textContent = `${completedExercises} of ${totalExercises} exercises`;
        }
    }

    skipExercise() {
        if (!this.isRunning || !this.currentWorkout) return;
        
        // Stop any current speech
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
            this.speechQueue = [];
            this.isSpeaking = false;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.currentExercise++;
        const phases = this.currentWorkout.phases;
        const phase = phases[this.currentPhase];
        
        if (this.currentExercise >= phase.exercises.length) {
            this.currentPhase++;
            this.currentExercise = 0;
            
            if (this.currentPhase >= phases.length) {
                this.completeWorkout();
                return;
            }
            
            this.startNextPhase();
        } else {
            this.startNextExercise();
        }
        
        this.updateNavigationButtons();
    }

    goBack() {
        if (!this.isRunning || !this.currentWorkout) return;
        
        // Stop any current speech
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
            this.speechQueue = [];
            this.isSpeaking = false;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.currentExercise--;
        
        if (this.currentExercise < 0) {
            this.currentPhase--;
            if (this.currentPhase < 0) {
                this.currentPhase = 0;
                this.currentExercise = 0;
            } else {
                const phase = this.currentWorkout.phases[this.currentPhase];
                this.currentExercise = phase.exercises.length - 1;
            }
        }
        
        this.startNextExercise();
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        if (this.backBtn) {
            this.backBtn.disabled = this.currentExercise === 0 && this.currentPhase === 0;
        }
        
        if (this.skipBtn) {
            this.skipBtn.disabled = !this.isRunning;
        }
    }

    toggleSettings() {
        this.settingsContent.classList.toggle('settings-content--active');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('bjj-workout-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    initializeSpeech() {
        if (!this.speechSynthesis) return;
        console.log('Speech synthesis ready');
    }

    speak(text, priority = false) {
        if (!this.settings.voiceEnabled || !this.speechSynthesis) return;
        
        if (priority) {
            this.speechSynthesis.cancel();
            this.speechQueue = [];
        }
        
        this.speechQueue.push(text);
        this.processSpeechQueue();
    }

    processSpeechQueue() {
        if (this.isSpeaking || this.speechQueue.length === 0) return;
        
        const text = this.speechQueue.shift();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.volume = this.settings.voiceVolume;
        utterance.rate = this.settings.voiceRate;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        utterance.onerror = () => {
            this.isSpeaking = false;
            setTimeout(() => this.processSpeechQueue(), 100);
        };
        
        this.speechSynthesis.speak(utterance);
    }

    getWorkoutData() {
        return {
            1: {
                name: "Kettlebell Snatch Intervals",
                focus: "Power and Explosiveness",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 180, description: "Joint mobility and movement prep" },
                            { name: "Light Kettlebell Swings", duration: 120, description: "15-20 light swings" }
                        ]
                    },
                    {
                        name: "Snatch Practice",
                        duration: 5,
                        exercises: [
                            { name: "Snatch Technique", duration: 300, description: "Practice form with light weight" }
                        ]
                    },
                    {
                        name: "Interval Training",
                        duration: 15,
                        exercises: [
                            { name: "Right Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Left Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Right Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Left Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Right Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Left Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Right Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" },
                            { name: "Left Arm Snatches", duration: 30, description: "30 seconds max reps" },
                            { name: "Rest", duration: 30, description: "30 seconds recovery" }
                        ]
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Light Movement", duration: 180, description: "Easy walking and stretching" },
                            { name: "Breathing Exercise", duration: 120, description: "Deep breathing for recovery" }
                        ]
                    }
                ]
            },
            2: {
                name: "EMOM Kettlebell Circuit",
                focus: "Strength-Endurance",
                duration: 30,
                phases: [
                    {
                        name: "Warm-Up",
                        duration: 5,
                        exercises: [
                            { name: "Dynamic Warm-Up", duration: 180, description: "Joint mobility and movement prep" },
                            { name: "Movement Practice", duration: 120, description: "Practice all movements" }
                        ]
                    },
                    {
                        name: "EMOM Circuit",
                        duration: 20,
                        exercises: [
                            { name: "Minute 1: Swings", duration: 60, description: "20 swings, rest remainder" },
                            { name: "Minute 2: Goblet Squats", duration: 60, description: "15 squats, rest remainder" },
                            { name: "Minute 3: Single-Arm Rows", duration: 60, description: "10 each arm, rest remainder" },
                            { name: "Minute 4: Push-Ups", duration: 60, description: "10-15 reps, rest remainder" },
                            { name: "Minute 5: Swings", duration: 60, description: "20 swings, rest remainder" },
                            { name: "Minute 6: Goblet Squats", duration: 60, description: "15 squats, rest remainder" },
                            { name: "Minute 7: Single-Arm Rows", duration: 60, description: "10 each arm, rest remainder" },
                            { name: "Minute 8: Push-Ups", duration: 60, description: "10-15 reps, rest remainder" },
                            { name: "Minute 9: Swings", duration: 60, description: "20 swings, rest remainder" },
                            { name: "Minute 10: Goblet Squats", duration: 60, description: "15 squats, rest remainder" },
                            { name: "Minute 11: Single-Arm Rows", duration: 60, description: "10 each arm, rest remainder" },
                            { name: "Minute 12: Push-Ups", duration: 60, description: "10-15 reps, rest remainder" },
                            { name: "Minute 13: Swings", duration: 60, description: "20 swings, rest remainder" },
                            { name: "Minute 14: Goblet Squats", duration: 60, description: "15 squats, rest remainder" },
                            { name: "Minute 15: Single-Arm Rows", duration: 60, description: "10 each arm, rest remainder" },
                            { name: "Minute 16: Push-Ups", duration: 60, description: "10-15 reps, rest remainder" },
                            { name: "Minute 17: Swings", duration: 60, description: "20 swings, rest remainder" },
                            { name: "Minute 18: Goblet Squats", duration: 60, description: "15 squats, rest remainder" },
                            { name: "Minute 19: Single-Arm Rows", duration: 60, description: "10 each arm, rest remainder" },
                            { name: "Minute 20: Push-Ups", duration: 60, description: "10-15 reps, rest remainder" }
                        ]
                    },
                    {
                        name: "Cooldown",
                        duration: 5,
                        exercises: [
                            { name: "Active Stretching", duration: 300, description: "Full body stretching routine" }
                        ]
                    }
                ]
            },
            3: {
                name: "Aerobic Base and Core Strength",
                focus: "Endurance and Core",
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
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
                            { name: "Turkish Get-Up", duration: 120, description: "1 rep each side" },
                            { name: "Kettlebell Halos", duration: 30, description: "5 rotations each direction" },
                            { name: "Goblet Reverse Lunges", duration: 60, description: "5 each leg" },
                            { name: "Plank Pull-Through", duration: 60, description: "5 each side" },
                            { name: "Light Jogging", duration: 30, description: "30 seconds easy movement" },
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
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" },
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" }
                        ]
                    },
                    {
                        name: "Optional Finisher",
                        duration: 2,
                        exercises: [
                            { name: "30-20-10 Ladder", duration: 120, description: "High-pulls and burpees" }
                        ]
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
                            { name: "Rest", duration: 30, description: "30 seconds rest" },
                            { name: "Towel Hang", duration: 30, description: "30 seconds per set" },
                            { name: "Rest", duration: 30, description: "30 seconds rest" },
                            { name: "Towel Hang", duration: 30, description: "30 seconds per set" },
                            { name: "Rest", duration: 30, description: "30 seconds rest" }
                        ]
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
                description: "Complex full-body movement from lying to standing with kettlebell overhead",
                cues: [
                    "Start lying down with kettlebell pressed overhead",
                    "Keep eyes on the bell throughout movement",
                    "Roll to elbow, then to hand",
                    "Bridge up and sweep leg through",
                    "Stand up while maintaining overhead position"
                ]
            },
            "Goblet Squat": {
                type: "Strength",
                description: "Front-loaded squat holding kettlebell at chest level",
                cues: [
                    "Hold kettlebell close to chest",
                    "Feet shoulder-width apart",
                    "Squat down keeping chest up",
                    "Drive through heels to stand",
                    "Keep knees tracking over toes"
                ]
            },
            "Single-Arm Row": {
                type: "Strength",
                description: "Unilateral pulling movement for back and core strength",
                cues: [
                    "Hinge at hips with one hand supported",
                    "Pull kettlebell to hip",
                    "Keep core tight and spine neutral",
                    "Control the descent",
                    "Squeeze shoulder blade at top"
                ]
            },
            "Kettlebell Press": {
                type: "Strength",
                description: "Overhead pressing movement with kettlebell",
                cues: [
                    "Start with bell in rack position",
                    "Press straight up overhead",
                    "Keep core tight",
                    "Lock out arm completely",
                    "Control the descent back to rack"
                ]
            },
            "Kettlebell Clean": {
                type: "Power",
                description: "Explosive movement bringing kettlebell to rack position",
                cues: [
                    "Start with swing motion",
                    "Pull bell up close to body",
                    "Flip bell over hand into rack",
                    "Absorb with slight knee bend",
                    "Keep wrist straight"
                ]
            },
            "Plank Pull-Through": {
                type: "Core",
                description: "Anti-rotation core exercise with dynamic component",
                cues: [
                    "Start in plank position",
                    "Reach under body to grab kettlebell",
                    "Pull through to opposite side",
                    "Maintain plank throughout",
                    "Resist rotation of hips"
                ]
            },
            "Kettlebell Halos": {
                type: "Mobility",
                description: "Shoulder mobility exercise moving kettlebell around head",
                cues: [
                    "Hold kettlebell by horns",
                    "Circle around head slowly",
                    "Keep core engaged",
                    "Maintain good posture",
                    "Control the movement"
                ]
            },
            "Goblet Reverse Lunge": {
                type: "Strength",
                description: "Backward stepping lunge with front-loaded weight",
                cues: [
                    "Hold kettlebell at chest",
                    "Step back into lunge",
                    "Lower back knee toward ground",
                    "Push through front heel to return",
                    "Keep torso upright"
                ]
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new BJJWorkoutApp();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}); 