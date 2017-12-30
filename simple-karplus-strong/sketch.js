let delayline = [];
let slider;
let audioCtx = new AudioContext();
let delayLength = 400;
let pos = 0;
source = audioCtx.createBufferSource();

// Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
let scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);

function setup() {
    background(0);

    for (let i = 0; i < delayLength; i++) {
        delayline[i] = ((Math.random() * 2) - 1) * 0.5;
    }
    slider = createSlider(0, 100, 50);
    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);
    source.start();
}

function mousePressed() {
    for (let i = 0; i < delayLength; i++) {
        delayline[i] = ((Math.random() * 2) - 1) * 0.5;
    }
}


// Give the node a function to process audio events
scriptNode.onaudioprocess = function(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    let inputBuffer = audioProcessingEvent.inputBuffer;

    let volume = slider.value() / 100;
    // The output buffer contains the samples that will be modified and played
    let outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        //var inputData = inputBuffer.getChannelData(channel);
        let outputData = outputBuffer.getChannelData(channel);

        // Loop through the 4096 samples
        for (let sample = 0; sample < inputBuffer.length; sample++) {
            // make output equal to the same as the input
            // outputData[sample] = inputData[sample];
            let nextPos = (pos + 1) % delayLength;
            // add noise to each output sample
            delayline[nextPos] = 0.5 * (delayline[nextPos] + delayline[pos]);

            outputData[sample] = delayline[pos] * volume;
            pos = nextPos;
        }
    }
}