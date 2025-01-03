export interface Role {
  id: string;
  name: string;
  display_name?: string;
}

export interface User {
  id: string;
  name: string;
  group: string;
  roles: string[];
  username?: string;
}
