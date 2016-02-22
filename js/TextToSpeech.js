Ext.namespace('Zarafa.plugins.texttospeech');

/**
 *
 * @class Zarafa.plugins.texttospeech.TextToSpeech
 * @extends Zarafa.core.Plugin
 * 
 */
Zarafa.plugins.texttospeech.TextToSpeech = Ext.extend(Zarafa.core.Plugin, {
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
			text: 'speech',
			handler: function(){
				var record = this.ownerCt.record;
				ttsModule.setApiKey('700c20d72f81465fbc2cae7244685d47');
				ttsModule.readOut(record.get('body'));
			}
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
