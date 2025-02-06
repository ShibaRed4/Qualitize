const fs = require('fs');
const path = require('path');

function loadCommands(commandsFolderPath) {
  const commands = {};

  // Read all files in the commands folder
  const commandFiles = fs.readdirSync(commandsFolderPath);

  commandFiles.forEach((file) => {
    const commandPath = path.join(commandsFolderPath, file);

    // Dynamically require each command file
    const commandModule = require(commandPath);

    // Ensure the command module has 'name' and 'initFunction'
    if (commandModule.name && typeof commandModule.initFunction === 'function') {
      commands[commandModule.name] = commandModule.initFunction;
    } else {
      console.warn(`Command file "${file}" is missing 'name' or 'initFunction'. Skipping...`);
    }
  });

  return commands;
}

module.exports = loadCommands;
