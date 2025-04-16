// Authentication functionality
let isAuthenticated = false;
const AUTH_STORAGE_KEY = 'pms_auth_data';
const EXPIRY_DAYS = 30;

// Check if user is authenticated on page load
document.addEventListener('DOMContentLoaded', function() {
    // Authentication check comes first, before any other app initialization
    checkAuthentication();
    
    // Firebase Auth state change listener
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, load data from Firebase
            console.log("User is signed in:", user.email);
            isAuthenticated = true;
            showApp();
            
            loadPartnersFromFirebase().then(loadedPartners => {
                if (loadedPartners && loadedPartners.length > 0) {
                    partners = loadedPartners;
                    renderPartnersList();
                }
            });
        } else {
            // No user is signed in, show auth screen
            console.log("No user is signed in");
            isAuthenticated = false;
            showAuthScreen();
        }
    });
    
    // Rest of the app initialization
    renderPartnersList();
    
    // Show onboarding wizard for first-time users
    if (!hasCompletedOnboarding) {
        showOnboardingWizard();
    }
    
    // Add animation classes on load
    animateElementsOnLoad();
    
    // Add mobile-specific classes if needed
    if (isMobile || isTouchDevice) {
        document.body.classList.add('mobile-device');
        addTouchSpecificInteractions();
    }
});

// Constants
const PHASES = {
    PERIOD: 'period',
    FERTILE: 'fertile',
    REGULAR: 'regular'
};

const RELATIONSHIP_TYPES = {
    PARTNER: 'partner',
    LOVER: 'lover',
    COWORKER: 'coworker',
    FRIEND: 'friend',
    FAMILY: 'family'
};

const RELATIONSHIP_LABELS = {
    partner: 'Partner (Serious)',
    lover: 'F*ckBuddy/Lover',
    coworker: 'Co-Worker',
    friend: 'Friend',
    family: 'Family Member'
};

const RELATIONSHIP_ICONS = {
    partner: 'fa-heart',
    lover: 'fa-fire',
    coworker: 'fa-briefcase',
    friend: 'fa-user-friends',
    family: 'fa-home'
};

// Customize recommendations based on relationship type and phase
const RECOMMENDATIONS = {
    [RELATIONSHIP_TYPES.PARTNER]: {
        [PHASES.PERIOD]: {
            DATE_TYPE: [
                'Netflix and dinner at home',
                'Relaxing spa day',
                'Cozy movie night',
                'Cooking a comfort meal together'
            ],
            GIFTS: [
                'Comfortable loungewear',
                'Favorite chocolates',
                'Heating pad',
                'Pain relief products'
            ],
            EMOTIONAL_SUPPORT: [
                'Extra patience and understanding',
                'Listen to her needs',
                'Physical comfort like back rubs',
                'Give her space when needed'
            ],
            SHAVING: 'Optional, many women prefer not to shave during this time'
        },
        [PHASES.FERTILE]: {
            DATE_TYPE: [
                'Active outdoor adventure',
                'Dancing',
                'Exciting new restaurant',
                'Something that gets her heart pumping'
            ],
            GIFTS: [
                'Lingerie',
                'Perfume',
                'Jewelry',
                'Flowers'
            ],
            EMOTIONAL_SUPPORT: [
                'Compliments on her appearance',
                'Physical touch and flirtation',
                'Be spontaneous and romantic',
                'Show confidence'
            ],
            SHAVING: 'Recommended, women often prefer to look their best during this phase'
        },
        [PHASES.REGULAR]: {
            DATE_TYPE: [
                'Casual dinner out',
                'Coffee and bookstore',
                'Museum or art gallery',
                'Wine tasting'
            ],
            GIFTS: [
                'Books',
                'Plants',
                'Thoughtful small items',
                'Something related to her hobbies'
            ],
            EMOTIONAL_SUPPORT: [
                'Discuss future plans',
                'Ask about her goals and aspirations',
                'Be a good listener',
                'Share your thoughts and feelings'
            ],
            SHAVING: 'Your regular routine is fine'
        }
    },
    [RELATIONSHIP_TYPES.LOVER]: {
        [PHASES.PERIOD]: {
            DATE_TYPE: [
                'Reschedule for after her period',
                'Netflix without the chill',
                'Casual meetup at a bar',
                'Low-key activity with no expectations'
            ],
            GIFTS: [
                'Skip gifts to avoid mixed signals',
                'Maybe just bring wine or snacks',
                'A dessert if you\'re meeting for dinner',
                'Nothing too personal'
            ],
            EMOTIONAL_SUPPORT: [
                'Respect her space',
                'Keep conversation light',
                'Don\'t pressure for intimacy',
                'Reschedule if she\'s not feeling well'
            ],
            SHAVING: 'Irrelevant during this phase as intimacy is unlikely'
        },
        [PHASES.FERTILE]: {
            DATE_TYPE: [
                'Last-minute invite',
                'Evening drinks',
                'Late night meetup',
                'Dancing or active date'
            ],
            GIFTS: [
                'Skip gifts to maintain casual boundaries',
                'Drinks are sufficient',
                'Protection (always a good idea)',
                'Ordering food in'
            ],
            EMOTIONAL_SUPPORT: [
                'Keep things light and fun',
                'Focus on physical connection',
                'Avoid deep emotional conversations',
                'Be direct about intentions'
            ],
            SHAVING: 'Recommended, maintain good hygiene'
        },
        [PHASES.REGULAR]: {
            DATE_TYPE: [
                'Casual meetup',
                'Drinks or coffee',
                'Activity you both enjoy',
                'Whatever suits your arrangement'
            ],
            GIFTS: [
                'No gifts needed',
                'Split the check',
                'Keep things casual',
                'Avoid anything that signals commitment'
            ],
            EMOTIONAL_SUPPORT: [
                'Maintain boundaries',
                'Respect the casual nature',
                'Check in occasionally',
                'Don\'t create unnecessary drama'
            ],
            SHAVING: 'Your normal grooming routine'
        }
    },
    [RELATIONSHIP_TYPES.COWORKER]: {
        [PHASES.PERIOD]: {
            DATE_TYPE: [
                'Keep interactions professional',
                'Lunch at the office',
                'Coffee break',
                'Work-related meetings only'
            ],
            GIFTS: [
                'Avoid gifts entirely',
                'Coffee if you\'re getting one anyway',
                'Team treats rather than individual gifts',
                'Keep everything professional'
            ],
            EMOTIONAL_SUPPORT: [
                'Maintain professional boundaries',
                'Be understanding of mood changes',
                'Offer to help with work tasks if needed',
                'Give space if she seems uncomfortable'
            ],
            SHAVING: 'Not relevant to professional relationships'
        },
        [PHASES.FERTILE]: {
            DATE_TYPE: [
                'Strictly professional interactions',
                'Team lunch is acceptable',
                'Work-related coffee',
                'Maintain professional boundaries'
            ],
            GIFTS: [
                'Avoid personal gifts',
                'Keep any gestures work-appropriate',
                'Group treats are ok',
                'Nothing that could be misinterpreted'
            ],
            EMOTIONAL_SUPPORT: [
                'Be professional but friendly',
                'Respect workplace boundaries',
                'Acknowledge her ideas in meetings',
                'Keep personal comments to a minimum'
            ],
            SHAVING: 'Completely irrelevant to professional relationships'
        },
        [PHASES.REGULAR]: {
            DATE_TYPE: [
                'Keep all interactions professional',
                'Team lunch or coffee',
                'Work-related events only',
                'Professional networking'
            ],
            GIFTS: [
                'Only group gifts for special occasions',
                'Work-related items if necessary',
                'Appropriate holiday team gifts',
                'Nothing personal'
            ],
            EMOTIONAL_SUPPORT: [
                'Professional empathy',
                'Team support',
                'Recognition of work achievements',
                'Maintain appropriate workplace relationship'
            ],
            SHAVING: 'Not applicable to professional relationships'
        }
    },
    [RELATIONSHIP_TYPES.FRIEND]: {
        [PHASES.PERIOD]: {
            DATE_TYPE: [
                'Relaxed hangout at home',
                'Movie night',
                'Comfort food meetup',
                'Low-key café catch-up'
            ],
            GIFTS: [
                'Chocolate or her favorite snack',
                'Offer a heating pad if she mentions cramps',
                'Tea or comfort drinks',
                'No gift necessary but small gesture appreciated'
            ],
            EMOTIONAL_SUPPORT: [
                'Listen if she wants to talk',
                'Be understanding if plans change',
                'Offer to bring food if hanging out',
                'Give space if needed'
            ],
            SHAVING: 'Not relevant to platonic friendship'
        },
        [PHASES.FERTILE]: {
            DATE_TYPE: [
                'Active social outings',
                'Group activities',
                'Try a new restaurant',
                'Creative activity or class'
            ],
            GIFTS: [
                'Not necessary for regular hangouts',
                'Birthday or special occasion gifts only',
                'Split costs for activities',
                'Small thoughtful items if you see something perfect'
            ],
            EMOTIONAL_SUPPORT: [
                'Be a good listener',
                'Engage in her interests',
                'Be supportive of her dating life',
                'Maintain appropriate friendship boundaries'
            ],
            SHAVING: 'Not relevant to friendship'
        },
        [PHASES.REGULAR]: {
            DATE_TYPE: [
                'Regular friend activities',
                'Coffee catch-ups',
                'Shopping together',
                'Fitness class or walking'
            ],
            GIFTS: [
                'Normal friendship gift protocol',
                'Special occasions only',
                'Small meaningful items occasionally',
                'Splitting costs for activities'
            ],
            EMOTIONAL_SUPPORT: [
                'Regular friendship support',
                'Listen to her updates',
                'Share your experiences too',
                'Maintain healthy friendship boundaries'
            ],
            SHAVING: 'Not applicable to friendship'
        }
    },
    [RELATIONSHIP_TYPES.FAMILY]: {
        [PHASES.PERIOD]: {
            DATE_TYPE: [
                'Quiet family meal',
                'Home movie night',
                'Low-key family activities',
                'Give space if she needs it'
            ],
            GIFTS: [
                'Tea or comfort drinks',
                'Her favorite snack',
                'Offer to make her favorite meal',
                'Heating pad if appropriate for your relationship'
            ],
            EMOTIONAL_SUPPORT: [
                'Be patient with mood swings',
                'Offer to help with tasks',
                'Give space when needed',
                'Be understanding of physical discomfort'
            ],
            SHAVING: 'Not relevant to family relationships'
        },
        [PHASES.FERTILE]: {
            DATE_TYPE: [
                'Normal family activities',
                'Family meals',
                'Regular family routines',
                'Respect her social schedule'
            ],
            GIFTS: [
                'Not necessary outside normal occasions',
                'Normal family gift protocol',
                'Thoughtful gestures for birthdays/holidays',
                'Practical helpful items if needed'
            ],
            EMOTIONAL_SUPPORT: [
                'Regular family support',
                'Respect her independence',
                'Maintain appropriate boundaries',
                'Be supportive without being intrusive'
            ],
            SHAVING: 'Not applicable to family relationships'
        },
        [PHASES.REGULAR]: {
            DATE_TYPE: [
                'Standard family activities',
                'Family meals',
                'Shopping together if that\'s your dynamic',
                'Normal family routines'
            ],
            GIFTS: [
                'Special occasions only',
                'Birthday and holiday gifts',
                'Small thoughtful items occasionally',
                'Practical helpful gifts'
            ],
            EMOTIONAL_SUPPORT: [
                'Regular family support',
                'Listen when needed',
                'Respect privacy and boundaries',
                'Be available but not intrusive'
            ],
            SHAVING: 'Not relevant to family relationships'
        }
    }
};

// DOM Elements
const addPartnerBtn = document.getElementById('add-partner-btn');
const addFirstPartnerBtn = document.getElementById('add-first-partner-btn');
const settingsBtn = document.getElementById('settings-btn');
const addPartnerModal = document.getElementById('add-partner-modal');
const partnerDetailModal = document.getElementById('partner-detail-modal');
const addPartnerForm = document.getElementById('add-partner-form');
const partnersList = document.getElementById('partners-list');
const closeBtns = document.querySelectorAll('.close-btn');
const themeToggle = document.getElementById('theme-toggle');

// Onboarding Wizard Elements
const onboardingWizard = document.getElementById('onboarding-wizard');
const wizardNext = document.getElementById('wizard-next');
const wizardPrev = document.getElementById('wizard-prev');
const wizardSkip = document.getElementById('wizard-skip');
const wizardDots = document.querySelectorAll('.wizard-dot');
const wizardAddPartner = document.getElementById('wizard-add-partner');
const wizardSteps = document.querySelectorAll('.wizard-step');

// State
let partners = []; // This will now load from Firebase
let currentWizardStep = 1;
let hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

// Apply dark mode if saved
if (darkMode) {
    document.body.classList.add('dark-mode');
}

// Event Listeners
addPartnerBtn.addEventListener('click', () => {
    openModal(addPartnerModal);
});

addFirstPartnerBtn.addEventListener('click', () => {
    openModal(addPartnerModal);
});

settingsBtn.addEventListener('click', () => {
    alert('Settings functionality will be added in future updates.');
});

// Add sign out button listener
document.getElementById('sign-out-btn').addEventListener('click', () => {
    // Sign out from Firebase
    firebase.auth().signOut()
        .then(() => {
            console.log("User signed out successfully");
            // Redirect to login screen
            showAuthScreen();
        })
        .catch((error) => {
            console.error("Error signing out:", error);
            alert("There was a problem signing out. Please try again.");
        });
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(btn.closest('.modal'));
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

addPartnerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const partnerName = document.getElementById('partner-name').value;
    const relationshipType = document.getElementById('relationship-type').value;
    const lastPeriod = document.getElementById('last-period').value;
    const cycleLength = parseInt(document.getElementById('cycle-length').value);
    const periodLength = parseInt(document.getElementById('period-length').value);
    
    addPartner(partnerName, relationshipType, lastPeriod, cycleLength, periodLength);
    addPartnerForm.reset();
    closeModal(addPartnerModal);
    renderPartnersList();
});

// Onboarding Wizard Event Listeners
wizardNext.addEventListener('click', () => {
    if (currentWizardStep < wizardSteps.length) {
        navigateWizard(currentWizardStep + 1);
    }
});

wizardPrev.addEventListener('click', () => {
    if (currentWizardStep > 1) {
        navigateWizard(currentWizardStep - 1);
    }
});

wizardSkip.addEventListener('click', () => {
    completeOnboarding();
});

wizardDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const step = parseInt(dot.dataset.step);
        navigateWizard(step);
    });
});

wizardAddPartner.addEventListener('click', () => {
    completeOnboarding();
    openModal(addPartnerModal);
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', darkMode);
});

// Add event listeners for relationship type cards in the wizard
document.querySelectorAll('.relationship-type-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.relationship-type-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
    });
});

/**
 * Add mobile-specific event handlers
 */
function addTouchSpecificInteractions() {
    // Make entire partner card clickable on mobile
    document.addEventListener('click', function(e) {
        let targetElement = e.target;
        
        // Find if the click was within a partner card
        while (targetElement != null) {
            if (targetElement.classList && targetElement.classList.contains('partner-card')) {
                // Don't trigger if clicked on the details button directly
                if (!e.target.classList.contains('details-btn') && 
                    !e.target.closest('.details-btn')) {
                    const detailsBtn = targetElement.querySelector('.details-btn');
                    if (detailsBtn) {
                        detailsBtn.click();
                        e.preventDefault();
                    }
                }
                break;
            }
            targetElement = targetElement.parentElement;
        }
    });
    
    // Add swipe to dismiss for modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        let startY = 0;
        let distY = 0;
        
        modal.addEventListener('touchstart', function(e) {
            if (e.target === modal || e.target.closest('.modal-content')) {
                startY = e.touches[0].clientY;
            }
        }, false);
        
        modal.addEventListener('touchmove', function(e) {
            if (e.target === modal) {
                distY = e.touches[0].clientY - startY;
                
                if (distY > 50) {
                    modal.style.background = `rgba(0, 0, 0, ${0.7 - (distY / 500)})`;
                    modal.querySelector('.modal-content').style.transform = `translateY(${distY}px)`;
                }
            }
        }, false);
        
        modal.addEventListener('touchend', function(e) {
            if (distY > 150) {
                closeModal(modal);
            }
            
            // Reset styles
            modal.style.background = '';
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = '';
            }
            distY = 0;
        }, false);
    });
    
    // Ensure proper focusing on form fields
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Add a small delay to ensure the viewport adjustment happens after the keyboard appears
            setTimeout(() => {
                // Scroll the input into view
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
    
    // Disable pull-to-refresh on mobile
    document.body.addEventListener('touchmove', function(e) {
        if (document.body.scrollTop === 0) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Add tap highlight effect
    document.querySelectorAll('button, .partner-card, .relationship-type-card')
        .forEach(el => {
            el.addEventListener('touchstart', function() {
                this.classList.add('tap-highlight');
            });
            
            el.addEventListener('touchend', function() {
                this.classList.remove('tap-highlight');
            });
        });
}

// Function to check if an element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

function addPartner(name, relationshipType, lastPeriod, cycleLength, periodLength) {
    const newPartner = {
        id: Date.now().toString(),
        name,
        relationshipType,
        lastPeriod: new Date(lastPeriod).toISOString(),
        cycleLength: parseInt(cycleLength),
        periodLength: parseInt(periodLength),
        dateAdded: new Date().toISOString()
    };
    
    partners.push(newPartner);
    savePartners();
    return newPartner;
}

function savePartners() {
    // Save to both localStorage and Firebase for backwards compatibility
    localStorage.setItem('partners', JSON.stringify(partners));
    savePartnersToFirebase(partners);
}

function renderPartnersList() {
    const partnersList = document.getElementById('partners-list');
    
    // Clear existing list
    partnersList.innerHTML = '';
    
    if (partners.length === 0) {
        // Show empty state
        partnersList.innerHTML = `
            <div class="empty-state">
                <p>No partners added yet</p>
                <button id="add-first-partner-btn">Add Your First Partner</button>
            </div>
        `;
        
        // Add event listener to the "Add Your First Partner" button
        const addFirstPartnerBtn = document.getElementById('add-first-partner-btn');
        if (addFirstPartnerBtn) {
            addFirstPartnerBtn.addEventListener('click', function() {
                openModal(document.getElementById('add-partner-modal'));
            });
        }
        
        return;
    }
    
    partners.forEach(partner => {
        const card = createEnhancedPartnerCard(partner);
        partnersList.appendChild(card);
    });
    
    // Add staggered animation
    animateElementsOnLoad();
}

function calculateCurrentPhase(partner) {
    const today = new Date();
    const lastPeriod = new Date(partner.lastPeriod);
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate days within the current cycle
    const dayInCycle = daysSinceLastPeriod % partner.cycleLength;
    
    // Determine current phase
    if (dayInCycle < partner.periodLength) {
        return PHASES.PERIOD;
    } else if (dayInCycle >= (partner.cycleLength - 14) && dayInCycle <= (partner.cycleLength - 11)) {
        return PHASES.FERTILE;
    } else {
        return PHASES.REGULAR;
    }
}

/**
 * Generate a recommendation based on phase and relationship type
 * @param {String} phase - The current cycle phase
 * @param {String} relationshipType - The type of relationship
 * @returns {String} - A recommendation string
 */
function generateRecommendation(phase, relationshipType) {
    try {
        // Set safe defaults
        let relType = RELATIONSHIP_TYPES.LOVER;
        let safePhase = PHASES.REGULAR.toUpperCase();
        
        // Safely get relationship type
        if (relationshipType) {
            // Make sure it's a valid key in RELATIONSHIP_TYPES
            for (const key in RELATIONSHIP_TYPES) {
                if (RELATIONSHIP_TYPES[key] === relationshipType) {
                    relType = relationshipType;
                    break;
                }
            }
        }
        
        // Safely get phase
        if (phase) {
            const upperPhase = phase.toUpperCase();
            if (upperPhase === PHASES.PERIOD.toUpperCase() || 
                upperPhase === PHASES.FERTILE.toUpperCase() || 
                upperPhase === PHASES.REGULAR.toUpperCase()) {
                safePhase = upperPhase;
            }
        }
        
        // Check if RECOMMENDATIONS exists and has the relationship type
        if (!RECOMMENDATIONS || !RECOMMENDATIONS[relType]) {
            return "No recommendations available for this relationship type.";
        }
        
        // Check if phase data exists
        const phaseData = RECOMMENDATIONS[relType][safePhase];
        if (!phaseData) {
            return "No recommendations available for this phase.";
        }
        
        // Check if recommendation categories exist
        if (!phaseData.DATE_TYPE || !phaseData.GIFTS || !phaseData.EMOTIONAL_SUPPORT) {
            return "Recommendation data is incomplete.";
        }
        
        // Make sure arrays have elements
        if (phaseData.DATE_TYPE.length === 0 || 
            phaseData.GIFTS.length === 0 || 
            phaseData.EMOTIONAL_SUPPORT.length === 0) {
            return "Recommendation data is empty.";
        }
        
        // Safely get random elements
        const dateIndex = Math.floor(Math.random() * phaseData.DATE_TYPE.length);
        const giftIndex = Math.floor(Math.random() * phaseData.GIFTS.length);
        const supportIndex = Math.floor(Math.random() * phaseData.EMOTIONAL_SUPPORT.length);
        
        const dateType = phaseData.DATE_TYPE[dateIndex] || "any activity";
        const gift = phaseData.GIFTS[giftIndex] || "something thoughtful";
        const support = phaseData.EMOTIONAL_SUPPORT[supportIndex] || "Be supportive";
        
        return `Try a "${dateType}" date. Consider ${gift.toLowerCase()} as a gift. ${support}.`;
    } catch (error) {
        console.error("Error generating recommendation:", error);
        return "Unable to generate recommendation at this time.";
    }
}

function showPartnerDetails(partner) {
    const currentPhase = calculateCurrentPhase(partner);
    const nextPeriodDate = calculateNextPeriodDate(partner);
    const fertilePhaseStart = calculateFertilePhaseStart(partner);
    const fertilePhaseEnd = calculateFertilePhaseEnd(partner);
    
    // Get recommendations specific to relationship type
    const relationshipRecs = RECOMMENDATIONS[partner.relationshipType || RELATIONSHIP_TYPES.LOVER][currentPhase.toUpperCase()];
    
    // Get relationship label
    const relationshipLabel = RELATIONSHIP_LABELS[partner.relationshipType || 'lover'];
    
    partnerDetailModal.querySelector('.modal-content').innerHTML = `
        <span class="close-btn">&times;</span>
        <h2>${partner.name}'s Details</h2>
        <div class="relationship-badge ${partner.relationshipType || 'lover'}">
            <i class="fas ${RELATIONSHIP_ICONS[partner.relationshipType || 'lover']}"></i> ${relationshipLabel}
        </div>
        
        <div class="partner-stats">
            <p><strong>Current Phase:</strong> ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</p>
            <p><strong>Next Period:</strong> ${formatDate(nextPeriodDate)}</p>
            <p><strong>Fertile Window:</strong> ${formatDate(fertilePhaseStart)} - ${formatDate(fertilePhaseEnd)}</p>
            <p><strong>Cycle Length:</strong> ${partner.cycleLength} days</p>
            <p><strong>Period Length:</strong> ${partner.periodLength} days</p>
        </div>
        
        <div class="cycle-visualization">
            <h3>30-Day Cycle Visualization</h3>
            <div class="calendar-days">
                ${generateCycleVisualization(partner)}
            </div>
        </div>
        
        <div class="recommendations-section">
            <h3>Recommendations for ${relationshipLabel} Relationship</h3>
            
            <div class="recommendation-card">
                <div class="recommendation-title">Activity Ideas</div>
                <p>${relationshipRecs.DATE_TYPE.join(', ')}</p>
            </div>
            
            <div class="recommendation-card">
                <div class="recommendation-title">Gift Ideas</div>
                <p>${relationshipRecs.GIFTS.join(', ')}</p>
            </div>
            
            <div class="recommendation-card">
                <div class="recommendation-title">Support Advice</div>
                <p>${relationshipRecs.EMOTIONAL_SUPPORT.join(', ')}</p>
            </div>
            
            ${partner.relationshipType === 'lover' || partner.relationshipType === 'fbuddy' ? 
            `<div class="recommendation-card">
                <div class="recommendation-title">Intimacy Tip</div>
                <p>${relationshipRecs.SHAVING}</p>
            </div>` : ''}
        </div>
        
        <button class="delete-partner-btn" data-id="${partner.id}">Remove Partner</button>
    `;
    
    openModal(partnerDetailModal);
    
    // Add event listeners for the detail modal
    partnerDetailModal.querySelector('.close-btn').addEventListener('click', () => {
        closeModal(partnerDetailModal);
    });
    
    partnerDetailModal.querySelector('.delete-partner-btn').addEventListener('click', (e) => {
        const partnerId = parseInt(e.target.dataset.id);
        deletePartner(partnerId);
        closeModal(partnerDetailModal);
    });
}

function calculateNextPeriodDate(partner) {
    const lastPeriod = new Date(partner.lastPeriod);
    const today = new Date();
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate days until next period
    const daysUntilNextPeriod = partner.cycleLength - (daysSinceLastPeriod % partner.cycleLength);
    
    // Calculate next period date
    const nextPeriodDate = new Date(today);
    nextPeriodDate.setDate(today.getDate() + daysUntilNextPeriod);
    
    return nextPeriodDate;
}

function calculateFertilePhaseStart(partner) {
    const nextPeriodDate = calculateNextPeriodDate(partner);
    
    // Fertile phase typically starts 14 days before next period
    const fertileStart = new Date(nextPeriodDate);
    fertileStart.setDate(nextPeriodDate.getDate() - 14);
    
    return fertileStart;
}

function calculateFertilePhaseEnd(partner) {
    const fertileStart = calculateFertilePhaseStart(partner);
    
    // Fertile phase typically lasts about 4 days
    const fertileEnd = new Date(fertileStart);
    fertileEnd.setDate(fertileStart.getDate() + 3);
    
    return fertileEnd;
}

function generateCycleVisualization(partner) {
    const today = new Date();
    let html = '';
    
    // Generate 30 day bars
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Determine phase for this day
        const phase = determineDayPhase(date, partner);
        
        html += `
            <div class="day">
                <div class="day-label">${date.getDate()}</div>
                <div class="day-bar ${phase}"></div>
            </div>
        `;
    }
    
    return html;
}

function determineDayPhase(date, partner) {
    const lastPeriod = new Date(partner.lastPeriod);
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((date - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate days within the current cycle
    const dayInCycle = daysSinceLastPeriod % partner.cycleLength;
    
    // Determine phase
    if (dayInCycle < partner.periodLength) {
        return PHASES.PERIOD;
    } else if (dayInCycle >= (partner.cycleLength - 14) && dayInCycle <= (partner.cycleLength - 11)) {
        return PHASES.FERTILE;
    } else {
        return PHASES.REGULAR;
    }
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function deletePartner(partnerId) {
    partners = partners.filter(partner => partner.id !== partnerId);
    savePartners();
    renderPartnersList();
}

/**
 * Show the onboarding wizard
 */
function showOnboardingWizard() {
    openModal(onboardingWizard);
    currentWizardStep = 1;
    updateWizardUI();
}

/**
 * Navigate to a specific step in the wizard
 * @param {Number} step - The step number to navigate to
 */
function navigateWizard(step) {
    if (step < 1 || step > wizardSteps.length) return;
    
    // Hide current step
    document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`).classList.remove('active');
    document.querySelector(`.wizard-dot[data-step="${currentWizardStep}"]`).classList.remove('active');
    
    // Show new step
    currentWizardStep = step;
    updateWizardUI();
}

/**
 * Update the wizard UI based on current step
 */
function updateWizardUI() {
    // Show current step
    document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`).classList.add('active');
    document.querySelector(`.wizard-dot[data-step="${currentWizardStep}"]`).classList.add('active');
    
    // Update button states
    wizardPrev.disabled = currentWizardStep === 1;
    
    if (currentWizardStep === wizardSteps.length) {
        wizardNext.style.display = 'none';
    } else {
        wizardNext.style.display = 'block';
    }
}

/**
 * Mark onboarding as completed and close the wizard
 */
function completeOnboarding() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    hasCompletedOnboarding = true;
    closeModal(onboardingWizard);
}

/**
 * Add animation classes to elements on load
 */
function animateElementsOnLoad() {
    // Add staggered animation to partner cards
    const cards = document.querySelectorAll('.partner-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add pulse animation to empty state button
    const emptyStateBtn = document.querySelector('.empty-state button');
    if (emptyStateBtn) {
        setTimeout(() => {
            emptyStateBtn.classList.add('pulse');
        }, 1000);
    }
}

/**
 * Render a partner card with enhanced visuals
 * @param {Object} partner - The partner data
 * @returns {HTMLElement} - The rendered card
 */
function createEnhancedPartnerCard(partner) {
    const currentPhase = calculateCurrentPhase(partner);
    const recommendation = generateRecommendation(currentPhase, partner.relationshipType);
    
    const partnerCard = document.createElement('div');
    partnerCard.classList.add('partner-card', `phase-${currentPhase}`);
    partnerCard.dataset.id = partner.id;
    
    // Get relationship label and icon
    const relationshipLabel = RELATIONSHIP_LABELS[partner.relationshipType || 'lover'];
    const relationshipIcon = RELATIONSHIP_ICONS[partner.relationshipType || 'lover'];
    
    partnerCard.innerHTML = `
        <div class="partner-name">
            ${partner.name}
            <span class="relationship-badge ${partner.relationshipType || 'lover'}">
                <i class="fas ${relationshipIcon}"></i> ${relationshipLabel}
            </span>
        </div>
        <div class="cycle-phase">Current phase: <strong>${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</strong></div>
        
        <div class="cycle-status">
            <div class="status-indicator ${currentPhase}" style="width: 100%;"></div>
        </div>
        
        <div class="recommendation">
            <strong>Recommendation:</strong> ${recommendation}
        </div>
        
        <button class="details-btn">View Details</button>
    `;
    
    // Add click event for details button
    partnerCard.querySelector('.details-btn').addEventListener('click', () => {
        showPartnerDetails(partner);
    });
    
    return partnerCard;
}

// Authentication Functions
function checkAuthentication() {
    // Firebase will handle authentication state
    console.log("Checking authentication via Firebase");
}

function showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const signupScreen = document.getElementById('signup-screen');
    const appContainer = document.getElementById('app-container');
    
    // Show auth screen and hide the main app content
    authScreen.style.display = 'flex';
    signupScreen.style.display = 'none';
    appContainer.style.display = 'none';
    
    // Hide error message initially
    document.getElementById('auth-error-message').style.display = 'none';
    document.getElementById('signup-error-message').style.display = 'none';
    
    // Add event listener for login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        loginWithEmailPassword(email, password);
    });
    
    // Add event listener for signup form
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        createAccount(email, password);
    });
    
    // Switch between login and signup
    document.getElementById('show-signup').addEventListener('click', function(e) {
        e.preventDefault();
        authScreen.style.display = 'none';
        signupScreen.style.display = 'flex';
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        authScreen.style.display = 'flex';
        signupScreen.style.display = 'none';
    });
}

function loginWithEmailPassword(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log("User logged in:", user.email);
            showApp();
        })
        .catch((error) => {
            console.error("Login error:", error);
            const errorMessage = error.message;
            showAuthError(errorMessage);
        });
}

function createAccount(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up and signed in
            const user = userCredential.user;
            console.log("Account created for:", user.email);
            showApp();
        })
        .catch((error) => {
            console.error("Signup error:", error);
            const errorMessage = error.message;
            showSignupError(errorMessage);
        });
}

function showApp() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('signup-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
}

function showAuthError(message) {
    const errorElement = document.getElementById('auth-error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add shake animation
    const form = document.getElementById('login-form');
    form.classList.add('shake');
    
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}

function showSignupError(message) {
    const errorElement = document.getElementById('signup-error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add shake animation
    const form = document.getElementById('signup-form');
    form.classList.add('shake');
    
    setTimeout(() => {
        form.classList.remove('shake');
    }, 500);
}
