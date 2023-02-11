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
