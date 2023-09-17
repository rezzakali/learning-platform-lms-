import { Router } from 'express';
import userController from '../controllers/userController.js';
import User from '../models/userModel.js';

// router object
const router = Router();

// sign up user route
router.post('/signup', userController);
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
  }
});

export default router;
