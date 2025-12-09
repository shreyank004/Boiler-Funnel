import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import QuoteFormPage from './components/QuoteFormPage';
import AdminPanelPage from './components/AdminPanelPage';
import ProductFlow from './components/ProductFlow';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Quote Form Page - Main entry point */}
        <Route path="/quote" element={<QuoteFormPage />} />
        
        {/* Admin Panel Page */}
        <Route path="/admin" element={<AdminPanelPage />} />
        
        {/* Product Flow Pages */}
        <Route path="/choose" element={<ProductFlow />} />
        <Route path="/customise" element={<ProductFlow />} />
        <Route path="/book" element={<ProductFlow />} />
        <Route path="/complete" element={<ProductFlow />} />
        <Route path="/thank-you" element={<ProductFlow />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/quote" replace />} />
        <Route path="*" element={<Navigate to="/quote" replace />} />
      </Routes>
    </div>
  );
}

export default App;

