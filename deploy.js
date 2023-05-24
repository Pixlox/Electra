const colours = require("colors");
colours.enable();

const { REST, Routes } = require("discord.js");
const {
  token,
  clientId,
  testing_mode,
  testingGuildId,
} = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
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
      commands.push(command.data.toJSON());
    } else {
      console.log(
        colours.red("[Electra] [WARNING] ") +
          `The module at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(
      colours.green("[Electra] ") +
        `Started refreshing ${commands.length} application (/) commands.`
    );

    if (testing_mode == true) {
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, testingGuildId),
        { body: commands }
      );
      console.log(
        colours.green("[Electra] ") +
          `Successfully reloaded ${data.length} application (/) commands.`
      );
    } else {
      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      console.log(
        colours.green("[Electra] ") +
          `Successfully reloaded ${data.length} application (/) commands.`
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
