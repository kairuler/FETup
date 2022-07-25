// ================= FIREBASE CONFIG =================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js"
import {
  getDatabase,
  set,
  ref,
  onValue,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-database.js"

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


// ================= SETUP/LOGIN/LOGOUT FUNCTIONS =================

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
          location.href = "/profile.html"
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
        location.href = "/index.html"
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


// ================= GAPI/GIS FUNCTIONS =================

var { API_KEY, DISCOVERY_DOC, tokenClient, CLIENT_ID, SCOPES } = googleConfig()

function googleConfig() {
    const CLIENT_ID = "374767743519-h4du4gkhivmltj0ho79ijdfeom4lh1ug.apps.googleusercontent.com"
    const API_KEY = "AIzaSyCOWAZ2lwY3DHoBntVJPKAYoRAlW9-s75E"
    const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
    const SCOPES = "https://www.googleapis.com/auth/calendar" //multiple scopes can be included, separated by spaces.
    var tokenClient
    return { API_KEY, DISCOVERY_DOC, tokenClient, CLIENT_ID, SCOPES }
}

function initGapiClient() {

  gapi.load("client", () => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
      plugin_name: "FETup",
    }).then(() => {
        console.log("loaded Gapi client")
    })
  })
}

function initGisClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    prompt: "", // prevents login prompt after user has already logged in and authorised
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token
      //loadCalendarApi()
      
    },
  })
  console.log("loaded Gis client")
}

function googleLogin() {
    const user = auth.currentUser
    return new Promise((resolve, reject) => {
        if (user && user.emailVerified) {
            // Conditionally ask users to select the Google Account they'd like to use,
            // and explicitly obtain their consent to fetch their Calendar.
            // NOTE: To request an access token a user gesture is necessary.
            if (gapi.client.getToken() === null) {
                // Prompt the user to select an Google Account and asked for consent to share their data
                // when establishing a new session.
                tokenClient.requestAccessToken({ prompt: "consent" })
                resolve("new token w new acc")
            } else {
                // Skip display of account chooser and consent dialog for an existing session.
                tokenClient.requestAccessToken({ prompt: "" })
                resolve("new token w current acc")
            }
        } else if (user && user.emailVerified == false) {
            alert("email is not verified")
            reject("email is not verified")
        } else {
            alert("no user logged in currently")
            reject("no user logged in currently")
        }
    })
}


// ================= CALENDAR API FUNCTIONS =================

async function fetchAsync(url) {
  let obj = null
  try {
    obj = await (await fetch(url)).json()
  } catch (e) {
    console.log("error in HTTP GET request")
  }
  return obj
}

/**
 * Insert reminder event 'days' number of days before the physical class/exam event.
 *
 * @param {date} date date of class/exam event
 * @param {number} days number of days before the class/exam event that user has set for reminder event
 */
function insertEvent(date, days) {
    //console.log("date before minus: ", date)
    var date = addDays(date, days)
    //console.log("date after minus: ", date)
    date = convertToYYYYMMDD(date)

    var resource = {
        summary: "FET Reminder",
        end: {
            date: date,
        },
        start: {
            date: date,
        },
    }
    var request = gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: resource,
    })
    request.execute(function (resp) { console.log("insertEvent() response: ", resp) })
}

function convertToYYYYMMDD(date) {
  /*
    const offset = date.getTimezoneOffset()
    var date = new Date(date.getTime() - offset * 60 * 1000)
    */
  return date.toISOString().split("T")[0]
}

function addDays(date, days) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function deleteEvents() {
    var request = gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        q: "FET Reminder",
    })

    return new Promise(resolve => request.execute(async function (resp) {
        var events = resp.items
        if (events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                var request2 = gapi.client.calendar.events.delete({
                    calendarId: "primary",
                    eventId: events[i].id,
                })
                request2.execute(function (resp) {
                    console.log("deleteEvents() response: ", resp)
                })
                console.log("deleted: ", events[i].summary)
                await delay(1000)
            }
        } else {
            console.log("no events deleted")
        }
        resolve("Event deletion Completed")
    }))
}

var daysBefore
async function newReminders() {
    if (typeof daysBefore === 'undefined' || daysBefore === null) {
        alert("Please select a number of days")
        return
    }
    setReminders(daysBefore)
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
async function setReminders(ndays) {
    var request = gapi.client.calendar.events.list({
        calendarId: "primary" /* Can be 'primary' or a given calendarid */,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
    })

    // Get the list of class/exam venues to check if the event is an NUS class/exam
    // using current Semester's (AY22/23 Sem 1) venues
    var venueList
    fetchAsync(
        "https://api.nusmods.com/v2/2022-2023/semesters/1/venues.json"
    ).then((data) => {
        venueList = data
    })

    request.execute(async (resp) => {
        var events = resp.items

        if (events.length > 0) {
            let prevEventDate
            let first = true
            ndays *= -1
            for (let i = 0; i < events.length; i++) {
                // Get start time
                var when = events[i].start.dateTime
                if (!when) {
                    when = events[i].start.date
                }
                // Get class/exam venue
                var loc = events[i].location    
                if (loc) {
                    // Filter out physical classes/exams
                    if (!loc.includes("E-Learn") && venueList.includes(loc)) {
                        if (first) {
                            insertEvent(events[i].start.dateTime, ndays)
                            prevEventDate = events[i].start.dateTime.substring(0, 10)
                            first = false
                            await delay(1000)
                        }
                        else if (events[i].start.dateTime.substring(0, 10) != prevEventDate) {
                            insertEvent(events[i].start.dateTime, ndays)
                            prevEventDate = events[i].start.dateTime.substring(0, 10)
                            await delay(1000)
                        }
                    }
                }
            }    
        } else {
            console.log("no upcoming events found")
        }
    })

    const user = auth.currentUser
    update(ref(database, 'users/' + user.uid), { days: ndays })
        .then(() => {
            console.log("days updated successfully")
        })
        .catch((error) => {
            alert(error)
        })
}

async function updateEvents() {
    await deleteEvents()
    setReminders(daysBefore)
}

// ================= AUXILIARY FUNCTIONS =================

function dropdown() {
  function one() {
    document.getElementById("dropbtn").textContent = "1"
    daysBefore = 1
  }
  function two() {
    document.getElementById("dropbtn").textContent = "2"
    daysBefore = 2
  }
  function three() {
    document.getElementById("dropbtn").textContent = "3"
    daysBefore = 3
  }
  function four() {
    document.getElementById("dropbtn").textContent = "4"
    daysBefore = 4
  }
  option_1.addEventListener("click", one)
  option_2.addEventListener("click", two)
  option_3.addEventListener("click", three)
  option_4.addEventListener("click", four)
}

function welcomeMessage(userId) {
    return onValue(
        ref(database, "/users/" + userId), (snapshot) => {
            const full_name = (snapshot.val() && snapshot.val().full_name) || "Anonymous"
            document.getElementById("intro-big-text").textContent =
                "WELCOME, " + full_name + "!"
        }, {
            onlyOnce: true,
        })
}

function siteNavigation() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in
            document.getElementById("logoutbtn").style.display = "block"
            document.getElementById("profilebtn").onclick = () => location.href = "/profile.html"
        }
        else {
            // User is logged out
            document.getElementById("logoutbtn").style.display = "none"
            document.getElementById("profilebtn").onclick = () => location.href = "/login.html"
        }
    })
}

const delay = ms => new Promise(res => setTimeout(res, ms))

// Call functions based on current page
if (document.getElementById("home-page")) {
    logoutbtn.addEventListener("click", logout)
    setupbtn.addEventListener("click", loginRedirect)

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is logged in
            document.getElementById("logoutbtn").style.display = "block"
            document.getElementById("profilebtn").onclick = () => location.href = "/profile.html"
            return welcomeMessage(user.uid)
        }
        else {
            // User is logged out
            document.getElementById("logoutbtn").style.display = "none"
            document.getElementById("intro-big-text").textContent = "WELCOME"
            document.getElementById("profilebtn").onclick = () => location.href = "/login.html"
        }
    })
}
if (document.getElementById("login-page")) {
    loginbtn.addEventListener("click", login)
    registerbtn.addEventListener("click", register)
}
if (document.getElementById("setup-page")) {
  logoutbtn.addEventListener("click", logout)
  verifybtn.addEventListener("click", verifyemail)
  googleLoginbtn.addEventListener("click", googleLogin)
  newRemindersBtn.addEventListener("click", newReminders)
  dropdown()
  siteNavigation()
  window.onload = () => {
    initGapiClient()
    initGisClient()
  }
}
if (document.getElementById("profile-page")) {
    logoutbtn.addEventListener("click", logout)
    updateEventsBtn.addEventListener("click", updateEvents)
    googleLoginbtn.addEventListener("click", googleLogin)
    deleteEventsBtn.addEventListener("click", deleteEvents)
    dropdown()
    siteNavigation()
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onValue(ref(database, "/users/" + user.uid), (snapshot) => {
                const data = snapshot.val()
                daysBefore = data.days
                document.getElementById("dropbtn").textContent = daysBefore
              }) 
        }
    })
    window.onload = () => {
        initGapiClient()
        initGisClient()
    }
}