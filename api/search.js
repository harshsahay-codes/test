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
      // The URL for the specific endpoint
      `https://amazon-products-api.p.rapidapi.com/get-product-data?keyword=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          // *** YOUR ACTUAL, CORRECTED API KEY IS INSERTED HERE ***
          "X-RapidAPI-Key": "252b454267e5ff8ce30f2931cb2e8f13b98dcd9ff2a153ed898d7",
          // The correct host for the API
          "X-RapidAPI-Host": "amazon-products-api.p.rapidapi.com"
        }
      }
    );

    // 4. Check if the API request itself returned an error (e.g., 403 Forbidden, 404 Not Found)
    if (!response.ok) {
        // Attempt to parse the error response if possible, otherwise use status text.
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText || "Unknown API error" };
        }
        return res.status(response.status).json({ "error": `API call failed with status ${response.status}: ${errorData.message || ''}` });
    }


    // 5. Convert the response to JSON format.
    const data = await response.json();

    // 6. Send the data back to the client with a successful 200 status.
    res.status(200).json(data);

  } catch (err) {
    // 7. Handle network errors or other unexpected errors.
    console.error(err);
    res.status(500).json({ "error": "An internal server error occurred." });
  }
}
