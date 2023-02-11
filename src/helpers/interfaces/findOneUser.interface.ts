export interface FindOneUser {
  id?: number;
  phone?: string;
  onlyActive?: boolean;
  withoutError?: boolean;
  login?: string;
}
