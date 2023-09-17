import colors from 'colors';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnection from '../dbconfig/dbConnection.js';
import errorHandler from '../middlewares/errorHandler.js';
import userRoute from '../routes/userRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configure environment
dotenv.config();
const PORT = process.env.PORT || 3000;
const HOST_NAME = process.env.HOST_NAME;

// enable colors
colors.enable();

// database connection
dbConnection();

// app instance
const app = express();

// set ejs engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors policy
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// routes

app.use('/api/v1/user', userRoute);

// custom error handler
app.use(errorHandler);

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next();
  }
  res.status(500).json({ error: 'There was a server side error!' });
});

// listening server
app.listen(PORT, HOST_NAME, () => {
  console.log(
    `🚀 Your server is running successfully on http://${HOST_NAME}:${PORT}`.blue
  );
});
