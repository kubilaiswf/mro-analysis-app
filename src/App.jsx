import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import DataTable from './components/DataTable';
import DashboardSummary from './components/DashboardSummary';
import AIAssistantPage from './pages/AIAssistantPage';
import MROComparisonPage from './pages/MROComparisonPage';
import MRODetailPage from './pages/MRODetailPage';
import TurkishTechnicComparisonPage from './pages/TurkishTechnicComparisonPage';
import AirlineOperatorsPage from './pages/AirlineOperatorsPage';
import ContinentDetailPage from './pages/ContinentDetailPage';
import Footer from './components/Footer';
import { maintenanceData, mroFirmalari } from './data/maintenanceData';
import MROWorldMap from './components/charts/MROWorldMap';
import ContinentMap from './components/charts/ContinentMap';
import HomePage from './pages/HomePage';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  const allAirlines = useMemo(() => {
    const airlinesSet = new Set();
    
    mroFirmalari.forEach(mro => {
      if (mro.musteriPortfoyu && Array.isArray(mro.musteriPortfoyu)) {
        mro.musteriPortfoyu.forEach(musteri => {
          airlinesSet.add(musteri.havayolu);
        });
      }
    });
    
    return [...airlinesSet].sort();
  }, []);

  const navigateToAI = () => {
    const newChatId = `chat_${Date.now()}`;
    const savedChats = JSON.parse(localStorage.getItem('mro_ai_chats') || '[]');
    
    const newChat = {
      id: newChatId,
      name: `Yeni Sohbet ${savedChats.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [
        {
          role: 'assistant',
          content: 'Merhaba! MRO bakım verileriniz hakkında sorularınızı yanıtlamak için buradayım. Başlamadan önce ayarlardan tercih ettiğiniz kriterleri seçmenizi öneririm. Ne öğrenmek istersiniz?'
        }
      ]
    };

    const updatedChats = [...savedChats, newChat];
    localStorage.setItem('mro_ai_chats', JSON.stringify(updatedChats));
    navigate(`/ai-assistant/${newChatId}`);
  };

  const preventPageScroll = (e) => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
  };

  const isAIPage = location.pathname.startsWith('/ai-assistant');

  const Dashboard = () => (
    <div className="flex flex-col lg:flex-row overflow-hidden bg-gray-50">
      <div className="pt-16 flex flex-col lg:flex-row w-full">        
        <div className="flex flex-col flex-1 w-full overflow-hidden transition-all duration-300 ease-in-out">
          <main className="flex-1 overflow-y-auto p-4 md:px-6 lg:px-8">
            <DashboardLayout>
              {activeView === 'dashboard' && (
                <>
                  <DashboardSummary data={maintenanceData} />
                  <div className="mt-6">
                    <ContinentMap />
                  </div>
                </>
              )}
              
              {activeView === 'data' && (
                <DataTable data={maintenanceData} />
              )}
            </DashboardLayout>
          </main>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar navigateToAI={navigateToAI} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/ai-assistant/:chatId" element={<AIAssistantPage />} />
          <Route path="/mro-comparison" element={<MROComparisonPage />} />
          <Route path="/mro-detail/:mroId" element={<MRODetailPage />} />
          <Route path="/thy-comparison" element={<TurkishTechnicComparisonPage />} />
          <Route path="/airline-operators" element={<AirlineOperatorsPage />} />
          <Route path="/continent/:continentName" element={<ContinentDetailPage />} />
        </Routes>
      </div>
      {/* Show Footer on all pages except AI Assistant pages */}
      {!isAIPage && <Footer />}
    </div>
  );
}

export default App;