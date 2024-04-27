import IGame from "../interfaces/IGame";
import Games from "../models/Game";

export async function processAndSaveGameData(
  rawGameData: IGame,
  eventDescription: string
) {
  const gameData = {
    id: rawGameData.id,
    event: eventDescription,
    date: rawGameData.date,
    season: rawGameData.season,
    status: rawGameData.status,
    period: rawGameData.period,
    time: rawGameData.time,
    postseason: rawGameData.postseason,
    home_team_score: rawGameData.home_team_score,
    visitor_team_score: rawGameData.visitor_team_score,
    home_team: {
      id: rawGameData.home_team.id,
      conference: rawGameData.home_team.conference,
      division: rawGameData.home_team.division,
      city: rawGameData.home_team.city,
      name: rawGameData.home_team.name,
      full_name: rawGameData.home_team.full_name,
      abbreviation: rawGameData.home_team.abbreviation,
    },
    visitor_team: {
      id: rawGameData.visitor_team.id,
      conference: rawGameData.visitor_team.conference,
      division: rawGameData.visitor_team.division,
      city: rawGameData.visitor_team.city,
      name: rawGameData.visitor_team.name,
      full_name: rawGameData.visitor_team.full_name,
      abbreviation: rawGameData.visitor_team.abbreviation,
    },
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  try {
    const game = await Games.findOneAndUpdate(
      { id: rawGameData.id },
      gameData,
      options
    );
    console.log(
      `${game!.home_team?.name} ${
        game!.visitor_team?.name
      } processed successfully`
    );
  } catch (error) {
    console.error("Failed to process the game:", error);
  }
}
