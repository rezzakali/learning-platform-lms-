import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          return emailRegex.test(value);
        },
        message: 'Enter a valid email address!',
      },
    },
    phone: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 10,
    },
    password: {
      type: String,
      required: [true, 'Enter your password!'],
      minLength: [6, 'Password must be 6 characters!'],
    },
    profileImage: {
      type: String,
    },
    courses: [
      {
        courseId: String,
      },
    ],
    role: {
      type: String,
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// hashing password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

// compare password
userSchema.methods.comparePassowrd = async (enteredPassword) => {
  try {
    return await bcrypt.compare(this.password, enteredPassword);
  } catch (error) {
    console.log(error);
  }
};

// user model
const User = model('User', userSchema);

export default User;
