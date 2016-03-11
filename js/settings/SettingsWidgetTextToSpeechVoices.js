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
			layout : 'fit',
			height: 'auto',
			items : [{
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
			}]
		});
		
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
			fields: ['enabled', 'name', 'langCode']
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
		
		languageStore.on('load', function(){
			if ( this.grid ){
				this.setGridSelection();
			}
		}, this);
		
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

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel)
	{
		this.setGridSelection();
	},
	
	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
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
	},
	
/*
	loadSelectedVoices : function()
	{
		// Try to find selected voices in local storage
		var selectedVoices = localStorage.getItem('tts_selected_voices');
		if ( selectedVoices ) {
			this.selectedVoices = JSON.parse(selectedVoices);
		} else {
			// If no selection was stored in local storage
			// we will create an initial selection for the user.
			// We will enable only the English voice.
			this.selectedVoices = {};
			for ( var lang in this.availableVoices ){
				var voice = null;
				// See if a default voice was set for this language
				for ( var i=0; i<this.availableVoices[lang][i]; i++ ){
					if ( this.availableVoices[lang][i]['default'] === true ){
						voice = this.availableVoices[lang][i];
						break;
					}
				}
				if ( voice === null ){
					// No default voice was found for this language. Let's use the
					// first available language.
					voice = this.availableVoices[lang][0];
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
		}
	},
	
	updateVoices : function(settingsModel)
	{
		var nativeVoices = tts.native.getVoices();
		for ( var i=0; i<nativeVoices.length; i++ ){
			nativeVoices[i].tts = tts.native;
		}

		var voiceRssVoices = tts.voicerss.getVoices();
		for ( i=0; i<voiceRssVoices.length; i++ ){
			voiceRssVoices[i].tts = tts.voicerss;
		}
		
		this.availableVoices = tts.native.getVoices().concat(tts.voicerss.getVoices());
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
	}
*/
});

Ext.reg('zarafa.texttospeech.settingswidgetvoices', Zarafa.plugins.texttospeech.settings.SettingsWidgetVoices);
