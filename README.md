# MRO Bakım Gösterge Paneli

Turkish Technic stajımda yaptığım, MRO Bakım verilerini analiz eden ve görselleştiren dashboard uygulaması.

## Özellikler

- MRO şirketleri, operatörler, bakım tipleri ve anlaşma yıllarına göre filtreleme
- Veri görselleştirme ve analiz
- Gemini AI entegrasyonu ile veri analiz asistanı

## Kurulum

1. Projeyi klonlayın:

```
git clone https://github.com/kubilaiswf/mro-analysis-app
cd mro-analysis-app
```

2. Bağımlılıkları yükleyin:

```
npm install
```

3. Geliştirme sunucusunu başlatın:

```
npm run dev
```

## Gemini AI Entegrasyonu

Uygulamadaki AI asistanını kullanmak için Gemini API'ye ihtiyacınız vardır.

### Güvenli API Anahtarı Yapılandırması

**ÖNEMLİ:** Güvenlik için API anahtarları backend'de tutulur, frontend'e gömülmez.

1. `.env.backend` dosyasını oluşturun:

```bash
# Backend Environment Variables
# Bu dosya backend tarafından kullanılacak

# Gemini API Key (sadece backend'de kullanılır)
VITE_GEMINI_API_KEY=your_api_key_here

# Default Prompt Template
VITE_DEFAULT_PROMPT_TEMPLATE="Sen MRO bakım verilerini analiz eden bir AI asistanısın..."
```

2. [Google AI Studio](https://ai.google.dev/)'dan bir API anahtarı alın ve `.env.backend` dosyasındaki `VITE_GEMINI_API_KEY` değişkenine ekleyin.

3. Backend ve frontend'i birlikte çalıştırın:

```bash
npm run dev:full
```

Bu komut hem backend server'ını (port 3001) hem de frontend'i (port 5173) aynı anda başlatır.

### Alternatif Çalıştırma

Ayrı terminallerde çalıştırmak isterseniz:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

3. Alternatif olarak, API anahtarınızı ve prompt şablonunuzu uygulamanın "Ayarlar" bölümünden de yapılandırabilirsiniz.

## Prompt Şablonu

AI asistanının nasıl yanıt vereceğini özelleştirmek için prompt şablonunu düzenleyebilirsiniz. `{data_context}` etiketi, asistanın analiz edeceği veri bağlamını temsil eder. 

## Teşekkürler

*Veri araştırması ve analizi konularında büyük yardımları için staj arkadaşlarım Hilal Şahin ve Kadir Emir Kanayran'a teşekkürler.*

*Ayrıca tasarım ve zaman kazanma konusunda bana büyük yardımları dokunan Gemini 2.5 Pro ve Claude 3.7 Sonnet YZ modellerine teşekkürler :)*
