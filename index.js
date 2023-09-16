import colors from 'colors';
import dotenv from 'dotenv';
import express from 'express';

// configure environment
dotenv.config();
const PORT = process.env.PORT || 3000;
const HOST_NAME = process.env.HOST_NAME;

// enable colors
colors.enable();

// database connection

// app instance
const app = express();

// routes
app.get('/api/v1/test', (req, res) => {
  res.send('Hello Developers!');
});

// listening server
app.listen(PORT, HOST_NAME, () => {
  console.log(
    `🚀 Your server is running successfully on http://${HOST_NAME}:${PORT}`
  );
});
