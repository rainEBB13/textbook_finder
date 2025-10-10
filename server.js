import express from "express";
import fetch from "node-fetch"; // For making requests
import dotenv from "dotenv";

dotenv.config(); // Load .env variables
const app = express();
const PORT = process.env.PORT || 3000;

// Allow frontend files to be served
app.use(express.static("public")); // assuming your HTML is in /public

// Proxy route for Google Books
app.get("/api/google-books", async (req, res) => {
  const query = encodeURIComponent(req.query.q || "");
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing Google Books API key" });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&key=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from Google Books:", error);
    res.status(500).json({ error: "Failed to fetch from Google Books" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
