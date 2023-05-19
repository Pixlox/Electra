const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('calculate')
		.setDescription('Provides information about the server.')
        .addStringOption(option =>
            option
                .setName('calculation')
                .setDescription('The math problem you\'d like the bot to calculate.')
                .setRequired(true),
        ),

	async execute(interaction) {
        global.instanceCommandCount = global.instanceCommandCount + 1;

        const calculation = calculate(interaction.options.getString('calculation'));
        const result = calculate(calculation);

        if (result == 'fail') {
            const calculateEmbedError = new EmbedBuilder()
                .setColor(0xF95d5d)
                .setTitle('Calculation failed.')
                .setDescription('Is it too big, or too complicated? Don\'t use words, as this is a basic calculator.')
                .setTimestamp()
                .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [calculateEmbedError], ephemeral: true });
        } else {
            const calculateEmbed = new EmbedBuilder()
                .setColor(0x3FA659)
                .setTitle('Your answer...')
                .setDescription(`Your answer is ${result}.`)
                .setTimestamp()
                .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [calculateEmbed] });
        }
	},
};

function calculate(operation) {
    try {
        const result = eval(operation);
        return result;
    } catch {
        return 'fail';
    }
}
  