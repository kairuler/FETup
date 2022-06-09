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

logoutcont.addEventListener("click", logout)