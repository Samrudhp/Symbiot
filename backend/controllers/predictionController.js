// controllers/predictionController.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const predictCropAdvice = async (req, res) => {
  try {
    const { crop, soilMoisture, latitude, longitude } = req.body;

    if (!crop || soilMoisture === undefined || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Get weather data from OpenWeather
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const weatherResponse = await axios.get(weatherUrl);
    const { temp, humidity } = weatherResponse.data.main;
    const weatherCondition = weatherResponse.data.weather[0].main;
    const rainExpected = ['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherCondition) ? 'yes' : 'no';

    // Create the prompt for Gemini
    const prompt = `Given that the soil moisture is ${soilMoisture}, temperature is ${temp}°C, humidity is ${humidity}%, rain expected: ${rainExpected}, and the crop is ${crop}, provide a brief agricultural report with these sections:
- Whether watering is needed
- Risk of any disease
- Any fertilizer or nutrient advice
- Whether the crop shows stress symptoms`;

    console.log("Sending prompt to Gemini API:", prompt);

    // Call Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
      console.log("Calling Gemini API...");
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log("Gemini API response received");
      
      // Extract the text from Gemini's response
      if (!geminiResponse.data || !geminiResponse.data.candidates || geminiResponse.data.candidates.length === 0) {
        console.error("Unexpected Gemini API response structure:", JSON.stringify(geminiResponse.data));
        throw new Error("Invalid response from Gemini API");
      }
      
      const predictionResult = geminiResponse.data.candidates[0]?.content?.parts?.[0]?.text || "No prediction generated.";
      
      // Format the response nicely
      const formattedResult = `Agricultural Report for ${crop.charAt(0).toUpperCase() + crop.slice(1)}\n\n${predictionResult}\n\nCurrent conditions: ${temp}°C, ${humidity}% humidity${rainExpected === 'yes' ? ', rain expected' : ''}`;
      
      res.json({ prediction: formattedResult });
    } catch (geminiError) {
      console.error("Gemini API error details:", {
        message: geminiError.message,
        status: geminiError.response?.status,
        data: geminiError.response?.data
      });
      
      // Fallback to basic logic if Gemini API fails
      console.log("Using fallback prediction logic");
      
      // Convert sensor value to moisture percentage for human understanding
      // Using your scale: 0-300 super moist, 300-700 moist, 700+ dry
      let moistureCategory = "";
      let needsWatering = false;
      
      if (soilMoisture < 300) {
        moistureCategory = "very moist";
        needsWatering = false;
      } else if (soilMoisture < 700) {
        moistureCategory = "moderately moist";
        needsWatering = false;
      } else {
        moistureCategory = "dry";
        needsWatering = true;
      }
      
      let advice = `Agricultural Report for ${crop.charAt(0).toUpperCase() + crop.slice(1)}\n\n`;
      
      // Watering advice based on sensor values and rain
      if (rainExpected === 'yes') {
        advice += `🌧️ **Watering**: Rain is expected. Hold off on irrigation.\n\n`;
      } else if (needsWatering) {
        advice += `💧 **Watering**: Needed. Soil is ${moistureCategory} (sensor value: ${soilMoisture}).\n\n`;
      } else {
        advice += `✅ **Watering**: Not needed. Soil is ${moistureCategory} (sensor value: ${soilMoisture}).\n\n`;
      }

      // Disease risk based on humidity and temperature
      let diseaseRisk = "Low";
      if (humidity > 85 && temp > 25) {
        diseaseRisk = "High";
      } else if (humidity > 75 || temp > 30) {
        diseaseRisk = "Moderate";
      }
      
      advice += `🔍 **Disease Risk**: ${diseaseRisk} risk based on current humidity (${humidity}%) and temperature (${temp}°C).\n\n`;
      
      // Fertilizer recommendation
      advice += `🌱 **Fertilizer**: Consider adding balanced NPK fertilizer. For ${crop}, focus on ${getFertilizerAdvice(crop)}.\n\n`;
      
      // Stress assessment
      const stressFactors = [];
      if (temp > 30) stressFactors.push(`high temperature (${temp}°C)`);
      if (temp < 10) stressFactors.push(`low temperature (${temp}°C)`);
      if (humidity > 90) stressFactors.push(`excessive humidity (${humidity}%)`);
      if (soilMoisture > 800) stressFactors.push(`dry soil conditions (sensor: ${soilMoisture})`);
      
      if (stressFactors.length > 0) {
        advice += `⚠️ **Stress Indicators**: Potential stress due to ${stressFactors.join(' and ')}.`;
      } else {
        advice += `✅ **Stress Indicators**: No significant environmental stress detected.`;
      }
      
      advice += `\n\nCurrent conditions: ${temp}°C, ${humidity}% humidity, ${weatherCondition}.`;

      res.json({ prediction: advice });
    }
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Prediction failed.', error: error.message });
  }
};

// Helper function for crop-specific fertilizer advice
function getFertilizerAdvice(crop) {
  const cropLower = crop.toLowerCase();
  
  const fertilizers = {
    tomato: "phosphorus during fruiting stage",
    potato: "potassium for tuber development",
    rice: "nitrogen during vegetative stage",
    wheat: "nitrogen early in the growing season",
    corn: "nitrogen and potassium in equal amounts",
    cotton: "potassium during boll development"
  };
  
  return fertilizers[cropLower] || "balanced nutrients throughout the growing season";
}
