import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AgricultureMarqueeBg } from "./pages/Main";
import SignInPage from "./pages/signin";
import SignUp from "./pages/signup";
import DiseasePrediction from "./pages/test";
import AgricultureDashboard from "./pages/farmerDashboard";
import FarmerDataCollectionForm from "./pages/onboarding";
import CropPrediction from "./pages/CropPrediction";





function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AgricultureMarqueeBg/>}  />
        <Route path="/signin" element={<SignInPage/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/test"  element={<DiseasePrediction/>}/>
        <Route path="/agri-dash" element={<AgricultureDashboard/>}/>
        <Route path="/main" element={<FarmerDataCollectionForm/>}/>
        <Route path="/crop-prediction" element={<CropPrediction/>}/>
        
      </Routes>
      </Router>
  );
};

export default App
