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

// Add a function to change the time signature
function changeTimeSignature(beats) {
    beatsPerMeasure = beats;

    // Reset currentTick and nextNoteTime to realign the scheduler
    currentTick = 0;
    nextNoteTime = audioContext.currentTime;

    console.log(`Time signature set to ${beats}/${subdivision === 1 ? 4 : subdivision * 2}`);
}

// Update the scheduler to dynamically support the time signature
function scheduler() {
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        const isDownbeat = currentTick % (beatsPerMeasure * subdivision) === 0;
        const isOnBeat = currentTick % subdivision === 0;

        if (isDownbeat) {
            playClick(nextNoteTime, 1000); // Downbeat: higher pitch
        } else if (isOnBeat) {
            playClick(nextNoteTime, 800); // Regular beat
        } else {
            playClick(nextNoteTime, 600); // Off-beat
        }

        nextNoteTime += interval;
        currentTick++;
        if (currentTick >= beatsPerMeasure * subdivision) {
            currentTick = 0; // Reset for the next measure
        }
    }
    timerID = setTimeout(scheduler, lookahead);
}

// Example usage for time signature selection
document.querySelector("#timeSignature").addEventListener("change", (e) => {
    const [beats, sub] = e.target.value.split("/").map(Number);
    changeTimeSignature(beats, sub);
});

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
