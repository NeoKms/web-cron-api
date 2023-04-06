import config from './index';
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource(config().DB as DataSourceOptions);
