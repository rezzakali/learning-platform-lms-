import { body, validationResult } from 'express-validator';
import User from '../models/userModel.js';
import cloudinary from '../utility/cloudinaryConfig.js';
import ErrorResponse from '../utility/error.js';
import upload from '../utility/multer.js';

const userController = [
  // Use multer middleware to handle file uploads first
  upload,

  // Validation checks using express-validator after multer
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isMobilePhone().withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // check if user already exists in the database
      const isUserExists = await User.findOne({ email });

      if (isUserExists) {
        return res.status(403).json({
          success: false,
          message: 'User already exists with this email!',
        });
      }

      let cloudinaryResponse;

      if (req.file) {
        // Upload the image to Cloudinary
        cloudinaryResponse = await cloudinary.uploader.upload(
          `data:image/png;base64,${req.file.buffer.toString('base64')}`
        );
      }

      const newUser = new User({
        ...req.body,
        profileImage: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
      });
      next();
    } catch (error) {
      return new ErrorResponse(error.message, 500);
    }
  },
];

export default userController;
