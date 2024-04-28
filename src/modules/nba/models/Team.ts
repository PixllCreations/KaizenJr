import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  conference: String,
  division: String,
  city: String,
  name: String,
  full_name: String,
  abbreviation: String,
  emote: { type: String, default: "" },
});

const Team = mongoose.model("Team", teamSchema, "nbaTeams");

export default Team;
