import express from 'express';
import loaders from './loaders';
import loggerInstance from '~/utils/logger';
import path from 'path';

global.__logger = loggerInstance;
global.__dirname = path.resolve('./');

loaders(express());
