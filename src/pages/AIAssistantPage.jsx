import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AIAssistant from '../components/AIAssistant';
import { maintenanceData, mroFirmalari } from '../data/maintenanceData';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const AIAssistantPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentChatName, setCurrentChatName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('mro_ai_chats') || '[]');
    setChats(savedChats);

    // If chatId is not provided, create a new chat
    if (!chatId) {
      createNewChat();
    } else if (!savedChats.find(chat => chat.id === chatId)) {
      // If chatId is not found in saved chats, navigate to home
      navigate('/');
    } else {
      // Set current chat name
      const currentChat = savedChats.find(chat => chat.id === chatId);
      if (currentChat) {
        setCurrentChatName(currentChat.name);
      }
    }
  }, [chatId, navigate]);

  // Create a new chat
  const createNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      name: `Yeni Sohbet ${chats.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [
        {
          role: 'assistant',
          content: 'Merhaba! MRO bakım verileriniz hakkında sorularınızı yanıtlamak için buradayım. Başlamadan önce ayarlardan tercih ettiğiniz kriterleri seçmenizi öneririm. Ne öğrenmek istersiniz?'
        }
      ]
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    localStorage.setItem('mro_ai_chats', JSON.stringify(updatedChats));
    navigate(`/ai-assistant/${newChatId}`);
  }, [chats, navigate]);

  // Delete a chat
  const deleteChat = useCallback((id) => {
    const updatedChats = chats.filter(chat => chat.id !== id);
    setChats(updatedChats);
    localStorage.setItem('mro_ai_chats', JSON.stringify(updatedChats));
    
    if (id === chatId) {
      if (updatedChats.length > 0) {
        navigate(`/ai-assistant/${updatedChats[0].id}`);
      } else {
        createNewChat();
      }
    }
  }, [chats, chatId, navigate, createNewChat]);

  // Update chat messages
  const updateChatMessages = useCallback((messages) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, messages };
        }
        return chat;
      });
      
      localStorage.setItem('mro_ai_chats', JSON.stringify(updatedChats));
      return updatedChats;
    });
  }, [chatId]);

  // Update chat name
  const updateChatName = useCallback((newName) => {
    if (!newName || !newName.trim()) return;
    
    setCurrentChatName(newName);
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, name: newName };
        }
        return chat;
      });
      
      localStorage.setItem('mro_ai_chats', JSON.stringify(updatedChats));
      return updatedChats;
    });
    
    setIsEditingName(false);
  }, [chatId]);

  // Get initial messages for current chat
  const getInitialMessages = useCallback(() => {
    const currentChat = chats.find(chat => chat.id === chatId);
    return currentChat ? currentChat.messages : [];
  }, [chats, chatId]);

  const currentChat = chats.find(chat => chat.id === chatId);

  // Memoize the AIAssistant component
  const memoizedAssistant = useMemo(() => {
    if (!currentChat) return null;
    
    return (
      <AIAssistant
        key={`assistant-${currentChat.id}`}
        onClose={() => navigate('/')}
        data={maintenanceData}
        initialMessages={getInitialMessages()}
        onUpdateMessages={updateChatMessages}
        onUpdateChatName={updateChatName}
        chatName={currentChat.name}
        mroData={mroFirmalari}
      />
    );
  }, [
    currentChat,
    navigate,
    updateChatMessages,
    updateChatName,
    getInitialMessages,
  ]);

  return (
    <div className="flex flex-col h-screen pt-16 bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-medium text-gray-800">Sohbetler</h2>
            <button 
              onClick={createNewChat}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700"
              aria-label="Yeni sohbet"
            >
              <FaPlus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <div 
                key={chat.id}
                className={`flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${chat.id === chatId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}`}
                onClick={() => navigate(`/ai-assistant/${chat.id}`)}
              >
                <div className="truncate flex-1">
                  {isEditingName && chat.id === chatId ? (
                    <input
                      type="text"
                      value={currentChatName}
                      onChange={(e) => setCurrentChatName(e.target.value)}
                      onBlur={() => updateChatName(currentChatName)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateChatName(currentChatName);
                        } else if (e.key === 'Escape') {
                          setIsEditingName(false);
                        }
                      }}
                      className="w-full px-2 py-1 border border-primary-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    chat.name
                  )}
                </div>
                {chat.id === chatId && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditingName(true);
                      }}
                      className="text-gray-500 hover:text-primary-600"
                      aria-label="Sohbet adını düzenle"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
                          deleteChat(chat.id);
                        }
                      }}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Sohbeti sil"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentChat ? memoizedAssistant : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Yükleniyor...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage; 