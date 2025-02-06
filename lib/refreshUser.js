import { User } from "./db";
const jwt = require('jsonwebtoken')

async function grabUserFromToken(token) {
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);

  const user = await User.findOne({
    where: { id: decoded.id },
    attributes: ["id", "username", "user_data"],
  });

  return user;
}

const user = await grabUserFromToken(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dCIsImlhdCI6MTczNzUxMTg3OCwiZXhwIjoxNzM3NTE1NDc4fQ.EyyNkbumMgnAZdS9D4v42LvgKTSMXFgE6z1VLuJm4zU"
);

User.update(
  {
    user_data: {chat_history: []},
  },
  {
    where: { id: user.id },
  }
);
