// Constants
const AUTH_STORAGE_KEY = 'pms_auth_data';
const PIN_STORAGE_KEY = 'pms_pin';
const DEFAULT_PIN = '1234';

// DOM Elements
const signInBtn = document.getElementById('sign-in-btn');
const tryNowBtn = document.getElementById('try-now-btn');
const signupBtn = document.getElementById('signup-btn');
const signupModal = document.getElementById('signup-modal');
const signinModal = document.getElementById('signin-modal');
const signupForm = document.getElementById('signup-form');
const closeBtns = document.querySelectorAll('.close-btn');
const switchToSignin = document.getElementById('switch-to-signin');
const switchToSignup = document.getElementById('switch-to-signup');
const resetPinLink = document.getElementById('reset-pin-link');
const signinSubmitBtn = document.getElementById('signin-submit-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    signInBtn.addEventListener('click', openSignInModal);
    tryNowBtn.addEventListener('click', openSignUpModal);
    signupBtn.addEventListener('click', openSignUpModal);
    
    // Close modal buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal'));
        });
    });
    
    // Switch between auth modals
    switchToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openSignInModal();
    });
    
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signinModal);
        openSignUpModal();
    });
    
    // Reset PIN link
    resetPinLink.addEventListener('click', (e) => {
        e.preventDefault();
        showResetPinPrompt();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Handle signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('setup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        
        // Redirect to app with email and password in parameters (for Firebase signup)
        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);
        params.append('action', 'signup');
        
        window.location.href = 'index.html?' + params.toString();
    });
    
    // Handle signin form submission
    if (signinSubmitBtn) {
        signinSubmitBtn.addEventListener('click', function() {
            const email = document.getElementById('signin-email') ? document.getElementById('signin-email').value : '';
            const password = document.getElementById('pin-input') ? document.getElementById('pin-input').value : '';
            
            // Redirect to app with login credentials
            const params = new URLSearchParams();
            params.append('email', email);
            params.append('password', password);
            params.append('action', 'login');
            
            window.location.href = 'index.html?' + params.toString();
        });
    }
    
    // Set up PIN input fields
    setupPinInputFields();
});

// Functions
function openSignInModal() {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    openModal(signinModal);
}

function openSignUpModal() {
    openModal(signupModal);
}

function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
    }
}

function setupPinInputFields() {
    const pinInputs = document.querySelectorAll('.pin-digit');
    
    // Clear inputs
    pinInputs.forEach(input => {
        input.value = '';
    });
    
    // Focus first input
    pinInputs[0].focus();
    
    pinInputs.forEach((input, index) => {
        // Clear existing event listeners by cloning and replacing
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Handle input
        newInput.addEventListener('input', function() {
            // Move to next input
            if (this.value.length === 1) {
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                } else {
                    // If last digit, verify PIN
                    verifyPin();
                }
            }
        });
        
        // Handle backspace
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    // If empty and not first input, focus previous
                    pinInputs[index - 1].focus();
                }
            }
        });
        
        // Enforce number only
        newInput.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
}

function verifyPin() {
    const pinInputs = document.querySelectorAll('.pin-digit');
    let enteredPin = '';
    
    pinInputs.forEach(input => {
        enteredPin += input.value;
    });
    
    // First-time user setup with default PIN
    if (!localStorage.getItem(PIN_STORAGE_KEY)) {
        localStorage.setItem(PIN_STORAGE_KEY, DEFAULT_PIN);
    }
    
    const storedPin = localStorage.getItem(PIN_STORAGE_KEY);
    
    if (enteredPin === storedPin) {
        // Correct PIN
        authenticateUser();
        
        // Redirect to app
        window.location.href = 'index.html';
    } else {
        // Incorrect PIN
        showSignInError('Incorrect PIN. Please try again.');
        setupPinInputFields();
    }
}

function authenticateUser() {
    // Calculate expiry time (30 days from now)
    const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    
    // Store authentication data
    const authData = {
        authenticated: true,
        expiryTime: expiryTime
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

function showSignInError(message) {
    const errorElement = document.getElementById('signin-error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add shake animation
    const pinContainer = document.querySelector('.pin-input-container');
    pinContainer.classList.add('shake');
    
    setTimeout(() => {
        pinContainer.classList.remove('shake');
    }, 500);
}

function showResetPinPrompt() {
    // Simple reset for now - just resets to default PIN
    if (confirm('This will reset your PIN to the default (1234). Continue?')) {
        localStorage.setItem(PIN_STORAGE_KEY, DEFAULT_PIN);
        alert('PIN has been reset to the default (1234)');
        setupPinInputFields();
    }
} 