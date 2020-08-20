import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import mongoose_autopopulate from 'mongoose-autopopulate';
import mongoosePaginate from 'mongoose-paginate-v2';

import CustomError from '~/utils/customError';

const roles = ['user', 'admin'];

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 32,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
      // remember to use .select('+password').exec(...) to explicitly select
      select: false,
    },
    name: {
      type: String,
      maxlength: 64,
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: roles,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

schema.pre('save', async function save(next) {
  try {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password);
    return next();
  } catch (error) {
    return next(error);
  }
});

schema.pre('find', async next => {});

schema.method({
  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password);
  },
});

schema.statics = {
  roles,

  checkDuplicateUsernameError(err) {
    if (err.code === 11000) {
      var error = new Error('Username already taken');
      error.errors = [
        {
          field: 'username',
          location: 'body',
          messages: ['Username already taken'],
        },
      ];
      error.status = httpStatus.CONFLICT;
      return error;
    }

    return err;
  },

  async findAndCheck(payload) {
    const { username, password } = payload;
    if (!username) throw new CustomError('Username must be provided for login');

    const user = await this.findOne({ username: username }).exec();
    if (!user) throw new CustomError(`No user associated with ${username}`, httpStatus.NOT_FOUND);

    const passwordOK = await user.passwordMatches(password);

    if (!passwordOK) throw new CustomError('Password mismatch', httpStatus.UNAUTHORIZED);

    if (!user.active) throw new CustomError('User not activated', httpStatus.UNAUTHORIZED);

    return user;
  },
};
schema.plugin(mongoosePaginate);
schema.plugin(mongoose_autopopulate);

module.exports = mongoose.model('users', schema);
