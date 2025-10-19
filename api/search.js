import fetch from "node-fetch";

export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    // Replace this static ASIN with something generic for demo
    const asin = "B08H75RTZ8";

    const body = {
      asin: asin,
      host: "www.amazon.com"
    };

    const response = await fetch("https://amazon-products-api.p.rapidapi.com/get-product-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "amazon-products-api.p.rapidapi.com",
        "x-rapidapi-key": "252b454267e5ff8ce30f2931cb2e8f13b98dcd9ff2a153ed898d7"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `API error: ${text}` });
    }

    const rawData = await response.json();

    // Transform data to frontend-friendly format
    const products = [
      {
        product_name: rawData.title || "Unknown Product",
        brand: rawData.brand || "Unknown Brand",
        image_url: rawData.images?.[0] || "https://placehold.co/218x218/D1D5DB/4B5563?text=N/A",
        vendors: [
          {
            name: "Amazon",
            lowest_price: rawData.price || 0,
            sellers: [
              {
                name: "Amazon",
                price: rawData.price || 0,
                rating: rawData.rating || 0,
                reviews: rawData.reviews || 0,
                salesRank: rawData.salesRank || 0,
                inStock: rawData.inStock ?? true,
                fastDelivery: rawData.fastDelivery ?? true,
                affiliate_link: rawData.affiliateLink || "#"
              }
            ]
          }
        ]
      }
    ];

    res.status(200).json({ products });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
