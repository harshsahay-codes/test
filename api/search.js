import fetch from "node-fetch";

// The handler function is what Replit will execute when the endpoint is hit.
export default async function handler(req, res) {
  // 1. Get the 'q' (query) parameter from the request URL.
  const query = req.query.q;

  // 2. Simple check to ensure a search query was provided.
  if (!query) {
    return res.status(400).json({ "error": "Query required" });
  }

  try {
    // 3. Make the API request to the Amazon Products API.
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

    // 4. Check if the API request itself returned an error
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText || "Unknown API error" };
        }
        return res.status(response.status).json({ "error": `API call failed with status ${response.status}: ${errorData.message || ''}` });
    }

    // 5. Convert the response to JSON format.
    const rawData = await response.json();

    // 6. Transform raw API data to match HTML/JS structure
    const data = rawData.map(item => ({
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

    // 7. Send transformed data back to client
    res.status(200).json(data);

  } catch (err) {
    // 8. Handle network errors or other unexpected errors.
    console.error(err);
    res.status(500).json({ "error": "An internal server error occurred." });
  }
}
