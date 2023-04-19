import * as crypto from 'node:crypto';
import config from '../config';
import RightsDto from '../auth/dto/rights.dto';

export type rightsType = {
  deny: number;
  read: number;
  write: number;
};
export const rights: rightsType = {
  deny: 0,
  read: 1,
  write: 2,
};
export const defaultRights: RightsDto = {
  logs: rights.deny,
  jobs: rights.deny,
  users: rights.deny,
  ssh: rights.deny,
  organization: rights.deny,
};
export const MESSAGE_OK = { message: 'ok' };

export const md5 = (x: string): string =>
  crypto.createHash('md5').update(x).digest('hex');
export const hashPassword = (password: string): string =>
  md5(config().SESSION.secret + md5(password) + md5(config().SESSION.secret));
export const getNowTimestampSec = (): number => {
  return Math.round(Date.now() / 1000);
};

export const cipher = (str: string): string => {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(config().SSH.SECRET_KEY, config().SSH.SALT, 32);
  const res = crypto
    .createCipheriv('aes-256-ctr', key, iv)
    .update(str, 'utf8', 'hex');
  return res + '/' + Array.from(iv).join('.');
};
export const decipher = (str: string): string => {
  const iv = Buffer.from(
    str
      .split('/')[1]
      .split('.')
      .map((el) => +el),
  );
  const key = crypto.scryptSync(config().SSH.SECRET_KEY, config().SSH.SALT, 32);
  return crypto
    .createDecipheriv('aes-256-ctr', key, iv)
    .update(str, 'hex', 'utf8');
};
export const copyObj = (obj: any) => JSON.parse(JSON.stringify(obj));

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const checkRelationDeep = (relations, select) => {
  Object.keys(select).forEach((prop) => {
    if (/Entity$/gi.test(prop)) {
      if (!relations.hasOwnProperty(prop)) {
        relations[prop] = {};
      }
      if (typeof select[prop] === 'object') {
        checkRelationDeep(relations[prop], select[prop]);
      }
    }
  });
};
export const fillOptionsByParams = (params, options): void => {
  if (params.select?.length) {
    params.select.forEach((pathProp) =>
      pathProp.split('.').reduce((acc, prop, ind, arr) => {
        if (ind === arr.length - 1) {
          acc[prop] = true;
        } else if (!acc.hasOwnProperty(prop)) {
          acc[prop] = {};
        }
        return acc[prop];
      }, options.select),
    );
    checkRelationDeep(options.relations, options.select);
  }
  if (params?.options?.sortBy?.length) {
    options.order = params?.options?.sortBy.reduce((acc, prop, ind) => {
      acc[prop] = 'ASC';
      if (params.options?.sortDesc?.length >= ind + 1) {
        acc[prop] = 'DESC';
      }
      return acc;
    }, {});
  }
  if (params.options?.itemsPerPage) {
    options.take = params.options.itemsPerPage;
    if (params.options?.hasOwnProperty('page')) {
      options.skip = params.options.itemsPerPage * (params.options.page - 1);
      options.skip < 0 && delete options.skip;
    }
  }
};
