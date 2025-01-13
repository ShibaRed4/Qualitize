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
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0dCIsImlhdCI6MTczNjM4NzY2OCwiZXhwIjoxNzM2MzkxMjY4fQ.u4apcDtU_obpUsSEuY-8TnLOIC1t3EmrGChaN8vradI"
);

User.update(
  {
    user_data: {chat_history: []},
  },
  {
    where: { id: user.id },
  }
);
