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
	
	ttsModule : null,
	
	/**
	 * Constructor
	 * @protected
	 */
	constructor : function(config) {
		config = config || {};
		
		this.registerInsertionPoint('context.mail.showmailcontentpanel.toolbar.options', this.createButton);
		
		Zarafa.plugins.texttospeech.TextToSpeech.superclass.constructor.call(this, config);
	},

	initPlugin : function()
	{
		if ( speechSynthesis && speechSynthesis.getVoices().length ){
			this.ttsModule = tts.native;
		} else {
			this.ttsModule = tts.voicerss;
			this.ttsModule.setApiKey('700c20d72f81465fbc2cae7244685d47');
			if ( window !== window.parent ){
				// This is probably DeskApp, which doesn't support mp3
				this.tssModule.setCodec('OGG');
			}
		}
	},
	
	createButton: function()
	{
		return {
			xtype: 'button',
			cls: 'tts-audio',
			iconCls: 'tts-play',
			tooltip: _('speech'),
			handler: this.onClick,
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
			var record = this.ownerCt.record;
			this.ttsModule.speak(record.get('body'));
		} else {
			this.ttsModule.stopPlayback();
		}
	},
	
	onBeforeRender: function(btn){
		var audio = this.ttsModule.getAudioObject();
		this.onPlaybackStartedHandler = this.onAudioPlaybackStart.createDelegate(this, [btn]);
		this.onPlaybackStoppededHandler = this.onAudioPlaybackStopped.createDelegate(this, [btn]);
		audio.addEventListener('loadstart', this.onPlaybackStartedHandler);
		audio.addEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onDestroy : function(btn){
		var audio = this.ttsModule.getAudioObject();
		audio.removeEventListener('loadstart', this.onPlaybackStartedHandler);
		audio.removeEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onAudioPlaybackStart: function(btn) {
		// Change the icon class of the button (this will change the behavior)
		btn.setIconClass('tts-stop');
	},
	
	onAudioPlaybackStopped: function(btn) {
		// Change the icon class of the button (this will change the behavior)
		btn.setIconClass('tts-play');
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'texttospeech',
		displayName : _('Text To Speech'),
		pluginConstructor : Zarafa.plugins.texttospeech.TextToSpeech
	}));
});
