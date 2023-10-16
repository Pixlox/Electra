const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Slap a user of your choice. Notifies them if slapped.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you'd like to slap.")
        .setRequired(true)
    ),

  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    const slapChance = Math.random();

    const slapperName = interaction.user.username;
    const slapRecieverName = interaction.options.getUser("user").username;

    if (interaction.user.id === interaction.options.getUser("user").id) {
      const slapSelfEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("You slapped yourself?")
        .setDescription("It hurt...")
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.editReply({ embeds: [slapSelfEmbed] });
      return;
    }

    if (slapChance < 1 / 3 || interaction.user.id === "465672129082556427") {
      const slapHitEmbed = new EmbedBuilder()
        .setColor(0x3fa659)
        .setTitle("The slap hits!")
        .setDescription(`You slapped ${slapRecieverName}.`)
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.editReply({ embeds: [slapHitEmbed] });

      const slapHitDMEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("You just got slapped...")
        .setDescription(`You got slapped by ${slapperName}.`)
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.options.getUser("user").send({ embeds: [slapHitDMEmbed] });
      return;
    } else {
      const slapMissEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("The slap misses!")
        .setDescription("You missed it...somehow.")
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.editReply({ embeds: [slapMissEmbed] });
    }
  },
};
