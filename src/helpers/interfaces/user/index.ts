export interface FindOneUser {
  id?: number;
  phone?: string;
  onlyActive?: boolean;
  withoutError?: boolean;
  email?: string;
  orgId?: number;
}
