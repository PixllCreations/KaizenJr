import CommandTypes from "../enums/CommandType";

export default interface ISubCommandOptions {
  name: string;
  description: string;
  type: CommandTypes;
  options: object;
}
