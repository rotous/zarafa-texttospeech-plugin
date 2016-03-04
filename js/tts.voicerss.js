(function(){
	"use strict";
	
	var _apiKey;
	var _language = 'en-gb';
	var _quality = 'ulaw_22khz_mono';
	var _codec = 'MP3';
	var _text = '';
	var _speed = 0;
	var _maxCharsPerRequest = 500;
	
	var _languages = {
		'ca-ES' : 'Catalan',
		'zh-CN' : 'Chinese (China)',
		'zh-HK' : 'Chinese (Hong Kong)',
		'zh-TW' : 'Chinese (Taiwan)',
		'da-DK' : 'Danish',
		'nl-NL' : 'Dutch',
		'en-AU' : 'English (Australia)',
		'en-CA' : 'English (Canada)',
		'en-GB' : 'English (Great Britain)',
		'en-IN' : 'English (India)',
		'en-US' : 'English (United States)',
		'fi-FI' : 'Finnish',
		'fr-CA' : 'French (Canada)',
		'fr-FR' : 'French (France)',
		'de-DE' : 'German',
		'it-IT' : 'Italian',
		'ja-JP' : 'Japanese',
		'ko-KR' : 'Korean',
		'nb-NO' : 'Norwegian',
		'pl-PL' : 'Polish',
		'pt-BR' : 'Portuguese (Brazil)',
		'pt-PT' : 'Portuguese (Portugal)',
		'ru-RU' : 'Russian',
		'es-MX' : 'Spanish (Mexico)',
		'es-ES' : 'Spanish (Spain)',
		'sv-SE' : 'Swedish (Sweden)'
	};
	
	var _qualities = {
		'ulaw_8khz_mono' : 'uLaw, 8 kHz, Mono',
		'ulaw_8khz_stereo' : 'uLaw, 8 kHz, Stereo',
		'ulaw_11khz_mono' : 'uLaw, 11 kHz, Mono',
		'ulaw_11khz_stereo' : 'uLaw, 11 kHz, Stereo',
		'ulaw_22khz_mono' : 'uLaw, 22 kHz, Mono',
		'ulaw_22khz_stereo' : 'uLaw, 22 kHz, Stereo',
		'ulaw_44khz_mono' : 'uLaw, 44 kHz, Mono',
		'ulaw_44khz_stereo' : 'uLaw, 44 kHz, Stereo'
	};
	
	var _codecs = ['MP3', 'OGG', 'WAV', 'AAC'];
	
	var _errors = {
		ERR_EXPIRED : 'The subscription is expired or requests count limitation is exceeded!',
		ERR_CONTENT_TOO_LARGE : 'The request content length is too large!',
		ERR_LANGUAGE_NOT_SUPPORTED : 'The language does not support!',
		ERR_LANGUAGE_NOT_SPECIFIED : 'The language is not specified!',
		ERR_TEXT_NOT_SPECIFIED : 'The text is not specified!',
		ERR_APIKEY_NOT_AVAILABLE : 'The API key is not available!',
		ERR_APIKEY_NOT_SPECIFIED : 'The API key is not specified!',
		ERR_SSML_NOT_SUPPORTED : 'The subscription does not support SSML!'		
	};
	
	var _audioObject;
	var _audioPlaying = false;
	var _audioPaused = false;
	var _audioBuffer = [];
	var _pendingRequests = [];
	
	function _isBreakpoint(ch) {
		return [" ", ".", ";", "?", "!", ",", "\t", "\n"].indexOf(ch) >= 0;
	}
	
	function _splitText(text) {
		var segments = [];
		while ( text.length ){
			var segment = text.substring(0, _maxCharsPerRequest);
			// Try to find a breakpoint
			var i = segment.length-1;
			while ( !_isBreakpoint(segment[i]) && i>_maxCharsPerRequest/2 ){
				i--;
			}
			if ( _isBreakpoint(segment[i]) ){
				segments.push(text.substring(0,i));
				text = text.substring(i+1);
			} else {
				segments.push(segment);
				text = text.substring(segment.length);
			}
		}
		
		return segments;
	}
	
	function _getAudioObject() {
		if ( !_audioObject ) {
			// Create an audio object
			_audioObject = new Audio();
			_audioObject.addEventListener('loadeddata', function(){
				console.log('play started', _audioObject.src)				
				_audioPlaying = true;
				// Release resource when it's loaded
				URL.revokeObjectURL(_audioObject.src);
			});
			_audioObject.addEventListener('ended', function(){
				_audioPlaying = false;
				if ( _audioBuffer.length > 0 ){
					console.log('audio ended, but buffer found, so starting again')
					_audioObject.src = _audioBuffer.shift();
					_audioObject.play();
				} else {
					// Let the audio object send a custom event
					_audioObject.dispatchEvent(new Event('playbackstopped'));
				}
			});
		}
		
		return _audioObject;
	}
	
	function _isErrorResponse(response) {
		if ( response.byteLength > 100 ){
			// This is too long to be an error (max error message is 76 chars)
			return false;
		}
		
		// Convert the response to a string
		response = String.fromCharCode.apply(null, new Uint8Array(response));
		for ( var error in _errors ){
			if ( _errors.hasOwnProperty(error) && 'ERROR: '+_errors[error] === response ){
				return error;
			}
		}
		
		return false;
	}
	
	function _getAudioForText(text, callback) {
		var request = new XMLHttpRequest();
		request.open('POST', 'http://api.voicerss.org/');
		request.responseType = 'arraybuffer';
		request.onLoadListener = function() {
			_pendingRequests.splice(_pendingRequests.indexOf(request), 1);
			if ( typeof callback === 'function' ){
				var error = _isErrorResponse(request.response); 
				if ( error ){
					// this is an error response
					callback(error, _errors[error], request);
				} else {
				    var blob = new Blob([request.response], {type: 'audio/mp3'});
				    var objUrl = URL.createObjectURL(blob);
					callback(false, objUrl, request);
				}
			}
		};
		request.addEventListener("load", request.onLoadListener);
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		var params = 'key=' + _apiKey +
					 '&hl=' + _language +
					 '&f=' + _quality +
					 '&c=' + _codec +
					 '&src=' + text;
		_pendingRequests.push(request);
		request.send(params);
	}
	
	var ttsModule = {
		setApiKey : function(apiKey) {
			_apiKey = apiKey;
		},
		
		setLanguage : function(lang) {
			_language = lang;
		},
		
		detectLanguage : function(text, callback) {
			
		},
		
		setSpeed : function(speed) {
			speed = parseInt(speed, 10);
			if ( speed>=-10 && speed<=10 ){
				_speed = speed;
			}
		},
		
		setQuality : function(quality) {
			if ( Object.keys(_qualities).indexOf(quality) >= 0 ){
				_quality = quality;
			}
		},
		
		setCodec : function(codec) {
			if ( _codecs.indexOf(codec) >= 0 ){
				_codec = codec;
			}
		},
		
		setMaxCharsPerRequest : function(maxCharsPerRequest) {
			_maxCharsPerRequest = parseInt(maxCharsPerRequest, 10);
		},
		
		getAudioObject: _getAudioObject,
		
		getVoices : function() {
			var voices = [];
			for ( var k in _languages ){
				voices.push({
					lang: k,
					name: 'VoiceRSS ' + _languages[k],
					localService: false
				});
			}
			
			return voices;
		},
		
		speak : function(text) {
			if ( text.length > _maxCharsPerRequest ){
				text = _splitText(text);
			} else {
				text = [text];
			}
			
			var segment, segmentNr=0;
			
			function recursiveGetAndReadText(){
				if ( segment = text.shift() ){
					_getAudioForText(segment, function(error, audioUrl) {
						recursiveGetAndReadText();
						if ( error ){
							console.error(audioUrl);
							return;
						}
						var audio = _getAudioObject();
						if ( !_audioPlaying && _audioBuffer.length===0 ){
							audio.src = audioUrl;
							audio.play();
						} else {
							_audioBuffer.push(audioUrl);
						}
					});
					
				}
			}
			
			recursiveGetAndReadText();
		},
		
		stopPlayback: function(){
			if ( !_audioPlaying ){
				return;
			}
			var audio = _getAudioObject();
			audio.pause();
			_audioPlaying = false;
			_audioBuffer.length = 0;
			while ( _pendingRequests.length ){
				var request = _pendingRequests.shift();
				request.removeEventListener('load', request.onLoadListener);
			}
			
			// Let the audio object send a custom event
			audio.dispatchEvent(new Event('playbackstopped'));
		},
		
		pausePlayback: function(){
			if ( !_audioPlaying ){
				return;
			}
			var audio = _getAudioObject();
			audio.pause();
			_audioPaused = true;
		},
		
		resumePlayback: function(){
			if ( !_audioPaused ){
				return;
			}
			var audio = _getAudioObject();
			audio.play();
			_audioPaused = false;
		}
	};
	
	window.tts = window.tts || {};
	window.tts.voicerss = ttsModule;
})();
