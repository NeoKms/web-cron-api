export class DefaultMessageDto {
  message: string;
}

export class MWRDto<T> {
  message: string;
  result: T;
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
