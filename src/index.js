import express from 'express';
import loaders from './loaders';
import loggerFactory from '~/utils/logger';
import path from 'path';

// set global vars that are not available in es6
global.__logger = loggerFactory({});
global.__dirname = path.resolve('./');

// loaders init
loaders(express());
