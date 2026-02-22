import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "monad_staking",
    });
  }

  return global._mongooseConn;
}
