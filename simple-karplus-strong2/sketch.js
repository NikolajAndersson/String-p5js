// Simple "karplus strong" string implementation.
// When the mouse is pressed, the string gets excited.
let audioCtx = new AudioContext();

source = audioCtx.createBufferSource();

// Create a ScriptProcessorNode with a bufferSize, input, output channels
let scriptNode = audioCtx.createScriptProcessor(1024, 1, 1);

let slider;
let aSlider;
let gSlider;
let f = 440;
let fs = audioCtx.sampleRate;
let delayLength = fs / f; // this is the frequency of the string
let delayLengthCeil = Math.ceil(delayLength);
let delayline = new Array(fs);
let frac = 0; //delayLength - floor(delayLength);
let dOut = 0;
let pos = 0;


// Create a ScriptProcessorNode with a bufferSize, input, output channels

function setup() {
    createCanvas(100, 100);
    background(0);

    for (let i = 0; i < delayLengthCeil; i++) {
        delayline[i] = 0; // ((Math.random() * 2) - 1) * 0.5;
    }

    frac = delayLength - floor(delayLength);

    aSlider = createSlider(0, 100, 50);
    gSlider = createSlider(0, 100, 50);
    slider = createSlider(0, 100, 50);

    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);
    source.start();
}

function mousePressed() {
    f = abs(mouseX);
    delayLength = fs / f; // this is the frequency of the string
    delayLengthCeil = Math.ceil(delayLength);
    frac = delayLength - floor(delayLength);

    // fill the delay line with noise when the mouse is pressed
    for (let i = 0; i < delayLengthCeil; i++) {
        delayline[i] = ((Math.random() * 2) - 1) * 0.5;
    }
}


// Give the node a function to process audio events
scriptNode.onaudioprocess = function(audioProcessingEvent) {
    let inputBuffer = audioProcessingEvent.inputBuffer;

    let a = aSlider.value() / 100;
    let g = gSlider.value() / 100;
    let volume = slider.value() / 100;

    // The output buffer contains the samples that will be modified and played
    let outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        let inputData = inputBuffer.getChannelData(channel);
        let outputData = outputBuffer.getChannelData(channel);

        // Loop through the 1024 samples
        for (let sample = 0; sample < outputBuffer.length; sample++) {
            // update to the next position in the delay line 
            let nextPos = (pos + 1) % delayLengthCeil;
            let prevPos = (pos - 1 + delayLengthCeil) % delayLengthCeil;
            // lowpass filter the delayline 
            delayline[nextPos] = a * delayline[nextPos] + (1 - a) * delayline[pos];
            // Allpass filter 
            let out = -g * delayline[pos] + delayline[prevPos] + g * dOut;
            // fractional delay
            outputData[sample] = frac * out * volume + (1 - frac) * dOut * volume;

            dOut = out;
            pos = nextPos;
        }
    }
}