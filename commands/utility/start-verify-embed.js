const { SlashCommandBuilder } = require('discord.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-verify-embed')
		.setDescription('Setup the verification embed for the server.'),
	async execute(interaction) {
		await interaction.reply({
            content: "",
            components: [
              {
                "type": 1,
                "components": [
                  {
                    "style": 2,
                    "label": `ONLY verify on https://captcha.bot`,
                    "custom_id": `row_0_button_0`,
                    "disabled": true,
                    "type": 2
                  }
                ]
              },
              {
                "type": 1,
                "components": [
                  {
                    "style": 5,
                    "label": `Verify`,
                    "url": `https://discord.com/api/oauth2/authorize?client_id=1190359002882777139&response_type=code&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2F&scope=identify`,
                    "disabled": false,
                    "emoji": {
                      "id": null,
                      "name": `🤖`
                    },
                    "type": 2
                  },
                  {
                    "style": 2,
                    "label": `Why?`,
                    "custom_id": `row_1_button_1`,
                    "disabled": false,
                    "type": 2
                  }
                ]
              }
            ],
            embeds: [
              {
                "type": "rich",
                "title": `🤖 Verification Required`,
                "description": 'To gain access to `CamoCheats` you need to prove you are a human by completing a captcha. Click the button below to get started!',
                "color": 0x2f63ab
              }
            ],
        });
	},
};