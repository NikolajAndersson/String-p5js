// Simple "karplus strong" string implementation.
// When the mouse is pressed, the string gets excited.

let slider;
let aSlider;
let gSlider;
let audioCtx = new AudioContext();
let delayLength = 200; // this is the frequency of the string
let delayline = new Array(delayLength);
let ap = 0;
let pos = 0;
source = audioCtx.createBufferSource();

// Create a ScriptProcessorNode with a bufferSize, input, output channels
let scriptNode = audioCtx.createScriptProcessor(1024, 1, 1);

function setup() {
    background(0);

    aSlider = createSlider(0, 100, 50);
    gSlider = createSlider(0, 100, 50);
    slider = createSlider(0, 100, 50);
    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);
    source.start();
}

function mousePressed() {
    // fill the delay line with noise when the mouse is pressed
    for (let i = 0; i < delayLength; i++) {
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
        //var inputData = inputBuffer.getChannelData(channel);
        let outputData = outputBuffer.getChannelData(channel);

        // Loop through the 1024 samples
        for (let sample = 0; sample < inputBuffer.length; sample++) {
            // update to the next position in the delay line 
            let nextPos = (pos + 1) % delayLength;
            // lowpass filter the delayline 
            delayline[nextPos] = a * delayline[nextPos] + (1 - a) * delayline[pos];
            // scale output
            let out = -g * delayline[pos] + delayline[(pos - 1) % delayLength] + g * ap;
            outputData[sample] = out * volume;
            pos = nextPos;
        }
    }
}