const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const colours = require("colors");

module.exports = {
  cooldown: 300,
  data: new SlashCommandBuilder()
    .setName("spammer")
    .setDescription(
      "Spams a specific user in DMs for a specified number of times. Max 50, plus a cooldown is in place."
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you'd like to spam.")
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName("spamamount")
        .setDescription("The amount of times you'd like to spam")
        .setRequired(true)
        .addChoices(
          { name: "10", value: "10" },
          { name: "20", value: "20" },
          { name: "30", value: "30" },
          { name: "40", value: "40" },
          { name: "50", value: "50" }
        )
    )

    .addStringOption((option) =>
      option
        .setName("custommessage")
        .setDescription("Message you'd like to send.")
        .setRequired(false)
    ),

  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    const cUser = interaction.options.getUser("user");
    const id = cUser?.id;
    const spamAmountNeeded = parseInt(
      interaction.options.getString("spamamount")
    );

    if (
      interaction.options.getString("custommessage") == null ||
      interaction.options.getString("custommessage") == ""
    ) {
      try {
        for (let i = 0; i < spamAmountNeeded; i++) {
          await interaction.options
            .getUser("user")
            .send(
              `<@${id}> ${interaction.user.username} would like to speak with you.`
            );
        }
      } catch {
        console.log(
          colours.green("[Electra] ") + "Bot blocked by user. Cannot send DM."
        );
        const blockedUserEmbed = new EmbedBuilder()
          .setColor(0xf95d5d)
          .setTitle("Cannot send user DM.")
          .setDescription("The user has blocked me, or has DMs disabled.")
          .setTimestamp()
          .setFooter({
            text: `Sent by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        return interaction.editReply({
          embeds: [blockedUserEmbed],
          ephemeral: true,
        });
      }
    } else {
      const messageToSend = interaction.options.getString("custommessage");
      for (let i = 0; i < spamAmountNeeded; i++) {
        try {
          interaction.options.getUser("user").send(`<@${id}> ` + messageToSend);
        } catch {
          console.log(
            colours.green("[Electra] ") + "Bot blocked by user. Cannot send DM."
          );
          const blockedUserEmbed = new EmbedBuilder()
            .setColor(0xf95d5d)
            .setTitle("Cannot send user DM.")
            .setDescription("The user has blocked me, or has DMs disabled.")
            .setTimestamp()
            .setFooter({
              text: `Sent by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          return interaction.editReply({
            embeds: [blockedUserEmbed],
            ephemeral: true,
          });
        }
      }
    }

    const spammingEmbed = new EmbedBuilder()
      .setColor(0x3fa659)
      .setTitle("Spamming!")
      .setDescription(
        `Spamming ${interaction.options.getUser("user").username}'s DMs.`
      )
      .setTimestamp()
      .setFooter({
        text: `Sent by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    return interaction.editReply({ embeds: [spammingEmbed], ephemeral: true });
  },
};
