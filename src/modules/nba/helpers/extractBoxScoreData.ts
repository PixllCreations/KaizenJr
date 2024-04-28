import { IBoxScore, IBoxScoreGame } from "../interfaces/IBoxScore";
import IGame from "../interfaces/IGame";

export async function extractBoxScoreData(
  liveBoxScores: IBoxScore,
  liveGame: IGame
) {
  // Match home team name
  const homeTeamData = liveBoxScores.data.find(
    (game: IBoxScoreGame) => game.home_team.id === liveGame.home_team.id
  );
  if (!homeTeamData) {
    console.error("Home team data not found");
    return { occurred: false };
  }

  // Extract top few players for home team
  const homeTeamPlayers = homeTeamData.home_team.players;

  // Match visitor team name
  const visitorTeamData = liveBoxScores.data.find(
    (game: IBoxScoreGame) => game.visitor_team.id === liveGame.visitor_team.id
  );
  if (!visitorTeamData) {
    console.error("Visitor team data not found");
    return { occurred: false };
  }

  // Extract top few players for visitor team
  const visitorTeamPlayers = visitorTeamData.visitor_team.players;

  return [homeTeamPlayers, visitorTeamPlayers];
}
