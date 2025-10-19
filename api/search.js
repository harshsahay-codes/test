import fetch from "node-fetch";

export default async function handler(req, res) {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const response = await fetch(
      `https://amazon-products-api.p.rapidapi.com/get-product-data?keyword=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",       // <-- replace this with your actual key
          "X-RapidAPI-Host": "amazon-products-api.p.rapidapi.com"
        }
      }
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API request failed" });
  }
}
