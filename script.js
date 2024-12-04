// Create Audio Context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let bpm = 120; // Beats per minute
let beatsPerMeasure = 4; // Number of beats per measure
let subdivision = 1; // Subdivisions per beat (1 = quarter note, 2 = eighth note, etc.)
let interval = 60 / bpm / subdivision; // Time interval for subdivisions
let nextNoteTime = 0; // Time of the next beat
let isPlaying = false; // Metronome state
let lookahead = 25; // Time in milliseconds to schedule ahead
let scheduleAheadTime = 0.1; // How far ahead to schedule audio
let currentTick = 0; // Tracks the current tick in the measure
let timerID;

// Play a click sound with specified pitch and duration
function playClick(time, frequency) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.frequency.value = frequency; // Set frequency for click
    gainNode.gain.value = 0.5; // Set volume for click

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05); // Short click sound
}

// Scheduler function
function scheduler() {
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        const isOnBeat = currentTick % (beatsPerMeasure * subdivision) === 0;
        const isSubBeat = currentTick % subdivision === 0;

        if (isOnBeat) {
            playClick(nextNoteTime, 1000); // On-beat: higher pitch
        } else if (isSubBeat) {
            playClick(nextNoteTime, 800); // Subdivided beat: medium pitch
        } else {
            playClick(nextNoteTime, 600); // Off-beat: lower pitch
        }

        nextNoteTime += interval;
        currentTick++;
    }
    timerID = setTimeout(scheduler, lookahead);
}

// Start/Stop the metronome
function toggleMetronome() {
    if (isPlaying) {
        clearTimeout(timerID);
        isPlaying = false;
        console.log("Metronome stopped.");
    } else {
        nextNoteTime = audioContext.currentTime;
        currentTick = 0;
        scheduler();
        isPlaying = true;
        console.log("Metronome started.");
    }
}

// Change BPM
function changeBPM(newBPM) {
    bpm = newBPM;
    interval = 60 / bpm / subdivision;
    console.log(`BPM set to ${bpm}`);
}

// Change Subdivision
function changeSubdivision(newSubdivision) {
    subdivision = newSubdivision;
    interval = 60 / bpm / subdivision;
    console.log(`Subdivision set to ${subdivision}`);
}

// Example usage
document.querySelector("#startStop").addEventListener("click", toggleMetronome);
document.querySelector("#bpmSlider").addEventListener("input", (e) => {
    const bpmValue = e.target.value;
    changeBPM(bpmValue);
    document.querySelector("#bpmDisplay").textContent = bpmValue;
});
document.querySelector("#subdivision").addEventListener("change", (e) => {
    changeSubdivision(e.target.value);
});
