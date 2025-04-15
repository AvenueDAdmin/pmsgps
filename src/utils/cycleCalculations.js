/**
 * Cycle Calculations Utility
 * This utility provides functions for calculating menstrual cycle phases
 * and generating recommendations based on scientific research.
 */

// Phase constants
const PHASES = {
    PERIOD: 'period',
    FOLLICULAR: 'follicular',
    OVULATION: 'ovulation',
    LUTEAL: 'luteal'
};

/**
 * Calculate the current phase of the menstrual cycle
 * @param {Date} lastPeriodStart - The date of the last period start
 * @param {Number} cycleLength - The average length of the cycle in days
 * @param {Number} periodLength - The average length of the period in days
 * @returns {String} - The current phase
 */
function calculateCyclePhase(lastPeriodStart, cycleLength, periodLength) {
    const today = new Date();
    const lastPeriod = new Date(lastPeriodStart);
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate days within the current cycle
    const dayInCycle = daysSinceLastPeriod % cycleLength;
    
    // Determine phase based on day in cycle
    if (dayInCycle < periodLength) {
        return PHASES.PERIOD;
    } else if (dayInCycle < 12) {
        return PHASES.FOLLICULAR;
    } else if (dayInCycle >= 12 && dayInCycle <= 16) {
        return PHASES.OVULATION;
    } else {
        return PHASES.LUTEAL;
    }
}

/**
 * Calculate the date of next period
 * @param {Date} lastPeriodStart - The date of the last period start
 * @param {Number} cycleLength - The average length of the cycle in days
 * @returns {Date} - The date of the next period
 */
function calculateNextPeriod(lastPeriodStart, cycleLength) {
    const lastPeriod = new Date(lastPeriodStart);
    const today = new Date();
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate days until next period
    const daysUntilNextPeriod = cycleLength - (daysSinceLastPeriod % cycleLength);
    
    // Calculate next period date
    const nextPeriodDate = new Date(today);
    nextPeriodDate.setDate(today.getDate() + daysUntilNextPeriod);
    
    return nextPeriodDate;
}

/**
 * Calculate the fertile window (highest chance of conception)
 * @param {Date} lastPeriodStart - The date of the last period start
 * @param {Number} cycleLength - The average length of the cycle in days
 * @returns {Object} - The start and end dates of the fertile window
 */
function calculateFertileWindow(lastPeriodStart, cycleLength) {
    const nextPeriod = calculateNextPeriod(lastPeriodStart, cycleLength);
    
    // Fertile window typically starts 14 days before next period and lasts about 6 days
    const fertileEnd = new Date(nextPeriod);
    fertileEnd.setDate(nextPeriod.getDate() - 10);
    
    const fertileStart = new Date(fertileEnd);
    fertileStart.setDate(fertileEnd.getDate() - 5);
    
    return {
        start: fertileStart,
        end: fertileEnd
    };
}

/**
 * Generate date and activity recommendations based on cycle phase
 * @param {String} phase - The current cycle phase
 * @returns {Object} - Recommendations for dates, gifts, and behavior
 */
function generateRecommendations(phase) {
    // Recommendations based on scientific research about hormone levels during different phases
    const recommendations = {
        [PHASES.PERIOD]: {
            dateIdeas: [
                'Relaxed night in with movies',
                'Cooking a comfort meal together',
                'Quiet cafe for talking',
                'Low-key restaurant dinner'
            ],
            giftIdeas: [
                'Heating pad or hot water bottle',
                'Favorite comfort snacks',
                'Relaxing bath products',
                'Comfortable loungewear'
            ],
            behaviors: [
                'Be understanding of mood fluctuations',
                'Offer physical comfort for cramps',
                'Be patient with lower energy levels',
                'Take on more household responsibilities'
            ],
            shaving: 'Many women prefer not to during this time due to increased skin sensitivity'
        },
        
        [PHASES.FOLLICULAR]: {
            dateIdeas: [
                'Try a new restaurant or cuisine',
                'Museum or art exhibit visit',
                'Outdoor activities in nature',
                'Creative workshop together'
            ],
            giftIdeas: [
                'Books or intellectual gifts',
                'Plants or flowers',
                'Skincare products',
                'Something related to her hobbies'
            ],
            behaviors: [
                'Support her increased energy with activities',
                'Engage in mental stimulation and conversation',
                'Be receptive to her increased socializing',
                'Match her optimistic outlook'
            ],
            shaving: 'Regular routine is fine, skin is not particularly sensitive'
        },
        
        [PHASES.OVULATION]: {
            dateIdeas: [
                'Dancing or active date',
                'Concert or music event',
                'Adventurous outdoor activities',
                'Social gatherings with friends'
            ],
            giftIdeas: [
                'Perfume or scented products',
                'Lingerie or clothing that makes her feel sexy',
                'Jewelry or accessories',
                'High-quality chocolate or wine'
            ],
            behaviors: [
                'Compliment her appearance more',
                'Be receptive to increased flirtation',
                'Match her higher energy levels',
                'Be confident and take initiative'
            ],
            shaving: 'Women often prefer to look their best during this phase'
        },
        
        [PHASES.LUTEAL]: {
            dateIdeas: [
                'Cozy coffee shop date',
                'Home cooking together',
                'Spa day or massage',
                'Quiet walk in a peaceful setting'
            ],
            giftIdeas: [
                'Comforting teas or drinks',
                'Self-care items',
                'Favorite sweet treats',
                'Cozy blanket or comfort items'
            ],
            behaviors: [
                'Be patient with mood changes',
                'Listen more than speak',
                'Offer reassurance and support',
                'Avoid high-stress situations'
            ],
            shaving: 'Skin may be more sensitive, so be understanding'
        }
    };
    
    return recommendations[phase];
}

/**
 * Predict mood patterns based on cycle phase
 * @param {String} phase - The current cycle phase
 * @returns {Object} - Likely mood patterns and how to respond
 */
function predictMoodPatterns(phase) {
    const moodPatterns = {
        [PHASES.PERIOD]: {
            common: ['Fatigue', 'Irritability', 'Relief', 'Emotional sensitivity'],
            response: 'Offer comfort and space. Be patient and understanding.'
        },
        
        [PHASES.FOLLICULAR]: {
            common: ['Increasing energy', 'Optimism', 'Sociability', 'Creativity'],
            response: 'Engage with her ideas and match her positivity and energy.'
        },
        
        [PHASES.OVULATION]: {
            common: ['Confidence', 'Heightened mood', 'Increased libido', 'Social extroversion'],
            response: 'Compliment her, be receptive to intimacy, and match her energy levels.'
        },
        
        [PHASES.LUTEAL]: {
            common: ['Decreasing energy', 'Potential irritability', 'Introspection', 'Sensitivity'],
            response: 'Be supportive, offer reassurance, and avoid adding stress.'
        }
    };
    
    return moodPatterns[phase];
}

/**
 * Generate a 30-day forecast of cycle phases
 * @param {Date} lastPeriodStart - The date of the last period start
 * @param {Number} cycleLength - The average length of the cycle in days
 * @param {Number} periodLength - The average length of the period in days
 * @returns {Array} - Array of objects with date and phase information
 */
function generateCycleForecast(lastPeriodStart, cycleLength, periodLength) {
    const today = new Date();
    const forecast = [];
    
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Calculate cycle phase for this date
        const lastPeriod = new Date(lastPeriodStart);
        const daysSinceLastPeriod = Math.floor((date - lastPeriod) / (1000 * 60 * 60 * 24));
        const dayInCycle = daysSinceLastPeriod % cycleLength;
        
        let phase;
        if (dayInCycle < periodLength) {
            phase = PHASES.PERIOD;
        } else if (dayInCycle < 12) {
            phase = PHASES.FOLLICULAR;
        } else if (dayInCycle >= 12 && dayInCycle <= 16) {
            phase = PHASES.OVULATION;
        } else {
            phase = PHASES.LUTEAL;
        }
        
        forecast.push({
            date: date,
            phase: phase,
            dayInCycle: dayInCycle + 1 // 1-indexed for user display
        });
    }
    
    return forecast;
}

// Export utility functions
export {
    PHASES,
    calculateCyclePhase,
    calculateNextPeriod,
    calculateFertileWindow,
    generateRecommendations,
    predictMoodPatterns,
    generateCycleForecast
};
