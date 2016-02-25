(function(){
	
	"use strict";
	
	var _voices = [];
	var _voice;
	var _speaking = false;
	
	var _audio = new Audio();

	speechSynthesis.onvoiceschanged = function(){
		_voices = speechSynthesis.getVoices();
		_voice = _getDefaultVoice();
	};
	
	function _getDefaultVoice() {
		for ( var i=0; i<_voices.length; i++ ){
			var voice = _voices[i];
			if ( voice['default'] ){
				return voice;
			}
		}
	}
	
	function _getVoice(language, name) {
		if ( _voices.length === 0 ){
			return;
		}
		
		var voice;
		if ( language && name ) {
			for ( var i=0; i<_voices.length; i++ ){
				voice = _voices[i];
				if ( voice.lang === language && voice.name === name ){
					return voice;
				}
			}
		}
		if ( language ){
			for ( i=0; i<_voices.length; i++ ){
				voice = _voices[i];
				if ( voice.lang === language ){
					return voice;
				}
			}
		}
		voice = _getDefaultVoice();
		return voice || _voices[0];
	}
	
	var native = {
		getVoices : function(){
			return _voices;
		},
		
		setVoice : function(language, name){
			var voice = _getVoice(language, name);
			if ( voice ){
				_voice = voice;
			}
		},
		
		getAudioObject : function(){
			return _audio;
		},
		
		speak : function(text) {
			var msg = new SpeechSynthesisUtterance(text);
			msg.voice = _voice;
			msg.onend = function(){
				console.log('onend');
				_speaking = false;
				_audio.dispatchEvent(new Event('playbackstopped'));
			};
			_audio.dispatchEvent(new Event('loadstart'));
			_speaking = true;
			speechSynthesis.speak(msg);
		},
		
		stopPlayback: function(){
			speechSynthesis.cancel();
			_speaking = false;
			_audio.dispatchEvent(new Event('playbackstopped'));
		}		
	};
	
	window.tts = window.tts || {};
	window.tts.native = native;
})();
