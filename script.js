
// ===== PREVENT ANDROID PULL-TO-REFRESH =====
(function () {
    let startY = 0;
    document.addEventListener('touchstart', function (e) {
        startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        const y = e.touches[0].clientY;
        // Block pull-down when already at the top of the page
        if (y > startY && window.scrollY === 0) {
            e.preventDefault();
        }
    }, { passive: false });
})();
// ============================================
// COGNITIVE AI QUESTIONNAIRE - JAVASCRIPT
// Timer, Progress, Validation, Data Collection
// ============================================

// ===== GLOBAL STATE =====
const state = {
    startTime: null,
    currentSection: 'section-welcome',
    totalSections: 19, // Updated: section-crt, section-explainability, section-thankyou // Adjust based on actual number of sections
    completedSections: 0,
    responses: {},
    scenarioConditions: {}, // Store randomized conditions
    sectionTimes: {}, // Track time spent on each section
    backNavigationCount: 0 // How many times user pressed Back
};


// ===== TRACK BACK NAVIGATION =====
function trackBackNavigation() {
    state.backNavigationCount++;
}


// ===== SHOPLAB PK — FLOW INITIATOR =====
function startSurveyFlow() {
    // Start the research session
    startTimer();
    randomizeScenarioConditions();

    // Show platform UI
    const header = document.getElementById('platform-header');
    const progress = document.getElementById('shopping-progress');
    if (header) header.style.display = 'block';
    if (progress) progress.style.display = 'flex';

    // Go to consent first (then demographics, then experience, then products)
    showSection('section-consent');
    updateProgress();
}

// ===== submitSurvey = alias for completeSurvey =====
function submitSurvey() {
    completeSurvey();
}

// ===== TIMER FUNCTIONS =====
function startTimer() {
    state.startTime = Date.now();
    updateTimer();
}

function updateTimer() {
    if (!state.startTime) return;

    const elapsed = Date.now() - state.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    const timerText = document.getElementById('timerText');
    if (timerText) {
        timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    requestAnimationFrame(updateTimer);
}

function getElapsedTime() {
    if (!state.startTime) return 0;
    return Math.floor((Date.now() - state.startTime) / 1000); // in seconds
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ===== PROGRESS BAR =====
function updateProgress() {
    const progress = (state.completedSections / state.totalSections) * 100;
    // Support both original IDs and new ShopLab PK IDs
    const bar1 = document.getElementById('progressBar');
    const bar2 = document.getElementById('progress-fill');
    const txt1 = document.getElementById('progressText');
    const txt2 = document.getElementById('progress-label');
    const pct  = Math.round(progress);
    if (bar1) bar1.style.width = `${progress}%`;
    if (bar2) bar2.style.width = `${progress}%`;
    if (txt1) txt1.textContent = `${pct}% Complete`;
    if (txt2) txt2.textContent = `Product ${state.completedSections} of 7`;
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Track section change
        trackSectionChange(sectionId);
    }
}

function trackSectionChange(sectionId) {
    const timestamp = Date.now();

    // Record time spent on previous section
    if (state.lastSectionId && state.lastSectionTime) {
        const timeSpent = timestamp - state.lastSectionTime;
        state.sectionTimes[state.lastSectionId] = (state.sectionTimes[state.lastSectionId] || 0) + timeSpent;
    }

    state.lastSectionId = sectionId;
    state.lastSectionTime = timestamp;
}

// ===== VALIDATION =====
function validateSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return true;

    // Check all required fields
    const requiredInputs = section.querySelectorAll('[required]');
    let allValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const name = input.name;
            const checked = section.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                allValid = false;
                highlightError(input);
            }
        } else if (input.type === 'checkbox') {
            if (!input.checked) {
                allValid = false;
                highlightError(input);
            }
        } else if (!input.value || input.value === '') {
            allValid = false;
            highlightError(input);
        }
    });

    return allValid;
}

function highlightError(input) {
    const question = input.closest('.question') || input.closest('.consent-checkbox');
    if (question) {
        question.style.border = '2px solid #ef4444';
        question.style.animation = 'shake 0.5s';

        setTimeout(() => {
            question.style.border = '';
            question.style.animation = '';
        }, 2000);
    }
}

function validateAndNext(currentSectionId, nextSectionId) {
    if (validateSection(currentSectionId)) {
        // Save responses
        saveResponses(currentSectionId);

        // Update progress
        state.completedSections++;
        updateProgress();

        // Show next section
        showSection(nextSectionId);
    } else {
        alert('Please answer all required questions before continuing.');
    }
}

// ===== DATA COLLECTION =====
let questionStartTimes = {}; // Track when each question was first interacted with
let questionResponseTimes = {}; // Track time to answer each question

// Track when user starts answering a question
function trackQuestionStart(questionName) {
    if (!questionStartTimes[questionName]) {
        questionStartTimes[questionName] = Date.now();
    }
}

// Track when user answers a question
function trackQuestionResponse(questionName, value) {
    if (questionStartTimes[questionName]) {
        const responseTime = (Date.now() - questionStartTimes[questionName]) / 1000; // in seconds
        questionResponseTimes[questionName] = responseTime;
    }
    // Also track the manipulation condition for this question
    trackManipulation(questionName, value);
}

// Track manipulation checks automatically
function trackManipulation(questionName, value) {
    // Extract scenario number from question name
    const scenarioMatch = questionName.match(/s(\d+)-/);
    if (scenarioMatch) {
        const scenarioNum = scenarioMatch[1];
        const scenarioKey = `scenario${scenarioNum}`;

        // Store what condition they were shown
        if (state.scenarioConditions[scenarioKey]) {
            state.responses[`${scenarioKey}_condition`] = state.scenarioConditions[scenarioKey];
        }
    }
}

function saveResponses(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const inputs = section.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        const name = input.name || input.id;
        if (!name) return;

        if (input.type === 'radio') {
            if (input.checked) {
                state.responses[name] = input.value;
                // Track response time
                if (questionResponseTimes[name]) {
                    state.responses[`${name}_response_time`] = questionResponseTimes[name];
                }
            }
        } else if (input.type === 'checkbox') {
            state.responses[name] = input.checked;
        } else {
            state.responses[name] = input.value;
            // Track response time for text inputs
            if (questionResponseTimes[name]) {
                state.responses[`${name}_response_time`] = questionResponseTimes[name];
            }
        }
    });

    // Save timestamp and section time
    state.responses[`${sectionId}_timestamp`] = Date.now();
    state.responses[`${sectionId}_time_spent`] = state.sectionTimes[sectionId] || 0;

    // Save section-level response times
    const sectionTime = (state.sectionTimes[sectionId] || 0) / 1000; // convert to seconds
    state.responses[`${sectionId}_total_time`] = sectionTime;
}

function saveAllData() {
    const data = {
        responses: state.responses,
        metadata: {
            totalTime: getElapsedTime(),
            completionDate: new Date().toISOString(),
            sectionTimes: state.sectionTimes,
            questionResponseTimes: questionResponseTimes, // Individual question times
            scenarioConditions: state.scenarioConditions, // Which manipulation they saw
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browserLanguage: navigator.language,
            // ── Additional behavioral metadata ────────────────────────────────
            submissionHour: new Date().getHours(), // 0-23; proxy for cognitive state (late night = System 1)
            backNavigationCount: state.backNavigationCount, // Indecision / reconsideration proxy
            crtResponseTimes: {
                'crt-1': questionResponseTimes['crt-1'] || null,
                'crt-2': questionResponseTimes['crt-2'] || null,
                'crt-3': questionResponseTimes['crt-3'] || null
            }, // Individual CRT times: longer = more deliberation = higher System 2 engagement
            scenarioResponseTimes: {
                s1: questionResponseTimes['s1-purchase'] || questionResponseTimes['s1-q1'] || null,
                s2: questionResponseTimes['s2-motivation'] || null,
                s3: questionResponseTimes['s3-purchase'] || null,
                s4: questionResponseTimes['s4-purchase'] || null,
                s5: questionResponseTimes['s5-purchase'] || null,
                s6: questionResponseTimes['s6-purchase'] || null,
                s7: questionResponseTimes['s7-purchase'] || null,
            }, // Per-scenario decision speed: proxy for heuristic vs deliberative processing

        }
    };



    // ── Impulse Buying Composite (Rook & Fisher, 1995 abbreviated) ──────────
    // imp-3-r is reverse scored: score = 8 - raw value
    const imp1 = parseInt(data.responses['imp-1']) || null;
    const imp2 = parseInt(data.responses['imp-2']) || null;
    const imp3r = parseInt(data.responses['imp-3-r']) || null;
    const imp4 = parseInt(data.responses['imp-4']) || null;
    if (imp1 && imp2 && imp3r && imp4) {
        const imp3_scored = 8 - imp3r; // reverse score
        data.responses['imp_composite'] = ((imp1 + imp2 + imp3_scored + imp4) / 4).toFixed(3);
    }

    // ── Persuasion Knowledge Composite (Bearden et al., 2001 adapted) ───────
    const pk1 = parseInt(data.responses['pk-1']) || null;
    const pk2 = parseInt(data.responses['pk-2']) || null;
    const pk3 = parseInt(data.responses['pk-3']) || null;
    if (pk1 && pk2 && pk3) {
        data.responses['pk_composite'] = ((pk1 + pk2 + pk3) / 3).toFixed(3);
    }

    // ── Deception Experience Composite ───────────────────────────────────────
    // Combines prior deception experience + promo trust (reverse) into one index
    const dec_exp = parseInt(data.responses['deception-experience']) || null;
    const promo_trust = parseInt(data.responses['promo-trust']) || null;
    const flash_trust = parseInt(data.responses['flashsale-trust']) || null;
    if (dec_exp && promo_trust && flash_trust) {
        // Higher score = more deception experience + lower trust = higher skepticism
        data.responses['deception_skepticism_index'] = (
            (dec_exp + (8 - promo_trust) + (8 - flash_trust)) / 3
        ).toFixed(3);
    }
    // ────────────────────────────────────────────────────────────────────────

    // ── Perceived Manipulation Scale (Scenario 4 only) ─────────────────────
    // Composite score: (manip-1 + manip-2 + (8 - manip-3)) / 3
    // Higher score = greater perceived manipulation
    // manip-3 is REVERSE SCORED (trust item) hence (8 - manip-3)
    const m1 = parseInt(data.responses['manip-1']) || null;
    const m2 = parseInt(data.responses['manip-2']) || null;
    const m3 = parseInt(data.responses['manip-3']) || null;
    if (m1 && m2 && m3) {
        data.responses['manip_composite'] = ((m1 + m2 + (8 - m3)) / 3).toFixed(3);
        // Flag: manipulation threshold crossed if composite > 4.0 (midpoint)
        data.responses['manip_threshold_flag'] = (parseFloat(data.responses['manip_composite']) > 4.0) ? 1 : 0;
    }
    // ────────────────────────────────────────────────────────────────────────
    // Save to localStorage (backup)
    localStorage.setItem('questionnaire_data', JSON.stringify(data));

    // Send to server (you'll need to implement this)
    sendDataToServer(data);

    return data;
}

function sendDataToServer(data) {
    // ===== GOOGLE FORMS INTEGRATION =====
    // Form URL - replace formResponse at the end, not viewform
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeyKWSGjA5h4RIPlKDX6EyxlM9_Q_anqXvXxLzw5uGqhhQLQg/formResponse';

    // Entry ID from your Google Form (the field where data will be saved)
    const ENTRY_ID = 'entry.1820146722';

    // Create form data
    const formData = new FormData();

    // Convert data object to JSON string and send to Google Form
    formData.append(ENTRY_ID, JSON.stringify(data, null, 2));

    // Submit to Google Form
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Forms
        body: formData
    }).then(() => {
        console.log('✅ Data successfully sent to Google Sheets!');
        console.log('Data sent:', data);
    }).catch(error => {
        console.error('❌ Error sending data:', error);
        // Data is still saved in localStorage as backup
        alert('Data saved locally. Please ensure you have internet connection.');
    });
}

// ===== RANDOMIZATION =====
function randomizeScenarioConditions() {
    // Randomize conditions for each scenario
    state.scenarioConditions = {
        scenario1: Math.random() < 0.5 ? 'A' : 'B', // With/without original price
        scenario2: Math.random() < 0.5 ? 'A' : 'B', // Gain/loss framing
        scenario3: Math.random() < 0.5 ? 'A' : 'B', // With/without social proof
        scenario4: Math.random() < 0.5 ? 'A' : 'B', // With/without scarcity
        scenario5: Math.random() < 0.5 ? 'A' : 'B', // With/without time pressure
        scenario6: Math.random() < 0.5 ? 'A' : 'B', // Detailed/simple info
        scenario7: Math.random() < 0.5 ? 'A' : 'B'  // Positive/negative reviews first
    };

    // Apply conditions to scenarios
    applyScenarioConditions();
}

function applyScenarioConditions() {
    // Scenario 1: Anchoring
    const price1 = document.getElementById('price-scenario1');
    if (price1) {
        if (state.scenarioConditions.scenario1 === 'A') {
            price1.innerHTML = `
                <span class="price-original">₨5,000</span>
                <span class="price-current">₨3,500</span>
                <span class="price-discount">30% OFF!</span>
            `;
        } else {
            price1.innerHTML = `<span class="price-current">₨3,500</span>`;
        }
    }

    // Scenario 2: Loss Aversion
    const promo2 = document.getElementById('promo-scenario2');
    if (promo2) {
        if (state.scenarioConditions.scenario2 === 'A') {
            promo2.innerHTML = `<div class="promo-box gain">SPECIAL OFFER: Buy now and <strong>SAVE ₨1,000!</strong></div>`;
        } else {
            promo2.innerHTML = `<div class="promo-box loss">SPECIAL OFFER: Don't <strong>LOSE</strong> this ₨1,000 discount!</div>`;
        }
    }

    // Scenario 3: Social Proof
    const rating3 = document.getElementById('rating-scenario3');
    const social3 = document.getElementById('social-scenario3');

    if (rating3 && social3) {
        if (state.scenarioConditions.scenario3 === 'A') {
            // High social proof
            rating3.innerHTML = '⭐⭐⭐⭐⭐ 4.8 stars (500+ reviews)';
            social3.innerHTML = `<div class="social-proof">🔥 POPULAR: 847 people bought this in the last 24 hours!</div>`;
        } else {
            // Low social proof
            rating3.innerHTML = '⭐⭐⭐⭐ 4.2 stars (12 reviews)';
            social3.innerHTML = '';
        }
    }

    // Scenario 4: Scarcity
    const stock4 = document.getElementById('stock-scenario4');
    if (stock4) {
        if (state.scenarioConditions.scenario4 === 'A') {
            stock4.innerHTML = `<div class="scarcity-warning">⚠️ ONLY 3 LEFT IN STOCK! High demand - order soon!</div>`;
        } else {
            stock4.innerHTML = `<div class="stock-available">✓ In Stock</div>`;
        }
    }

    // Scenario 5: Time Pressure
    const timer5 = document.getElementById('timer-scenario5');
    if (timer5) {
        if (state.scenarioConditions.scenario5 === 'A') {
            timer5.innerHTML = `<div class="countdown">⏰ FLASH SALE ENDS IN: <span class="countdown-timer">01:47:23</span></div>`;
            startCountdown('countdown-timer');
        } else {
            timer5.innerHTML = `<div class="sale-available">✓ Sale Price Available</div>`;
        }
    }

    // Scenario 6: Information Overload
    const info6 = document.getElementById('info-scenario6');
    if (info6) {
        if (state.scenarioConditions.scenario6 === 'A') {
            info6.innerHTML = getDetailedSpecs();
        } else {
            info6.innerHTML = getSimpleSpecs();
        }
    }

    // Scenario 7: Confirmation Bias
    const reviews7 = document.getElementById('reviews-scenario7');
    if (reviews7) {
        if (state.scenarioConditions.scenario7 === 'A') {
            reviews7.innerHTML = getPositiveReviews();
        } else {
            reviews7.innerHTML = getNegativeReviews();
        }
    }
}

function startCountdown(elementId) {
    let time = 6443; // 1:47:23 in seconds

    const interval = setInterval(() => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        const element = document.querySelector(`.${elementId}`);
        if (element) {
            element.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        time--;

        if (time < 0) {
            clearInterval(interval);
            if (element) {
                element.textContent = 'EXPIRED';
            }
        }
    }, 1000);
}

function getDetailedSpecs() {
    return `
        <div class="detailed-specs">
            <h4>📋 DETAILED SPECIFICATIONS:</h4>
            <ul class="specs-list">
                <li>• Capacity: 20,000mAh (74Wh)</li>
                <li>• Input: 5V/2A, 9V/2A, 12V/1.5A (USB-C)</li>
                <li>• Output 1: 5V/3A, 9V/2A, 12V/1.5A (USB-C PD)</li>
                <li>• Output 2: 5V/2.4A (USB-A QC 3.0)</li>
                <li>• Output 3: 5V/2.4A (USB-A standard)</li>
                <li>• Battery Type: Lithium Polymer</li>
                <li>• Charging Time: 6-7 hours (with 18W adapter)</li>
                <li>• Dimensions: 146 x 68 x 28mm</li>
                <li>• Weight: 365g</li>
                <li>• Protection: Over-charge, over-discharge, short-circuit, temperature</li>
                <li>• Compatibility: iPhone 6-14, Samsung Galaxy, Huawei, Xiaomi, tablets</li>
                <li>• Certifications: CE, FCC, RoHS</li>
                <li>• Warranty: 12 months</li>
                <li>• Package: Power bank, USB-C cable, user manual, warranty card</li>
            </ul>
        </div>
    `;
}

function getSimpleSpecs() {
    return `
        <div class="simple-specs">
            <h4>✨ KEY FEATURES:</h4>
            <ul class="specs-list">
                <li>✓ 20,000mAh capacity</li>
                <li>✓ Charges most phones 4-5 times</li>
                <li>✓ Fast charging support</li>
                <li>✓ 3 USB ports</li>
                <li>✓ Safe and certified</li>
            </ul>
        </div>
    `;
}

function getPositiveReviews() {
    return `
        <div class="reviews-container">
            <h4>⭐ Customer Reviews:</h4>
            <div class="review-item">
                <div class="review-rating">⭐⭐⭐⭐⭐</div>
                <div class="review-text">"Excellent tablet, very fast and responsive!"</div>
            </div>
            <div class="review-item">
                <div class="review-rating">⭐⭐⭐⭐⭐</div>
                <div class="review-text">"Great value for money, highly recommend"</div>
            </div>
            <div class="review-item">
                <div class="review-rating">⭐⭐⭐⭐</div>
                <div class="review-text">"Good quality, minor issues with battery"</div>
            </div>
        </div>
    `;
}

function getNegativeReviews() {
    return `
        <div class="reviews-container">
            <h4>⭐ Customer Reviews:</h4>
            <div class="review-item">
                <div class="review-rating">⭐⭐⭐</div>
                <div class="review-text">"Decent, but battery could be better"</div>
            </div>
            <div class="review-item">
                <div class="review-rating">⭐⭐</div>
                <div class="review-text">"Screen quality disappointing for the price"</div>
            </div>
            <div class="review-item">
                <div class="review-rating">⭐⭐⭐⭐⭐</div>
                <div class="review-text">"Excellent tablet, very fast and responsive!"</div>
            </div>
        </div>
    `;
}

// ===== CONSENT HANDLING =====
function toggleConsentButton() {
    const checkbox = document.getElementById('consentCheck');
    const button = document.getElementById('consentButton');

    if (checkbox && button) {
        button.disabled = !checkbox.checked;
    }
}

function startSurvey() {
    startTimer();
    randomizeScenarioConditions();
    showSection('section-demographics');
}

// ===== COMPLETION =====
function completeSurvey() {
    // Save all data
    const data = saveAllData();

    // Update final time display
    const finalTime = document.getElementById('finalTime');
    if (finalTime) {
        finalTime.textContent = formatTime(getElapsedTime());
    }

    // Show thank you page
    showSection('section-thankyou');

    // Update progress to 100%
    state.completedSections = state.totalSections;
    updateProgress();
}

// ===== IMAGE GENERATION =====
function generatePlaceholderImages() {
    // Generate placeholder images for products
    const images = {
        'img-backpack': generateProductImage('Laptop Backpack', '#4F46E5'),
        'img-earbuds': generateProductImage('Wireless Earbuds', '#10B981'),
        'img-phonecase': generateProductImage('Phone Case', '#F59E0B'),
        'img-smartwatch': generateProductImage('Smartwatch', '#EF4444'),
        'img-shoes': generateProductImage('Running Shoes', '#8B5CF6'),
        'img-powerbank': generateProductImage('Power Bank', '#06B6D4'),
        'img-tablet': generateProductImage('Tablet', '#EC4899')
    };

    // Apply images
    Object.keys(images).forEach(id => {
        const img = document.getElementById(id);
        if (img) {
            img.src = images[id];
        }
    });
}

function generateProductImage(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 200, 150);

    return canvas.toDataURL();
}

function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize progress
    updateProgress();

    // Generate placeholder images
    generatePlaceholderImages();

    // Show welcome screen
    showSection('section-welcome');

    // Add shake animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // Add event listeners for automatic response time tracking
    setupResponseTimeTracking();
});

// Setup automatic tracking of question interactions
function setupResponseTimeTracking() {
    // Use event delegation for dynamically loaded content
    document.body.addEventListener('focus', (e) => {
        const input = e.target;
        if (input.name && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
            trackQuestionStart(input.name);
        }
    }, true);

    document.body.addEventListener('change', (e) => {
        const input = e.target;
        if (input.name && (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA')) {
            const value = input.type === 'checkbox' ? input.checked : input.value;
            trackQuestionResponse(input.name, value);
        }
    }, true);

    // Also track on input for text fields
    document.body.addEventListener('input', (e) => {
        const input = e.target;
        if (input.name && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
            trackQuestionStart(input.name);
        }
    }, true);
}

// ===== EXPORT FOR DEBUGGING =====
window.questionnaireState = state;
window.saveAllData = saveAllData;
