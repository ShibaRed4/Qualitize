const fs = require('fs');
const path = require('path');

/**
 * Dynamically loads all routes from the ./routes directory
 * and mounts them with the endpoint matching the file name.
 * 
 * @param {Express.Application} app - The Express app instance.
 * @param {string} routesPath - Path to the routes directory.
 */
function loadRoutes(app, routesPath = './routes') {
  const absolutePath = path.resolve(routesPath);

  // Read all files in the routes directory
  fs.readdirSync(absolutePath).forEach(async (file) => {
    const filePath = path.join(absolutePath, file);

    // Ensure it's a JavaScript or TypeScript file
    if (file.endsWith('.js') || file.endsWith('.ts')) {
      const route = require(filePath); // Import the route module
      const routeName = file.replace(/\.(js|ts)$/, ''); // Strip the extension

      // Mount the route with its name as the endpoint
      app.use(`/api/${routeName}`, route);
      console.log(`Route loaded: /${routeName} ✅`);
    }
  });
}

module.exports = loadRoutes;
