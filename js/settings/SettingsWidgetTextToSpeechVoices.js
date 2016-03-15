Ext.namespace('Zarafa.plugins.texttospeech.settings');

Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	ttsPlugin : null,
	
	constructor : function(config) {
		config = config || {};
		
		this.selModel = new Ext.grid.CheckboxSelectionModel({
			header: _('Enabled'), 
			width: 100, 
			checkOnly: true,
			listeners : {
				rowselect: function(selModel, rowIndex, record ) {
					record.set('enabled', true);
				},
				rowdeselect: function(selModel, rowIndex, record ) {
					record.set('enabled', false);
				},
				scope: this
			}
		});
		
		Ext.applyIf(config, {
			title : _('Available Voices'),
			height: 'auto',
			items : [
/*			
			{
				xtype: 'editorgrid',
				height: Object.keys(config.ttsPlugin.availableVoices).length * 33 +36,
				ref: 'grid',
				colModel: this.getColumnModel(),
				selModel: this.selModel,
				store: this.getLanguageStore(config.ttsPlugin),
				autoExpandColumn: 2,
				clicksToEdit: 1,
				listeners: {
					viewready: function(){
						this.setGridSelection();
					},
					scope: this
				}
			}
*/
			].concat(this.getVoicePickers(config.ttsPlugin))
		});
		
		console.log([].concat(this.getVoicePickers(config.ttsPlugin)));
		
		Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices.superclass.constructor.call(this, config);
	},
	
	getColumnModel : function()
	{
		var comboStore = new Ext.data.JsonStore({
			// store config
			autoDestroy: true,
			data: {voices:[]},
			// reader config
			root: 'voices',
			idProperty: 'name',
			fields: ['enabled', 'name', 'lang']
		});
		var combo = new Ext.form.ComboBox({
			xtype: 'combo',
			mode: 'local',
			triggerAction: 'all',
			store: comboStore,
			width: 250,
			displayField: 'name',
			valueField: 'name',
			forceSelection: true,
			editable: false,
			allowBlank: false,
			listeners: {
				beforeshow : function(combo){
					var lang = combo.gridEditor.record.get('lang');
					var voices = this.ttsPlugin.availableVoices[lang];
					combo.store.loadData({voices: voices});
					combo.setValue(voices[0].name);
				},
				select : function(combo){
					console.log('change');
					var gridStore = this.grid.getStore();
					var gridRecord = combo.gridEditor.record;
					var comboPreviouslySelectedRecord = combo.store.getById(gridRecord.get('name'));
					// We must change the language because it might have changed from 
					// en_US to en_GB for example
					if ( gridRecord.get('name') === comboPreviouslySelectedRecord.get('name') ){
						gridRecord.set('langCode', comboPreviouslySelectedRecord.get('lang'));
					}
				},
				scope: this
			}
		});
		
		return new Ext.grid.ColumnModel({
	        columns: [
		        this.selModel,
	            {
	            	header: _('Language'), 
	            	sortable: true, 
	            	dataIndex: 'lang',
	            	renderer: function(value){
	            		return getLanguageName(value);
	            	}
				},{
					header: _('Selected voice'),
					width: '',
					sortable: false,
					dataIndex: 'name',
					renderer: function(value){
						return value;
					},
					editor: combo
				}
			]
		});
	},
	
	getLanguageStore : function(ttsPlugin)
	{
		var langs = {languages:[]};
		for ( var lang in ttsPlugin.selectedVoices ){
			var voice = ttsPlugin.selectedVoices[lang];
			langs.languages.push({
				lang: lang, 
				enabled: voice.enabled, 
				name: voice.name,
				langCode: voice.langCode
			});
		}
		langs.languages.sort(function(l1, l2){
			return l1.lang.localeCompare(l2.lang);
		});
		
		var languageStore = new Ext.data.JsonStore({
			// store configs
			autoDestroy: true,
			data: langs,
			// reader configs
			root: 'languages',
			idProperty: 'lang',
			fields: ['enabled', 'lang', 'langCode', 'name']
		});
		
		return languageStore;
	},
	
	setGridSelection : function() {
		// select the voices that are enabled
		var records = [];
		var selectedVoices = this.ttsPlugin.selectedVoices;
		this.grid.store.each(function(record){
			var lang = record.get('lang');
			if ( selectedVoices[lang].enabled ){
				records.push(record);
			}
		});
		
		this.grid.getSelectionModel().selectRecords(records);
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

			items.push({
				xtype: 'compositefield',
				hideLabel: true,
				ref: lang.substring(0,2),
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
			});
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
//		this.doLayout();
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
