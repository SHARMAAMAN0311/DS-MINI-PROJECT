// Postfix Expression Evaluator - Frontend JavaScript

let currentHistory = [];
let currentStepIndex = 0;
let playInterval = null;
let voiceExplanationActive = false;
let voiceExplanationId = 0;

// DOM Elements
const expressionInput = document.getElementById('expressionInput');
const evaluateBtn = document.getElementById('evaluateBtn');
const clearBtn = document.getElementById('clearBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');

const resultCard = document.getElementById('resultCard');
const resultValue = document.getElementById('resultValue');
const resultExpression = document.getElementById('resultExpression');
const resultTokens = document.getElementById('resultTokens');
const resultOperations = document.getElementById('resultOperations');
const viewStepsBtn = document.getElementById('viewStepsBtn');

const errorCard = document.getElementById('errorCard');
const errorMessage = document.getElementById('errorMessage');

// Modal Elements
const stepsModal = document.getElementById('stepsModal');
const learnModal = document.getElementById('learnModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalExpression = document.getElementById('modalExpression');
const stepsTableBody = document.getElementById('stepsTableBody');
const vizStackItems = document.getElementById('vizStackItems');
const currentTokenEl = document.getElementById('currentToken');
const currentOperationEl = document.getElementById('currentOperation');
const currentExplanationEl = document.getElementById('currentExplanation');
const operationTypeEl = document.getElementById('operationType');
const operationDetailsEl = document.getElementById('operationDetails');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const playStepBtn = document.getElementById('playStepBtn');
const playBtnIcon = document.getElementById('playBtnIcon');
const playBtnText = document.getElementById('playBtnText');
const resetStepBtn = document.getElementById('resetStepBtn');
const stepCounter = document.getElementById('stepCounter');
const voiceCurrentStepBtn = document.getElementById('voiceCurrentStepBtn');
const voicePlayBtn = document.getElementById('voicePlayBtn');
const voicePauseBtn = document.getElementById('voicePauseBtn');
const voiceStopBtn = document.getElementById('voiceStopBtn');
const voiceStatus = document.getElementById('voiceStatus');

// Example cards
// Event Listeners
evaluateBtn.addEventListener('click', handleEvaluate);
clearBtn.addEventListener('click', handleClear);
loadExampleBtn.addEventListener('click', loadRandomExample);

expressionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleEvaluate();
    }
});

viewStepsBtn.addEventListener('click', openStepsModal);

modalOverlay.addEventListener('click', closeStepsModal);
modalClose.addEventListener('click', closeStepsModal);

document.querySelectorAll('[data-close="learnModal"]').forEach(button => {
    button.addEventListener('click', closeLearnModal);
});

document.querySelectorAll('.nav-modal-link').forEach(button => {
    button.addEventListener('click', () => {
        openLearnModal();
    });
});

prevStepBtn.addEventListener('click', showPreviousStep);
nextStepBtn.addEventListener('click', showNextStep);
playStepBtn.addEventListener('click', togglePlay);
resetStepBtn.addEventListener('click', resetSteps);
voiceCurrentStepBtn.addEventListener('click', speakCurrentStep);
voicePlayBtn.addEventListener('click', startVoiceExplanation);
voicePauseBtn.addEventListener('click', toggleVoicePause);
voiceStopBtn.addEventListener('click', stopVoiceExplanation);

document.querySelectorAll('.example-load-btn').forEach(button => {
    button.addEventListener('click', () => {
        expressionInput.value = button.closest('.example-card').dataset.example;
        document.getElementById('evaluator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

// Smooth scrolling for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId) {
            return;
        }
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

async function handleEvaluate() {
    const expression = expressionInput.value.trim();
    
    // Hide previous results
    resultCard.style.display = 'none';
    errorCard.style.display = 'none';
    
    if (!expression) {
        showError('Please enter a postfix expression');
        return;
    }
    
    // Disable button and show loading
    evaluateBtn.disabled = true;
    evaluateBtn.querySelector('.btn-text').textContent = 'Evaluating...';
    
    try {
        const response = await fetch('/evaluate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expression: expression })
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
            showError(data.error || 'An error occurred');
            return;
        }

        // Show result
        resultValue.textContent = data.result;
        resultExpression.textContent = expression;
        resultTokens.textContent = data.tokens;
        resultOperations.textContent = data.operations;

        // Store history for modal
        currentHistory = data.steps;
        currentStepIndex = 0;

        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch {
        showError('Could not connect to server. Make sure the backend is running.');
    } finally {
        evaluateBtn.disabled = false;
        evaluateBtn.querySelector('.btn-text').textContent = 'Evaluate';
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorCard.style.display = 'block';
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleClear() {
    expressionInput.value = '';
    resultCard.style.display = 'none';
    errorCard.style.display = 'none';
    expressionInput.focus();
}

function loadRandomExample() {
    const examples = [
        '5 6 2 + *',
        '25 5 / 3 +',
        '8 2 -',
        '8 2 /',
        '5 6 + 2 *',
        '2 3 ^',
        '10 2 / 3 +',
        '4 5 + 7 *'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    expressionInput.value = randomExample;
    expressionInput.focus();
}

function openStepsModal() {
    if (currentHistory.length === 0) {
        return;
    }
    
    modalExpression.textContent = expressionInput.value.trim();
    
    // Populate table
    stepsTableBody.innerHTML = '';
    currentHistory.forEach((step, index) => {
        const row = document.createElement('tr');
        if (index === currentStepIndex) {
            row.classList.add('active');
        }
        row.innerHTML = `
            <td>${step.step}</td>
            <td>${step.token}</td>
            <td>${step.action}</td>
            <td>${step.operation}</td>
            <td>[${step.stackAfter.join(', ')}]</td>
        `;
        row.addEventListener('click', () => {
            if (voiceExplanationActive) {
                stopVoiceExplanation();
            }
            goToStep(index);
        });
        stepsTableBody.appendChild(row);
    });
    
    // Show first step
    goToStep(0);
    
    stepsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeStepsModal() {
    stepsModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    stopPlay();
    stopVoiceExplanation();
}

function openLearnModal() {
    learnModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLearnModal() {
    learnModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function goToStep(index) {
    if (index < 0 || index >= currentHistory.length) return;
    
    currentStepIndex = index;
    const step = currentHistory[index];
    
    // Update table highlighting
    const rows = stepsTableBody.querySelectorAll('tr');
    rows.forEach((row, i) => {
        row.classList.toggle('active', i === index);
    });
    
    // Update step counter
    stepCounter.textContent = `Step ${index + 1} of ${currentHistory.length}`;
    
    // Update visual stack
    vizStackItems.innerHTML = '';
    if (step.stackAfter.length === 0) {
        vizStackItems.innerHTML = '<div style="color: var(--text-muted); padding: 1rem;">Empty</div>';
    } else {
        step.stackAfter.slice().reverse().forEach(item => {
            const stackItem = document.createElement('div');
            stackItem.className = 'viz-stack-item';
            stackItem.textContent = item;
            vizStackItems.appendChild(stackItem);
        });
    }
    
    // Update current step info
    currentTokenEl.textContent = step.token;
    currentOperationEl.textContent = step.action === 'Push' ? 'Push' : step.operation;
    currentExplanationEl.textContent = step.explanation;
    
    // Update operation indicator
    if (step.action === 'Push') {
        operationTypeEl.textContent = 'PUSH';
        operationDetailsEl.innerHTML = `Push ${step.token} onto stack<br>Stack Before: [${step.stackBefore.join(', ')}]<br>Stack After: [${step.stackAfter.join(', ')}]`;
    } else {
        operationTypeEl.textContent = 'CALCULATE';
        operationDetailsEl.innerHTML = `Pop operands and calculate<br>${step.operation}<br>Push result back onto stack<br>Stack After: [${step.stackAfter.join(', ')}]`;
    }
}

function showPreviousStep() {
    if (voiceExplanationActive) {
        stopVoiceExplanation();
    }
    goToStep(currentStepIndex - 1);
}

function showNextStep() {
    if (voiceExplanationActive) {
        stopVoiceExplanation();
    }
    goToStep(currentStepIndex + 1);
}

function resetSteps() {
    goToStep(0);
    stopPlay();
    if (voiceExplanationActive) {
        stopVoiceExplanation();
    }
}

function togglePlay() {
    if (playInterval) {
        stopPlay();
    } else {
        startPlay();
    }
}

function startPlay() {
    playBtnIcon.textContent = '⏸';
    playBtnText.textContent = 'Pause';
    playStepBtn.classList.add('playing');
    
    playInterval = setInterval(() => {
        if (currentStepIndex >= currentHistory.length - 1) {
            stopPlay();
            return;
        }
        goToStep(currentStepIndex + 1);
    }, 1500);
}

function stopPlay() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
    playBtnIcon.textContent = '▶';
    playBtnText.textContent = 'Play';
    playStepBtn.classList.remove('playing');
}

function startVoiceExplanation() {
    if (!supportsSpeech()) {
        showVoiceUnsupported();
        return;
    }

    if (voiceExplanationActive) {
        return;
    }

    voiceExplanationActive = true;
    voiceExplanationId += 1;
    voicePlayBtn.disabled = true;
    voiceCurrentStepBtn.disabled = true;
    voicePauseBtn.disabled = false;
    voiceStopBtn.disabled = false;
    voiceStatus.textContent = 'Reading the expression step by step...';
    speakStep(currentStepIndex, voiceExplanationId);
}

function speakStep(index, explanationId) {
    if (!voiceExplanationActive || explanationId !== voiceExplanationId) {
        return;
    }

    if (index >= currentHistory.length) {
        voiceStatus.textContent = 'Explanation complete.';
        stopVoiceExplanation(false);
        return;
    }

    goToStep(index);
    const step = currentHistory[index];
    const utterance = new SpeechSynthesisUtterance(getStepSpeech(step));
    utterance.rate = 0.95;
    utterance.onend = () => speakStep(index + 1, explanationId);
    utterance.onerror = () => {
        if (explanationId === voiceExplanationId) {
            voiceStatus.textContent = 'Could not play the voice explanation.';
            stopVoiceExplanation();
        }
    };
    window.speechSynthesis.speak(utterance);
}

function speakCurrentStep() {
    if (!supportsSpeech()) {
        showVoiceUnsupported();
        return;
    }

    if (voiceExplanationActive) {
        stopVoiceExplanation();
    }

    const step = currentHistory[currentStepIndex];
    if (!step) {
        return;
    }

    voiceExplanationActive = true;
    voiceExplanationId += 1;
    const explanationId = voiceExplanationId;
    voicePlayBtn.disabled = true;
    voiceCurrentStepBtn.disabled = true;
    voicePauseBtn.disabled = false;
    voiceStopBtn.disabled = false;
    voiceStatus.textContent = `Explaining step ${step.step}...`;

    const utterance = new SpeechSynthesisUtterance(getStepSpeech(step));
    utterance.rate = 0.95;
    utterance.onend = () => {
        if (explanationId === voiceExplanationId) {
            voiceExplanationActive = false;
            voiceStatus.textContent = `Step ${step.step} explanation complete.`;
            resetVoiceButtons();
        }
    };
    utterance.onerror = () => {
        if (explanationId === voiceExplanationId) {
            voiceStatus.textContent = 'Could not play the voice explanation.';
            stopVoiceExplanation();
        }
    };
    window.speechSynthesis.speak(utterance);
}

function getStepSpeech(step) {
    const operatorNames = {
        '+': 'plus',
        '-': 'minus',
        '*': 'times',
        '/': 'divided by',
        '%': 'modulo',
        '^': 'to the power of',
    };

    if (step.action === 'Push') {
        return `Step ${step.step}. The number ${step.token} is an operand. Push ${step.token} onto the stack. The stack now contains ${step.stackAfter.join(', ')}.`;
    }

    const operator = operatorNames[step.token] || step.token;
    return `Step ${step.step}. The operator ${operator} needs two values. ${step.explanation.replace(/[+\-*\/%^]/g, symbol => operatorNames[symbol] || symbol)} The stack now contains ${step.stackAfter.join(', ')}.`;
}

function supportsSpeech() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function showVoiceUnsupported() {
    voiceStatus.textContent = 'Voice explanation is not supported by this browser.';
}

function toggleVoicePause() {
    if (!voiceExplanationActive) {
        return;
    }

    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        voicePauseBtn.textContent = 'Pause';
        voiceStatus.textContent = 'Reading the expression step by step...';
    } else {
        window.speechSynthesis.pause();
        voicePauseBtn.textContent = 'Resume';
        voiceStatus.textContent = 'Voice explanation paused.';
    }
}

function stopVoiceExplanation(cancelSpeech = true) {
    const wasActive = voiceExplanationActive;
    voiceExplanationActive = false;
    voiceExplanationId += 1;
    if (cancelSpeech && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    resetVoiceButtons();
    if (cancelSpeech && wasActive) {
        voiceStatus.textContent = 'Voice explanation stopped.';
    }
}

function resetVoiceButtons() {
    voicePlayBtn.disabled = false;
    voiceCurrentStepBtn.disabled = false;
    voicePauseBtn.disabled = true;
    voicePauseBtn.textContent = 'Pause';
    voiceStopBtn.disabled = true;
}

// Add smooth animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all glass cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});
