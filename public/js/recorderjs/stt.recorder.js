	var recording 	= false;
	var audioData 	= new Array();
	
	(function(window){
		var WORKER_PATH = '/js/recorderjs/recorderWorker.js';
	
		var Recorder = function(source, cfg){
			var config = cfg || {};
			var bufferLen = config.bufferLen || 4096;
			this.context = source.context;
			if(!this.context.createScriptProcessor){
				this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
			} else {
				this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
			}
		
			var worker = new Worker(config.workerPath || WORKER_PATH);
			worker.postMessage({
				command: 'init',
				config: {
					sampleRate: this.context.sampleRate
				}
			});
			
			var currCallback;
	
			this.node.onaudioprocess = function(e){
				if (!recording) return;
				worker.postMessage({
					command: 'record',
					buffer: [
						e.inputBuffer.getChannelData(0),
						e.inputBuffer.getChannelData(1)
					]
				});
			}
	
			this.configure = function(cfg){
				for (var prop in cfg){
					if (cfg.hasOwnProperty(prop)){
						config[prop] = cfg[prop];
					}
				}
			}
	
			this.record = function(){
				recording 	= true;
				audioData	= new Array();
			}
	
			this.stop = function(){
				recording 	= false;
			}
	
			this.clear = function(){
				worker.postMessage({ command: 'clear' });
			}
	
			this.getBuffers = function(cb) {
				currCallback = cb || config.callback;
				worker.postMessage({ command: 'getBuffers' })
			}
			 
			this.getSliceBuffers = function(cb, startRec) {
				currCallback = cb || config.callback; 
				worker.postMessage({
					command: 'getSliceBuffers',
					startRec: startRec
				});			
			}		
			
			this.exportPCM = function(cb, type){
				currCallback = cb || config.callback;
				type = type || config.type || 'audio/pcm';
				
				if (!currCallback) 
					throw new Error('Callback not set');
			
				worker.postMessage({
					command: 'exportPCM',
					type: type
				});
			}		
	
			this.exportMonoPCM = function(cb, type, _sampleRate){
				currCallback = cb || config.callback;
				type = type || config.type || 'audio/wav';
				
				if (!currCallback) 
					throw new Error('Callback not set');
			
				worker.postMessage({
					command: 'exportMonoPCM',
					type: type,
					sampleRate: _sampleRate
				});
			}			
			
			this.exportWAV = function(cb, type){
				currCallback = cb || config.callback;
				type = type || config.type || 'audio/wav';
				
				if (!currCallback) 
					throw new Error('Callback not set');
			
				worker.postMessage({
					command: 'exportWAV',
					type: type
				});
			}
			
			this.exportMonoWAV = function(cb, type){
				currCallback = cb || config.callback;
				type = type || config.type || 'audio/wav';
				if (!currCallback) 
					throw new Error('Callback not set');
				worker.postMessage({
					command: 'exportMonoWAV',
					type: type
				});
			}
	
			this.getRecLength = function(cb){
				currCallback = cb || config.callback;
				if (!currCallback) 
					throw new Error('Callback not set');
				
				worker.postMessage({ 
					command: 'getRecLength' 
				});
			}
			
			worker.onmessage = function(e){
				var blob = e.data;
				currCallback(blob);
			}
			
			source.connect(this.node);
			
			this.node.connect(this.context.destination);   
		};
	
		window.Recorder = Recorder;
		
	})(window);	
	
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext = new AudioContext();
	var audioInput = null,
		realAudioInput = null,
		inputPoint = null,
		audioRecorder = null;
	var rafID = null;
	var analyserContext = null;
	var canvasWidth, canvasHeight;
	var recIndex = 0;
	
	// 마이크버튼 종료 클릭시
	function gotBuffers( buffers ) {
		// the ONLY time gotBuffers is called is right after a new recording is completed - 
		// so here's where we should set up the download.
		//audioRecorder.exportWAV( doneEncoding );
		//audioRecorder.exportMonoWAV( doneEncoding );
		audioRecorder.exportMonoPCM( doneEncoding, "audio/pcm", 8000 );
	}
	
	function doneEncoding( blob ) {
		var arrayBuffer;
		var oriDataArray= null;
		var dataArray	= null;
		
		var fileReader 	= new FileReader();
		fileReader.onload = function (e) {
			arrayBuffer 	= e.target.result;
			oriDataArray 	= new Uint8Array(arrayBuffer);
			dataArray		= oriDataArray.subarray(g_readOffset, oriDataArray.length);
			g_readOffset	= oriDataArray.length;
			
			micComplete(dataArray);
		};
		fileReader.readAsArrayBuffer(blob);		
	}
	
	function convertToMono( input ) {
		var splitter = audioContext.createChannelSplitter(2);
		var merger = audioContext.createChannelMerger(2);
	
		input.connect( splitter );
		splitter.connect( merger, 0, 0 );
		splitter.connect( merger, 0, 1 );
		return merger;
	}
	
	function cancelAnalyserUpdates() {
		window.cancelAnimationFrame( rafID );
		rafID = null;
	}
	
	function updateAnalysers(time) {
		if (!analyserContext) {
			var canvas = document.getElementById("analyser");
			canvasWidth 	= canvas.width;
			canvasHeight 	= canvas.height;
			analyserContext = canvas.getContext('2d');
		}
	
		//canvas에 대한 size는 css의 @media에서 처리
		{
			// 막대그래프 bar사이의 간격
			var SPACING = 3;
			// 막대그래프 bar 두께
			var BAR_WIDTH = 1;
			// 막대그래프 의 총카운트(1024 / 3 = 341)
			var numBars = Math.round(canvasWidth / SPACING);
			
			var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
			//console.log("freqByteData : " + freqByteData); ==> 0,0,0,0,0,0,0,.....
			analyserNode.getByteFrequencyData(freqByteData); 
	
			analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
			analyserContext.fillStyle = '#F6D565';
			analyserContext.lineCap = 'round';
			// 1024 / 341 = 3.002932551319648
			var multiplier = analyserNode.frequencyBinCount / numBars;
			
			// Draw rectangle for each frequency bin.
			for (var i = 0; i < numBars; ++i) {
				var magnitude = 0;
				var offset = Math.floor( i * multiplier );
				//console.log("offset : " + offset);
				// gotta sum/average the block, or we miss narrow-bandwidth spikes
				for (var j = 0; j< multiplier; j++)
					magnitude += freqByteData[offset + j];
				
				magnitude = magnitude / multiplier;

				analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
				//fillRect(int x, int y, int width, int height) ==> x와 y좌표에 width와 heigth만큼 색칠된 직사각형을 그린다.
				analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);			
			}
		}
		
		rafID = window.requestAnimationFrame( updateAnalysers );
	}
	
	function getAvg(arr){
		var sum = 0.0;
		for(var idx in arr){
			sum += Number(arr[idx]);
		}
		
		return Math.floor(sum / arr.length);
	}					
	
	function toggleMono() {
		if (audioInput != realAudioInput) {
			audioInput.disconnect();
			realAudioInput.disconnect();
			audioInput = realAudioInput;
		} else {
			realAudioInput.disconnect();
			audioInput = convertToMono( realAudioInput );
		}
	
		audioInput.connect(inputPoint);
	}
	
	function gotStream(stream) {
		inputPoint = audioContext.createGain();
	
		// Create an AudioNode from the stream.
		realAudioInput = audioContext.createMediaStreamSource(stream);
		audioInput = realAudioInput;
		audioInput.connect(inputPoint);
	
		// audioInput = convertToMono( input );
		analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );
	
		audioRecorder = new Recorder( inputPoint );
		//audioRecorder = new Recorder( inputPoint , {numChannels:1} );
	
		zeroGain = audioContext.createGain();
		zeroGain.gain.value = 0.0;
		inputPoint.connect( zeroGain );
		zeroGain.connect( audioContext.destination );
		updateAnalysers();
	}
	
	function initAudio() {
		if (!navigator.getUserMedia)
			navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (!navigator.cancelAnimationFrame)
			navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame || navigator.msCancelAnimationFrame;
		if (!navigator.requestAnimationFrame)
			navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame || navigator.msRequestAnimationFrame;
	
		navigator.getUserMedia({
			"audio": {
					"mandatory": {
						"googEchoCancellation": "false",
						"googAutoGainControl": "false",
						"googNoiseSuppression": "false",
						"googHighpassFilter": "false"
					},
					"optional": []
			},
		}, 
		gotStream, 
		function(e) {
			//console.log(e);
		});
	}
	window.addEventListener('load', initAudio );	