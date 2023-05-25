const colours = require("colors");
const { Events, ActivityType } = require("discord.js");
const appRoot = require("app-root-path");
const config = require(appRoot + "/config.json");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(
      colours.green("[Electra] ") + `Logged in as ${client.user.tag}`
    );
    console.log(colours.green("[Electra] ") + `Bot ID: ${client.user.id}`);

    client.user.setActivity(
      `${config.discord[0].status} | version: ${
        require("../package.json").version
      }`,
      {
        type: ActivityType.Playing,
      }
    );
  },
};
