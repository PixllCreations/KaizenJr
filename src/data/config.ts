import dotenv from "dotenv";
dotenv.config();

/**
 * Retrieves sensitive environment variables from the .env file and exports them.
 * Ensures that sensitive information such as tokens and IDs are kept private.
 */

const token = process.env.TOKEN;
const discordClientId = process.env.DISCORD_CLIENT_ID;
const developerUserIds = (process.env.DEVELOPER_USER_IDS || " ").split(",");
const mongoDbUri = process.env.MONGODB_URI;

export { token, discordClientId, developerUserIds, mongoDbUri };
