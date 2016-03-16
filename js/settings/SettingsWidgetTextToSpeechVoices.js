Ext.namespace('Zarafa.plugins.texttospeech.settings');

Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	ttsPlugin : null,
	
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			title : _('Available Voices'),
			height: 'auto',
			items : this.getVoicePickers(config.ttsPlugin)
		});
		
		Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices.superclass.constructor.call(this, config);
	},
	
	getVoicePickers : function(ttsPlugin)
	{
		if ( !Ext.isDefined(ttsPlugin) ){
			ttsPlugin = this.ttsPlugin;
		}
		var items = [];
		var availableVoices = ttsPlugin.getAvailableVoices();
		var selectedVoices = ttsPlugin.selectedVoices;
		for ( var lang in availableVoices ){
			var comboStore = new Ext.data.JsonStore({
				// store config
				autoDestroy: true,
				data: {voices:availableVoices[lang]},
				// reader config
				root: 'voices',
				idProperty: 'name',
				fields: ['enabled', 'name', 'lang', 'module']
			});
			var combo = new Ext.form.ComboBox({
				xtype: 'combo',
				ref: 'combo',
				mode: 'local',
				triggerAction: 'all',
				store: comboStore,
				width: 250,
				displayField: 'name',
				valueField: 'name',
				forceSelection: true,
				editable: false,
				allowBlank: false,
				value: selectedVoices[lang].name
			});

			items.push(new Ext.form.CompositeField({
				xtype: 'compositefield',
				hideLabel: true,
				ref: lang,
				items: [
					{
						xtype: 'checkbox',
						value: '1',
						ref: 'enabled',
						checked: selectedVoices[lang].enabled === true
					},{
						xtype: 'displayfield',
						cls: 'zarafa-texttospeechplugin-settingswidgetvoices-name',
						html: getLanguageName(lang)
					},
					combo,
					{
						xtype: 'button',
						text: _('Test voice'),
						lang: lang,
						handler: function(btn){
							var combo = this[btn.lang]['combo'];
							var record = combo.findRecord('name', combo.getValue());
							console.log('speaking '+getLanguageName(btn.lang)+' with '+this[btn.lang]['combo'].getValue());
							if ( record.get('module') === 'native' ){
								tts.native.setVoice(record.get('lang'), record.get('name'));
								tts.native.speak('Zarafa collaboration software');
							} else if ( record.get('module') === 'voicerss' ) {
								tts.voicerss.setLanguage(record.get('lang'));
								tts.voicerss.speak('Zarafa collaboration software');
							}
						},
						scope: this
					}
				]
			}));
		}
		
		return items;
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
//		var selectedVoices = this.ttsPlugin.getSelectedVoices();
//		this.items = new Ext.util.MixedCollection({
//			items: this.getVoicePickers()
//		});

		this.removeAll();
		var voicePickers = this.getVoicePickers();
		for ( var i=0; i<voicePickers.length; i++){
			this.add(voicePickers[i]);
		}
		this.doLayout();
	},
	
	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
/*
		// We will not store the settings in the SettingsModel
		// but in localStorage because the settings are for
		// this browser on this computer only
		var selectedRecords = this.grid.getSelectionModel().getSelections();
		this.ttsPlugin.selectedVoices = {};
		this.grid.getStore().each(function(item){
			this.ttsPlugin.selectedVoices[item.get('lang')] = {
				enabled: item.get('enabled'),
				name: item.get('name'),
				langCode: item.get('langCode')
			};
		}, this);
		localStorage.setItem('tts_selected_voices', JSON.stringify(this.ttsPlugin.selectedVoices));
*/
	},
	
});

Ext.reg('zarafa.texttospeech.settingswidgetvoices', Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices);
