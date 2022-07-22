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

// Google API integration
const CLIENT_ID =
  "374767743519-h4du4gkhivmltj0ho79ijdfeom4lh1ug.apps.googleusercontent.com"
const API_KEY = "AIzaSyCOWAZ2lwY3DHoBntVJPKAYoRAlW9-s75E"
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
const SCOPES = "https://www.googleapis.com/auth/calendar" //multiple scopes can be included, separated by spaces.
var tokenClient

function initGapiClient() {
  //gapi.load("client:auth2", () => {
  gapi.load("client", () => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
      plugin_name: "FETup",
    })
  })
  console.log("loaded Gapi client")
}

function initGisClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    prompt: "", // prevents login prompt after user has already logged in and authorised
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token
      loadCalendarApi()
    },
  })
  console.log("loaded Gis client")
}

function googleLogin() {
  const user = auth.currentUser
  if (user && user.emailVerified) {
    // Conditionally ask users to select the Google Account they'd like to use,
    // and explicitly obtain their consent to fetch their Calendar.
    // NOTE: To request an access token a user gesture is necessary.
    if (gapi.client.getToken() === null) {
      // Prompt the user to select an Google Account and asked for consent to share their data
      // when establishing a new session.
      console.log("new token w new acc")
      tokenClient.requestAccessToken({ prompt: "consent" })
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      console.log("new token w current acc")
      tokenClient.requestAccessToken({ prompt: "" })
    }
  } else if (user && user.emailVerified == false) {
    alert("email is not verified")
  } else {
    alert("no user logged in currently")
  }
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load("calendar", "v3", listUpcomingEvents)
  //gapi.client.load("calendar", "v3", listCalendars)
}

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

  request.execute(async function (resp) {
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
        await delay(500)
      }
    } else {
      console.log("no events deleted")
    }
  })
}

function listCalendars() {
  var request = gapi.client.calendar.calendarList.get({
    calendarId: "primary" /* Can be 'primary' or a given calendarid */,
  })

  request.execute(function (resp) {
    var calendar = resp
    console.log(calendar)
  })
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    var now = new Date
    var oneMonthAfter = addDays(now, 30)
    var request = gapi.client.calendar.events.list({
        calendarId: "primary" /* Can be 'primary' or a given calendarid */,
        timeMin: now.toISOString(),
        //timeMax: oneMonthAfter.toISOString(),
        showDeleted: false,
        singleEvents: true,
        //maxResults: 10,
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

    request.execute(async function (resp) {
        var events = resp.items
        appendPre("Upcoming physical classes:")

        if (events.length > 0) {
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
                        appendPre(
                            events[i].summary + " - " + events[i].location + " (" + when + ")"
                        )
                        //insertEvent(events[i].start.dateTime, -1)
                        //await delay(1000)
                    }
                }
            }
        } else {
            appendPre("No upcoming events found.")
        }
    })
  // Testing deleting FET reminder events
  deleteEvents()
}

// Delay function
const delay = ms => new Promise(res => setTimeout(res, ms))

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById("output")
  var textContent = document.createTextNode(message + "\n")
  pre.appendChild(textContent)
}

function showEvents() {
  loadCalendarApi()
  document.getElementById("showEventsBtn").innerText = "Refresh Calendar"
}

/*
function revokeToken() {
  let cred = gapi.client.getToken()
  if (cred !== null) {
    google.accounts.oauth2.revoke(cred.access_token, () => {
      console.log("Revoked: " + cred.access_token)
    })
    gapi.client.setToken("")
    document.getElementById("showEventsBtn").innerText = "Show Calendar"
  }
}
*/

function dropdown() {
  function one() {
    document.getElementById("dropbtn").textContent = "1"
  }
  function two() {
    document.getElementById("dropbtn").textContent = "2"
  }
  function three() {
    document.getElementById("dropbtn").textContent = "3"
  }
  function four() {
    document.getElementById("dropbtn").textContent = "4"
  }
  option_1.addEventListener("click", one)
  option_2.addEventListener("click", two)
  option_3.addEventListener("click", three)
  option_4.addEventListener("click", four)
}

// Call Auth functions based on current page
if (document.getElementById("home-page")) {
  logoutbtn.addEventListener("click", logout)
  setupbtn.addEventListener("click", loginRedirect)

  // Welcome message with User's name
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid
      return onValue(
        ref(database, "/users/" + userId),
        (snapshot) => {
          const full_name =
            (snapshot.val() && snapshot.val().full_name) || "Anonymous"
          document.getElementById("intro-big-text").textContent =
            "WELCOME, " + full_name + "!"
        },
        {
          onlyOnce: true,
        }
      )
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
  showEventsBtn.addEventListener("click", showEvents)
  dropdown()
  window.onload = () => {
    initGapiClient()
    initGisClient()
  }
}