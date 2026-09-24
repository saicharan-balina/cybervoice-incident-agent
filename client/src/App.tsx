import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentDetailsPage } from './pages/IncidentDetailsPage';
import { HelpSettingsPage } from './pages/HelpSettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assistant" element={<VoiceAssistantPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailsPage />} />
            <Route path="/help" element={<HelpSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
