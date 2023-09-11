const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server."),
  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    await interaction.editReply(
      `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
  },
};
