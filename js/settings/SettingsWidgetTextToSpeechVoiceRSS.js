Ext.namespace('Zarafa.plugins.texttospeech.settings');

Zarafa.plugins.texttospeech.settings.SettingsWidgetTextToSpeechVoiceRSS = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			title : _('VoiceRSS settings'),
			layout : 'form',
			items : [
				{
					xtype: 'textfield',
					inputType: 'password',
					fieldLabel: _('API Key'),
					name: 'zarafa/v1/plugins/texttospeech/voicerss/key',
					ref: 'apiKey'
				}
			]
		});
		
		Zarafa.plugins.texttospeech.settings.SettingsWidgetTextToSpeechVoiceRSS.superclass.constructor.call(this, config);
	},
	
	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel)
	{
		var apiKey = settingsModel.get(this.apiKey.name);
		this.apiKey.setValue(apiKey);
	},
	
	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
		var apiKey = this.apiKey.getValue();

		settingsModel.beginEdit();
		settingsModel.set(this.apiKey.name, apiKey);
		settingsModel.endEdit();
		this.ownerCt.voicesWidget.updateVoices(settingsModel);
	}
	
});

Ext.reg('zarafa.texttospeech.settingswidgetvoicerss', Zarafa.plugins.texttospeech.settings.SettingsWidgetTextToSpeechVoiceRSS);
