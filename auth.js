// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithRedirect,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import {
  getDatabase,
  set,
  ref,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMB7e7AbpWsBndOHJ_qel6oOwnfZPhMlE",
  authDomain: "fetup-orbital-22.firebaseapp.com",
  databaseURL:
    "https://fetup-orbital-22-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "fetup-orbital-22",
  storageBucket: "fetup-orbital-22.appspot.com",
  messagingSenderId: "155909158290",
  appId: "1:155909158290:web:3b507c31540089675f7d4b",
  measurementId: "G-G1SH00HCGX",
}

// Firebase' initialisations - config, auth, database
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

// Google auth provider + OAuth 2.0 scopes
const provider = new GoogleAuthProvider()
provider.addScope('https://www.googleapis.com/auth/calendar')
provider.addScope('https://www.googleapis.com/auth/calendar.events')
provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly')
provider.addScope('https://www.googleapis.com/auth/calendar.readonly')
provider.addScope('https://www.googleapis.com/auth/calendar.settings.readonly')

const loginRedirect = async () => {
  const user = auth.currentUser
  if (user) {
    location.href = "/setup.html"
  } else {
    location.href = "/login.html"
  }
}

const register = async () => {
  // Get input
  const full_name = document.getElementById("regname").value
  const email = document.getElementById("regemail").value
  const password = document.getElementById("regpw").value

  // Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user
      // Save data into real time database
      // Key: user id (uid). Values: full_name, email
      set(ref(database, "users/" + user.uid), {
        full_name: full_name,
        email: email,
      })
        .then(() => {
          // Data saved successfully!
          alert("User created successfully")
          location.href = "/setup.html"
        })
        .catch((error) => {
          alert(error)
        })
    })
    .catch((error) => {
      alert(error.code)
    })
}

const login = async () => {
  // Get input
  const email = document.getElementById("loginemail").value
  const password = document.getElementById("loginpw").value

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      // save log in details into real time database
      var lgDate = new Date()
      update(ref(database, "users/" + user.uid), {
        last_login: lgDate,
      })
        .then(() => {
          // Data saved successfully!
          location.href = "/setup.html"
        })
        .catch((error) => {
          alert(error)
        })
    })
    .catch((error) => {
      alert(error.Code)
    })
}

const logout = async () => {
  if (auth.currentUser) {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        alert("user logged out successfully")
      })
      .catch((error) => {
        alert(error.Code)
      })
  } else {
    alert("no user logged in currently")
  }
}

const verifyemail = async () => {
  const user = auth.currentUser
  if (user) {
    if (user.emailVerified) {
      alert("Email is already verified")
    } else {
      console.log("email is NOT verified")
      sendEmailVerification(user)
        .then(() => {
          // Email verification sent!
          alert("Verification email sent")
        })
        .catch((error) => {
          alert(error.Code)
        })
    }
  } else {
    alert("no user logged in currently")
  }
}

const registerGoogle = async () => {
  const user = auth.currentUser
  if (user) {
    signInWithRedirect(auth, provider)
    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential.accessToken
        // The signed-in user info.
        const user = result.user
        // ...
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.customData.email // The email of the user's account used.
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error)
        alert(
          credential + "\n" + email + "\n" + errorCode + ": " + errorMessage
        )
      })
  } else {
    alert("Log in required")
  }
}

function dropdown() {
    function one() { document.getElementById('dropbtn').textContent = '1' }
    function two() { document.getElementById('dropbtn').textContent = '2' }
    function three() { document.getElementById('dropbtn').textContent = '3' }
    function four() { document.getElementById('dropbtn').textContent = '4' }
    option_1.addEventListener("click", one)
    option_2.addEventListener("click", two)
    option_3.addEventListener("click", three)
    option_4.addEventListener("click", four)
}

// Call Auth functions based on current page 
if (document.getElementById('home-page')) {
  logoutbtn.addEventListener("click", logout)
  setupbtn.addEventListener("click", loginRedirect)

  // Welcome message with User's name
  onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        return onValue(ref(database, '/users/' + userId), (snapshot) => {
        const full_name = (snapshot.val() && snapshot.val().full_name) || 'Anonymous';
        document.getElementById("intro-big-text").textContent="WELCOME, " + full_name + "!"
        }, {
        onlyOnce: true
        })
    }
  })
}
if (document.getElementById('login-page')) {
  loginbtn.addEventListener("click", login)
  registerbtn.addEventListener("click", register)
}
if (document.getElementById('setup-page')) {
    logoutbtn.addEventListener("click", logout)
    verifybtn.addEventListener("click", verifyemail)
    registerGooglebtn.addEventListener("click", registerGoogle)
    dropdown()
}


