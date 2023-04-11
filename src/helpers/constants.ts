import * as crypto from 'node:crypto';
import config from '../config';

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
export const defaultRights = {
  logs: rights.deny,
  jobs: rights.deny,
  users: rights.deny,
  ssh: rights.deny,
};
export const MESSAGE_OK = { message: 'ok' };

const md5 = (x: string): string =>
  crypto.createHash('md5').update(x).digest('hex');
export const hashPassword = (password: string): string =>
  md5(config().SESSION.secret + md5(password) + md5(config().SESSION.secret));
export const transliterate = (text: string): string => {
  const a = {
    Ё: 'YO',
    Й: 'I',
    Ц: 'TS',
    У: 'U',
    К: 'K',
    Е: 'E',
    Н: 'N',
    Г: 'G',
    Ш: 'SH',
    Щ: 'SCH',
    З: 'Z',
    Х: 'H',
    Ъ: "'",
    ё: 'yo',
    й: 'i',
    ц: 'ts',
    у: 'u',
    к: 'k',
    е: 'e',
    н: 'n',
    г: 'g',
    ш: 'sh',
    щ: 'sch',
    з: 'z',
    х: 'h',
    ъ: "'",
    Ф: 'F',
    Ы: 'I',
    В: 'V',
    А: 'a',
    П: 'P',
    Р: 'R',
    О: 'O',
    Л: 'L',
    Д: 'D',
    Ж: 'ZH',
    Э: 'E',
    ф: 'f',
    ы: 'i',
    в: 'v',
    а: 'a',
    п: 'p',
    р: 'r',
    о: 'o',
    л: 'l',
    д: 'd',
    ж: 'zh',
    э: 'e',
    Я: 'Ya',
    Ч: 'CH',
    С: 'S',
    М: 'M',
    И: 'I',
    Т: 'T',
    Ь: "'",
    Б: 'B',
    Ю: 'YU',
    я: 'ya',
    ч: 'ch',
    с: 's',
    м: 'm',
    и: 'i',
    т: 't',
    ь: "'",
    б: 'b',
    ю: 'yu',
  };
  return text
    .split('')
    .map((char) => a[char] || char)
    .join('');
};
export const getNowTimestampSec = (): number => {
  return Math.round(Date.now() / 1000);
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
