// Animation Utilities for Enhanced UI

export class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.setupIntersectionObserver();
    }

    // Smooth number counting animation
    animateNumber(element, start, end, duration = 1000, callback = null) {
        const startTime = performance.now();
        const difference = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (difference * easeOut));
            
            element.textContent = current.toString().padStart(2, '0');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };

        requestAnimationFrame(animate);
    }

    // Pulse animation for timer
    pulseTimer(element, isActive = true) {
        if (isActive) {
            element.classList.add('timer-display--pulse');
        } else {
            element.classList.remove('timer-display--pulse');
        }
    }

    // Countdown animation for last 5 seconds
    countdownAnimation(element) {
        element.classList.add('timer-display--countdown');
        setTimeout(() => {
            element.classList.remove('timer-display--countdown');
        }, 1000);
    }

    // Progress bar animation
    animateProgress(element, percentage, duration = 500) {
        const startWidth = parseFloat(element.style.width) || 0;
        const targetWidth = Math.min(Math.max(percentage, 0), 100);
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing
            const easeOut = 1 - Math.pow(1 - progress, 2);
            const currentWidth = startWidth + (targetWidth - startWidth) * easeOut;
            
            element.style.width = `${currentWidth}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Button press animation
    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.transition = '';
        }, 100);
    }

    // Card flip animation for day selection
    animateCardFlip(card, isActive) {
        const duration = 300;
        
        if (isActive) {
            card.style.transform = 'rotateY(180deg)';
            setTimeout(() => {
                card.classList.add('day-btn--active');
                card.style.transform = 'rotateY(360deg)';
            }, duration / 2);
            setTimeout(() => {
                card.style.transform = '';
            }, duration);
        } else {
            card.classList.remove('day-btn--active');
        }
    }

    // Stagger animation for multiple elements
    staggerAnimation(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }

    // Parallax scroll effect
    setupParallax(element, speed = 0.5) {
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * speed;
            element.style.transform = `translateY(${parallax}px)`;
        };

        window.addEventListener('scroll', updateParallax, { passive: true });
        return () => window.removeEventListener('scroll', updateParallax);
    }

    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
    }

    // Observe element for scroll animations
    observeElement(element) {
        this.intersectionObserver.observe(element);
    }

    // Unobserve element
    unobserveElement(element) {
        this.intersectionObserver.unobserve(element);
    }

    // Shake animation for errors
    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // Bounce animation for success
    bounceElement(element) {
        element.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Celebration animation for workout completion
    celebrationAnimation(element) {
        // Add celebration class with keyframe animation
        element.classList.add('celebration-pulse');
        
        // Create confetti-like effect
        this.createConfettiEffect(element);
        
        // Remove class after animation
        setTimeout(() => {
            element.classList.remove('celebration-pulse');
        }, 2000);
    }

    // Create confetti effect
    createConfettiEffect(targetElement) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        const rect = targetElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${centerX}px;
                top: ${centerY}px;
            `;

            document.body.appendChild(confetti);

            // Animate confetti
            const angle = (Math.PI * 2 * i) / 20;
            const velocity = 150 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 200; // Add upward bias

            confetti.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 1500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                document.body.removeChild(confetti);
            };
        }
    }

    // Slide in animation
    slideIn(element, direction = 'left', duration = 300) {
        const directions = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };

        element.style.transform = directions[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;

        setTimeout(() => {
            element.style.transform = 'translate(0)';
            element.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            element.style.transition = '';
        }, duration + 10);
    }

    // Fade animation
    fade(element, fadeIn = true, duration = 300) {
        if (fadeIn) {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            setTimeout(() => {
                element.style.opacity = '1';
            }, 10);
        } else {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';
        }

        setTimeout(() => {
            element.style.transition = '';
        }, duration + 10);
    }

    // Modal animations
    animateModal(modal, show = true) {
        const content = modal.querySelector('.modal__content');
        
        if (show) {
            modal.classList.add('modal--open');
            this.fade(modal, true, 200);
            setTimeout(() => {
                content.style.transform = 'scale(1) translateY(0)';
            }, 50);
        } else {
            content.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => {
                this.fade(modal, false, 200);
                setTimeout(() => {
                    modal.classList.remove('modal--open');
                }, 200);
            }, 100);
        }
    }

    // Cleanup all animations
    cleanup() {
        this.animations.clear();
        this.observers.clear();
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }
}

// CSS animations to be added to the stylesheet
export const animationCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes bounce {
    0%, 20%, 60%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    80% { transform: translateY(-10px); }
}

@keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideInUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes zoomIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.animate-in {
    animation: fadeIn 0.6s ease-out;
}

.animate-slide-in-left {
    animation: slideInLeft 0.5s ease-out;
}

.animate-slide-in-right {
    animation: slideInRight 0.5s ease-out;
}

.animate-slide-in-up {
    animation: slideInUp 0.5s ease-out;
}

.animate-slide-in-down {
    animation: slideInDown 0.5s ease-out;
}

.animate-zoom-in {
    animation: zoomIn 0.4s ease-out;
}
`;

// Export a singleton instance
export const animationManager = new AnimationManager(); 