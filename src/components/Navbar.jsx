import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaPlane, FaExchangeAlt, FaPlaneDeparture, FaTools, FaRobot } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, navigateToAI }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/ai-assistant') {
      return location.pathname.startsWith('/ai-assistant');
    }
    return location.pathname === path;
  };
  
  // Check if we're on the AI Assistant page
  const isAIAssistantPage = location.pathname.startsWith('/ai-assistant');
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b-2 border-primary-500">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="ml-4 flex items-center text-primary-600 font-semibold">
              <svg version="1.1" id="thy_logo" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style={{width:'32px', height:'32px', minWidth:'32px', minHeight:'32px', marginRight:'12px'}} xmlSpace="preserve">
                <style type="text/css">
                    {`.st0 {
                        fill: #FFFFFF;
                    }

                    .st1 {
                        fill: #D0141C;
                    }

                    .st2 {
                        fill: none;
                        stroke: #F27171;
                        stroke-width: 0.5;
                        stroke-miterlimit: 10;
                    }`}
                </style>
                <g>
                    <path className="st0" d="M51.5,96.2c-25.9,0-47-21.1-47-47s21.1-47,47-47s47,21.1,47,47S77.4,96.2,51.5,96.2z"></path>
                    <path className="st1" d="M51.5,9.2c22.6,0,41,18.4,41,41s-18.4,41-41,41s-41-18.4-41-41S28.9,9.2,51.5,9.2 M51.5,8.7c-23,0-41.7,18.7-41.7,41.7
                    s18.7,41.7,41.7,41.7s41.7-18.7,41.7-41.7S74.5,8.7,51.5,8.7L51.5,8.7z"></path>
                    <path className="st0" d="M31.1,16.2c0,0,47.4,14.9,26.2,37.6l27.5-2.1c0.3,0,0.5,0.5,0.2,0.7L18.8,72.7c0,0,1.7,2.7,4.3,5.3
                    c11.8,11.8,30.9,14.2,45.5,5.8c14.6-8.4,22.3-25.1,19.5-41.9C86.8,22.9,63.6,5.3,37.2,13.1C34.6,13.9,32.1,15,31.1,16.2z"></path>
                    <path className="st1" d="M31.1,16.2c0,0,47.4,14.9,26.2,37.6l27.5-2.1c0.3,0,0.5,0.5,0.2,0.7L18.8,72.7c0,0,1.7,2.7,4.3,5.3
                    c11.8,11.8,30.9,14.2,45.5,5.8c14.6-8.4,22.3-25.1,19.5-41.9C86.8,22.9,63.6,5.3,37.2,13.1C34.6,13.9,32.1,15,31.1,16.2z"></path>
                    <path className="st1" d="M13.2,51.2c0,7.4,1.9,14.3,5.3,20.3c0,0,24.8-3.6,23.5-32.1C40.3,25.4,31.1,16.2,31.1,16.2
                    C20.6,23.3,13.2,35.5,13.2,51.2z"></path>
                </g>
              </svg>
              <span className="text-lg hidden sm:block">MRO Gösterge Paneli</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-primary-500 text-white' 
                    : 'text-accent-700 hover:bg-accent-100 hover:text-accent-900'
                }`}
              >
                Ana Sayfa
              </Link>
              
              <Link
                to="/mro-comparison"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/mro-comparison') 
                    ? 'bg-primary-500 text-white' 
                    : 'text-accent-700 hover:bg-accent-100 hover:text-accent-900'
                }`}
              >
                <FaExchangeAlt className="mr-1.5 h-4 w-4" />
                MRO Karşılaştırma
              </Link>
              
              <Link
                to="/airline-operators"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/airline-operators') 
                    ? 'bg-primary-500 text-white' 
                    : 'text-accent-700 hover:bg-accent-100 hover:text-accent-900'
                }`}
              >
                <FaPlaneDeparture className="mr-1.5 h-4 w-4" />
                Havayolu Operatörleri
              </Link>
              
              <button
                onClick={navigateToAI}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/ai-assistant')
                    ? 'bg-accent-900 text-white'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <FaRobot className="mr-1.5 h-4 w-4" />
                AI Asistan
              </button>
            </div>
          </div>
          
          {/* Hide mobile buttons on AI Assistant page */}
          {!isAIAssistantPage && (
            <div className="flex space-x-1 md:hidden">
              <Link
                to="/mro-comparison"
                className={`p-2 rounded-md ${
                  isActive('/mro-comparison') 
                    ? 'bg-primary-500 text-white' 
                    : 'text-accent-700 hover:bg-accent-100'
                }`}
                aria-label="MRO Karşılaştırma"
              >
                <FaExchangeAlt className="h-5 w-5" />
              </Link>
              
              <Link
                to="/airline-operators"
                className={`p-2 rounded-md ${
                  isActive('/airline-operators') 
                    ? 'bg-primary-500 text-white' 
                    : 'text-accent-700 hover:bg-accent-100'
                }`}
                aria-label="Havayolu Operatörleri"
              >
                <FaPlaneDeparture className="h-5 w-5" />
              </Link>
              
              <button
                onClick={navigateToAI}
                className={`p-2 rounded-md ${
                  isActive('/ai-assistant')
                    ? 'bg-accent-900 text-white'
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
                aria-label="AI Asistan"
              >
                <FaRobot className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 