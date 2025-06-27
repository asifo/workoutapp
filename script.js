class BJJWorkoutApp {
    constructor() {
        this.currentDay = null;
        this.currentWorkout = null;
        this.isRunning = false;
        this.currentPhase = 0;
        this.currentExercise = 0;
        this.timer = null;
        this.timeRemaining = 0;
        this.settings = {
            soundEnabled: true,
            vibrationEnabled: true,
            autoAdvance: true,
            restDuration: 60
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.populateExerciseLibrary();
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
        this.restDurationSelect = document.getElementById('rest-duration');

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

        // Settings
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.soundEnabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.vibrationEnabledCheckbox.addEventListener('change', () => this.saveSettings());
        this.autoAdvanceCheckbox.addEventListener('change', () => this.saveSettings());
        this.restDurationSelect.addEventListener('change', () => this.saveSettings());

        // Modal
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    selectDay(day) {
        this.currentDay = day;
        this.currentWorkout = this.getWorkoutData()[day];
        
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
        if (!this.currentWorkout) return;

        this.isRunning = true;
        
        // Check if we're resuming from a pause or starting fresh
        const isResuming = this.currentPhase > 0 || this.currentExercise > 0 || this.timeRemaining > 0;
        
        if (!isResuming) {
            // Starting fresh - reset to beginning
            this.currentPhase = 0;
            this.currentExercise = 0;
            this.startNextPhase();
        } else {
            // Resuming from pause - just restart the timer
            this.startTimer();
        }
        
        this.startBtn.textContent = 'Pause';
        this.startBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        this.startBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }

    startNextPhase() {
        if (!this.isRunning || !this.currentWorkout) return;

        const phases = this.currentWorkout.phases;
        if (this.currentPhase >= phases.length) {
            this.completeWorkout();
            return;
        }

        const phase = phases[this.currentPhase];
        
        // Only reset currentExercise if we're not resuming from a pause
        if (this.timeRemaining <= 0) {
            this.currentExercise = 0;
        }
        
        this.timerLabelEl.textContent = phase.name;
        this.phaseInfoEl.textContent = `Phase ${this.currentPhase + 1} of ${phases.length}`;
        
        this.startNextExercise();
    }

    startNextExercise() {
        if (!this.isRunning || !this.currentWorkout) return;

        const phase = this.currentWorkout.phases[this.currentPhase];
        if (this.currentExercise >= phase.exercises.length) {
            this.currentPhase++;
            this.startNextPhase();
            return;
        }

        const exercise = phase.exercises[this.currentExercise];
        
        // Only set timeRemaining if it's not already set (i.e., not resuming from pause)
        if (this.timeRemaining <= 0) {
            this.timeRemaining = exercise.duration;
        }
        
        this.timerLabelEl.textContent = exercise.name;
        this.phaseInfoEl.textContent = `${phase.name} - ${this.currentExercise + 1}/${phase.exercises.length}`;
        
        this.updateDisplay();
        this.startTimer();
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.notify();
                this.nextExercise();
            }
        }, 1000);
    }

    nextExercise() {
        if (!this.isRunning) return;

        this.currentExercise++;
        const phase = this.currentWorkout.phases[this.currentPhase];
        
        if (this.currentExercise >= phase.exercises.length) {
            this.currentPhase++;
            if (this.settings.autoAdvance) {
                this.startNextPhase();
            } else {
                this.pauseWorkout();
            }
        } else {
            if (this.settings.autoAdvance) {
                this.startNextExercise();
            } else {
                this.pauseWorkout();
            }
        }
    }

    pauseWorkout() {
        this.isRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.startBtn.textContent = 'Resume';
        this.startBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        this.startBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }

    resetWorkout() {
        this.pauseWorkout();
        this.currentPhase = 0;
        this.currentExercise = 0;
        this.timeRemaining = 0;
        
        this.startBtn.textContent = 'Start Workout';
        this.timerLabelEl.textContent = 'Select a workout';
        this.phaseInfoEl.textContent = '';
        this.progressTextEl.textContent = 'Ready to begin';
        this.progressFillEl.style.width = '0%';
        
        this.updateDisplay();
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
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress
        if (this.currentWorkout) {
            const totalTime = this.currentWorkout.duration * 60;
            const elapsedTime = totalTime - this.timeRemaining;
            const progress = (elapsedTime / totalTime) * 100;
            this.progressFillEl.style.width = Math.min(progress, 100) + '%';
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

    toggleSettings() {
        this.settingsContent.classList.toggle('hidden');
    }

    loadSettings() {
        const saved = localStorage.getItem('bjjWorkoutSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.soundEnabledCheckbox.checked = this.settings.soundEnabled;
            this.vibrationEnabledCheckbox.checked = this.settings.vibrationEnabled;
            this.autoAdvanceCheckbox.checked = this.settings.autoAdvance;
            this.restDurationSelect.value = this.settings.restDuration;
        }
    }

    saveSettings() {
        this.settings.soundEnabled = this.soundEnabledCheckbox.checked;
        this.settings.vibrationEnabled = this.vibrationEnabledCheckbox.checked;
        this.settings.autoAdvance = this.autoAdvanceCheckbox.checked;
        this.settings.restDuration = parseInt(this.restDurationSelect.value);
        
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
                            { name: "Right Arm Snatches", duration: 15, description: "15 seconds work, 15 seconds rest" },
                            { name: "Left Arm Snatches", duration: 15, description: "15 seconds work, 15 seconds rest" }
                        ],
                        repeat: 20
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
                            { name: "Swings + Push-Ups", duration: 60, description: "15 swings + 5 push-ups" },
                            { name: "Goblet Squats", duration: 60, description: "10 goblet squats" }
                        ],
                        repeat: 12
                    },
                    {
                        name: "Farmer's Carry",
                        duration: 3,
                        exercises: [
                            { name: "Right Arm Carry", duration: 30, description: "30 seconds per arm" },
                            { name: "Left Arm Carry", duration: 30, description: "30 seconds per arm" }
                        ],
                        repeat: 3
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
                            { name: "Right Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Left Arm Complex", duration: 45, description: "5 swings, 5 cleans, 5 presses, 5 squats" },
                            { name: "Rest", duration: 90, description: "Recovery between rounds" }
                        ],
                        repeat: 3
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
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BJJWorkoutApp();
}); 