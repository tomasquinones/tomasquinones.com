const body = document.body;
const timer = document.querySelector("#timer");
const playButton = document.querySelector("#play-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const timerStatus = document.querySelector("#status");
const streakCounter = document.querySelector("#streak");

let alarm = document.getElementById("alarm");

let minutes = 1;
let seconds = 0;
let intervalId;
let isWorking = true;

function startTimer() {
    playButton.style.display = "none";
    pauseButton.style.display = "block";
    workingStatus();
    intervalId = setInterval(timerCountDown, 1000);
}

function timerCountDown() {
    timer.innerHTML = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    document.title = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    if (minutes === 0 && seconds === 0) {
        alarm.play();

        //playButton.style.display = "block";
        //pauseButton.style.display = "none";
        if (isWorking) {
            shortBreak();
            isWorking = false;
            streakCounter.append(" X");
        } else {
            workingStatus();
            isWorking = true;
        }
    } else if (minutes > 0 && seconds === 0) {
        seconds = 59;
        minutes--;
    } else {
        seconds--;
    }
}

function shortBreak() {
    minutes = 1;
    timerStatus.innerHTML = "Take a quick break!";
    body.style.backgroundColor = "CadetBlue";
}

function workingStatus() {
    timerStatus.innerHTML = "Time to work!";
    body.style.backgroundColor = "DarkRed";
}

function pauseTimer() {
    clearInterval(intervalId);
    pauseButton.style.display = "none";
    playButton.style.display = "block";
    playButton.innerHTML = "RESUME";
}

function resetTimer() {
    minutes = 25;
    seconds = 0;
    clearInterval(intervalId);
    timer.innerHTML = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    document.title = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    pauseButton.style.display = "none";
    playButton.style.display = "block";
    playButton.innerHTML = "START";
}

resetButton.addEventListener("click", resetTimer);
pauseButton.addEventListener("click", pauseTimer);
playButton.addEventListener("click", startTimer);
