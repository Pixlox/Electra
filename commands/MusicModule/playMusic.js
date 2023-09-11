const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays the specified song.")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song problem you'd like the bot to play.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    global.instanceCommandCount = global.instanceCommandCount + 1;
    const channel = interaction.member.voice.channel;

    if (!channel) {
      const noVCEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("You need to be in a VC first!")
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.editReply({ embeds: [noVCEmbed], ephemeral: true });
    }

    const result = await client.kazagumo.search(
      interaction.options.getString("song"),
      { requester: interaction.user }
    );

    if (!result.tracks.length) {
      const noVCEmbed = new EmbedBuilder()
        .setColor(0xf95d5d)
        .setTitle("No results found!")
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.editReply({ embeds: [noVCEmbed], ephemeral: true });
    }

    const player = await client.kazagumo.createPlayer({
      guildId: interaction.guild.id,
      textId: interaction.channel.id,
      voiceId: interaction.member.voice.channel.id,
      volume: 50,
    });

    if (!player.cleanup) player.cleanup = [];

    if (result.type === "PLAYLIST") {
      for (const track of result.tracks) {
        player.queue.add(track);
      }
    } else {
      player.queue.add(result.tracks[0]);
    }

    if (!player.playing && !player.paused) {
      player.play();
    }

    const queuedSuccessfulEmbed = new EmbedBuilder()
      .setColor(0x3fa659)
      .setTitle(
        result.type === "PLAYLIST"
          ? `Queued ${result.tracks.length}`
          : `Queued ${result.tracks[0].title}`
      )
      .setDescription(
        result.type === "PLAYLIST"
          ? `From playlist: ${result.playlistName}`
          : "Successfully queued."
      )
      .setTimestamp()
      .setFooter({
        text: `Sent by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    interaction.editReply({ embeds: [queuedSuccessfulEmbed] });
  },
};
