import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import Category from "../enums/Category";

export default interface ICommand {
  client: CustomClient;
  name: string;
  description: string;
  category: Category;
  options: object;
  default_member_permissions: bigint;
  cooldown: number;
  dm_permission: boolean;
  dev: boolean;
  deprecated?: boolean;

  Execute(interaction: ChatInputCommandInteraction): void;
}
