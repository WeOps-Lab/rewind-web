export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  group: string;
  roles: string[];
}
