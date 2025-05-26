import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaArrowLeft, FaCog, FaSave, FaTimes, FaUserEdit, FaSpinner, FaArrowUp, FaEdit, FaUser, FaSync, FaCopy, FaPencilAlt } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GoogleGenAI } from "@google/genai";

const DEFAULT_PROMPT_TEMPLATE = import.meta.env.VITE_DEFAULT_PROMPT_TEMPLATE || 
  'Ben {bot_name}, MRO bakım verilerini analiz eden bir AI asistanıyım. Aşağıdaki veri setini kullanarak soruları yanıtla: {data_context}';

const AIAssistant = ({ onClose, data, mroData = [], initialMessages = [], onUpdateMessages, chatName, onUpdateChatName }) => {
  const isFirstRender = useRef(true);
  
  const [messages, setMessages] = useState(() => {
    return initialMessages.length > 0 ? 
      initialMessages : 
      [{
        role: 'assistant',
        content: 'Merhaba! MRO bakım verileriniz hakkında sorularınızı yanıtlamak için buradayım. Başlamadan önce ayarlardan tercih ettiğiniz kriterleri seçmenizi öneririm. Ne öğrenmek istersiniz?'
      }];
  });

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '');
  const [promptTemplate, setPromptTemplate] = useState(
    localStorage.getItem('gemini_prompt_template') || DEFAULT_PROMPT_TEMPLATE
  );

  const [botName, setBotName] = useState(localStorage.getItem('bot_name') || '0x6B7562696C6169737766');
  const [botBehaviors, setBotBehaviors] = useState({
    formal: localStorage.getItem('bot_formal') === 'true' || false,
    detailed: localStorage.getItem('bot_detailed') === 'true' || true,
    visual: localStorage.getItem('bot_visual') === 'true' || true,
    techLang: localStorage.getItem('bot_tech_lang') === 'true' || false,
  });

  // States for editing user messages
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Add state for editing chat name in the header
  const [isEditingHeaderName, setIsEditingHeaderName] = useState(false);
  const [headerName, setHeaderName] = useState(chatName || botName);
  
  // Update header name when chatName prop changes
  useEffect(() => {
    setHeaderName(chatName || botName);
  }, [chatName, botName]);
  
  // Function to handle saving the header name
  const handleSaveHeaderName = useCallback(() => {
    setIsEditingHeaderName(false);
    if (onUpdateChatName && headerName.trim()) {
      onUpdateChatName(headerName);
    }
  }, [headerName, onUpdateChatName]);

  // Update parent component when messages change, but only when it's not the first render
  useEffect(() => {
    if (!isFirstRender.current && onUpdateMessages) {
      onUpdateMessages(messages);
    } else {
      isFirstRender.current = false;
    }
  }, [messages, onUpdateMessages]);

  // Handle initialMessages changes in a more stable way
  useEffect(() => {
    // Skip if initialMessages is empty or same length as current messages
    if (initialMessages.length === 0) return;
    
    // Only update if the messages actually changed
    const initialMessagesStr = JSON.stringify(initialMessages);
    const currentMessagesStr = JSON.stringify(messages);
    
    if (initialMessagesStr !== currentMessagesStr) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Function to scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Prepare data context for Gemini
  const prepareDataContext = () => {
    // Convert the data to a string format
    if (!mroData || mroData.length === 0) {
      return "Detaylı MRO verisi bulunamadı.";
    }
    
    let formattedText = "";
    
    // Yeni veri formatı (detaylı MRO şirketleri verisi)
    if (mroData && mroData.length > 0) {
      const formattedMroData = mroData.map((mro, index) => {
        let mroText = `MRO Şirketi ${index + 1}: ${mro.mroFirmasiAdi || 'Belirtilmemiş'}\n`;
        mroText += `- Profil: ${mro.kimdir ? mro.kimdir.substring(0, 500) + (mro.kimdir.length > 500 ? '...' : '') : 'Bilgi yok.'}\n`;
        
        if (mro.hizmetleri && mro.hizmetleri.length > 0) {
          mroText += `- Hizmetler (${mro.hizmetleri.length} adet):\n` + mro.hizmetleri.map(h => `  * ${h}`).join('\n') + '\n';
        } else {
          mroText += `- Hizmetler: Belirtilmemiş\n`;
        }

        if (mro.sertifikalar && mro.sertifikalar.length > 0) {
          mroText += `- Sertifikalar (${mro.sertifikalar.length} adet):\n` + mro.sertifikalar.map(s => `  * ${s}`).join('\n') + '\n';
        } else {
          mroText += `- Sertifikalar: Belirtilmemiş\n`;
        }

        if (mro.hangarVeTesisKonumlari && mro.hangarVeTesisKonumlari.length > 0) {
          mroText += `- Hangar ve Tesis Konumları (${mro.hangarVeTesisKonumlari.length} adet):\n`;
          mro.hangarVeTesisKonumlari.forEach(ht => {
            mroText += `  * Konum: ${ht.konum || 'Belirtilmemiş'}\n    Detay: ${ht.detay || 'Detay yok.'}\n`;
          });
        } else {
          mroText += `- Hangar ve Tesis Konumları: Belirtilmemiş\n`;
        }
        
        if (mro.musteriPortfoyu && mro.musteriPortfoyu.length > 0) {
          mroText += `- Müşteri Portföyü (${mro.musteriPortfoyu.length} havayolu):\n`;
          // Tüm müşterileri listele
          mro.musteriPortfoyu.forEach(musteri => {
            mroText += `  * ${musteri.havayolu || 'Bilinmeyen Havayolu'} (${musteri.ulke || 'Bilinmeyen Ülke'}, Merkez: ${musteri.merkezSehir || 'Bilinmiyor'}): ${musteri.anlasmaDetayi || "Anlaşma detayı belirtilmemiş"}\n`;
          });
        } else {
          mroText += `- Müşteri Portföyü: Belirtilmemiş\n`;
        }
        
        if (mro.bakimHizmetiVerilenUcakTipleri && Object.keys(mro.bakimHizmetiVerilenUcakTipleri).length > 0) {
          mroText += `- Desteklenen Uçak Tipleri:\n`;
          Object.entries(mro.bakimHizmetiVerilenUcakTipleri).forEach(([marka, modeller]) => {
            if (modeller && modeller.length > 0) {
              mroText += `  * ${marka}: ${modeller.join(", ")}\n`;
            }
          });
        } else {
          mroText += `- Desteklenen Uçak Tipleri: Belirtilmemiş\n`;
        }

        if (mro.anlasmalar && mro.anlasmalar.length > 0) {
          mroText += `- Anlaşmalar (${mro.anlasmalar.length} adet):\n` + mro.anlasmalar.map(a => `  * ${a}`).join('\n') + '\n';
        } else {
          mroText += `- Anlaşmalar: Belirtilmemiş\n`;
        }

        if (mro.sonDonemdekiYatirimlar && mro.sonDonemdekiYatirimlar.length > 0) {
          mroText += `- Son Yatırımlar (${mro.sonDonemdekiYatirimlar.length} adet):\n` + mro.sonDonemdekiYatirimlar.map(y => `  * ${y}`).join('\n') + '\n';
        } else {
          mroText += `- Son Yatırımlar: Belirtilmemiş\n`;
        }

        if (mro.tahminiYillikBakimKapasitesi && mro.tahminiYillikBakimKapasitesi.length > 0) {
          mroText += `- Yıllık Kapasite Bilgileri (${mro.tahminiYillikBakimKapasitesi.length} adet):\n` + mro.tahminiYillikBakimKapasitesi.map(k => `  * ${k}`).join('\n') + '\n';
        } else {
          mroText += `- Yıllık Kapasite Bilgileri: Belirtilmemiş\n`;
        }
        
        if (mro.finansalVeriler && mro.finansalVeriler.length > 0) {
          mroText += `- Finansal Veriler (${mro.finansalVeriler.length} adet):\n` + mro.finansalVeriler.map(f => `  * ${f}`).join('\n') + '\n';
        } else {
          mroText += `- Finansal Veriler: Belirtilmemiş\n`;
        }

        if (mro.teknikAltyapi && mro.teknikAltyapi.length > 0) {
          mroText += `- Teknik Altyapı (${mro.teknikAltyapi.length} adet):\n` + mro.teknikAltyapi.map(t => `  * ${t}`).join('\n') + '\n';
        } else {
          mroText += `- Teknik Altyapı: Belirtilmemiş\n`;
        }

        return mroText;
      }).join('\n\n--------------------\n\n'); // Separator between MRO company entries
      
      formattedText += `Detaylı MRO Şirketleri Bilgisi (${mroData.length} şirket):\n\n${formattedMroData}`;
    }
    
    return formattedText;
  };

  // Prepare bot instructions based on settings
  const prepareBotInstructions = () => {
    let instructions = `Senin adın ${botName} ve sen MRO (Bakım, Onarım, Revizyon) verilerini analiz eden bir yapay zeka asistanısın.`;
    
    if (botBehaviors.formal) {
      instructions += " Formal ve profesyonel bir dil kullanmalısın.";
    } else {
      instructions += " Arkadaşça ve samimi bir dil kullanabilirsin.";
    }
    
    if (botBehaviors.detailed) {
      instructions += " Kapsamlı ve detaylı yanıtlar vermelisin.";
    } else {
      instructions += " Kısa ve öz yanıtlar vermelisin.";
    }
    
    if (botBehaviors.visual) {
      instructions += " Mümkün olduğunda verilerini görselleştirmek için markdown tabloları, madde işaretleri ve başlıklar kullanmalısın.";
    }
    
    if (botBehaviors.techLang) {
      instructions += " Teknik havacılık ve bakım terimleri kullanabilirsin.";
    } else {
      instructions += " Teknik terimlerden kaçınıp basit ve anlaşılır bir dil kullanmalısın.";
    }

    return instructions;
  };

  // Call Gemini API
  const callGeminiAPI = async (userMessage) => {
    if (!apiKey) {
      return "API anahtarı eksik. Lütfen ayarlar kısmından bir API anahtarı ekleyin veya .env dosyasında tanımlayın.";
    }

    try {
      // Prepare the context with the data
      const dataContext = prepareDataContext();
      
      // Format the prompt using the template
      const basePrompt = promptTemplate
        .replace('{data_context}', dataContext)
        .replace('{bot_name}', botName);
      
      // Add behavior instructions
      const behaviorInstructions = prepareBotInstructions();
      
      // Add specific instructions for table formatting
      const tableFormatInstructions = botBehaviors.visual ? 
        "Tablolar oluştururken MUTLAKA aşağıdaki kurallara uymalısın (ASLA BU KURALLAR DIŞINA ÇIKMA):\n" +
        "1. Her satır yeni bir satırda olmalıdır\n" +
        "2. Her satır başında ve sonunda | işareti olmalıdır\n" +
        "3. Başlık satırından sonra ayırıcı satır (|----|----| şeklinde) mutlaka olmalıdır\n" +
        "4. Hücre içeriği ile | işareti arasında boşluk olmalıdır\n" +
        "5. Tablon örnek tablo formatında olmak zorunda!\n\n" +
        "Örnek tablo:\n" +
        "```markdown\n" +
        "| Başlık 1 | Başlık 2 | Başlık 3 |\n" +
        "|----------|----------|----------|\n" +
        "| Veri 1   | Veri 2   | Veri 3   |\n" +
        "| Veri 4   | Veri 5   | Veri 6   |\n" +
        "```\n" +
        "ASLA | Başlık 1 | Başlık 2 | | ------- | ------- | | Veri 1 | Veri 2 | şeklinde tablo oluşturma, her satır ayrı olmalıdır." : "";
      
      const systemPrompt = behaviorInstructions + "\n\n" + basePrompt + "\n\n" + tableFormatInstructions;
      
      // Build the conversation history for the API
      let conversationHistoryForAPI = messages.map(msg => ({
        role: msg.role, // Keep original roles for now ('user', 'assistant')
        parts: [{ text: msg.content }]
      }));
      
      // Add system prompt as the first message if it's not already there or if history is empty
      // The role for system prompt should be "model"
      if (conversationHistoryForAPI.length === 0 || 
          !(conversationHistoryForAPI[0].role === 'model' && conversationHistoryForAPI[0].parts[0].text === systemPrompt)) {
        conversationHistoryForAPI.unshift({
          role: "model", 
          parts: [{ text: systemPrompt }]
        });
      }
      
      // Add the new user message
      conversationHistoryForAPI.push({
        role: "user",
        parts: [{ text: userMessage }]
      });

      // Map roles to what the Gemini API expects ('user', 'model')
      const apiContents = conversationHistoryForAPI.map(item => ({
        ...item,
        role: item.role === 'assistant' ? 'model' : item.role // 'user' -> 'user', 'assistant' -> 'model', 'model' -> 'model'
      }));
      
      // Instantiate the GoogleGenAI client
      const ai = new GoogleGenAI({ apiKey }); // As per user's snippet, using shorthand for { apiKey: apiKey }

      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Ensure this is a number
      };
      
      // Make the API request using the user's specified method
      const apiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: apiContents,
        generationConfig: generationConfig 
      });
      
      // Extract the response text as per user's example
      const generatedContent = apiResponse.text;
      
      if (typeof generatedContent !== 'string') { // Check if text is actually present
        // Attempt to get a more detailed error if possible, or default
        let errorDetail = "API yanıtından metin içeriği alınamadı.";
        if (apiResponse && apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
            errorDetail = `İstek engellendi: ${apiResponse.promptFeedback.blockReason}. Sebep: ${apiResponse.promptFeedback.blockReasonMessage || 'Belirtilmemiş'}`;
        } else if (apiResponse && apiResponse.candidates && apiResponse.candidates.length > 0 && apiResponse.candidates[0].finishReason !== 'STOP') {
            errorDetail = `İçerik üretimi durduruldu, sebep: ${apiResponse.candidates[0].finishReason}. ${apiResponse.candidates[0].finishMessage || ''}`;
        }
        throw new Error(errorDetail);
      }
      
      return generatedContent;
    } catch (error) {
      console.error("Gemini API hatası:", error);
      // Construct a more informative error message
      let errorMessage = `Gemini API ile iletişim kurulurken bir hata oluştu: ${error.message}`;
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        // If the error object has response data from an HTTP error (e.g. via Axios like structure, though not used here)
        errorMessage = `Gemini API Hatası: ${error.response.data.error.message}`;
      } else if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "Geçersiz API Anahtarı. Lütfen ayarlarınızı kontrol edin.";
      }
      return errorMessage;
    }
  };

  // Fix markdown tables in the response
  const fixMarkdownTables = (text) => {
    // Only log in development mode and only when needed
    const isDev = process.env.NODE_ENV === 'development';
    const debugLog = (message, data) => {
      if (isDev && false) { // Set to true only when debugging is needed
        console.log(message, data);
      }
    };
    
    debugLog("Orijinal yanıt:", text);
    
    // İlk olarak, içerikte tablo var mı kontrol edelim ve varsa daha belirgin hale getirelim
    if (text.includes('|') && text.includes('-|-')) {
      debugLog("Tablo tespit edildi, düzenleniyor...");
      // Tabloyu belirginleştirmek için <div class="table-container"> ekleyelim
      text = text.replace(/(\n\s*\|.*\|\s*\n\s*\|[-:\|\s]+\|\s*\n.*?(?:\n\s*\n|\n*$))/gs, 
        '\n\n$1\n\n');
    }
    
    // First try to fix broken tables that don't follow normal table format
    let fixedText = text;
    
    // Match pattern like: | Hizmet Türü | Geçiş Sayısı | | :---- | :---- | | Value | Value |
    const brokenTableRegex = /\|\s*([^|\n]+)\s*\|\s*([^|\n]+)\s*\|\s*\|\s*:?-+\s*\|\s*:?-+\s*\|\s*(\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|(\s*\n|\s*$))+/g;
    
    fixedText = fixedText.replace(brokenTableRegex, (match) => {
      debugLog("Bozuk tablo formatı bulundu:", match);
      // Try to reconstruct the table with proper line breaks
      try {
        const lines = match.split('|');
        if (lines.length < 6) return match; // Not enough parts for a broken table
        
        // Reconstruct the header
        let result = `| ${lines[1].trim()} | ${lines[2].trim()} |\n`;
        
        // Find the separator line parts
        let separatorIndex = -1;
        for (let i = 3; i < lines.length; i++) {
          if (lines[i].includes('-')) {
            separatorIndex = i;
            break;
          }
        }
        
        if (separatorIndex > 0) {
          // Add separator line
          result += `| ${lines[separatorIndex].trim()} | ${lines[separatorIndex+1].trim()} |\n`;
          
          // Process the remaining parts in pairs to form data rows
          for (let i = separatorIndex + 2; i < lines.length - 1; i += 2) {
            if (lines[i].trim() && lines[i+1].trim()) {
              result += `| ${lines[i].trim()} | ${lines[i+1].trim()} |\n`;
            }
          }
          
          return result;
        }
        
        return match; // Couldn't find separator
      } catch (error) {
        console.error("Error fixing broken table:", error);
        return match;
      }
    });
    
    // Now try to fix standard tables with formatting issues
    const tableRegex = /(\|[^\n]+\|\n)(\|[\s-:]+\|\n)(\|[^\n]+\|(\n|$))+/g;
    
    fixedText = fixedText.replace(tableRegex, (tableMatch) => {
      debugLog("Düzeltilecek tablo bulundu:", tableMatch);
      try {
        // Split the table into rows
        const rows = tableMatch.trim().split('\n');
        
        debugLog("Tablo satırları:", rows);
        
        if (rows.length < 3) {
          debugLog("Yeterli satır yok, orijinal bırakılıyor");
          return tableMatch; // Not a valid table, return as is
        }
        
        // Process each row to ensure correct formatting
        const processedRows = rows.map(row => {
          // Ensure the row starts and ends with pipe
          let processedRow = row;
          if (!processedRow.startsWith('|')) processedRow = '|' + processedRow;
          if (!processedRow.endsWith('|')) processedRow = processedRow + '|';
          
          // Fix issue with missing spaces after pipes
          processedRow = processedRow.replace(/\|([^\s|])/g, '| $1');
          processedRow = processedRow.replace(/([^\s|])\|/g, '$1 |');
          
          return processedRow;
        });
        
        // Handle the separator row (second row) to ensure proper markdown table format
        const headerRow = processedRows[0];
        const separatorParts = headerRow.split('|').filter(p => p.trim());
        const separatorRow = '|' + separatorParts.map(() => ' ---------- |').join('');
        
        // Reconstruct the table with proper formatting
        processedRows[1] = separatorRow;
        
        const result = processedRows.join('\n');
        debugLog("Düzeltilen tablo:", result);
        return result;
      } catch (error) {
        console.error("Error fixing markdown table:", error);
        return tableMatch; // Return original if processing fails
      }
    });
    
    debugLog("Düzeltilmiş yanıt:", fixedText);
    return fixedText;
  };

  // Handle sending a message to the AI
  const handleSendMessage = async (e, messageToSend) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    const currentMessage = messageToSend || userInput;
    if (!currentMessage.trim()) return;

    // Add user message to chat
    const newMessages = [
      ...messages,
      { role: 'user', content: currentMessage }
    ];
    setMessages(newMessages);
    if (!messageToSend) { // Only clear input if it's a new message, not a resend/regenerate
      setUserInput('');
    }
    setIsLoading(true);

    try {
      // Call Gemini API
      const aiResponse = await callGeminiAPI(currentMessage);
      
      // Temizlenmiş yanıt oluştur
      let cleanedResponse = aiResponse;
      
      // Markdown kod bloklarındaki içeriği çıkar (```markdown yerine direkt içeriği al)
      cleanedResponse = cleanedResponse.replace(/```markdown\s*\n([\s\S]*?)\n\s*```/g, '$1');
      
      // Markdown içindeki tabloları temizle
      cleanedResponse = cleanedResponse.replace(/```\s*\n\|/g, '\n|');
      cleanedResponse = cleanedResponse.replace(/\|\s*```/g, '|');
      
      // Fix any markdown tables in the response
      cleanedResponse = fixMarkdownTables(cleanedResponse);
      
      // Ensure table rows are each on a new line (common issue)
      cleanedResponse = cleanedResponse.replace(/\|\s*\|/g, "|\n|");
      
      // Ensure proper spacing in table cells
      cleanedResponse = cleanedResponse.replace(/\|([^\s|])/g, "| $1");
      cleanedResponse = cleanedResponse.replace(/([^\s|])\|/g, "$1 |");
      
      // Add AI response to chat
      setMessages([
        ...newMessages, // This should be the messages array *before* adding the current user's new input if regenerating
        { role: 'assistant', content: cleanedResponse }
      ]);
    } catch (error) {
      // Handle error
      setMessages([
        ...newMessages, // Same as above
        { 
          role: 'assistant', 
          content: `Üzgünüm, bir hata oluştu: ${error.message}` 
        }
      ]);
    } finally {
      setIsLoading(false);
      // Focus input field after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleRegenerateResponse = async () => {
    if (isLoading) return; // Do not allow regenerate if already loading

    let lastUserMessageContent = null;
    let lastUserMessageIndex = -1;

    // Find the last user message that has an AI response after it
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        if (i + 1 < messages.length && messages[i+1].role === 'assistant') {
          lastUserMessageContent = messages[i].content;
          lastUserMessageIndex = i;
          break;
        }
      }
    }

    if (lastUserMessageContent) {
      // Remove messages from the last user message onwards to regenerate
      const messagesBeforeLastUser = messages.slice(0, lastUserMessageIndex);
      
      // Effectively, we are resending the last user message.
      // We need to set the messages state to exclude the old AI answer before calling the API.
      setMessages(messagesBeforeLastUser);
      setIsLoading(true); // Set loading before async call

      // Call the API with the content of the last user message
      try {
        const aiResponse = await callGeminiAPI(lastUserMessageContent);
        let cleanedResponse = aiResponse;
        cleanedResponse = cleanedResponse.replace(/```markdown\s*\n([\s\S]*?)\n\s*```/g, '$1');
        cleanedResponse = cleanedResponse.replace(/```\s*\n\|/g, '\n|');
        cleanedResponse = cleanedResponse.replace(/\|\s*```/g, '|');
        cleanedResponse = fixMarkdownTables(cleanedResponse);
        cleanedResponse = cleanedResponse.replace(/\|\s*\|/g, "|\n|");
        cleanedResponse = cleanedResponse.replace(/\|([^\s|])/g, "| $1");
        cleanedResponse = cleanedResponse.replace(/([^\s|])\|/g, "$1 |");

        // Add back the user message and the new AI response
        setMessages([
          ...messagesBeforeLastUser,
          { role: 'user', content: lastUserMessageContent },
          { role: 'assistant', content: cleanedResponse }
        ]);
      } catch (error) {
        setMessages([
          ...messagesBeforeLastUser,
          { role: 'user', content: lastUserMessageContent },
          { 
            role: 'assistant', 
            content: `Yanıt yeniden oluşturulurken bir hata oluştu: ${error.message}` 
          }
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    } else {
      console.warn("Yeniden oluşturulacak uygun bir kullanıcı mesajı bulunamadı.");
      // Optionally, provide user feedback here if no suitable message is found
    }
  };

  const handleEditMessageStart = (index, content) => {
    setEditingMessageIndex(index);
    setEditingMessageContent(content);
  };

  const handleEditMessageCancel = () => {
    setEditingMessageIndex(null);
    setEditingMessageContent('');
  };

  const handleEditMessageSave = async () => {
    if (!editingMessageContent.trim() || editingMessageIndex === null) return;

    const messagesUpToEdit = messages.slice(0, editingMessageIndex);
    
    // Clear editing state first
    const originalEditingContent = editingMessageContent;
    setEditingMessageIndex(null);
    setEditingMessageContent('');
    
    // Set messages to the part before the edit, so the UI updates immediately
    setMessages(messagesUpToEdit);
    setIsLoading(true);

    // Call send message with the edited content
    // No need to pass 'e' (event) as the first argument if it's not an actual form submission event
    try {
      const aiResponse = await callGeminiAPI(originalEditingContent); // Send edited content
      let cleanedResponse = aiResponse;
      cleanedResponse = cleanedResponse.replace(/```markdown\s*\n([\s\S]*?)\n\s*```/g, '$1');
      cleanedResponse = cleanedResponse.replace(/```\s*\n\|/g, '\n|');
      cleanedResponse = cleanedResponse.replace(/\|\s*```/g, '|');
      cleanedResponse = fixMarkdownTables(cleanedResponse);
      cleanedResponse = cleanedResponse.replace(/\|\s*\|/g, "|\n|");
      cleanedResponse = cleanedResponse.replace(/\|([^\s|])/g, "| $1");
      cleanedResponse = cleanedResponse.replace(/([^\s|])\|/g, "$1 |");

      setMessages([
        ...messagesUpToEdit,
        { role: 'user', content: originalEditingContent }, // Add the edited user message
        { role: 'assistant', content: cleanedResponse }
      ]);
    } catch (error) {
      setMessages([
        ...messagesUpToEdit,
        { role: 'user', content: originalEditingContent }, 
        { 
          role: 'assistant', 
          content: `Düzenlenmiş mesaj işlenirken bir hata oluştu: ${error.message}` 
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Save settings
  const saveSettings = () => {
    // Save bot name
    localStorage.setItem('bot_name', botName);
    
    // Save bot behavior settings
    localStorage.setItem('bot_formal', botBehaviors.formal.toString());
    localStorage.setItem('bot_detailed', botBehaviors.detailed.toString());
    localStorage.setItem('bot_visual', botBehaviors.visual.toString());
    localStorage.setItem('bot_tech_lang', botBehaviors.techLang.toString());
    
    setShowSettings(false);
  };

  // Handle behavior checkbox changes
  const handleBehaviorChange = (behavior) => {
    setBotBehaviors(prev => ({
      ...prev,
      [behavior]: !prev[behavior]
    }));
  };

  // Custom styles for markdown rendering
  const markdownStyles = {
    h1: 'text-xl font-bold my-3',
    h2: 'text-lg font-bold my-2',
    h3: 'text-base font-bold my-1',
    h4: 'text-sm font-bold my-1',
    h5: 'text-sm font-bold my-1',
    h6: 'text-sm font-bold my-1',
    p: 'mb-2 break-words',
    a: 'text-primary-600 hover:underline',
    strong: 'font-bold',
    em: 'italic',
    code: 'bg-gray-100 px-1 py-0.5 rounded font-mono text-sm',
    pre: 'bg-gray-100 p-3 rounded font-mono text-sm my-2 overflow-x-auto',
    ul: 'list-disc pl-5 my-2',
    ol: 'list-decimal pl-5 my-2',
    li: 'mb-1',
    blockquote: 'border-l-4 border-gray-300 pl-3 italic my-2',
    table: 'border-collapse my-4 w-full',
    th: 'border border-gray-300 px-3 py-2 bg-gray-100 font-medium text-left',
    td: 'border border-gray-300 px-3 py-2',
    hr: 'my-3 border-t border-gray-300',
  };

  // Alternatif tablo oluşturma fonksiyonu
  const parseAndRenderTable = React.useCallback((text) => {
    // Only log in development mode and only when needed
    const isDev = process.env.NODE_ENV === 'development';
    const debugLog = (message, data) => {
      if (isDev && false) { // Set to true only when debugging is needed
        console.log(message, data);
      }
    };
    
    debugLog("Parse and render table called for:", text);
    
    // Markdown kod bloklarını temizle
    let processedText = text;
    
    // ```markdown bloklarını işle - içeriği koru
    processedText = processedText.replace(/```markdown\s*\n([\s\S]*?)\n\s*```/g, '$1');
    
    // Diğer kod bloklarını işle - içeriği koru, format bilgisini kaldır
    processedText = processedText.replace(/```[a-zA-Z]*\s*\n/g, '');
    processedText = processedText.replace(/\n\s*```/g, '');
    
    // Tablo içeriğini tespit et
    const tableRegex = /\|(.+)\|\n\|([-|\s:]+)\|\n(\|.+\|\n?)+/g;
    
    // Tablo içermeyen metni doğrudan ReactMarkdown ile render et
    if (!processedText || !processedText.match(tableRegex)) {
      debugLog("No table found in text, using standard ReactMarkdown");
      return (
        <div className="break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
              h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
              h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
              h4: ({node, ...props}) => <h4 className={markdownStyles.h4} {...props} />,
              h5: ({node, ...props}) => <h5 className={markdownStyles.h5} {...props} />,
              h6: ({node, ...props}) => <h6 className={markdownStyles.h6} {...props} />,
              p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
              a: ({node, ...props}) => <a className={markdownStyles.a} target="_blank" rel="noopener noreferrer" {...props} />,
              strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
              em: ({node, ...props}) => <em className={markdownStyles.em} {...props} />,
              code: ({node, inline, ...props}) => 
                inline ? 
                  <code className={markdownStyles.code} {...props} /> :
                  <pre className={markdownStyles.pre}><code {...props} /></pre>,
              pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
              ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
              ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
              li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
              blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
              hr: ({node, ...props}) => <hr className={markdownStyles.hr} {...props} />,
              table: ({node, ...props}) => <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm my-4"><table className={markdownStyles.table} {...props} /></div>,
              tr: ({node, index, ...props}) => {
                const isEven = (index % 2 === 0);
                return <tr className={isEven ? 'bg-white' : 'bg-gray-50'} {...props} />;
              },
              th: ({node, ...props}) => <th className={markdownStyles.th} {...props} />,
              td: ({node, ...props}) => <td className={markdownStyles.td} {...props} />,
            }}
          >
            {processedText}
          </ReactMarkdown>
        </div>
      );
    }
    
    debugLog("Table found in text, manual parsing");
    
    // Metni bölümlere ayır: tablolar ve normal metin
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // tableRegex'i resetle
    tableRegex.lastIndex = 0;
    
    // Metni tarayarak tabloları bul
    while ((match = tableRegex.exec(processedText)) !== null) {
      // Tablodan önceki metin
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: processedText.substring(lastIndex, match.index)
        });
      }
      
      // Tablo içeriği
      parts.push({
        type: 'table',
        content: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Son kısım
    if (lastIndex < processedText.length) {
      parts.push({
        type: 'text',
        content: processedText.substring(lastIndex)
      });
    }
    
    debugLog("Parsed parts:", parts);
    
    // Tabloları özel olarak işle
    return (
      <div className="break-words">
        {parts.map((part, index) => {
          if (part.type === 'table') {
            // Bu kısım bir tablo içeriyor, manuel olarak işleyelim
            const tableLines = part.content.trim().split('\n');
            if (tableLines.length < 3) {
              debugLog("Not enough lines for a valid table, rendering as text");
              return (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                    h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                    h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                    h4: ({node, ...props}) => <h4 className={markdownStyles.h4} {...props} />,
                    h5: ({node, ...props}) => <h5 className={markdownStyles.h5} {...props} />,
                    h6: ({node, ...props}) => <h6 className={markdownStyles.h6} {...props} />,
                    p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                    a: ({node, ...props}) => <a className={markdownStyles.a} target="_blank" rel="noopener noreferrer" {...props} />,
                    strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                    em: ({node, ...props}) => <em className={markdownStyles.em} {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code className={markdownStyles.code} {...props} /> :
                        <pre className={markdownStyles.pre}><code {...props} /></pre>,
                    pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                    ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                    ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                    li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                    hr: ({node, ...props}) => <hr className={markdownStyles.hr} {...props} />,
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              );
            }
            
            const headerLine = tableLines[0];
            const headers = headerLine.split('|')
              .filter(cell => cell.trim() !== '')
              .map(cell => cell.trim());
            
            debugLog("Table headers:", headers);
            
            const columnCount = headers.length;
            const columnWidth = `${Math.floor(100 / columnCount)}%`;
            
            return (
              <div key={index} className="my-4 overflow-x-auto w-full">
                <table className="w-full border-collapse border border-gray-300 shadow-sm">
                  <thead>
                    <tr>
                      {headers.map((header, headerIndex) => (
                        <th 
                          key={headerIndex} 
                          className="bg-gray-100 border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700"
                          style={{ width: columnWidth }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableLines.slice(2).map((line, lineIndex) => {
                      const cells = line.split('|')
                        .filter(cell => cell.trim() !== '')
                        .map(cell => cell.trim());
                      
                      if (cells.length === 0) return null;
                      
                      return (
                        <tr key={lineIndex} className={lineIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {cells.map((cell, cellIndex) => (
                            <td 
                              key={cellIndex} 
                              className="border border-gray-300 px-3 py-2"
                              style={{ width: columnWidth }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          } else {
            // Bu kısım normal metin, ReactMarkdown ile render et
            return (
              <ReactMarkdown
                key={index}
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                  h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                  h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                  h4: ({node, ...props}) => <h4 className={markdownStyles.h4} {...props} />,
                  h5: ({node, ...props}) => <h5 className={markdownStyles.h5} {...props} />,
                  h6: ({node, ...props}) => <h6 className={markdownStyles.h6} {...props} />,
                  p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                  a: ({node, ...props}) => <a className={markdownStyles.a} target="_blank" rel="noopener noreferrer" {...props} />,
                  strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                  em: ({node, ...props}) => <em className={markdownStyles.em} {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? 
                      <code className={markdownStyles.code} {...props} /> :
                      <pre className={markdownStyles.pre}><code {...props} /></pre>,
                  pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                  ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                  ol: ({node, ...props}) => <ol className={markdownStyles.ol} {...props} />,
                  li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                  hr: ({node, ...props}) => <hr className={markdownStyles.hr} {...props} />,
                }}
              >
                {part.content}
              </ReactMarkdown>
            );
          }
        })}
      </div>
    );
  }, [markdownStyles]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-50">
      {/* Global Style */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Kod bloklarındaki renklendirmeyi sıfırla */
        .break-words pre code {
          color: inherit;
          background-color: transparent;
        }
        
        /* Markdown kod bloklarını gizle */
        .break-words pre.language-markdown {
          display: none;
        }
        
        /* Tablo stilleri */
        .break-words table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: white;
        }
        
        .break-words th {
          background-color: #f9fafb;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border: 1px solid #e5e7eb;
          word-break: break-word;
        }
        
        .break-words td {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          word-break: break-word;
          background-color: white;
        }
        
        .break-words tr:nth-child(even) td {
          background-color: #f9fafb;
        }
        
        .break-words tr:hover td {
          background-color: #f3f4f6;
        }
        
        /* Metin alanları için stiller */
        .break-words p, 
        .break-words li, 
        .break-words blockquote {
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          hyphens: auto;
        }
        
        /* Kod blokları için stiller */
        .break-words pre {
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        
        /* Resimler için stiller */
        .break-words img {
          max-width: 100%;
          height: auto;
        }
        
        /* Mobil görünüm için tablo uyarlaması */
        @media (max-width: 640px) {
          .break-words table {
            display: block;
            overflow-x: auto;
          }
          
          .break-words th,
          .break-words td {
            min-width: 120px;
          }
        }
      `}} />

      {/* Header */}
      <div className="bg-primary-600 text-white py-4 px-6 shadow-md flex-shrink-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-4 p-2 rounded-full hover:bg-primary-500 transition-colors"
              aria-label="Geri dön"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                <FaRobot className="h-5 w-5 text-primary-600" />
              </div>
              {isEditingHeaderName ? (
                <div className="relative max-w-xs">
                  <input
                    type="text"
                    value={headerName}
                    onChange={(e) => setHeaderName(e.target.value)}
                    onBlur={handleSaveHeaderName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveHeaderName();
                      } else if (e.key === 'Escape') {
                        setIsEditingHeaderName(false);
                        setHeaderName(chatName || botName);
                      }
                    }}
                    className="px-2 py-1 text-gray-800 text-xl font-semibold bg-white border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveHeaderName}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <h1 
                  className="text-xl font-semibold truncate max-w-xs cursor-pointer hover:underline"
                  onClick={() => setIsEditingHeaderName(true)}
                  title="Sohbet adını düzenlemek için tıklayın"
                >
                  {headerName}
                </h1>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-primary-500 transition-colors"
            aria-label="Ayarlar"
          >
            <FaCog className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b border-gray-200 p-6 shadow-sm flex-shrink-0 overflow-y-auto max-h-[50vh]">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Asistan Ayarları</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Bot Name Setting */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-md font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <FaUserEdit className="mr-2 text-primary-500" />
                    Asistan Adı
                  </div>
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Asistanın ismini girin"
                />
              </div>

              {/* Bot Behavior Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-4">Asistan Davranışları</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      id="formal"
                      type="checkbox"
                      checked={botBehaviors.formal}
                      onChange={() => handleBehaviorChange('formal')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="formal" className="ml-3 block text-md text-gray-700">
                      Resmi Dil
                      <p className="text-sm text-gray-500">Daha profesyonel ve formal bir dil kullanır</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      id="detailed"
                      type="checkbox"
                      checked={botBehaviors.detailed}
                      onChange={() => handleBehaviorChange('detailed')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="detailed" className="ml-3 block text-md text-gray-700">
                      Detaylı Açıklamalar
                      <p className="text-sm text-gray-500">Daha kapsamlı ve detaylı yanıtlar verir</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      id="visual"
                      type="checkbox"
                      checked={botBehaviors.visual}
                      onChange={() => handleBehaviorChange('visual')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="visual" className="ml-3 block text-md text-gray-700">
                      Görsel Formatlar
                      <p className="text-sm text-gray-500">Tablolar, listeler ve başlıklar kullanarak bilgiyi organize eder</p>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      id="techLang"
                      type="checkbox"
                      checked={botBehaviors.techLang}
                      onChange={() => handleBehaviorChange('techLang')}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="techLang" className="ml-3 block text-md text-gray-700">
                      Teknik Dil
                      <p className="text-sm text-gray-500">Havacılık ve MRO terminolojisi kullanır</p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  className="flex items-center px-5 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md transition-all"
                >
                  <FaSave className="mr-2" />
                  Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages area */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 ${showSettings ? 'hidden md:block' : ''}`}>
        <div className="mx-auto w-full max-w-6xl space-y-6">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`${message.role === 'assistant' ? 'border-b border-gray-200 pb-6' : 'mb-6'}`}
            >
              {message.role === 'assistant' ? (
                <div className="flex w-full">
                  <div className="flex w-full">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                      <FaRobot className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="text-gray-800 max-h-[75vh] overflow-y-auto pr-2 md:pr-6 flex-1 text-base">
                      {parseAndRenderTable(message.content)}
                    </div>
                  </div>
                  {/* Regenerate Button for the last AI message */}
                  {index === messages.length - 1 && !isLoading && (
                    <button 
                      onClick={handleRegenerateResponse}
                      className="ml-2 p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 transition-colors"
                      title="Yanıtı yeniden oluştur"
                    >
                      <FaSync className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex justify-end items-start group">
                  {editingMessageIndex === index ? (
                    <div className="flex-1 mr-2 p-2 bg-white border border-primary-300 rounded-lg shadow-md">
                      <textarea
                        value={editingMessageContent}
                        onChange={(e) => setEditingMessageContent(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none text-gray-800"
                        rows={Math.max(3, Math.min(10, editingMessageContent.split('\n').length))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEditMessageSave();
                          }
                          if (e.key === 'Escape') {
                            handleEditMessageCancel();
                          }
                        }}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button 
                          onClick={handleEditMessageCancel}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                          İptal
                        </button>
                        <button 
                          onClick={handleEditMessageSave}
                          disabled={!editingMessageContent.trim() || isLoading}
                          className="px-3 py-1 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:bg-gray-400"
                        >
                          {isLoading ? <FaSpinner className="animate-spin h-4 w-4"/> : 'Kaydet'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary-600 text-white rounded-tr-none shadow-md">
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                      {!isLoading && (
                        <button
                          onClick={() => handleEditMessageStart(index, message.content)}
                          className="ml-2 p-2 text-gray-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-gray-100"
                          title="Mesajı düzenle"
                        >
                          <FaPencilAlt className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  <div className={`w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center ml-2 flex-shrink-0 overflow-hidden shadow-sm ${editingMessageIndex === index ? 'self-start mt-1' : ''}`}>
                    <FaUser className="text-white h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 flex-shrink-0">
                <FaRobot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex space-x-2 items-center h-8">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={(e) => handleSendMessage(e, null)} className={`p-4 md:p-6 bg-white border-t border-gray-200 flex-shrink-0 ${showSettings ? 'hidden md:block' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Veriniz hakkında bir soru sorun..."
              disabled={isLoading || showSettings}
              ref={inputRef}
            />
            <button
              type="submit"
              className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all focus:outline-none ${
                isLoading || !userInput.trim() || showSettings
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg'
              }`}
              disabled={isLoading || !userInput.trim() || showSettings}
            >
              {isLoading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AIAssistant; 