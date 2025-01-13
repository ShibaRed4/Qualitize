import express from 'express'
import cors from 'cors'
import expressWs from 'express-ws';
import loadRoutes from "./lib/importRoutes";
import { syncDatabase } from './lib/db';

const port = 3000;
const app = express();

expressWs(app);
app.use(express.json());
app.use(cors());

syncDatabase();
loadRoutes(app)


app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
