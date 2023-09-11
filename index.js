const colours = require("colors");
colours.enable();

global.instanceCommandCount = 0;

const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const { Connectors } = require("shoukaku");
const { Kazagumo } = require("kazagumo");
const config = require("./config.json");

const nodes = [
  {
    name: config.lavalink[0].name,
    url: `${config.lavalink[0].host}:${config.lavalink[0].port}`,
    auth: config.lavalink[0].password,
  },
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const kazagumo = new Kazagumo(
  {
    defaultSearchEngine: "youtube",
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  nodes
);

client.commands = new Collection();
client.cooldowns = new Collection();
client.shoukaku = kazagumo.shoukaku;
client.kazagumo = kazagumo;

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        colours.red("[Electra] [WARNING] ") +
          `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

kazagumo.shoukaku.on("ready", (name) =>
  console.log(colours.green("[Shoukaku] ") + `Lavalink ${name}: Ready!`)
);
kazagumo.shoukaku.on("error", (name, error) =>
  console.error(
    colours.red("[Shoukaku] [ERROR] ") + `Lavalink ${name}: Error Caught,`,
    error
  )
);
kazagumo.shoukaku.on("close", (name, code, reason) =>
  console.warn(
    colours.yellow("[Shoukaku] [WARN] ") +
      `Lavalink ${name}: Closed, Code ${code}, Reason ${reason || "No reason"}`
  )
);
kazagumo.shoukaku.on("debug", (name, info) =>
  console.debug(
    colours.green("[Shoukaku] [DEBUG] ") + `Lavalink ${name}: Debug,`,
    info
  )
);
kazagumo.shoukaku.on("disconnect", (name, players, moved) => {
  if (moved) return;
  players.map((player) => player.connection.disconnect());
  console.warn(
    colours.red("[Shoukaku] [WARN] ") + `Lavalink ${name}: Disconnected`
  );
});

kazagumo.on("playerStart", (player, track) => {
  const nowPlayingEmbed = new EmbedBuilder()
    .setColor(0x3fa659)
    .setTitle(`Now playing **${track.title}**!`)
    .setDescription(`By **${track.author}**`)
    .setTimestamp()
    .setFooter({
      text: "Automated Electra message",
      iconURL: client.user.displayAvatarURL(),
    });
  client.channels.cache
    .get(player.textId)
    ?.send({ embeds: [nowPlayingEmbed] })
    .then((x) => player.data.set("message", x));
});

kazagumo.on("playerEnd", (player) => {
  const nowPlayingEmbed = new EmbedBuilder()
    .setColor(0x3fa659)
    .setTitle(`Finished playing all tracks.`)
    .setTimestamp()
    .setFooter({
      text: "Automated Electra message",
      iconURL: client.user.displayAvatarURL(),
    });
  client.channels.cache
    .get(player.textId)
    ?.send({ embeds: [nowPlayingEmbed] })
    .then((x) => player.data.set("message", x));
});

kazagumo.on("playerEmpty", (player) => {
  const playerEmptyEmbed = new EmbedBuilder()
    .setColor(0xf95d5d)
    .setTitle("Player destroyed...")
    .setDescription("Player was destroyed due to inactivity. Queue another!")
    .setTimestamp()
    .setFooter({
      text: "Automated Electra message",
      iconURL: client.user.displayAvatarURL(),
    });
  client.channels.cache
    .get(player.textId)
    ?.send({ embeds: [playerEmptyEmbed] });
  player.destroy();
});

client.login(config.discord[0].token);
