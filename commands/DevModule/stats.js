const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const osu = require("node-os-utils");
const appRoot = require("app-root-path");

const cpu = osu.cpu;
const formatMemoryUsage = (data) =>
  `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
const memoryData = process.memoryUsage();
const memoryUsage = {
  rss: `${formatMemoryUsage(memoryData.rss)}`,
  heapTotal: `${formatMemoryUsage(memoryData.heapTotal)}`,
  heapUsed: `${formatMemoryUsage(memoryData.heapUsed)}`,
  external: `${formatMemoryUsage(memoryData.external)}`,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Provides current stats about the bot."),
  async execute(interaction) {
    global.instanceCommandCount = global.instanceCommandCount + 1;

    cpu.usage().then((cpuPercentage) => {
      const statsEmbed = new EmbedBuilder()
        .setColor(0x3fa659)
        .setTitle("Instance Statistics")
        .addFields(
          {
            name: "Version",
            value: `Alpha ${require(appRoot + "/package.json").version}`,
          },
          { name: "Author", value: "Pixlox#1717" },
          { name: "Library", value: "DiscordJS" },
          { name: "Server", value: `${interaction.guild.name}` },
          { name: "Instance Memory usage", value: memoryUsage.rss },
          { name: "Instance CPU usage", value: `${cpuPercentage}%` },
          {
            name: "Commands run on this instance",
            value: `${global.instanceCommandCount}`,
          }
        )
        .setTimestamp()
        .setFooter({
          text: `Sent by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({ embeds: [statsEmbed] });
    });
  },
};
