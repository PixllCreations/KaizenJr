import Category from "../enums/Category";
import CommandTypes from "../enums/CommandType";

export default interface ICommandOptions {
  name: string;
  description: string;
  type: CommandTypes;
  category: Category;
  options: object;
  default_member_permissions: bigint;
  cooldown: number;
  dm_permission: boolean;
  dev: boolean;
  deprecated?: boolean;
}
