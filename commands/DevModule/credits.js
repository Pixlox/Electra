const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Credits all who helped create the bot."),
  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    const statsEmbed = new EmbedBuilder()
      .setColor(0x3fa659)
      .setTitle("Credits")
      .addFields(
        { name: "Author", value: "Pixlox", inline: true },
        { name: "Main Library", value: "DiscordJS", inline: true },
        { name: "Reddit Wrapper", value: "Snoowrap" },
        { name: "Thanks to...", value: `${interaction.user.username}` }
      )
      .setTimestamp()
      .setFooter({
        text: `Sent by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.editReply({ embeds: [statsEmbed] });
  },
};
