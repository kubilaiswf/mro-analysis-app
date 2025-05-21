# MRO Bakım Gösterge Paneli

Turkish Technic stajımda yaptığım, MRO Bakım verilerini analiz eden ve görselleştiren dashboard uygulaması.

## Özellikler

- MRO şirketleri, operatörler, bakım tipleri ve anlaşma yıllarına göre filtreleme
- Veri görselleştirme ve analiz
- Gemini AI entegrasyonu ile veri analiz asistanı

## Kurulum

1. Projeyi klonlayın:

```
git clone <repo-url>
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

### API Anahtarı Yapılandırması

1. `.env` dosyasını oluşturun (`.env.example` dosyasını referans alabilirsiniz):

```
# MRO Dashboard Configuration

# Gemini API Entegrasyonu
VITE_GEMINI_API_KEY=your_api_key_here

# Default Prompt Template
VITE_DEFAULT_PROMPT_TEMPLATE="Sen MRO bakım verilerini analiz eden bir AI asistanısın. Aşağıdaki veri setini kullanarak soruları yanıtla: {data_context}"
```

2. [Google AI Studio](https://ai.google.dev/)'dan bir API anahtarı alın ve `.env` dosyasındaki `VITE_GEMINI_API_KEY` değişkenine ekleyin.

3. Alternatif olarak, API anahtarınızı ve prompt şablonunuzu uygulamanın "Ayarlar" bölümünden de yapılandırabilirsiniz.

## Prompt Şablonu

AI asistanının nasıl yanıt vereceğini özelleştirmek için prompt şablonunu düzenleyebilirsiniz. `{data_context}` etiketi, asistanın analiz edeceği veri bağlamını temsil eder. 

## Teşekkürler

*Veri araştırması ve analizi konularında büyük yardımları için staj arkadaşlarım Hilal Şahin ve Kadir Emir Kanayran'a teşekkürler.*

*Ayrıca tasarım ve zaman kazanma konusunda bana büyük yardımları dokunan Gemini 2.5 Pro ve Claude 3.7 Sonnet YZ modellerine teşekkürler :)*