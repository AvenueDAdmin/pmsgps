// Firebase Debugging Helpers

// Wait for page to fully load
window.addEventListener('DOMContentLoaded', function() {
    console.log("===== Firebase Debug Tool =====");
    
    // Add debug button to corner of screen
    const debugButton = document.createElement('button');
    debugButton.innerHTML = "Debug Firebase";
    debugButton.style.position = "fixed";
    debugButton.style.bottom = "10px";
    debugButton.style.right = "10px";
    debugButton.style.zIndex = "9999";
    debugButton.style.opacity = "0.7";
    debugButton.style.padding = "5px 10px";
    debugButton.style.backgroundColor = "#e9556d";
    debugButton.style.color = "#fff";
    debugButton.style.border = "none";
    debugButton.style.borderRadius = "5px";
    debugButton.style.cursor = "pointer";
    
    debugButton.addEventListener('click', runFirebaseDebugger);
    document.body.appendChild(debugButton);
});

// Main debugger function
function runFirebaseDebugger() {
    console.clear();
    console.log("===== FIREBASE DEBUG REPORT =====");
    
    // Check if Firebase is defined
    if (!window.firebase) {
        console.error("Firebase SDK is not loaded!");
        showDebugResult("Firebase SDK not loaded. Check your internet connection and script includes.");
        return;
    }
    
    console.log("Firebase SDK loaded ✓");
    
    // Check Firebase config
    const config = window.firebaseConfig;
    if (!config) {
        console.error("Firebase config is missing!");
        showDebugResult("Firebase config not found. Check firebase-config.js");
        return;
    }
    
    console.log("Firebase config:", {
        apiKey: config.apiKey ? "Present ✓" : "MISSING ✗",
        projectId: config.projectId,
        authDomain: config.authDomain,
        storageBucket: config.storageBucket ? "Present ✓" : "MISSING ✗"
    });
    
    // Check Auth
    const auth = firebase.auth && firebase.auth();
    if (!auth) {
        console.error("Firebase Auth is not initialized!");
        showDebugResult("Firebase Auth not initialized. Check firebase-config.js");
        return;
    }
    
    const user = auth.currentUser;
    console.log("Auth initialized ✓");
    console.log("Current user:", user ? user.uid : "Not signed in");
    
    // Check Firestore
    const db = firebase.firestore && firebase.firestore();
    if (!db) {
        console.error("Firestore is not initialized!");
        showDebugResult("Firestore not initialized. Check firebase-config.js");
        return;
    }
    
    console.log("Firestore initialized ✓");
    
    // Test Firestore with a simple operation
    const testDoc = db.collection('tests').doc('debug-' + Date.now());
    testDoc.set({
        timestamp: new Date(),
        test: 'Firebase debug test'
    })
    .then(() => {
        console.log("Firestore write test succeeded ✓");
        showDebugResult("Firebase is working correctly! Check console for details.");
    })
    .catch(error => {
        console.error("Firestore write test failed:", error);
        showDebugResult("Error writing to Firestore: " + error.message);
    });
}

// Show a user-friendly debug result
function showDebugResult(message) {
    // Create a modal for the result
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.7)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "10000";
    
    const content = document.createElement('div');
    content.style.backgroundColor = "white";
    content.style.padding = "20px";
    content.style.borderRadius = "10px";
    content.style.maxWidth = "80%";
    content.style.textAlign = "center";
    
    const title = document.createElement('h3');
    title.innerText = "Firebase Debug Result";
    title.style.color = "#e9556d";
    
    const text = document.createElement('p');
    text.innerText = message;
    
    const closeButton = document.createElement('button');
    closeButton.innerText = "Close";
    closeButton.style.padding = "5px 15px";
    closeButton.style.backgroundColor = "#e9556d";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "5px";
    closeButton.style.marginTop = "15px";
    closeButton.style.cursor = "pointer";
    
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(closeButton);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
} 