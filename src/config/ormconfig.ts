import { ORMConfig } from './index';
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource(ORMConfig as DataSourceOptions);
