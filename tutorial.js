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

            


class ImageProcessingTutorial {
    constructor() {
        this.setupCursor();
        this.setupTooltip();
        this.setupProgressIndicator();
        this.steps = this.defineSteps();
        this.currentStepIndex = 0;
    }

    setupCursor() {
        this.cursor = document.createElement('div');
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(255, 0, 0, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            transition: all 0.5s ease;
            box-shadow: 0 0 0 4px rgba(255, 0, 0, 0.2);
        `;
        document.body.appendChild(this.cursor);
    }

    setupTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: #2a2a4f;
            color: white;
            padding: 15px;
            border-radius: 8px;
            max-width: 300px;
            z-index: 10001;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transition: opacity 0.3s ease;
            font-size: 14px;
        `;
        document.body.appendChild(this.tooltip);
    }

    setupProgressIndicator() {
        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2a2a4f;
            padding: 10px 20px;
            border-radius: 20px;
            color: white;
            z-index: 10002;
            display: flex;
            gap: 10px;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(this.progressBar);
    }

    
defineSteps() {
    return [
        {
            element: '#closeVideoModal',
            title: 'Close Video Modal',
            description: 'First, let\'s close the video modal to access the main interface.',
            action: 'click',
            position: 'bottom'
        },
        {
            element: '#imageUpload',
            title: 'Upload Your Image',
            description: 'Click here to choose an image file from your computer. Supported formats: JPEG, PNG, etc.',
            action: 'click',
            position: 'right',
            waitForEvent: 'change'
        },
        {
            element: '#lassoTool',
            title: 'Select Lasso Tool',
            description: 'The Lasso Tool allows you to make precise selections around objects in your image. Click to activate.',
            action: 'click',
            position: 'right'
        },
        {
            element: '#imageCanvas',
            title: 'Make Your Selection',
            description: 'Select the area on the image and then press the process image button.',
            action: 'waitForSelection',
            position: 'center'
        },
        {
            element: '#processButton',
            title: 'Process Selection',
            description: 'Now click the "Process Image" button to process your selection.',
            action: 'waitForProcessClick',
            position: 'left'
        },
        {
            element: '#resultsContainer',
            title: 'Processing Results',
            description: 'Wait while your selection is being processed...',
            action: 'waitForResults',
            position: 'right'
        },
        {
            element: '#effectControls',
            title: 'Effect Controls',
            description: 'Now you can adjust various effects and see the results in real-time.',
            action: 'explainEffects',
            position: 'left'
        }
    ];
}






    updateProgressBar() {
        const total = this.steps.length;
        const current = this.currentStepIndex + 1;
        this.progressBar.innerHTML = `
            <span>Step ${current} of ${total}</span>
            <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden;">
                <div style="width: ${(current/total)*100}%; height: 100%; background: white; transition: width 0.3s ease;"></div>
            </div>
        `;
    }


    showTooltip(element, step) {
        const rect = element.getBoundingClientRect();
        const positions = {
            'top': {
                top: rect.top - 10 - this.tooltip.offsetHeight,
                left: rect.left + (rect.width/2) - (this.tooltip.offsetWidth/2)
            },
            'bottom': {
                top: rect.bottom + 10,
                left: rect.left + (rect.width/2) - (this.tooltip.offsetWidth/2)
            },
            'left': {
                top: rect.top + (rect.height/2) - (this.tooltip.offsetHeight/2),
                left: rect.left - 10 - this.tooltip.offsetWidth
            },
            'right': {
                top: rect.top + (rect.height/2) - (this.tooltip.offsetHeight/2),
                left: rect.right + 10
            }
        };

        const pos = positions[step.position] || positions.bottom;
        this.tooltip.style.top = `${pos.top}px`;
        this.tooltip.style.left = `${pos.left}px`;
        this.tooltip.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${step.title}</h3>
            <p style="margin: 0;">${step.description}</p>
        `;
        this.tooltip.style.opacity = '1';
    }


    async waitForSelection() {
    return new Promise((resolve) => {
        const canvas = document.querySelector('#imageCanvas');
        if (!canvas) {
            console.warn('Canvas not found, skipping selection wait');
            resolve();
            return;
        }

        let isSelecting = false; // Track if the user is actively selecting
        let points = []; // Store the points of the selection

        // Listen for mousedown to start the selection
        const onMouseDown = (e) => {
            isSelecting = true;
            points = []; // Reset points
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            points.push({ x, y }); // Add the first point
            this.tooltip.innerHTML = `
                <h3 style="margin: 0 0 8px 0; font-size: 16px;">Making Selection</h3>
                <p style="margin: 0;">Click and drag to draw your selection. Double-click or connect back to the start point to complete.</p>
            `;
        };

        // Listen for mousemove to track the selection
        const onMouseMove = (e) => {
            if (isSelecting) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                points.push({ x, y }); // Add the current point
                this.drawSelectionPreview(canvas, points); // Draw a preview of the selection
            }
        };

        // Listen for mouseup or double-click to end the selection
        const onMouseUp = (e) => {
            if (isSelecting) {
                isSelecting = false;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                points.push({ x, y }); // Add the final point

                // Check if the selection is complete (e.g., closed shape)
                if (this.isSelectionComplete(points)) {
                    this.tooltip.innerHTML = `
                        <h3 style="margin: 0 0 8px 0; font-size: 16px;">Selection Complete</h3>
                        <p style="margin: 0;">Click "Next" to proceed.</p>
                        <button id="nextStep" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-top: 10px;
                        ">Next</button>
                    `;

                    // Add a click handler for the "Next" button
                    const nextButton = this.tooltip.querySelector('#nextStep');
                    nextButton.onclick = () => {
                        canvas.removeEventListener('mousedown', onMouseDown);
                        canvas.removeEventListener('mousemove', onMouseMove);
                        canvas.removeEventListener('mouseup', onMouseUp);
                        canvas.removeEventListener('dblclick', onMouseUp);
                        resolve();
                    };
                }
            }
        };

        // Add event listeners
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('dblclick', onMouseUp); // Allow double-click to complete the selection
    });
}

// Helper method to draw a preview of the selection on the canvas
drawSelectionPreview(canvas, points) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.closePath();
    ctx.stroke();
}

// Helper method to check if the selection is complete (e.g., closed shape)
isSelectionComplete(points) {
    if (points.length < 3) return false; // Need at least 3 points to form a shape
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const distance = Math.sqrt(
        Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
    );
    return distance < 10; // Consider the shape closed if the last point is close to the first
}

    async waitForProcessButtonClick(element) {
    return new Promise((resolve) => {
        const processButton = element;
        
        // Update tooltip to guide user
        this.tooltip.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">Click Process Image</h3>
            <p style="margin: 0;">Click the "Process Image" button to continue.</p>
        `;

        // Add highlight effect to process button
        processButton.style.transition = 'all 0.3s ease';
        processButton.style.boxShadow = '0 0 0 2px #4CAF50';
        
        const clickHandler = () => {
            processButton.style.boxShadow = 'none';
            processButton.removeEventListener('click', clickHandler);
            resolve();
        };
        
        processButton.addEventListener('click', clickHandler);
    
    
    });
}


async waitForProcessingResults() {
    return new Promise((resolve) => {
        const resultsContainer = document.querySelector('#resultsContainer');
        
        // Show processing status
        this.tooltip.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">Processing...</h3>
            <p style="margin: 0;">Please wait while your selection is being processed.</p>
            <div class="processing-spinner" style="
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 10px auto;
            "></div>
        `;

        // Watch for changes in results container
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // Wait a bit to ensure everything is loaded
                    setTimeout(() => {
                        observer.disconnect();
                        this.tooltip.innerHTML = `
                            <h3 style="margin: 0 0 8px 0; font-size: 16px;">Processing Complete</h3>
                            <p style="margin: 0;">Your selection has been processed. Click "Next" to continue.</p>
                            <button id="nextStep" style="
                                background: #4CAF50;
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 10px;
                            ">Next</button>
                        `;
                        
                        this.tooltip.querySelector('#nextStep').onclick = () => resolve();
                    }, 1000);
                }
            }
        });

        observer.observe(resultsContainer, {
            childList: true,
            subtree: true
        });

        // Fallback timeout
        setTimeout(() => {
            observer.disconnect();
            resolve();
        }, 15000);
    });
}

async waitForLassoSelection() {
        return new Promise((resolve) => {
            const canvas = document.querySelector('#imageCanvas');
            let isSelectionActive = false;
            
            // Update tooltip with initial instructions
            this.updateTooltipContent({
                title: 'Make Your Selection',
                description: 'Click and drag on the image to draw around the area you want to process.',
                showButton: false
            });

            const handleSelectionStart = () => {
                if (!isSelectionActive) {
                    isSelectionActive = true;
                    this.updateTooltipContent({
                        title: 'Drawing Selection',
                        description: 'Double click to finish',
                        showButton: false
                    });
                }
            };

            const handleSelectionComplete = () => {
                if (isSelectionActive) {
                    this.updateTooltipContent({
                        title: 'Selection Complete!',
                        description: 'Great! You\'ve completed your selection. Click "Continue" to proceed.',
                        showButton: true,
                        buttonText: 'Continue',
                        buttonCallback: () => {
                            cleanup();
                            resolve();
                        }
                    });
                }
            };

            const cleanup = () => {
                canvas.removeEventListener('mousedown', handleSelectionStart);
                canvas.removeEventListener('dblclick', handleSelectionComplete);
                document.removeEventListener('keydown', handleEscape);
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    cleanup();
                    resolve();
                }
            };

            canvas.addEventListener('mousedown', handleSelectionStart);
            canvas.addEventListener('dblclick', handleSelectionComplete);
            document.addEventListener('keydown', handleEscape);
        });
    }


    updateTooltipContent({ title, description, showButton = false, buttonText = '', buttonCallback = null }) {
        this.tooltip.innerHTML = `
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${title}</h3>
            <p style="margin: 0;">${description}</p>
            ${showButton ? `
                <button id="tooltipButton" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">${buttonText}</button>
            ` : ''}
        `;

        if (showButton && buttonCallback) {
            this.tooltip.querySelector('#tooltipButton').onclick = buttonCallback;
        }
    }


    async demonstrateLassoSelection(element, path) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const x = rect.left + (rect.width * point.x);
            const y = rect.top + (rect.height * point.y);
            this.cursor.style.left = `${x}px`;
            this.cursor.style.top = `${y}px`;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }


    
    async moveTo(element, step) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.cursor.style.left = `${x}px`;
        this.cursor.style.top = `${y}px`;
        
        this.showTooltip(element, step);
        
        switch (step.action) {
            case 'click':
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.cursor.style.transform = 'scale(0.8)';
                await new Promise(resolve => setTimeout(resolve, 200));
                this.cursor.style.transform = 'scale(1)';
                element.click();
                
                if (step.waitForEvent) {
                    await new Promise(resolve => {
                        element.addEventListener(step.waitForEvent, resolve, { once: true });
                    });
                }
                break;

            case 'waitForSelection':
                this.cursor.style.opacity = '0';
                await this.waitForLassoSelection();
                this.cursor.style.opacity = '1';
                break;

            case 'waitForProcessClick':
                this.cursor.style.opacity = '0';
                await this.waitForProcessButtonClick(element);
                this.cursor.style.opacity = '1';
                break;

            case 'waitForResults':
                await this.waitForProcessingResults();
                break;
        }
    }

    

    async startTutorial() {
        try {
            for (let i = 0; i < this.steps.length; i++) {
                this.currentStepIndex = i;
                this.updateProgressBar();
                
                const step = this.steps[i];
                const element = document.querySelector(step.element);
                
                if (!element) {
                    console.warn(`Element ${step.element} not found, skipping step`);
                    continue;
                }
                
                await this.moveTo(element, step);
            }

            // Cleanup
            this.cleanup();
            
            // Show completion message
            // alert('Tutorial completed! You can now use these tools to process your images.');

        } catch (error) {
            console.error('Tutorial error:', error);
            this.cleanup();
        }
    }

    cleanup() {
        [this.cursor, this.tooltip, this.progressBar].forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
}

