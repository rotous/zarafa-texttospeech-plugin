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
	},
	
	createButton: function()
	{
		return {
			xtype: 'button',
			cls: 'tts-audio',
			iconCls: 'tts-play',
			tooltip: _('speech'),
			handler: this.onClick,
			listeners: {
				beforerender: this.onBeforeRender,
				destroy: this.onDestroy,
				scope: this
			}
		};
	},
	
	onClick: function(btn) {
		console.log('icon class=', btn.iconCls)
		if ( btn.iconCls === 'tts-play' ){
			var record = this.ownerCt.record;
			ttsModule.setApiKey('700c20d72f81465fbc2cae7244685d47');
			ttsModule.readOut(record.get('body'));
		} else {
			ttsModule.stopPlayback();
		}
	},
	
	onBeforeRender: function(btn){
		var audio = ttsModule.getAudioObject();
		this.onPlaybackStartedHandler = this.onAudioPlaybackStart.createDelegate(this, [btn]);
		this.onPlaybackStoppededHandler = this.onAudioPlaybackStopped.createDelegate(this, [btn]);
		audio.addEventListener('loadstart', this.onPlaybackStartedHandler);
		audio.addEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onDestroy : function(btn){
		var audio = ttsModule.getAudioObject();
		audio.removeEventListener('loadstart', this.onPlaybackStartedHandler);
		audio.removeEventListener('playbackstopped', this.onPlaybackStoppededHandler);
	},
	
	onAudioPlaybackStart: function(btn) {
		console.log('btn sees that playback has started', arguments)
		// Change the icon class of the button (this will change the behavior)
		btn.setIconClass('tts-stop');
	},
	
	onAudioPlaybackStopped: function(btn) {
		console.log('btn sees that playback has stopped', arguments)
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
