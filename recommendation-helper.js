// Recommendation Helper Functions
function safeGenerateRecommendation(phase, relationshipType) {
    try {
        console.log("Generating recommendation for", { phase, relationshipType });
        
        // Safe defaults
        if (!phase) phase = 'regular';
        if (!relationshipType) relationshipType = 'lover';
        
        // Default response if anything fails
        let safeResponse = "Recommendation not available. Please try refreshing the app.";
        
        // Check for undefined values
        if (!window.RECOMMENDATIONS) {
            console.error("RECOMMENDATIONS object is undefined");
            return safeResponse;
        }
        
        // Get relationship map or default to lover
        const relationshipMap = window.RECOMMENDATIONS[relationshipType];
        if (!relationshipMap) {
            console.error("No recommendations for relationship type:", relationshipType);
            return safeResponse;
        }
        
        // Get phase data or default to regular
        const phaseKey = phase.toUpperCase();
        const phaseData = relationshipMap[phaseKey];
        if (!phaseData) {
            console.error("No data for phase:", phaseKey, "in relationship type:", relationshipType);
            return safeResponse;
        }
        
        // Check if data categories exist
        if (!phaseData.DATE_TYPE || !phaseData.DATE_TYPE.length) {
            console.error("DATE_TYPE is missing or empty");
            return safeResponse;
        }
        if (!phaseData.GIFTS || !phaseData.GIFTS.length) {
            console.error("GIFTS is missing or empty");
            return safeResponse;
        }
        if (!phaseData.EMOTIONAL_SUPPORT || !phaseData.EMOTIONAL_SUPPORT.length) {
            console.error("EMOTIONAL_SUPPORT is missing or empty");
            return safeResponse;
        }
        
        // Get random elements safely
        const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
        const dateType = getRandomItem(phaseData.DATE_TYPE);
        const gift = getRandomItem(phaseData.GIFTS);
        const support = getRandomItem(phaseData.EMOTIONAL_SUPPORT);
        
        return `Try a "${dateType}" date. Consider ${gift.toLowerCase()} as a gift. ${support}.`;
    } catch (error) {
        console.error("Error in recommendation generation:", error);
        return "Unable to generate recommendation due to an error.";
    }
}

// Patch the original function when this script loads
window.addEventListener('DOMContentLoaded', function() {
    console.log("Patching generateRecommendation function");
    window.generateRecommendation = safeGenerateRecommendation;
}); 