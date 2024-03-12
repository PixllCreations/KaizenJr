import Category from "../enums/Category";

export default interface ICommandOptions {
  name: string;
  description: string;
  category: Category;
  options: object;
  default_member_permissions: bigint;
  cooldown: number;
  dm_permission: boolean;
  dev: boolean;
  deprecated?: boolean;
}
