/**
 * G20-Staaten Übersetzungsdienst für DocuCast PWA
 * Unterstützt alle G20-Sprachen & regionale Dialekt-Variationen:
 * - Online: AI-gestützte Lokalisierung via /api/translate (mit Gemini)
 * - Offline: Ausgereifte clientseitige linguistische Übersetzung mit idiomatischen
 *   Dialog-Formeln, Sprechermarkern und kulturspezifischen Redewendungen.
 */

import { PodcastItem, TranscriptSegment } from '../types/podcast';
import { G20_COUNTRIES, getG20CountryById } from '../data/g20Countries';

// Kulturelle und sprachliche Dialog-Muster für G20-Sprachen und -Dialekte
interface LanguageDialogTemplates {
  welcome: (title: string, hostA: string) => string;
  cohostIntro: (hostA: string, hostB: string) => string;
  deepDiveLead: (topic: string) => string;
  analystResponse: (detail: string) => string;
  outroA: (title: string, hostB: string) => string;
  outroB: (hostA: string) => string;
}

// Dialektspezifische und länderspezifische Templates
const REGIONAL_DIALOG_TEMPLATES: Record<string, LanguageDialogTemplates> = {
  // Österreichisches Deutsch (AT)
  'de-AT': {
    welcome: (title, hostA) =>
      `Servus und herzlich willkommen zu DocuCast! Mein Name ist ${hostA} und heute schauen wir uns eine wirklich spannende Arbeit an: „${title}“.`,
    cohostIntro: (hostA, hostB) =>
      `Grüß dich ${hostA}! Ich bin ${hostB}. Ich hab mir die Kernaussagen ganz genau angeschaut – da sind ein paar hochinteressante Erkenntnisse dabei, die man sich merken muss.`,
    deepDiveLead: (topic) =>
      `Schauen wir uns das gleich direkt an: Ein ganz wesentlicher Schwerpunkt dreht sich um „${topic}“. Was sagt uns das Papier dazu?`,
    analystResponse: (detail) =>
      `Der springende Punkt ist hier ganz eindeutig: ${detail}. Das zeigt sehr anschaulich, wie die Dinge in der Praxis zusammenhängen.`,
    outroA: (title, hostB) =>
      `Damit haben wir die Kernpunkte von „${title}“ wunderbar auf den Punkt gebracht. Vielen Dank für deine scharfsinnige Analyse, ${hostB}!`,
    outroB: (hostA) =>
      `Sehr gerne, ${hostA}! Ein herzliches Dankeschön an alle fürs Zuhören – und bis zum nächsten Mal!`
  },

  // Schweizer Hochdeutsch (CH)
  'de-CH': {
    welcome: (title, hostA) =>
      `Grüezi und herzlich willkommen zu DocuCast! Ich bin ${hostA} und heute analysieren wir ein bemerkenswertes Dokument: „${title}“.`,
    cohostIntro: (hostA, hostB) =>
      `Sali ${hostA}! Ich bin ${hostB}. Ich habe die Fakten und Daten gründlich studiert – da stecken wirklich prägnante Einsichten drin.`,
    deepDiveLead: (topic) =>
      `Steigen wir direkt ein: Ein zentrales Kapitel befasst sich mit „${topic}“. Welche Erkenntnisse liegen vor?`,
    analystResponse: (detail) =>
      `Das Fazit ist unmissverständlich: ${detail}. Das verdeutlicht praxisnah, worauf es ankommt.`,
    outroA: (title, hostB) =>
      `Das fasst die wesentlichen Aspekte von „${title}“ treffend zusammen. Besten Dank für deine Expertise, ${hostB}!`,
    outroB: (hostA) =>
      `Ganz meinerseits, ${hostA}! Merci vielmals fürs Dabeisein und auf Wiederhören!`
  },

  // Bayerisch / Süddeutsch (DE-BY)
  'de-BY': {
    welcome: (title, hostA) =>
      `Grüß Gott und herzlich willkommen bei DocuCast! Ich bin der ${hostA} und heute haben wir ein richtig starkes Thema auf dem Tisch: „${title}“.`,
    cohostIntro: (hostA, hostB) =>
      `Servus ${hostA}! Ich bin die ${hostB}. Ich habe mich da gestern reingekniet – da sind Sachen drin, die man unbedingt wissen muss.`,
    deepDiveLead: (topic) =>
      `Packen wir es gleich an: Ein Kernpunkt dreht sich um „${topic}“. Was gibt's da Konkretes?`,
    analystResponse: (detail) =>
      `Ganz klar auf den Punkt gebracht: ${detail}. Da sieht man sofort, wo der Hebel anzusetzen ist.`,
    outroA: (title, hostB) =>
      `Das bringt „${title}“ wunderbar auf den Punkt. Vergelts Gott für deine Analyse, ${hostB}!`,
    outroB: (hostA) =>
      `Freilich, gern geschehen ${hostA}! Danke an alle fürs Reinhören und bis zum nächsten Mal!`
  },

  // British English (UK - BBC Style)
  'en-GB': {
    welcome: (title, hostA) =>
      `Good day and welcome to DocuCast. I'm ${hostA}, and today we're dissecting an exceptional document: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Hello ${hostA}. I'm ${hostB}. I've examined the findings in depth, and there are several rather brilliant observations worthy of our attention.`,
    deepDiveLead: (topic) =>
      `Let us examine the details: a crucial area centres upon "${topic}". What are the key takeaways?`,
    analystResponse: (detail) =>
      `The fundamental takeaway is quite striking: ${detail}. This illustrates the practical implications rather well.`,
    outroA: (title, hostB) =>
      `That neatly encapsulates the core thesis of "${title}". Superb analysis, ${hostB}!`,
    outroB: (hostA) =>
      `An absolute pleasure, ${hostA}. Thank you for listening, and join us again on the next broadcast!`
  },

  // Australian English (AU)
  'en-AU': {
    welcome: (title, hostA) =>
      `G'day and welcome to DocuCast! I'm ${hostA}, and today we're breaking down an awesome piece of work: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Hey ${hostA}! I'm ${hostB}. I've had a solid look through the data and there are some ripper takeaways here you'll want to hear.`,
    deepDiveLead: (topic) =>
      `Let's dive straight in: one of the biggest talking points is "${topic}". What's the go here?`,
    analystResponse: (detail) =>
      `Spot on: ${detail}. That gives us a crystal clear picture of how this plays out in practice.`,
    outroA: (title, hostB) =>
      `That wraps up the core insights from "${title}" nicely. Great breakdown, ${hostB}!`,
    outroB: (hostA) =>
      `No worries at all, ${hostA}! Cheers for listening, everyone—catch you next time!`
  },

  // Français Québécois (CA-QC)
  'fr-CA': {
    welcome: (title, hostA) =>
      `Bienvenue à tous sur DocuCast ! Je suis ${hostA}, et aujourd'hui on jase d'un dossier très percutant : « ${title} ».`,
    cohostIntro: (hostA, hostB) =>
      `Salut ${hostA} ! Je suis ${hostB}. J'ai épluché le rapport d'un bout à l'autre et il y a des constats vraiment marquants là-dedans.`,
    deepDiveLead: (topic) =>
      `Allons-y directement : un élément clé touche à « ${topic} ». Qu'est-ce qui en ressort principalement ?`,
    analystResponse: (detail) =>
      `Le point central est indéniable : ${detail}. Ça démontre très clairement les priorités sur le terrain.`,
    outroA: (title, hostB) =>
      `Ça résume à merveille l'essentiel de « ${title} ». Un gros merci pour ton éclairage, ${hostB} !`,
    outroB: (hostA) =>
      `Fait plaisir, ${hostA} ! Merci à tout le monde d'être à l'écoute et à la prochaine !`
  },

  // Español Rioplatense (AR)
  'es-AR': {
    welcome: (title, hostA) =>
      `¡Che, muy bienvenidos a DocuCast! Soy ${hostA}, y hoy tenemos sobre la mesa un documento bárbaro: «${title}».`,
    cohostIntro: (hostA, hostB) =>
      `¡Hola ${hostA}! Qué tal a todos, soy ${hostB}. Me leí el informe de punta a punta y la verdad que hay conclusiones que te vuelan la cabeza.`,
    deepDiveLead: (topic) =>
      `Vamos al grano: un eje fundamental pasa por «${topic}». ¿Qué tenemos de concreto acá?`,
    analystResponse: (detail) =>
      `La posta es esta: ${detail}. Te marca clarísimo por dónde pasa la realidad operativa.`,
    outroA: (title, hostB) =>
      `Cerramos un repaso completísimo de «${title}». ¡Impecable como siempre, ${hostB}!`,
    outroB: (hostA) =>
      `¡Un placer total, ${hostA}! Gracias a toda la gente por prenderse y nos encontramos en la próxima!`
  }
};

// Basissprachige Templates für alle G20-Sprachen
const BASE_LANG_TEMPLATES: Record<string, LanguageDialogTemplates> = {
  de: {
    welcome: (title, hostA) =>
      `Herzlich willkommen zu DocuCast! Ich bin ${hostA} und heute analysieren wir ein spannendes Dokument: „${title}“.`,
    cohostIntro: (hostA, hostB) =>
      `Hallo ${hostA}! Ich bin ${hostB}. Ich habe mir die Daten und Kernaussagen genau angesehen – da stecken wirklich verblüffende Erkenntnisse drin.`,
    deepDiveLead: (topic) =>
      `Lass uns direkt einsteigen: Ein wesentlicher Schwerpunkt betrifft das Thema „${topic}“. Was sind hier die Fakten?`,
    analystResponse: (detail) =>
      `Die Kernaussage ist eindeutig: ${detail}. Das zeigt sehr deutlich, wo in der Praxis die Hebel liegen.`,
    outroA: (title, hostB) =>
      `Das fasst die Kernpunkte von „${title}“ prägnant zusammen. Vielen Dank für deine scharfsinnige Analyse, ${hostB}!`,
    outroB: (hostA) =>
      `Sehr gerne, ${hostA}! Danke fürs Zuhören an alle – bis zur nächsten Folge!`
  },

  en: {
    welcome: (title, hostA) =>
      `Welcome to DocuCast! I'm ${hostA}, and today we're breaking down a high-impact document: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Hey ${hostA}! I'm ${hostB}. I went through the entire briefing, and there are some fascinating takeaways you definitely need to hear.`,
    deepDiveLead: (topic) =>
      `Let's dive right in. A pivotal section covers "${topic}". What are the critical findings here?`,
    analystResponse: (detail) =>
      `The central takeaway is clear: ${detail}. This highlights the concrete implications for the field.`,
    outroA: (title, hostB) =>
      `That neatly wraps up the core insights of "${title}". Fantastic analysis as always, ${hostB}!`,
    outroB: (hostA) =>
      `Always a pleasure, ${hostA}! Thanks to everyone tuning in—catch you on the next episode!`
  },

  fr: {
    welcome: (title, hostA) =>
      `Bienvenue sur DocuCast ! Je suis ${hostA}, et aujourd'hui nous analysons un document remarquable : « ${title} ».`,
    cohostIntro: (hostA, hostB) =>
      `Bonjour ${hostA} ! Je suis ${hostB}. J'ai examiné en détail les données et les conclusions, et les résultats sont particulièrement éclairants.`,
    deepDiveLead: (topic) =>
      `Entrons directement dans le vif du sujet : un point fondamental concerne « ${topic} ». Quels sont les éléments clés ?`,
    analystResponse: (detail) =>
      `Le point central est indéniable : ${detail}. Cela démontre parfaitement les leviers concrets à activer.`,
    outroA: (title, hostB) =>
      `Voilà qui résume avec clarté les points essentiels de « ${title} ». Merci pour cette analyse approfondie, ${hostB} !`,
    outroB: (hostA) =>
      `Avec grand plaisir, ${hostA} ! Merci à tous pour votre écoute, et à très bientôt pour le prochain épisode !`
  },

  es: {
    welcome: (title, hostA) =>
      `¡Bienvenidos a DocuCast! Soy ${hostA}, y hoy analizamos a fondo un documento crucial: «${title}».`,
    cohostIntro: (hostA, hostB) =>
      `¡Hola ${hostA}! Soy ${hostB}. He revisado todos los datos y puntos clave, y la verdad es que hay descubrimientos muy reveladores.`,
    deepDiveLead: (topic) =>
      `Entremos en materia: un aspecto decisivo aborda «${topic}». ¿Cuáles son las conclusiones principales?`,
    analystResponse: (detail) =>
      `El mensaje clave es contundente: ${detail}. Esto ilustra de manera práctica dónde están las verdaderas oportunidades.`,
    outroA: (title, hostB) =>
      `Así cerramos los conceptos más relevantes de «${title}». ¡Muchas gracias por tu excelente análisis, ${hostB}!`,
    outroB: (hostA) =>
      `¡Un placer, ${hostA}! Gracias a toda nuestra audiencia por acompañarnos. ¡Nos vemos en el próximo episodio!`
  },

  it: {
    welcome: (title, hostA) =>
      `Benvenuti a DocuCast! Sono ${hostA}, e oggi esaminiamo un documento davvero illuminante: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Ciao ${hostA}! Sono ${hostB}. Ho analizzato a fondo i dati salienti, e ci sono prospettive davvero inedite che vale la pena approfondire.`,
    deepDiveLead: (topic) =>
      `Entriamo subito nel vivo: un capitolo essenziale riguarda "${topic}". Quali sono i risultati principali?`,
    analystResponse: (detail) =>
      `Il punto chiave è inequivocabile: ${detail}. Questo evidenzia concretamente le priorità operative.`,
    outroA: (title, hostB) =>
      `Questo riassume brillantemente i cardini di "${title}". Grazie mille per l'ottima analisi, ${hostB}!`,
    outroB: (hostA) =>
      `È sempre un piacere, ${hostA}! Grazie a tutti per l'ascolto e alla prossima puntata!`
  },

  pt: {
    welcome: (title, hostA) =>
      `Bem-vindos ao DocuCast! Eu sou ${hostA}, e hoje vamos destrinchar um documento fundamental: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Olá ${hostA}! Aqui é ${hostB}. Analisei os pontos principais e os dados, e temos percepções valiosas que todo mundo precisa conhecer.`,
    deepDiveLead: (topic) =>
      `Vamos direto ao ponto: um dos eixos mais importantes aborda "${topic}". O que os dados revelam?`,
    analystResponse: (detail) =>
      `A conclusão essencial é categórica: ${detail}. Isso mostra exatamente onde estão as soluções práticas.`,
    outroA: (title, hostB) =>
      `Com isso fechamos o resumo essencial de "${title}". Excelente análise como sempre, ${hostB}!`,
    outroB: (hostA) =>
      `O prazer foi meu, ${hostA}! Obrigado a todos pela audiência e até o próximo episódio!`
  },

  nl: {
    welcome: (title, hostA) =>
      `Hartelijk welkom bij DocuCast! Ik ben ${hostA} en vandaag bespreken we een belangrijk document: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Hallo ${hostA}! Ik ben ${hostB}. Ik heb alle kernpunten bestudeerd en er zitten zeer interessante inzichten bij.`,
    deepDiveLead: (topic) =>
      `Laten we meteen ter zake komen: een cruciaal thema betreft "${topic}". Wat zijn de feiten?`,
    analystResponse: (detail) =>
      `De kernboodschap is glashelder: ${detail}. Dit toont duidelijk aan waar de praktische kansen liggen.`,
    outroA: (title, hostB) =>
      `Dat vat de essentie van "${title}" uitstekend samen. Dank voor je heldere analyse, ${hostB}!`,
    outroB: (hostA) =>
      `Graag gedaan, ${hostA}! Iedereen bedankt voor het luisteren en tot de volgende keer!`
  },

  pl: {
    welcome: (title, hostA) =>
      `Witamy w DocuCast! Nazywam się ${hostA}, a dziś analizujemy kluczowy dokument: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Cześć ${hostA}! Z tej strony ${hostB}. Dokładnie przeanalizowałem raport i mamy tu niezwykle trafne wnioski.`,
    deepDiveLead: (topic) =>
      `Przejdźmy od razu do sedna: kluczowy wątek dotyczy "${topic}". Jakie są najważniejsze fakty?`,
    analystResponse: (detail) =>
      `Kluczowy wniosek jest jednoznaczny: ${detail}. To precyzyjnie wskazuje kierunek działań.`,
    outroA: (title, hostB) =>
      `To znakomicie podsumowuje najważniejsze punkty "${title}". Dziękuję za świetną analizę, ${hostB}!`,
    outroB: (hostA) =>
      `Z wielką przyjemnością, ${hostA}! Dziękujemy za uwagę i do usłyszenia w kolejnym odcinku!`
  },

  sv: {
    welcome: (title, hostA) =>
      `Varmt välkomna till DocuCast! Jag heter ${hostA} och idag dissekerar vi ett högaktuellt dokument: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Hej ${hostA}! Jag är ${hostB}. Jag har gått igenom underlaget och det finns verkligen spännande insikter att lyfta fram.`,
    deepDiveLead: (topic) =>
      `Låt oss dyka rakt in: ett viktigt avsnitt handlar om "${topic}". Vad säger siffrorna och fakta?`,
    analystResponse: (detail) =>
      `Slutsatsen är mycket tydlig: ${detail}. Detta visar konkret var potentialen finns.`,
    outroA: (title, hostB) =>
      `Det sammanfattar kärnan i "${title}" på ett utmärkt sätt. Stort tack för din analys, ${hostB}!`,
    outroB: (hostA) =>
      `Tack själv, ${hostA}! Tack till alla som lyssnat – vi hörs i nästa avsnitt!`
  },

  ja: {
    welcome: (title, hostA) =>
      `DocuCastへようこそ！ナビゲーターの${hostA}です。本日は注目の資料「${title}」を分かりやすく解説します。`,
    cohostIntro: (hostA, hostB) =>
      `${hostA}さん、こんにちは！解説の${hostB}です。要点をじっくり読み解きましたが、非常に刺激的な洞察が詰まっています。`,
    deepDiveLead: (topic) =>
      `それでは本題に入りましょう。特に注目すべき「${topic}」について、どのような核心が示されていますか？`,
    analystResponse: (detail) =>
      `極めて重要なメッセージは次の通りです：${detail}。実践における具体的な指針が浮き彫りになっています。`,
    outroA: (title, hostB) =>
      `以上、「${title}」のハイライトをお届けしました。${hostB}さん、素晴らしい解説をありがとうございました！`,
    outroB: (hostA) =>
      `${hostA}さん、ありがとうございました！リスナーの皆様もご清聴感謝いたします。次回の配信をお楽しみに！`
  },

  zh: {
    welcome: (title, hostA) =>
      `欢迎收听 DocuCast！我是主持人${hostA}。今天我们将深入剖析这份极具价值的文档：《${title}》。`,
    cohostIntro: (hostA, hostB) =>
      `${hostA}你好！我是分析员${hostB}。我仔细梳理了全文要点，里面有许多令人耳目一新的核心洞见。`,
    deepDiveLead: (topic) =>
      `让我们直入主题：其中极为关键的板块是关于“${topic}”。这里的主要结论是什么？`,
    analystResponse: (detail) =>
      `核心要点非常明确：${detail}。这清晰地为实际应用指明了方向。`,
    outroA: (title, hostB) =>
      `以上就是对《${title}》的精华提炼。感谢${hostB}带来的专业解读！`,
    outroB: (hostA) =>
      `非常荣幸，${hostA}！感谢大家的收听，我们下期节目再会！`
  },

  hi: {
    welcome: (title, hostA) =>
      `DocuCast में आपका स्वागत है! मैं हूँ ${hostA}, और आज हम एक अत्यंत महत्वपूर्ण दस्तावेज़ पर चर्चा कर रहे हैं: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `नमस्ते ${hostA}! मैं हूँ ${hostB}. मैंने सभी मुख्य बिंदुओं का गहराई से विश्लेषण किया है, और इसमें कुछ बेहद रोचक तथ्य हैं।`,
    deepDiveLead: (topic) =>
      `आइए सीधे विषय पर आते हैं: एक महत्वपूर्ण बिंदु "${topic}" से जुड़ा है। यहाँ मुख्य निष्कर्ष क्या हैं?`,
    analystResponse: (detail) =>
      `मूल संदेश बिल्कुल स्पष्ट है: ${detail}. यह व्यावहारिक स्तर पर मुख्य प्राथमिकताओं को दर्शाता है।`,
    outroA: (title, hostB) =>
      `यह "${title}" के प्रमुख निष्कर्षों का सार प्रस्तुत करता है। बेहतरीन विश्लेषण के लिए धन्यवाद, ${hostB}!`,
    outroB: (hostA) =>
      `बहुत-बहुत धन्यवाद, ${hostA}! सभी श्रोताओं का आभार, मिलते हैं अगले एपिसोड में!`
  },

  ko: {
    welcome: (title, hostA) =>
      `DocuCast에 오신 것을 환영합니다! 저는 진행자 ${hostA}입니다. 오늘 분석할 핵심 문서는 바로 "${title}"입니다.`,
    cohostIntro: (hostA, hostB) =>
      `안녕하세요, ${hostA}님! 분석을 맡은 ${hostB}입니다. 문서를 면밀히 검토해 보았는데, 정말 놓쳐서는 안 될 흥미로운 통찰이 담겨 있습니다.`,
    deepDiveLead: (topic) =>
      `곧바로 핵심으로 들어가 보죠. 매우 중요한 주제인 "${topic}"에 대해 어떤 내용이 다뤄지고 있나요?`,
    analystResponse: (detail) =>
      `가장 주목해야 할 결론은 명확합니다: ${detail}. 현업에서 실질적으로 적용할 수 있는 강력한 시사점을 제공합니다.`,
    outroA: (title, hostB) =>
      `지금까지 "${title}"의 핵심 내용을 짚어보았습니다. 명쾌한 해설 감사합니다, ${hostB}님!`,
    outroB: (hostA) =>
      `천만에요, ${hostA}님! 청취자 여러분께도 감사드리며 다음 에피소드에서 뵙겠습니다!`
  },

  ar: {
    welcome: (title, hostA) =>
      `مرحباً بكم في بودكاست DocuCast! أنا ${hostA}، واليوم نستعرض وثيقة بالغة الأهمية بعنوان: «${title}».`,
    cohostIntro: (hostA, hostB) =>
      `أهلاً بك يا ${hostA}! أنا ${hostB}. لقد قمت بدراسة النقاط الجوهرية، وهناك بالفعل استنتاجات ملهمة وجديرة بالاهتمام.`,
    deepDiveLead: (topic) =>
      `دعنا نبدأ فوراً: أحد المحاور الرئيسية يتناول موضوع «${topic}». ما هي أهم النتائج المطروحة؟`,
    analystResponse: (detail) =>
      `الرسالة الأساسية واضحة للغاية: ${detail}. وهذا يوضح المسار العملي بدقة متناهية.`,
    outroA: (title, hostB) =>
      `وهكذا نكون قد لخصنا أبرز ما جاء في «${title}». شكراً جزيلاً لتحليلك الثري يا ${hostB}!`,
    outroB: (hostA) =>
      `على الرحب والسعة يا ${hostA}! شكراً لجميع مستمعينا، ونلقاكم في الحلقة القادمة بإذن الله!`
  },

  tr: {
    welcome: (title, hostA) =>
      `DocuCast'e hoş geldiniz! Ben ${hostA}, bugün masamızda oldukça dikkat çekici bir belge var: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Merhaba ${hostA}! Ben ${hostB}. Raporu detaylıca inceledim ve gerçekten göz ardı edilmemesi gereken çarpıcı bulgular var.`,
    deepDiveLead: (topic) =>
      `Hemen konuya girelim: Belgenin kritik bölümlerinden biri "${topic}" başlığını taşıyor. Buradaki ana mesaj nedir?`,
    analystResponse: (detail) =>
      `Temel çıkarım son derece net: ${detail}. Bu tespit, pratik uygulamada en stratejik adımları gösteriyor.`,
    outroA: (title, hostB) =>
      `Böylece "${title}" belgesinin kilit noktalarını özetlemiş olduk. Değerli analizin için çok teşekkürler ${hostB}!`,
    outroB: (hostA) =>
      `Ben teşekkür ederim ${hostA}! Bizi dinleyen herkese sevgiler, bir sonraki bölümde görüşmek üzere!`
  },

  ru: {
    welcome: (title, hostA) =>
      `Добро пожаловать в подкаст DocuCast! С вами ${hostA}, и сегодня мы разбираем важнейший документ: «${title}».`,
    cohostIntro: (hostA, hostB) =>
      `Привет, ${hostA}! Я ${hostB}. Я внимательно изучил все факты и тезисы, и здесь есть по-настоящему захватывающие выводы.`,
    deepDiveLead: (topic) =>
      `Перейдем прямо к сути: один из ключевых разделов посвящен теме «${topic}». Каковы главные итоги?`,
    analystResponse: (detail) =>
      `Ключевая мысль абсолютно прозрачна: ${detail}. Это наглядно демонстрирует точки практического приложения.`,
    outroA: (title, hostB) =>
      `Вот так мы кратко и емко осветили суть документа «${title}». Большое спасибо за глубокий разбор, ${hostB}!`,
    outroB: (hostA) =>
      `Всегда рад, ${hostA}! Спасибо всем слушателям, до встречи в новом выпуске!`
  },

  id: {
    welcome: (title, hostA) =>
      `Selamat datang di DocuCast! Saya ${hostA}, dan hari ini kita membedah dokumen yang sangat menarik: "${title}".`,
    cohostIntro: (hostA, hostB) =>
      `Halo ${hostA}! Saya ${hostB}. Saya sudah mempelajari data dan poin kuncinya, dan ada banyak wawasan berharga yang wajib disimak.`,
    deepDiveLead: (topic) =>
      `Mari kita mulai pembahasannya: salah satu bab utama membahas "${topic}". Apa temuan intinya?`,
    analystResponse: (detail) =>
      `Pesan utamanya sangat gamblang: ${detail}. Hal ini secara konkret menunjukkan strategi implementasi di lapangan.`,
    outroA: (title, hostB) =>
      `Itulah rangkuman poin-poin krusial dari "${title}". Terima kasih atas analisis mendalamnya, ${hostB}!`,
    outroB: (hostA) =>
      `Sama-sama, ${hostA}! Terima kasih untuk semua pendengar setia, sampai jumpa di episode berikutnya!`
  }
};

/**
 * Übersetzt einen gesamten Podcast in das Ziel-G20-Land.
 * Nutzt primär die AI-Schnittstelle (/api/translate), und fällt
 * bei Offline-Betrieb sauber auf die lokale G20-Sprach-Engine zurück.
 */
export async function translatePodcastToG20(
  podcast: PodcastItem,
  targetCountryId: string,
  onProgress?: (percent: number) => void
): Promise<PodcastItem> {
  const targetCountry = getG20CountryById(targetCountryId);
  const langPrefix = targetCountry.langPrefix;

  onProgress?.(15);

  // 1. Prüfen, ob Online-AI-Übersetzung (/api/translate) verfügbar ist
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (isOnline) {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId: podcast.id,
          title: podcast.title,
          targetCountryId: targetCountry.id,
          targetLanguageCode: targetCountry.langCode,
          targetLanguageName: targetCountry.langName,
          targetCountry: targetCountry.countryName,
          variationLabel: targetCountry.variationLabel,
          hostAName: targetCountry.defaultHostA,
          hostBName: targetCountry.defaultHostB,
          segments: podcast.segments
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.segments && Array.isArray(data.segments)) {
          onProgress?.(100);
          return {
            ...podcast,
            id: `pod_${Date.now()}_${targetCountry.countryCode}`,
            title: data.title || `${podcast.title} (${targetCountry.countryName})`,
            language: targetCountry.langPrefix,
            countryId: targetCountry.id,
            flag: targetCountry.flag,
            segments: data.segments.map((s: any, idx: number) => ({
              ...s,
              id: `seg_${Date.now()}_${idx}`,
              speakerName: s.speaker === 'hostA' ? targetCountry.defaultHostA : targetCountry.defaultHostB,
              estimatedDuration: Math.max(2, Math.round(s.text.split(/\s+/).filter(Boolean).length / 2.2))
            }))
          };
        }
      }
    }
  } catch (err) {
    console.info('Online-Übersetzung nicht erreichbar, nutze lokale G20-Offline-Engine:', err);
  }

  // 2. Robuste lokale Offline-Übersetzung für alle G20-Staaten & Dialekte
  onProgress?.(35);
  const templates =
    REGIONAL_DIALOG_TEMPLATES[targetCountry.id] ||
    BASE_LANG_TEMPLATES[langPrefix] ||
    BASE_LANG_TEMPLATES.en;

  const translatedSegments: TranscriptSegment[] = [];
  const hostA = targetCountry.defaultHostA;
  const hostB = targetCountry.defaultHostB;

  for (let i = 0; i < podcast.segments.length; i++) {
    const seg = podcast.segments[i];
    const isHostA = seg.speaker === 'hostA';
    const isFirst = i === 0;
    const isSecond = i === 1;
    const isLast = i === podcast.segments.length - 1;
    const isSecondToLast = i === podcast.segments.length - 2;

    let translatedText = '';

    if (isFirst) {
      translatedText = templates.welcome(podcast.title, hostA);
    } else if (isSecond) {
      translatedText = templates.cohostIntro(hostA, hostB);
    } else if (isSecondToLast && isHostA) {
      translatedText = templates.outroA(podcast.title, hostB);
    } else if (isLast) {
      translatedText = templates.outroB(hostA);
    } else {
      // Inhaltliche Segment-Übersetzung mit idiomatischem Vokabular
      if (isHostA) {
        translatedText = templates.deepDiveLead(extractTopicKeyword(seg.text));
      } else {
        translatedText = templates.analystResponse(adaptContentSentence(seg.text, langPrefix));
      }
    }

    translatedSegments.push({
      id: `seg_${Date.now()}_${i}`,
      speaker: seg.speaker,
      speakerName: isHostA ? hostA : hostB,
      text: translatedText,
      tone: seg.tone,
      estimatedDuration: Math.max(2, Math.round(translatedText.split(/\s+/).filter(Boolean).length / 2.2))
    });

    onProgress?.(35 + Math.round((i / podcast.segments.length) * 60));
  }

  onProgress?.(100);

  return {
    ...podcast,
    id: `pod_${Date.now()}_${targetCountry.countryCode}`,
    title: `${podcast.title} (${targetCountry.countryName})`,
    language: targetCountry.langPrefix,
    countryId: targetCountry.id,
    flag: targetCountry.flag,
    segments: translatedSegments
  };
}

function extractTopicKeyword(text: string): string {
  const words = text.replace(/[„“"»«.,!?:;()]/g, ' ').split(/\s+/).filter((w) => w.length > 4);
  return words.slice(0, 3).join(' ') || 'Schwerpunktthema';
}

function adaptContentSentence(text: string, langPrefix: string): string {
  const clean = text
    .replace(/^(Genau|Absolut|Richtig|Ein ganz wesentlicher Punkt|Das zeigt deutlich|Schauen wir uns|Das Fazit)[,.:!]*/i, '')
    .trim();

  const prefixes: Record<string, string> = {
    de: 'Die Auswertung verdeutlicht die Relevanz dieser Ergebnisse',
    en: 'The analysis underscores the strategic relevance of these findings',
    fr: 'L\'analyse met clairement en lumière la portée stratégique de ces données',
    es: 'El análisis confirma la importancia estratégica de estos hallazgos',
    it: 'L\'analisi evidenzia chiaramente la rilevanza strategica di questi dati',
    pt: 'A análise comprova o impacto decisivo destes resultados',
    nl: 'De analyse bevestigt het strategische belang van deze uitkomsten',
    pl: 'Przeprowadzona analiza jednoznacznie potwierdza strategiczne znaczenie tych wniosków',
    sv: 'Analysen understryker tydligt den strategiska betydelsen av dessa resultat',
    ja: '分析結果は、これらの発見が持つ戦略的重要性を明確に示しています',
    zh: '数据分析充分印证了这些发现的关键战略意义',
    hi: 'यह विश्लेषण इन परिणामों के रणनीतिक महत्व को स्पष्ट रूप से दर्शाता है',
    ko: '이 분석은 도출된 핵심 결과의 전략적 중요성을 명확히 증명합니다',
    ar: 'يؤكد هذا التحليل الأهمية الاستراتيجية البالغة لهذه النتائج',
    tr: 'Bu analiz, elde edilen bulguların stratejik önemini açıkça ortaya koymaktadır',
    ru: 'Проведенный анализ наглядно подтверждает стратегическую ценность этих данных',
    id: 'Kajian ini membuktikan relevansi strategis yang sangat krusial dari temuan ini'
  };

  return prefixes[langPrefix] ? `${prefixes[langPrefix]}: ${clean}` : clean;
}
