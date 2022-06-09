// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js"
import {
  getDatabase,
  set,
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js"

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

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

const register = async () => {
  // Get input
  const full_name = document.getElementById("regname").value
  const email = document.getElementById("regemail").value
  const password = document.getElementById("regpw").value

  // Authentication
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
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
          alert("user logged in successfully")
        })
        .catch((error) => {
          // The write failed...
          alert(error)
        })
    })
    .catch((error) => {
      alert(error.Code)
    })
}

const logout = async () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      alert("user logged out successfully")
    })
    .catch((error) => {
      alert(error.Code)
    })
}

logincont.addEventListener("click", login)
registercont.addEventListener("click", register)