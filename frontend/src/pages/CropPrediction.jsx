import React, { useState } from 'react';
import axios from 'axios';

export default function  CropPrediction(){
  const [crop, setCrop] = useState('');
  const [soilMoisture, setSoilMoisture] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/v1/predictions/predict', {
        crop,
        soilMoisture,
        latitude,
        longitude,
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error(error);
      alert('Prediction failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-100 min-h-screen flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h1 className="text-2xl font-semibold text-center text-green-600 mb-6">Crop Health Advisor</h1>
        <form onSubmit={handlePredict} className="space-y-4">
          <input
            type="text"
            placeholder="Crop Name (e.g., Tomato)"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="number"
            placeholder="Soil Moisture (%)"
            value={soilMoisture}
            onChange={(e) => setSoilMoisture(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-green-300"
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </form>

        {prediction && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Prediction Result:</h2>
            <p className="text-green-800">{prediction}</p>
          </div>
        )}
      </div>
    </div>
  );
};

