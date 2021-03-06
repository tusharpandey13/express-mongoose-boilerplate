## express-mongoose-boilerplate

[![Open Source Helpers](https://www.codetriage.com/tusharpandey13/express-mongoose-boilerplate/badges/users.svg)](https://www.codetriage.com/tusharpandey13/express-mongoose-boilerplate)  



### Features

- Uses ExpressJS
- MongooseJS and MongoDB as DB
- Redis as session store
- ES6 syntax
- `@hapi/joi` for validations
- Scalable structure
- Google OAuth / Passport local auth support
- Seperate logging and config for `development`, `staging` and `production` builds

### Installation

- Install MongoDB
- Install Redis
- Install NodeJS, npm
- Run `npm install -g forever` if using in staging/prod
- Run `git clone https://github.com/tusharpandey13/express-mongoose-boilerplate.git && cd express-mongoose-boilerplate && npm install`

### Usage

Development

    npm run dev

Staging

    npm run staging

Production

    npm run start

By default, the server is started at `PORT` 8080, but this can be changed by setting the `PORT` config var as described below.  
To open the frontend, enter `http://localhost:8080` in your browser.

### Cofiguration

Make a `.env` file in the root dir.  
The `.env` file **MUST** define the following vars in addition to other vars of your choice:

    MONGODB_URI='production-mongodb-uri'
    JWT_SECRET='production-JWT-secret'
    SESSION_SECRET='production-session-secret'
    GOOGLE_CLIENT_ID='production-GOOGLE_CLIENT_ID'
    GOOGLE_CLIENT_SECRET='production-GOOGLE_CLIENT_SECRET'

In addition to `.env`, the app also pulls configuaration from `src/config/config.json` which should be defined in `src/config/index.js`.

Edit the `common` section of `config.json`. It contains dummy values for development and testing. In prod, preference is given to .env .

The `config.json` file has 4 fields:

1. `development` : these settings are used in development environment.
2. `staging` : these settings are used in staging environment.
3. `production` : these settings are used in production environment.
4. `common` : these settings are availiable in all environments.

In general, the config vars are pulled in the following order:

> In production:  
> .ENV > {`CONFIG.JSON`.`ENV`} > {`CONFIG.JSON`.`COMMON`}

> In dev/staging:  
> {`CONFIG.JSON`.`ENV`} > {`CONFIG.JSON`.`COMMON`} > .ENV

### Notes

1. `~` in import path is mapped to `__dirname/src`. This is done intentionally to simplify imports.

### License

MIT license
