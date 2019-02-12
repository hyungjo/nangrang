
/*License (MIT)

Copyright 짤 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of 
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
*/

var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate;

this.onmessage = function(e){
  //console.log(e.data);
  console.log("workers : " + e.data.command);	
  
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportPCM':
      exportPCM(e.data.type);
      break;	
    case 'exportMonoPCM':
      exportMonoPCM(e.data.type, e.data.sampleRate);
      break;	  
    case 'exportWAV':
      exportWAV(e.data.type);
      break;
    case 'exportMonoWAV':
      exportMonoWAV(e.data.type);
      break;
    case 'getBuffers':
      getBuffers();
      break;
    case 'getSliceBuffers':
      getSliceBuffers(e.data.startRec);
      break;	 
    case 'getRecLength':
      getRecLength(); 
      break;	  
    case 'clear':
      clear();
      break;
  }
};

function init(config){
  sampleRate = config.sampleRate;
  //44100 --> 48000
  console.log("sampleRate : " + sampleRate);
}

function record(inputBuffer){
  recBuffersL.push(inputBuffer[0]);
  recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function exportPCM(type){
  var bufferL = mergeBuffers(recBuffersL, recLength);
  var bufferR = mergeBuffers(recBuffersR, recLength);

  var interleaved = interleave2(bufferL, bufferR, 8000);

  var dataview = encodePCM(interleaved);
  //var dataview = convertoFloat32ToInt16(interleaved);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function exportWAV(type){
  var bufferL = mergeBuffers(recBuffersL, recLength);
  var bufferR = mergeBuffers(recBuffersR, recLength);
  var interleaved = interleave(bufferL, bufferR);
  var dataview = encodeWAV(interleaved);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function exportMonoWAV(type){
  var bufferL = mergeBuffers(recBuffersL, recLength);
  var dataview = encodeWAV(bufferL, true);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function exportMonoPCM(type, _sampleRate){
	var bufferL = mergeBuffers(recBuffersL, recLength);

	var interleaved = interleaveMono(bufferL, _sampleRate);
	var dataview;
	
	if(type == "audio/pcm"){
		dataview = encodePCM(interleaved);
	}
	else {
		dataview = encodeWAV(interleaved);
	}
  
	//var dataview = convertoFloat32ToInt16(interleaved);
	var audioBlob = new Blob([dataview], { type: type });

	this.postMessage(audioBlob);
}

function getBuffers() {
  //console.log("recLength:"+recLength);
  var buffers = [];
  buffers.push( mergeBuffers(recBuffersL, recLength) );
  buffers.push( mergeBuffers(recBuffersR, recLength) );
  this.postMessage(buffers);
}

function getSliceBuffers(startRec) {
  console.log("getSliceBuffers startRec : "+ startRec);
  var buffers = [];
  buffers.push( mergeSliceBuffers(recBuffersL, recLength, startRec) );
  this.postMessage(buffers);
}

function clear(){
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function mergeSliceBuffers(recBuffers, recLength, startRec){
  console.log("mergeSliceBuffers recLength : " + recLength);
  console.log("mergeSliceBuffers startRec  : " + startRec);
  var result = new Float32Array(recLength-startRec);
  var offset = 0;
  for (var i = startRec; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function getRecLength(){
	this.postMessage(recLength);
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
      inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function interleave2(inputL, inputR, outputSampleRate){
	var nowlength = inputL.length + inputR.length;
	sampleRate += 0.0;
	outputSampleRate += 0.0;
	
	var index = 0;
	var inputIndex = 0;
	var	o = sampleRate / outputSampleRate;
	var length = Math.ceil(nowlength * outputSampleRate / sampleRate);
	var result = new Float32Array(length);
		
	while (index < length){		
		result[index++] = inputL[Math.floor(inputIndex)];
		result[index++] = inputR[Math.floor(inputIndex)];
		inputIndex += o;
	}

	return result;
}

function interleaveMono(inputL, outputSampleRate){
	var nowlength = inputL.length;
	sampleRate += 0.0;
	outputSampleRate += 0.0;
	
	var index = 0;
	var inputIndex = 0;
	var	o = sampleRate / outputSampleRate;
	var length = Math.ceil(nowlength * outputSampleRate / sampleRate);
	var result = new Float32Array(length);
		
	while (index < length){		
		result[index++] = inputL[Math.floor(inputIndex)];
		inputIndex += o;
	}

	return result;
}

function floatTo16BitPCM(output, offset, input){
	for (var i = 0; i < input.length; i++, offset+=2){
		var s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
	}
}

function convertoFloat32ToInt16(buffer) {
    var l = buffer.length;
    var buf = new Int16Array(l)

    while (l--) {
        buf[l] = buffer[l] * 0xFFFF; //convert to 16 bit
    }
    return buf.buffer
}	

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, mono){
  //console.log("workers : encodeWAV : " + samples.length);
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, mono?1:2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  //view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}

function encodePCM(samples, mono){
  //console.log("workers : encodePCM : " + samples.length);
  var buffer = new ArrayBuffer(samples.length * 2);
  var view = new DataView(buffer);
  
  floatTo16BitPCM(view, 0, samples);

  return view;
}
