const colours = require("colors");
const { Events, Collection, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        const cooldownEmbed = new EmbedBuilder()
          .setColor(0x3fa659)
          .setTitle("On cooldown!")
          .setDescription(
            `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`
          )
          .setTimestamp()
          .setFooter({
            text: `Sent by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    if (!command) {
      console.error(
        colours.red("[Electra] [WARNING] ") +
          `No command matching ${interaction.commandName} was found.`
      );
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        colours.red("[Electra] [WARNING] ") +
          `Error executing ${interaction.commandName}`
      );
      console.error(error);
    }
  },
};
