import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status-codes';

import mongoose_autopopulate from 'mongoose-autopopulate';
import mongoosePaginate from 'mongoose-paginate-v2';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

import CustomError from '~/utils/customError';

const roles = ['user', 'admin'];

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true,
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

schema.method({
  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password);
  },
});

schema.statics = {
  roles,
  checkDuplicateEmailError(err) {
    if (err.code === 11000) {
      var error = new CustomError({
        message: 'Email already taken',
        status: httpStatus.CONFLICT,
        details: [
          {
            field: 'email',
            location: 'body',
            messages: ['Email already taken'],
          },
        ],
      });
      return error;
    }
    return err;
  },
  async findAndCheck(payload) {
    const { email, password } = payload;
    if (!email) throw new CustomError({ message: 'email must be provided for login' });
    const user = await this.findOne({ email: email }).select('+password').exec();
    if (!user)
      throw new CustomError({
        message: `No user associated with ${email}`,
        status: httpStatus.NOT_FOUND,
      });
    const passwordOK = await user.passwordMatches(password);
    if (!passwordOK)
      throw new CustomError({ message: 'Password mismatch', status: httpStatus.UNAUTHORIZED });
    if (!user.active)
      throw new CustomError({ message: 'User not activated', status: httpStatus.UNAUTHORIZED });
    return user;
  },
};

schema.plugin(mongoosePaginate);
schema.plugin(mongoose_autopopulate);
schema.plugin(beautifyUnique);

export default mongoose.model('users', schema);
