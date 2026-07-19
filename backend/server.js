import "dotenv/config";
import validateEnv from "./src/config/validateEnv.js";
validateEnv();
import app from "./app.js";
import { connectDB } from "./src/config/db.js";
// dns.setDefaultResultOrder("ipv4first");
// try {
//   dns.setServers(["8.8.8.8", "1.1.1.1"]);
// } catch (e) {
//   console.warn("Could not set custom DNS servers:", e.message);
// }

const PORT = process.env.PORT || 5000;

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`MediShop Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
// Trigger nodemon reload with restored MongoDB Atlas SRV URI
