import express from 'express';
import loaders from './loaders';
import loggerFactory from '~/utils/logger';
import path from 'path';

global.__logger = loggerFactory({});
global.__dirname = path.resolve('./');

loaders(express());
