const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server."),
  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    const serverInfoEmbed = new EmbedBuilder()
      .setColor(0x3fa659)
      .setTitle(
        `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
      )
      .setTimestamp()
      .setFooter({
        text: `Sent by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [serverInfoEmbed] });
  },
};
