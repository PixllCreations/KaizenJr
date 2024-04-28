export interface ITeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
  emote?: string;
}

export interface ITeamApiResponse {
  data: ITeam[];
}
