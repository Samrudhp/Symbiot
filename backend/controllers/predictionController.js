// controllers/predictionController.js
import axios from "axios";

// export const predictCropAdvice = async (req, res) => {
//   try {
//     const { crop, soilMoisture, latitude, longitude } = req.body;

//     if (!crop || soilMoisture === undefined || !latitude || !longitude) {
//       return res.status(400).json({ message: 'Please provide all required fields.' });
//     }

//     // 1. Get weather data from OpenWeather
//     const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
//     const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

//     const weatherResponse = await axios.get(weatherUrl);
//     const { temp, humidity } = weatherResponse.data.main;
//     const rainExpected = weatherResponse.data.weather.some(w => w.main.toLowerCase().includes('rain')) ? 'yes' : 'no';

//     // 2. Create prompt
//     const prompt = `Given that the soil moisture is ${soilMoisture}%, temperature is ${temp}°C, humidity is ${humidity}%, rain expected: ${rainExpected}, and the crop is ${crop}, suggest:
// - Whether watering is needed
// - Risk of any disease
// - Any fertilizer or nutrient advice
// - Whether the crop shows stress symptoms`;

//     // 3. Call HuggingFace Inference API
//     const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
//     const hfResponse = await axios.post(
//       'https://api-inference.huggingface.co/models/google/flan-t5-small',
//       { inputs: prompt },
//       { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
//     );

//     const predictionResult = hfResponse.data[0]?.generated_text || "No prediction generated.";

//     res.json({ prediction: predictionResult });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Prediction failed.', error: error.message });
//   }
// };


export const predictCropAdvice = async (req, res) => {
  try {
    const { crop, soilMoisture, latitude, longitude } = req.body;

    if (!crop || soilMoisture === undefined || !latitude || !longitude) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 1. Get weather data from OpenWeather
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const weatherResponse = await axios.get(weatherUrl);
    const { temp, humidity } = weatherResponse.data.main;
    const rainExpected = weatherResponse.data.weather.some(w => w.main.toLowerCase().includes('rain')) ? 'yes' : 'no';

    // For testing without API dependencies
    let advice = `Based on your ${crop} with soil moisture of ${soilMoisture}%:\n\n`;
    
    if (soilMoisture < 30) {
      advice += "- Watering: Needed immediately. Soil moisture is too low.\n";
    } else if (soilMoisture < 60) {
      advice += "- Watering: Monitor closely, may need watering in 1-2 days.\n";
    } else {
      advice += "- Watering: Not needed. Soil moisture is adequate.\n";
    }

    advice += `- Disease Risk: ${humidity > 80 ? "High" : "Low"} based on current humidity (${humidity}%).\n`;
    advice += "- Fertilizer: Consider adding balanced NPK fertilizer within the next week.\n";
    advice += `- Stress: ${temp > 30 ? "Potential heat stress detected" : "No significant stress indicators detected"} based on temperature data.`;

    res.json({ prediction: advice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Prediction failed.', error: error.message });
  }
};
