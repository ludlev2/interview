import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseOptions } from './database';

export default new DataSource(databaseOptions);
