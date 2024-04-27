export default interface ISportsEvent {
  idEvent: string;
  strEvent: string;
  strEventAlternate?: string;
  dateEvent: string;
  dateEventLocal: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strSport: string;
  strLeague: string;
  strTimestamp?: string;
  strTime?: string;
  strStatus?: string;
}
