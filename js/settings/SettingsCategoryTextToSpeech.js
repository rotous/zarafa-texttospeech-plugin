Ext.namespace('Zarafa.plugins.texttospeech.settings');

Zarafa.plugins.texttospeech.settings.SettingsCategoryTextToSpeech = Ext.extend(Zarafa.settings.ui.SettingsCategory, {
	ttsPlugin: null,
	
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			title : _('Text to speech'),
			categoryIndex : 9997,
			iconCls : 'zarafa-settings-category-texttospeech',
			items : [
				{
					xtype : 'zarafa.settingswidget',
					title: _('Text to Speech plugin'),
					items :[{
						cls : 'zarafa-texttospeech-settings-infopanel',
						border: false,
						html: 
							'<p>' +
								'The Text to Speech plugin can use your browser&quot;s internal text to speech capabilities when available, ' +
								'or it can use the VoiceRSS web service to convert text to speech. '+
								'When your OS has internal voices for speech synthesis and your browser supports this, this plugin could use it. ' +
								'Some browsers can use external speech synthesis services (e.g. Google service) to convert text to speech.<br/>' +
								'To use the the VoiceRSS service you must ' +
								'register an account at <a href="http://www.voicerss.org/" target="_blank">www.voicerss.org</a> to obtain ' +
								'your personal API Key. They have several pricing plans available to suit every use (free plan is probably ' +
								'enough for average users) You can fill in your personal API Key below to start using the service.' +
							'</p>' +
							'<p class="zarafa-texttospeech-notes">Notes: <ul><li>We are not affiliated with VoiceRSS and are not responsible ' +
							'for their actions. We just ' +
							'think that they offer a solid service.</li>' +
							'<li>If you do not wish to send any confidential data to an external party ' +
							'you should not use external voices.</li></ul></p>'
					}],
				},{
					xtype : 'zarafa.texttospeech.settingswidgetvoicerss',
					settingsContext : config.settingsContext,
					ref: 'voiceRssWidget'
				},{
					xtype : 'zarafa.texttospeech.settingswidgetvoices',
					ttsPlugin: config.ttsPlugin,
					settingsContext : config.settingsContext,
					ref: 'voicesWidget'
				}
			]
		});

		Zarafa.plugins.texttospeech.settings.SettingsCategoryTextToSpeech.superclass.constructor.call(this, config);
		
	}
});

Ext.reg('zarafa.texttospeech.settingscategory', Zarafa.plugins.texttospeech.settings.SettingsCategoryTextToSpeech);
