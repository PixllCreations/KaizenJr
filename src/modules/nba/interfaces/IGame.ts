export default interface IGame {
  id: number; // Identifier for the game
  event?: string;
  date: string; // Date of the game
  season: number; // NBA season year
  status: string; // Game status (e.g., "Final", "1st Qtr", "2nd Qtr", "Halftime", "3rd Qtr", "4th Qtr", or "{start_time}")
  period: number; // Current period of the game (0, 1, 2, 3, 4)
  time: string; // Time left in the current period or "Final"
  postseason: boolean; // Whether the game is in the postseason
  home_team_score: number; // Score of the home team
  visitor_team_score: number; // Score of the visitor team
  home_team: {
    id: number; // Identifier for the home team
    name: string; // Name of the home team
    abbreviation: string; // Abbreviation of the home team's name
    city: string; // City of the home team
    conference: string; // Conference of the home team
    division: string; // Division of the home team
    full_name: string;
  };
  visitor_team: {
    id: number; // Identifier for the visitor team
    name: string; // Name of the visitor team
    abbreviation: string; // Abbreviation of the visitor team's name
    city: string; // City of the visitor team
    conference: string; // Conference of the visitor team
    division: string; // Division of the visitor team
    full_name: string;
  };
}
