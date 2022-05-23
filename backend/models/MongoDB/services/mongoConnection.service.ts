import mongoose from "mongoose";
import {DbConnectionError} from "../../../errors/dbConnection.error";

class MongoDBConnectionService {
  private readonly mongoUrl = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_USER_PASSWORD}@${process.env.MONGO_CLUSTER}/myFirstDatabase?retryWrites=true&w=majority` || '';

  connectDB = async () => {
    try {
      const dbConnection = await mongoose.connect(this.mongoUrl);

      console.log(`DB connected: ${dbConnection.connection.host}`)
    } catch {
      throw new DbConnectionError('Failed to connect to the DB')
    }
  }
}

export const mongoConnectionService = new MongoDBConnectionService();


