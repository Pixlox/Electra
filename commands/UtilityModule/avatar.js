const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Displays your avatar, or another user if specified.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you\'d like to target for the avatar.')
                .setRequired(false),
        ),


	async execute(interaction) {
        try {
            const mentionUserEmbed = new EmbedBuilder()
            .setColor(0x2C2C2C)
            .setTitle(`${interaction.options.getUser('user').username}'s Avatar`)
            .setImage(interaction.options.getUser('user').displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTimestamp()
            .setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [mentionUserEmbed] });
        } catch {
            const currentUserEmbed = new EmbedBuilder()
			.setColor(0x2C2C2C)
			.setTitle(`${interaction.user.username}'s Avatar`)
            .setImage(interaction.user.displayAvatarURL({ dynamic: true, size: 4096 }))
			.setTimestamp()
			.setFooter({ text: `Sent by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            interaction.reply({ embeds: [currentUserEmbed] });
        }
	},
};