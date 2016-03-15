Ext.namespace('Zarafa.plugins.texttospeech');

/**
 *
 * @class Zarafa.plugins.texttospeech.TextToSpeech
 * @extends Zarafa.core.Plugin
 * 
 */
Zarafa.plugins.texttospeech.TextToSpeech = Ext.extend(Zarafa.core.Plugin, {
	onPlaybackStartedHandler : null,
	onPlaybackStoppedHandler : null,
	
	/* The module that is currently playing */
	ttsModule : null,
	
	selectedVoices: {},
	availableVoices: undefined,
	
	/**
	 * Constructor
	 * @protected
	 */
	constructor : function(config) {
		config = config || {};
		
		this.registerInsertionPoint('context.mail.showmailcontentpanel.toolbar.options', this.createButton);
		
		this.registerInsertionPoint('context.settings.categories', this.createSettingCategory, this);
		
		Zarafa.plugins.texttospeech.TextToSpeech.superclass.constructor.call(this, config);
	},

	initPlugin : function()
	{
		var settingsModel = container.getSettingsModel();
		var apiKey = settingsModel.get('zarafa/v1/plugins/texttospeech/voicerss/key');
		tts.voicerss.setApiKey(apiKey);
		
		if ( window !== window.parent ){
			// This is probably DeskApp, which doesn't support mp3
			tts.voicerss.setCodec('OGG');
		}
		
		this.selectedVoices = this.getSelectedVoices();
	},
	
	createButton: function()
	{
		var menuItems = [];
		var selectedVoices = JSON.parse(localStorage.getItem('tts_selected_voices'));
		for ( var lang in selectedVoices ){
			if ( selectedVoices[lang].enabled ){
				menuItems.push({
					text: getLanguageName(lang),
					handler: this.speak,
					lang: lang,
					langCode: selectedVoices[lang].langCode,
					name: selectedVoices[lang].name
				});
			}
		}
		
		return {
			xtype: 'splitbutton',
			cls: 'tts-audio',
			iconCls: 'tts-play',
			tooltip: _('speech'),
			handler: this.onClick,
			menu: menuItems,
			ttsModule: this.ttsModule,
			listeners: {
				beforerender: this.onBeforeRender,
				destroy: this.onDestroy,
				scope: this
			}
		};
	},
	
	onClick: function(btn) {
		if ( btn.iconCls === 'tts-play' ){
//			btn.menu.disable();
//			var record = this.ownerCt.record;
//			this.ttsModule.speak(record.get('body'));
		} else {
//			btn.menu.enable();
//			this.ttsModule.stopPlayback();
		}
	},
	
	speak: function(item) {
		// Get the record from the toolbar
		var record = item.ownerCt.ownerCt.ownerCt.record;
		
		var voice = tts.native.getVoice(item.langCode, item.name);
		if ( voice && voice.name === item.name ){
			// We found a native voice
			this.ttsModule = tts.native;
			tts.native.setVoice(item.langCode, item.name);
			tts.native.speak(record.get('body'));
		} else {
			ttsModule = tts.voicerss;
			tts.voicerss.setLanguage(item.langCode);
			tts.voicerss.speak(record.get('body'));
		}
		
		
	},
	
	onBeforeRender: function(btn){
//		var audio = this.ttsModule.getAudioObject();
//		this.onPlaybackStartedHandler = this.onAudioPlaybackStart.createDelegate(this, [btn]);
//		this.onPlaybackStoppededHandler = this.onAudioPlaybackStopped.createDelegate(this, [btn]);
//		audio.addEventListener('loadstart', this.onPlaybackStartedHandler);
//		audio.addEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onDestroy : function(btn){
//		var audio = this.ttsModule.getAudioObject();
//		audio.removeEventListener('loadstart', this.onPlaybackStartedHandler);
//		audio.removeEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onAudioPlaybackStart: function(btn) {
		// Change the icon class of the button (this will change the behavior)
		btn.setIconClass('tts-stop');
	},
	
	onAudioPlaybackStopped: function(btn) {
		// Change the icon class of the button (this will change the behavior)
		btn.setIconClass('tts-play');
	},
	
	createSettingCategory: function() {
		return {
			xtype: 'zarafa.texttospeech.settingscategory',
			ttsPlugin: this
		};
	},
	
	getSelectedVoices : function()
	{
		var availableVoices = this.getAvailableVoices();

		// Try to find selected voices in local storage
		var selectedVoices = localStorage.getItem('tts_selected_voices');
		if ( selectedVoices ) {
			this.selectedVoices = JSON.parse(selectedVoices);
		} else {
			// If no selection was stored in local storage
			// we will create an initial selection for the user.
			// We will enable only the English voice.
			this.selectedVoices = {};
			for ( var lang in availableVoices ){
				var voice = null;
				// See if a default voice was set for this language
				for ( var i=0; i<availableVoices[lang][i]; i++ ){
					if ( availableVoices[lang][i]['default'] === true ){
						voice = availableVoices[lang][i];
						break;
					}
				}
				if ( voice === null ){
					// No default voice was found for this language. Let's use the
					// first available language.
					voice = availableVoices[lang][0];
				}
				this.selectedVoices[lang] = {
					name: voice.name,
					langCode: voice.lang
				};
				
				// Enable only English
				this.selectedVoices[lang].enabled = lang === 'en';
			}
			// Store the created selection in local storage
			localStorage.setItem('tts_selected_voices', JSON.stringify(this.selectedVoices));
			console.log('initially selected voices created');
		}
		
		console.log('selected voices loaded');
		return this.selectedVoices;
	},
	
	getAvailableVoices : function(settingsModel)
	{
		if ( this.availableVoices instanceof Object ){
			// available voices were already found, so return them;
			return this.availableVoices;
		}
		
		var nativeVoices = tts.native.getVoices();
		for ( var i=0; i<nativeVoices.length; i++ ){
			nativeVoices[i].module = 'native';
		}

		var voiceRssVoices = tts.voicerss.getVoices();
		for ( i=0; i<voiceRssVoices.length; i++ ){
			voiceRssVoices[i].module = 'voicerss';
		}
		
		this.availableVoices =nativeVoices.concat(voiceRssVoices);
		// Group the voices by language
		var voices = {};
		for ( i=0; i<this.availableVoices.length; i++ ){
			var lang = this.availableVoices[i].lang.substring(0,2);
			if ( !Ext.isDefined(voices[lang]) ){
				voices[lang] = [];
			}
			voices[lang].push(this.availableVoices[i]);
		}
		
		this.availableVoices = voices;
		return voices;
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'texttospeech',
		displayName : _('Text To Speech'),
		pluginConstructor : Zarafa.plugins.texttospeech.TextToSpeech
	}));
});
