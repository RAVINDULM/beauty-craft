// --------------------------------------------------------------------------------
// Required for data loading
const statusColors = {
    1: '#037AFF', // '#FFBF02', // Pending
    2: '#1BC657', // Confirmed
    3: '#50515A', // No Show
    4: '#50515A', // Completed
    5: '#FFBF02' //'#DA2346' // Recalled
};

const resIDColours = ['#FF8B4A', '#139AD3', '#9A4AFF', '#FF006B', '#FEA828'];

const numToAlph = ["", "A", "B", "C", "D"];

// --------------------------------------------------------------------------------

let sProvHeadersList = document.querySelectorAll(".sProvHeader");
let sProvColumnsList = document.querySelectorAll(".sProvResContainer");
const datePicker = document.getElementById("datePicker")
let rightArrow = document.querySelector(".arrowRight");
let leftArrow = document.querySelector(".arrowLeft");
let offset = 0;
let sProvCount;
let pickedDate = datePicker.value;

initLoad();

async function initLoad() {
    await getSProvCount();
    await arrowClick(0);
}

// async function scrollData()

async function getSProvCount() {
    await fetch(`http://localhost:80/beauty-craft/Staff/getActiveSProvCount`)

        .then(response => response.json())
        .then(num => {
            sProvCount = num;
            return;
        })
}

async function getReservationData() {
    //TODO : Pass date properly
    // let date = '2022-03-25';

    await fetch(`http://localhost:80/beauty-craft/Reservations/getResDailyOverviewData/${pickedDate}/${offset}`)
        .then(response => response.json())
        .then(reservationData => {
            console.log(reservationData);
            loadSProviders(reservationData);
            loadData(reservationData);
        })
}

// function request

function loadSProviders(reservationData) {
    let sProvIndex = 0;
    for (let sProvID in reservationData) {
        let sProvData = reservationData[sProvID];
        let sProvName = sProvData[0];
        let sProvImgPath = "http://localhost/beauty-craft/public/imgs/staffImgs/" + sProvData[2];

        let imgContainer = sProvHeadersList[sProvIndex].querySelector('.header-profilepic');
        imgContainer.setAttribute("src", sProvImgPath);

        let nameSpan = sProvHeadersList[sProvIndex].querySelector('span');
        nameSpan.textContent = sProvName;

        sProvHeadersList[sProvIndex].style.visibility = "visible";
        sProvColumnsList[sProvIndex].style.visibility = "visible";

        // imgContainer.style.visibility = "visible";
        // nameSpan.style.visibility = "visible";
        sProvIndex++;
    }
}


function loadData(reservationData) {
    let x = 0;
    let sProvIndex = 0;
    for (let sProvID in reservationData) {
        let sProvData = reservationData[sProvID];
        let sProvColumn = sProvColumnsList[sProvIndex];

        for (let reservationID in sProvData[1]) {
            // if (reservationID == "") break;
            let resData = sProvData[1][reservationID];
            let sName = resData['sName'];
            let resSlots = resData['slots'];
            let resStatus = resData['status'];
            for (let i = 0; i < resSlots.length; i++) {
                resSlot = resSlots[i];

                let resBox = createResBox(resStatus, resSlot[0], resSlot[1], sName, numToAlph[i + 1], reservationID, x);
                console.log(resBox);
                sProvColumnsList[sProvIndex].appendChild(resBox);
            }

            x++;
        }
        sProvIndex++;
    }
}

function clearData() {
    let resBoxesList = document.querySelectorAll(".resBox");
    resBoxesList.forEach(resBox => {
        resBox.remove();
    });

    sProvHeadersList.forEach(element => {
        element.style.visibility = "hidden";
    });

    sProvColumnsList.forEach(element => {
        element.style.visibility = "hidden";
    });
}

// Creates and returns a resData Box and load data to it.
function createResBox(status, startTime, duration, service, slotNo, resID, x) {

    let endTime = parseInt(startTime) + parseInt(duration);

    let resBox = document.createElement("div");
    resBox.style.top = (startTime - 540) * 2 + 'px';
    resBox.style.height = duration * 2 - 3 + 'px';
    resBox.classList.add("resBox");
    resBox.setAttribute("onclick", `directToResMoreInfo('${resID}')`);

    let resBoxInner = document.createElement("div");
    resBoxInner.classList.add("resBoxInner");
    resBox.appendChild(resBoxInner);

    let statusSection = document.createElement("div");
    statusSection.classList.add("statusSection");
    resBoxInner.appendChild(statusSection);
    statusSection.style.backgroundColor = statusColors[status];

    let infoSection = document.createElement("div");
    infoSection.classList.add("infoSection");
    resBoxInner.appendChild(infoSection);

    let timeSpan = document.createElement("span");
    timeSpan.classList.add("time");
    timeSpan.textContent = minsToTime(startTime) + ' - ' + minsToTime(endTime);
    infoSection.appendChild(timeSpan);

    let serviceSpan = document.createElement("span");
    serviceSpan.classList.add("service");
    serviceSpan.textContent = `${service}(${slotNo})`;
    infoSection.appendChild(serviceSpan);

    let idSection = document.createElement("div");
    idSection.classList.add("idSection");
    resBoxInner.appendChild(idSection);
    let resIDSpan = document.createElement("span");
    resIDSpan.classList.add("alphanumeric");
    resIDSpan.textContent = 'R' + resID;
    resIDSpan.style.color = resIDColours[x % 5];
    idSection.appendChild(resIDSpan);

    return resBox;
}



async function arrowClick(direction) {
    await updateArrowVisibility(direction);
    clearData();
    getReservationData();
}

async function updateArrowVisibility(direction) {
    switch (direction) {
        case 1:
            offset = (sProvCount - offset > 5) ? offset += 5 : offset;
            break;

        case 0:
            offset = (offset > 0) ? offset -= 5 : offset;
            break;
        default:
            break;
    }

    if (sProvCount - offset <= 5) {
        rightArrow.style.visibility = "hidden";
    } else {
        rightArrow.style.visibility = "visible";
    }
    if (offset <= 0) {
        leftArrow.style.visibility = "hidden";
    } else {
        leftArrow.style.visibility = "visible";
    }
    return;
}

function directToResMoreInfo(reservationID) {
    window.location.assign(`http://localhost/beauty-craft/Reservations/reservationMoreInfo/${reservationID}`);
}

function minsToTime(timeInMins) {
    let hours24 = Math.floor(timeInMins / 60);
    let suffix = (hours24 >= 12) ? "PM" : "AM";
    let hours12 = (hours24 > 12) ? hours24 - 12 : hours24;
    let mins12 = timeInMins % 60;
    let time = hours12.toString().padStart(2, '0') + ':' + mins12.toString().padStart(2, '0') + suffix;
    return time;
}

function calendarUpdate(calendar) {
    console.log(calendar);
    pickedDate = calendar.value;
    clearData();
    getReservationData();
}
