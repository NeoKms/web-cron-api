import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';

export class DefaultMessageDto {
  message: string;
}

export class MWRDto<T> {
  message: string;
  result: T;
}

export interface InviteCodeData {
  orgId: number;
  email: string;
}

export interface SimpleObject {
  [key: string]: any;
}

export interface Pagination {
  groupBy: Array<string>;
  groupDesc: Array<boolean>;
  itemsPerPage: number;
  page: number;
  sortBy: Array<string>;
  sortDesc: Array<boolean>;
}

export type additionalSelect<Entity, Dto> =
  | false
  | (keyof Omit<Dto, keyof Entity>)[];
export interface FindManyOptionsAdd<Entity = any, Dto = any>
  extends FindManyOptions<Entity> {
  additionalSelect?: additionalSelect<Entity, Dto>;
}
