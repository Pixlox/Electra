const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock paper scissors against the bot.")
    .addStringOption((option) =>
      option
        .setName("option")
        .setDescription("The option you'd like to play against the bot.")
        .setRequired(true)
        .addChoices(
          { name: "rock", value: "rock" },
          { name: "paper", value: "paper" },
          { name: "scissors", value: "scissors" }
        )
    ),
  async execute(interaction) {
    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const userChoice = interaction.options.getString("option");

    global.instanceCommandCount = global.instanceCommandCount + 1;

    if (botChoice == interaction.options.getString("option")) {
      const tieEmbed = new EmbedBuilder()
        .setColor(0xffe838)
        .setTitle("It's a tie!")
        .setDescription("Game results are placed below.")
        .addFields(
          { name: "I rolled", value: botChoice },
          { name: "You rolled", value: userChoice }
        )
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({ embeds: [tieEmbed] });
      return;
    }

    if (
      (botChoice == "rock" && userChoice == "paper") ||
      (botChoice == "paper" && userChoice == "scissors") ||
      (botChoice == "scissors" && userChoice == "rock")
    ) {
      const userWinEmbed = new EmbedBuilder()
        .setColor(0x3fa659)
        .setTitle("You win!")
        .setDescription("Game results are placed below.")
        .addFields(
          { name: "I rolled", value: botChoice },
          { name: "You rolled", value: userChoice }
        )
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({ embeds: [userWinEmbed] });
      return;
    }

    if (
      (botChoice == "rock" && userChoice == "scissors") ||
      (botChoice == "paper" && userChoice == "rock") ||
      (botChoice == "scissors" && userChoice == "paper")
    ) {
      const userLoseEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("You lose!")
        .setDescription("Game results are placed below.")
        .addFields(
          { name: "I rolled", value: botChoice },
          { name: "You rolled", value: userChoice }
        )
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({ embeds: [userLoseEmbed] });
      return;
    }
  },
};
