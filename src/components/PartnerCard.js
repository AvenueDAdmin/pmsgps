/**
 * Partner Card Component
 * Displays information about a partner and their current cycle phase
 */

class PartnerCard {
    /**
     * Create a new partner card
     * @param {Object} partner - The partner data object
     * @param {Function} onDetailsClick - Callback for when details button is clicked
     */
    constructor(partner, onDetailsClick) {
        this.partner = partner;
        this.onDetailsClick = onDetailsClick;
        this.element = null;
    }
    
    /**
     * Calculate the current cycle phase for this partner
     * @returns {String} - The current phase
     */
    calculatePhase() {
        const today = new Date();
        const lastPeriod = new Date(this.partner.lastPeriod);
        
        // Calculate days since last period
        const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
        
        // Calculate days within the current cycle
        const dayInCycle = daysSinceLastPeriod % this.partner.cycleLength;
        
        // Determine current phase
        if (dayInCycle < this.partner.periodLength) {
            return 'period';
        } else if (dayInCycle < 12) {
            return 'follicular';
        } else if (dayInCycle >= 12 && dayInCycle <= 16) {
            return 'ovulation';
        } else {
            return 'luteal';
        }
    }
    
    /**
     * Generate a recommendation based on the current phase
     * @param {String} phase - The current cycle phase
     * @returns {String} - A recommendation string
     */
    generateRecommendation(phase) {
        const recommendations = {
            period: [
                "A relaxing night in might be appreciated right now.",
                "Consider bringing over some comfort food or chocolate.",
                "This is a good time to be extra understanding and patient.",
                "A heating pad or warm bath could be a thoughtful gesture."
            ],
            follicular: [
                "Her energy is increasing - plan something active and fun.",
                "This is a great time for intellectual conversation and new experiences.",
                "Consider a gift related to her personal interests or hobbies.",
                "She's likely feeling upbeat and social right now."
            ],
            ovulation: [
                "She's likely feeling her most confident and social.",
                "This is a perfect time for an exciting date night.",
                "Consider more romantic gestures during this phase.",
                "She may appreciate compliments on her appearance."
            ],
            luteal: [
                "Patience and emotional support are appreciated during this phase.",
                "Cozy and low-key dates are ideal right now.",
                "Comfort items make good gifts in this phase.",
                "She may need more reassurance than usual right now."
            ]
        };
        
        // Choose a random recommendation for the phase
        const phaseRecs = recommendations[phase];
        return phaseRecs[Math.floor(Math.random() * phaseRecs.length)];
    }
    
    /**
     * Calculate the days until next period
     * @returns {Number} - Days until next period
     */
    daysUntilNextPeriod() {
        const today = new Date();
        const lastPeriod = new Date(this.partner.lastPeriod);
        
        // Calculate days since last period
        const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
        
        // Calculate days until next period
        return this.partner.cycleLength - (daysSinceLastPeriod % this.partner.cycleLength);
    }
    
    /**
     * Generate HTML for the progressive cycle indicator
     * @returns {String} - HTML string
     */
    generateCycleIndicator() {
        const currentPhase = this.calculatePhase();
        const daysUntil = this.daysUntilNextPeriod();
        
        let indicator = '';
        
        // Add phase label based on current phase
        if (currentPhase === 'period') {
            indicator = `<span class="phase-label">Period</span>`;
        } else if (currentPhase === 'follicular') {
            indicator = `<span class="phase-label">Follicular Phase</span>`;
        } else if (currentPhase === 'ovulation') {
            indicator = `<span class="phase-label">Ovulation</span>`;
        } else {
            indicator = `<span class="phase-label">Luteal Phase</span>`;
        }
        
        // Add period countdown if in luteal phase and close to period
        if (currentPhase === 'luteal' && daysUntil <= 7) {
            indicator += `<span class="period-countdown">${daysUntil} days until period</span>`;
        }
        
        return indicator;
    }
    
    /**
     * Render the partner card
     * @returns {HTMLElement} - The rendered card element
     */
    render() {
        const currentPhase = this.calculatePhase();
        const recommendation = this.generateRecommendation(currentPhase);
        
        // Create card element
        const card = document.createElement('div');
        card.classList.add('partner-card');
        card.dataset.id = this.partner.id;
        
        // Add phase-specific styling
        card.classList.add(`phase-${currentPhase}`);
        
        // Populate card content
        card.innerHTML = `
            <div class="partner-name">${this.partner.name}</div>
            <div class="cycle-phase">
                ${this.generateCycleIndicator()}
            </div>
            
            <div class="cycle-status">
                <div class="status-indicator ${currentPhase}" style="width: 100%;"></div>
            </div>
            
            <div class="recommendation">
                <strong>Recommendation:</strong> ${recommendation}
            </div>
            
            <button class="details-btn">View Details</button>
        `;
        
        // Add event listener for details button
        const detailsBtn = card.querySelector('.details-btn');
        detailsBtn.addEventListener('click', () => {
            this.onDetailsClick(this.partner);
        });
        
        this.element = card;
        return card;
    }
    
    /**
     * Update the partner card with new data
     * @param {Object} partner - Updated partner data
     */
    update(partner) {
        this.partner = partner;
        
        if (this.element) {
            const newCard = this.render();
            this.element.replaceWith(newCard);
            this.element = newCard;
        }
    }
}

export default PartnerCard;
