const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTripPrompt = (data) => {
  return `
Plan a travel itinerary from ${data.from} to ${data.to}  
Travel dates: from ${data.startDate} to ${data.endDate}  
Total budget: ${data.budget} ${data.currency || 'USD'}  
Preferred mode of travel: ${data.travelType}  
Traveler's interests: ${data.preferences.join(', ') || 'None'}

Please follow these guidelines:

1. Divide the trip into daily plans (Day 1, Day 2, etc.)
2. For each day, include:
   - Date in YYYY-MM-DD format
   - A short title (title) describing the theme of the day
   - A brief narrative description (1-2 sentences) to set the mood of the day

3. List 3-4 locations per day with the following for each:
   - name: Name of the place
   - time: Estimated time spent (e.g., "09:00-10:30")
   - transport: Travel method from the previous location (e.g., walk, Grab, metro)
   - estimated_cost: Approximate cost to visit (entrance fee, transportation)
   - currency: Use the specified currency
   - category: Type of place (e.g., temple, cafe, nature, shopping)
   - google_maps_url: Link to Google Maps
   - lat and lng: Coordinates (if available)

4. Include a list of 1-3 useful daily travel tips (e.g., what to bring, when to avoid traffic)
5. Calculate and include:
   - total_day_cost: Daily total cost
   - total_trip_cost: Total for the whole trip
Return ONLY valid and parseable JSON.
Do not include markdown, code blocks, or any explanation.
Ensure the response is strictly JSON format, wrapped in '{}' or '[]' as needed.
Escape all double quotes in strings correctly.`
};

const callGeminiAPI = async (tripData) => {
  const prompt = generateTripPrompt(tripData);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text); // Debug

  // ✅ ล้าง markdown ถ้ามี
  const cleanText = text
   .replace(/```json|```/g, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/(\w):(\s*")/g, '"$1":$2') // Fix missing quotes around keys
      .trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Invalid JSON from Gemini:", err);
    return null;
  }
}

module.exports = {
  generateTripPrompt,
  callGeminiAPI,
};
