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
        {
          name: "Auscar",
          value:
            "He is ladyboy and loves SUSHANG and Thick tenticle hentai also cursed with Xianzhou characters, talked about Egypt for too long",
        },
        {
          name: "Sika",
          value:
            "He loves a certain event that occured on the eleventh of septmeber 2001 and the line 'what rod' reason why maxi hate Egypt",
        },
        {
          name: "Maxi",
          value:
            "Hates Egypt and loves looking at SEELE, also have mucho hombre amigos",
        },
        {
          name: "Omar",
          value: "He loves Silver Wolf, doesn't contribute to Egypt",
        },
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
