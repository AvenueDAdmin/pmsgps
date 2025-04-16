// Check if we have a config in localStorage
let firebaseConfig;
const storedConfig = localStorage.getItem('firebase_config');

if (storedConfig) {
  try {
    firebaseConfig = new Function('return ' + storedConfig)();
    console.log('Using Firebase config from localStorage');
  } catch (e) {
    console.error('Error parsing stored Firebase config:', e);
    // Fall back to default config
    firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "pmsgps.firebaseapp.com",
      projectId: "pmsgps",
      storageBucket: "pmsgps.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
  }
} else {
  // Default config (needs to be replaced with real values)
  firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "pmsgps.firebaseapp.com",
    projectId: "pmsgps",
    storageBucket: "pmsgps.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
}

// Initialize Firebase if config is valid
try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized: Default API key detected');
  }
} catch (e) {
  console.error('Error initializing Firebase:', e);
}

// Firebase helper functions
function savePartnersToFirebase(partners) {
  if (!firebase.auth || !firebase.auth().currentUser) {
    console.log('Not saving to Firebase: No user logged in');
    return;
  }
  
  const userId = firebase.auth().currentUser.uid;
  firebase.firestore().collection('users').doc(userId).set({
    partners: partners
  }, { merge: true })
  .then(() => {
    console.log("Partners data saved to Firebase");
  })
  .catch((error) => {
    console.error("Error saving partners data: ", error);
  });
}

function loadPartnersFromFirebase() {
  if (!firebase.auth || !firebase.auth().currentUser) {
    console.log('Not loading from Firebase: No user logged in');
    return Promise.resolve([]);
  }
  
  const userId = firebase.auth().currentUser.uid;
  return firebase.firestore().collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists && doc.data().partners) {
        console.log('Partners loaded from Firebase');
        return doc.data().partners;
      } else {
        console.log('No partners found in Firebase');
        return [];
      }
    })
    .catch((error) => {
      console.error("Error loading partners data: ", error);
      return [];
    });
}

function saveSettingsToFirebase(settings) {
  if (!firebase.auth || !firebase.auth().currentUser) return;
  
  const userId = firebase.auth().currentUser.uid;
  firebase.firestore().collection('users').doc(userId).set({
    settings: settings
  }, { merge: true });
}

function loadSettingsFromFirebase() {
  if (!firebase.auth || !firebase.auth().currentUser) return Promise.resolve({});
  
  const userId = firebase.auth().currentUser.uid;
  return firebase.firestore().collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists && doc.data().settings) {
        return doc.data().settings;
      } else {
        return {};
      }
    });
} 