import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  event: { type: String, required: true },
  date: String, // Date of the game
  season: Number, // NBA season year
  status: String, // Game status (e.g., "Final", "1st Qtr", "2nd Qtr", "Halftime", "3rd Qtr", "4th Qtr", or "{start_time}")
  period: Number, // Current period of the game (0, 1, 2, 3, 4)
  time: String, // Time left in the current period or "Final"
  postseason: Boolean, // Whether the game is in the postseason
  home_team_score: Number, // Score of the home team
  visitor_team_score: Number, // Score of the visitor team
  home_team: {
    id: Number, // Identifier for the home team
    name: String, // Name of the home team
    abbreviation: String, // Abbreviation of the home team's name
    city: String, // City of the home team
    conference: String, // Conference of the home team
    division: String, // Division of the home team
    full_name: String,
  },
  visitor_team: {
    id: Number, // Identifier for the visitor team
    name: String, // Name of the visitor team
    abbreviation: String, // Abbreviation of the visitor team's name
    city: String, // City of the visitor team
    conference: String, // Conference of the visitor team
    division: String, // Division of the visitor team
    full_name: String,
  },
});

const Games = mongoose.model("Games", gameSchema, "games");

export default Games;
