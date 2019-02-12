var websocket = null;

	var wsUri = "wss://speechcatch.aibril.com/api/"; 
	
	var g_timerId 		= 0;
	var g_arrModelTxt	= ["General"];

	var g_stat			= 0;
	var g_arrStatMsg	= ["sndStartMsg", "sndBodyMsg", "sndEndMsg"];
	var g_readOffset	= 0;
	var g_currSttText	= "";
	
	$(document).ready(function() {
		var innerHtml = "";
		for(var i = 0 ; i < g_arrModelTxt.length ; i++){
			innerHtml 	= innerHtml
						+ "<a class='btn btn-primary btn-sm active'" 
						+ "data-toggle='lm_data' "
						+ "data-title='" + g_arrModelTxt[i]	+ "'>"
						+ g_arrModelTxt[i]
						+ "</a>"
			;
		}
		$("#radio_lm").html(innerHtml);
		$('input:radio[name="radio_input_type"]:input[value=mic]').attr("checked", true);
		
		wsConnect();
	});
	
	function recStart() {
		if (!audioRecorder)
			return;
		
		if(audioContext.state === 'suspended') {
			audioContext.resume().then(function() {
				//console.log('audioContext is running');
			});	
		}

		$('#btn_recStart').removeClass("btn btn-default");
		$('#btn_recStart').addClass("btn btn-danger");
		$('#btn_recStart').prop("disabled", true);
		$('#btn_recStop').prop("disabled", false);
		
		g_stat 			= 0;
		g_readOffset	= 0;
		g_currSttText   = "";	
		
		doSend();
		
		audioRecorder.clear();
		audioRecorder.record();
		
		mainGetSliceBuffers();
		g_timerId = setInterval("mainGetSliceBuffers()", 200); 
	}	
	
	function recStop() {
		$('#btn_recStart').removeClass("btn btn-danger");
		$('#btn_recStart').addClass("btn btn-default");
		$('#btn_recStart').prop("disabled", false);
		$('#btn_recStop').prop("disabled", true);
		
		g_stat = 2;
		clearInterval(g_timerId);		
		
		audioRecorder.stop();
		audioRecorder.getBuffers( gotBuffers );
	}
			
	function mainGetSliceBuffers() { 
		g_stat = 1;
		audioRecorder.getBuffers( gotBuffers );
	}	
	
	// 마이크 입력 완료시
	function micComplete(dataArray){
		doSend(dataArray);
	}
	
	function doSend(dataArray)
	{
		if(g_stat == 0)
			init(); 	
		
		var modelText 	= g_arrModelTxt[0];

		var msg = {
			pMethod: g_arrStatMsg[g_stat],
			pAuthKey: "DF93583C0AA84B2B6391DCBCFD24AE9E",
			pModel: "STT_GNRL_02",
			pAudioData: dataArray
		};	
		var retStringify = JSON.stringify(msg);
		
		websocket.send(retStringify);
	}	
	
	function wsConnect()
	{
		// websocket 객체 생성
		websocket = new WebSocket(wsUri);
		// websocket 연결 이벤트
		websocket.onopen = function(event) { onOpen(event) };
		// websocket 종료 이벤트
		websocket.onclose = function(event) { onClose(event) };
		// websocket 메시지 이벤트
		websocket.onmessage = function(event) { onMessage(event) };
		// websocket 에러 이벤트
		websocket.onerror = function(event) { onError(event) };
	}
	
	function disconnect()
	{
		websocket.close();
		websocket = null;
		
		console.log("disconnect");
	}
	
	function onOpen(event)
	{
		console.log("onOpen");
	}
	
	function onClose(event)
	{
		console.log("onClose");
		console.log(event);
	}
	
	function onError(event)
	{
		console.log("ERROR: " + event.data);
	}
		
	function onMessage(event)
	{
		var sttJson 	= JSON.parse(event.data); 
		var sttText 	= sttJson.sttText;
		var resultType  = sttJson.resultType;

		console.log("onMessage resultType : " + resultType);
		console.log("onMessage sttText    : " + sttText);
		
		if(resultType != "" )
			setSttResult(sttText, resultType);
	}

	function setSttResult(sttText, resultType){
		var appendSttText = "";

		var regex = /<br\s*[\/]?>/gi;			
		appendSttText = sttText.replace(regex, "");
		
		if(resultType == "partial"){
			$('#mfl_text0').val(g_currSttText + " " + appendSttText);
		}
		else if(resultType == "result"){
			g_currSttText = g_currSttText + " " + appendSttText;
			$('#mfl_text0').val(g_currSttText);
		}
	}
	
	function init(){
		$('textarea[id=mfl_text0]').val("");
	}
	
	window.onbeforeunload = function() {
		websocket.close();
	}