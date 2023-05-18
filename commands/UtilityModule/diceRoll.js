const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Rolls a die, and returns the answer.'),
	async execute(interaction) {
		const diceRoll = rollDice();
		const diceRollEmbed = new EmbedBuilder()
			.setColor(0x2C2C2C)
			.setTitle('Your dice roll')
			.setDescription(`You rolled... ${diceRoll}!`)
			.setTimestamp()
			.setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });


		interaction.reply({ embeds: [diceRollEmbed] });

	},
};

function rollDice() {
	const randomNumber = Math.floor(Math.random() * 6) + 1;
	return randomNumber;
}
  
