const monthYearE = document.getElementById('monthYear');
const datesE = document.getElementById('dates');
const reservedE = document.getElementById('reserved');
const prevB = document.getElementById('prevM');
const nextB = document.getElementById('nextM');
const clearB = document.getElementById('clearEventButton');

const bookingE = document.getElementById('bookingHeader');
const bookingDateE = document.getElementById('bookingDate');

bookingE.textContent = "Booking";

let currentDate = new Date();
let bookedDays = new Array(32).fill(0);
let reasons = new Array(32).fill("Unreserved");
let names = new Array(32).fill(" ");

// Function to create unique keys based on month and year
function getStorageKey(prefix) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${prefix}_${year}_${month}`;
}

function loadData() {
    // Load data for the specific month and year
    let retrieveStoredData = localStorage.getItem(getStorageKey("booked"));
    bookedDays = retrieveStoredData ? JSON.parse(retrieveStoredData) : new Array(32).fill(0);

    retrieveStoredData = localStorage.getItem(getStorageKey("reasons"));
    reasons = retrieveStoredData ? JSON.parse(retrieveStoredData) : new Array(32).fill("Unreserved");

    retrieveStoredData = localStorage.getItem(getStorageKey("names"));
    names = retrieveStoredData ? JSON.parse(retrieveStoredData) : new Array(32).fill(" ");
}

function saveData() {
    // Save data to localStorage for the current month and year
    localStorage.setItem(getStorageKey("booked"), JSON.stringify(bookedDays));
    localStorage.setItem(getStorageKey("reasons"), JSON.stringify(reasons));
    localStorage.setItem(getStorageKey("names"), JSON.stringify(names));
}

function updateCalendar() {
    // Refresh data when rendering the calendar for any reason, to ensure each month's bookings are in the right place
    loadData();

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayI = firstDay.getDay();

    monthYearE.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    let datesHTML = '';

    // Render dates for the previous month, shaded gray to signify they're from the previous month
    for (let i = firstDayI; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 1 - i);
        datesHTML += `<div class="date inactive">${prevDate.getDate()}</div>`;
    }

    // Render dates for the current month
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const bookedClass = bookedDays[i] === 1 ? 'booked' : '';
        if(new Date().getDate()===i){
            const currentClass = date.toDateString() === new Date().toDateString() ? 'current' : '';
            datesHTML += `<div class="date ${currentClass}" id="${i}">${i}</div>`;
        }
        else{
            datesHTML += `<div class="date ${bookedClass}" id="${i}">${i}</div>`;
        }
    }



    // Render dates for the next month, shaded gray to signify they're from the next month
    const lastDayI = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayI; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        datesHTML += `<div class="date inactive">${nextDate.getDate()}</div>`;
    }

    datesE.innerHTML = datesHTML;
}

// Display the date's booking details when clicking on a date on the calendar
datesE.addEventListener('click', (event) => {
    const form = document.getElementById('bookingForm');
    const dayClicked = event.target.id;
    let reservedHTML = "";

    form.reset();



    if(dayClicked!== "dates"){
        const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayClicked);
        bookingDateE.textContent = tempDate.toLocaleDateString();
        document.getElementById('bookingForm').style.display = 'inline-block';
        document.getElementById('reserved').style.display = 'inline-block';
        if (dayClicked && reasons[dayClicked] !== "Unreserved") {
            reservedHTML += `<ul>
            <li>Reserved</li>
            <li>-----------</li>
            <li>Event:</li>
            <li>${names[dayClicked]}</li>
            <li>-----------</li>
            <li>Time:</li>
            <li>${reasons[dayClicked]}</li>
        </ul>`;
        } else if (dayClicked) {
            reservedHTML = `<ul><li>${reasons[dayClicked]}</li></ul>`;
        }
    }
    else{
        reservedHTML += `<ul>

            <li>Invalid Click</li>
            <li>-----------</li>
            <li>Please click directly on a day to make</li>
            <li>a booking</li>


        </ul>`;
        bookingDateE.textContent = " ";
    }

    if(event.target.classList.contains('inactive')) {
        reservedHTML += `<ul>
        <li>Invalid Click</li>
        <li>-----------</li>
        <li>Please click directly on a day in this month to make</li>
        <li>a booking</li>


        </ul>`;
        bookingDateE.textContent = " ";
    }


    reservedE.innerHTML = reservedHTML;

    document.querySelectorAll('div.active').forEach(el => el.classList.remove('active'));

    event.target.classList.add('active');

    if (dayClicked) {

    }
});


// Save the details of the booking when submitting the form, and clear the form
document.getElementById('submission').addEventListener('click', () => {
    const form = document.getElementById('bookingForm');
    const reason = document.getElementById('reason').value;
    const name = document.getElementById('name').value;
    const activeDate = document.querySelector('div.active');
    const day = activeDate ? activeDate.id : null;
    let isChecked = document.getElementById("reminder").checked;
    let isCheckedDelay = document.getElementById("reminderdelay").checked;

    console.log("isCheckedDelay:", isCheckedDelay);

    if (day) {
        bookedDays[day] = 1;
        reasons[day] = reason;
        names[day] = name;

        activeDate.classList.remove('active');
        activeDate.classList.add('booked');
        saveData();

        form.reset();
    }

    if(isChecked){
        const notify = new Notification("Reminder:\nYour Event, " + name + ", is one day away.");
    }

    if(isCheckedDelay){
        setTimeout(() => {const notify = new Notification("Reminder:\nYour Event, " + name + ", is three days away.")}, 20000);
    }

});

// Buttons to navigate between months
prevB.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextB.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

clearB.addEventListener('click', () =>{
localStorage.clear();
    updateCalendar();
});

// Render calendar
updateCalendar();
