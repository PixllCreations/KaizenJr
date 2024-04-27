export interface IBoxScorePlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
}

export interface IBoxScoreStats {
  min: string;
  fgm: number;
  fga: number;
  fg_pct: number;
  fg3m: number;
  fg3a: number;
  fg3_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  pts: number;
  player: IBoxScorePlayer;
}

export interface IBoxScoreTeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
  players: IBoxScoreStats[];
}

export interface IBoxScoreGame {
  date: string;
  season: number;
  status: string;
  period: number;
  time: string;
  postseason: boolean;
  home_team_score: number;
  visitor_team_score: number;
  home_team: IBoxScoreTeam;
  visitor_team: IBoxScoreTeam;
}

export interface IBoxScore {
  data: IBoxScoreGame[];
}
