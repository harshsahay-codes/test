import fetch from "node-fetch";

export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    // 1️⃣ Fetch from Amazon Products API
    const response = await fetch(
      `https://amazon-products-api.p.rapidapi.com/get-product-data?keyword=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "252b454267e5ff8ce30f2931cb2e8f13b98dcd9ff2a153ed898d7",
          "X-RapidAPI-Host": "amazon-products-api.p.rapidapi.com"
        }
      }
    );

    // 2️⃣ Get raw text first (in case it’s HTML error)
    const rawText = await response.text();

    // 3️⃣ Try to parse JSON
    let rawData;
    try {
      rawData = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse JSON from API:", rawText);
      return res.status(500).json({
        error: "API returned invalid JSON or HTML error page",
        raw: rawText
      });
    }

    // 4️⃣ Transform data to match frontend
    const products = (rawData.products || []).map(item => ({
      product_name: item.title || "Unknown Product",
      brand: item.brand || "Unknown Brand",
      image_url: item.images?.[0] || "https://placehold.co/218x218/D1D5DB/4B5563?text=N/A",
      vendors: [
        {
          name: "Amazon",
          lowest_price: item.price || 0,
          sellers: [
            {
              name: "Amazon",
              price: item.price || 0,
              rating: item.rating || 0,
              reviews: item.reviews || 0,
              salesRank: item.salesRank || 0,
              inStock: item.inStock ?? true,
              fastDelivery: item.fastDelivery ?? true,
              affiliate_link: item.affiliateLink || "#"
            }
          ]
        }
      ]
    }));

    // 5️⃣ Return JSON safely
    return res.status(200).json({ products });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      error: "Internal server error while fetching products",
      details: err.message
    });
  }
}
