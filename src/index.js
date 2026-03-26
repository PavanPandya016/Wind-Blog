import connectDB from "./db/connect.js";
import 'dotenv/config'
import app from "./app.js"

const port = process.env.PORT || 8000

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection error", err);
    })

