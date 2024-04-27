

export interface CommandData {
  name: string;
  description: string;
  options: object;
  dm_permission?: boolean;
  default_member_permissions?: string;
}
