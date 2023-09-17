import ejs from 'ejs';
import { body, validationResult } from 'express-validator';
import JWT from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';
import cloudinary from '../utility/cloudinaryConfig.js';
import ErrorResponse from '../utility/error.js';
import upload from '../utility/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    const { email, name } = req.body;

    try {
      // check if user already exists in the database
      const user = await User.findOne({ email });

      if (user) {
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
      // Generate a token for the newly created user
      const token = JWT.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN,
      });

      // Configure Nodemailer with your email service provider
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const verificationLink = 'http://localhost:3000'; // Replace with your verification link

      // Render the EJS template with data
      const emailTemplatePath = path.join(
        __dirname,
        '..',
        'views',
        'email.ejs'
      );

      // Render the EJS template with data
      ejs.renderFile(
        emailTemplatePath,
        { name, verificationLink },
        (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
          } else {
            // Send the email
            transporter.sendMail(
              {
                from: process.env.SMTP_MAIL,
                to: `${email}`, // Recipient's email
                subject: 'Email Verification',
                html: data,
              },
              (error, info) => {
                if (error) {
                  console.error(error);
                  res.status(500).send('Internal Server Error');
                } else {
                  console.log('Email sent: ' + info.response);
                  res.send('Verification email sent successfully!');
                }
              }
            );
          }
        }
      );

      await newUser.save();

      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        token,
      });
      next();
    } catch (error) {
      console.log(error);
      return new ErrorResponse(error.message, 500);
    }
  },
];

export default userController;
