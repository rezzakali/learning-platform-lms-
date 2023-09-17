import mongoose from 'mongoose';

const dbConnection = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_CONN_URI}/${process.env.DB_NAME}`
    );
    console.log(`🔗 Database connected successfully`.cyan);
  } catch (error) {
    console.log(`Database connection failed!`.red);
  }
};

export default dbConnection;
