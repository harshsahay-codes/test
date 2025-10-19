import fetch from "node-fetch";

export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query required" });
  }

  try {
    // Fetch from Amazon Products API
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

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText || "Unknown API error" };
      }
      return res.status(response.status).json({ error: `API call failed with status ${response.status}: ${errorData.message || ''}` });
    }

    const rawData = await response.json();

    // Transform data to match frontend structure
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

    res.status(200).json({ products });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
}
