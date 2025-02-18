const FTUE = {
    // Local storage key
    VISIT_COUNT_KEY: 'visitCount',
    TUTORIAL_SEEN_KEY: 'image_processor_tutorial_seen',
    
    // HTML template for the welcome modal
    welcomeModalHTML: `
        <div id="welcomeModal" class="welcome-modal">
            <div class="welcome-content">
                <div class="welcome-header">
                    <div class="welcome-title">
                        <h2>Welcome to Image Processor! 🎨</h2>
                        <div class="pulse-dot"></div>
                    </div>
                    <button class="close-welcome">&times;</button>
                </div>
                <div class="welcome-body">
                    <div class="welcome-step active" data-step="1">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h3>Let's Get Started!</h3>
                            <p>Would you like a quick tour of the essential features?</p>
                            <div class="welcome-buttons">
                                <button class="start-tutorial">Yes, show me around</button>
                                <button class="skip-tutorial">Maybe later</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="welcome-footer">
                    <label class="dont-show-again">
                        <input type="checkbox" id="dontShowAgain">
                        Don't show this again
                    </label>
                </div>
            </div>
        </div>
    `,

    // CSS styles for the welcome modal
    styles: `
        .welcome-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        .welcome-modal.show {
            opacity: 1;
        }

        .welcome-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 500px;
            opacity: 0;
            transition: all 0.3s ease-in-out;
        }

        .welcome-modal.show .welcome-content {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }

        .welcome-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .welcome-title {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .welcome-title h2 {
            margin: 0;
            color: #2d3748;
            font-size: 24px;
        }

        .pulse-dot {
            width: 10px;
            height: 10px;
            background: #48bb78;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
            }
            70% {
                transform: scale(1);
                box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
            }
            100% {
                transform: scale(0.95);
                box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
            }
        }

        .close-welcome {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #a0aec0;
            transition: color 0.2s;
        }

        .close-welcome:hover {
            color: #2d3748;
        }

        .welcome-step {
            display: none;
            opacity: 0; 
            transform: translateY(20px);
            transition: all 0.3s ease-in-out;
        }

        .welcome-step.active {
            display: flex;
            gap: 20px;
            opacity: 1;
            transform: translateY(0);
        }

        .step-number {
            width: 40px;
            height: 40px;
            background: #ebf8ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #3182ce;
            flex-shrink: 0;
        }

        .step-content {
            flex-grow: 1;
        }

        .step-content h3 {
            margin: 0 0 10px 0;
            color: #2d3748;
        }

        .step-content p {
            margin: 0;
            color: #4a5568;
            line-height: 1.5;
        }

        .welcome-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .start-tutorial, .skip-tutorial {
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }

        .start-tutorial {
            background: #4299e1;
            color: white;
            border: none;
        }

        .start-tutorial:hover {
            background: #3182ce;
        }

        .skip-tutorial {
            background: white;
            color: #4a5568;
            border: 1px solid #e2e8f0;
        }

        .skip-tutorial:hover {
            background: #f7fafc;
        }

        .welcome-footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .dont-show-again {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #718096;
            cursor: pointer;
        }

        .dont-show-again input {
            margin: 0;
        }
    `,

    initialize() {

        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.styles;
        document.head.appendChild(styleSheet);

        // Add modal to document
        document.body.insertAdjacentHTML('beforeend', this.welcomeModalHTML);

        // Track visits
        const visitCount = trackVisits();

        // Only show tutorial for first and second visits
        if (visitCount <= 2) {
            this.showWelcomeModal();
        }

        // Setup event listeners
        this.setupEventListeners();
    },

    showWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.style.display = 'block';
        // Trigger reflow
        modal.offsetHeight;
        modal.classList.add('show');
    },

    hideWelcomeModal() {
        const modal = document.getElementById('welcomeModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    },

    setupEventListeners() {
        // Close button
        document.querySelector('.close-welcome').addEventListener('click', () => {
            this.hideWelcomeModal();
        });

        // Start tutorial button
        document.querySelector('.start-tutorial').addEventListener('click', () => {
            this.hideWelcomeModal();
            this.startTutorial();
        });

        // Skip tutorial button
        document.querySelector('.skip-tutorial').addEventListener('click', () => {
            this.hideWelcomeModal();
        });

        // Don't show again checkbox
        document.querySelector('#dontShowAgain').addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.setItem(this.TUTORIAL_SEEN_KEY, 'true');
            } else {
                localStorage.setItem(this.TUTORIAL_SEEN_KEY, 'false');
            }
        });

        // Close modal when clicking outside
        document.getElementById('welcomeModal').addEventListener('click', (e) => {
            if (e.target.id === 'welcomeModal') {
                this.hideWelcomeModal();
            }
        });
    },

    startTutorial() {
        const tutorial = new ImageProcessingTutorial();
        tutorial.start();
    }
};

            
