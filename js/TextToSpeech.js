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
		if ( voice.name === item.name ){
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
			xtype: 'zarafa.texttospeech.settingscategory'
		};
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'texttospeech',
		displayName : _('Text To Speech'),
		pluginConstructor : Zarafa.plugins.texttospeech.TextToSpeech
	}));
});
