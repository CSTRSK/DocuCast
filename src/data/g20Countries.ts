import { G20Country } from '../types/podcast';

export const G20_COUNTRIES: G20Country[] = [
  // =================== EUROPA ===================
  {
    id: 'de-DE',
    countryCode: 'DE',
    countryName: 'Deutschland',
    flag: '🇩🇪',
    langCode: 'de-DE',
    langPrefix: 'de',
    langName: 'Deutsch',
    variationLabel: 'Bundesdeutsch (Standard)',
    defaultHostA: 'Alex',
    defaultHostB: 'Sam',
    region: 'Europe'
  },
  {
    id: 'de-BY',
    countryCode: 'DE-BY',
    countryName: 'Deutschland (Süd / Bayern)',
    flag: '🇩🇪',
    langCode: 'de-DE',
    langPrefix: 'de',
    langName: 'Deutsch (Süddeutsch)',
    variationLabel: 'Bayerisch & Süddeutsch gefärbt',
    defaultHostA: 'Maximilian',
    defaultHostB: 'Vroni',
    region: 'Europe'
  },
  {
    id: 'de-ND',
    countryCode: 'DE-ND',
    countryName: 'Deutschland (Nord)',
    flag: '🇩🇪',
    langCode: 'de-DE',
    langPrefix: 'de',
    langName: 'Deutsch (Norddeutsch)',
    variationLabel: 'Norddeutsch / Hanseatisch',
    defaultHostA: 'Jan',
    defaultHostB: 'Levke',
    region: 'Europe'
  },
  {
    id: 'de-AT',
    countryCode: 'AT',
    countryName: 'Österreich',
    flag: '🇦🇹',
    langCode: 'de-AT',
    langPrefix: 'de',
    langName: 'Deutsch (Österreich)',
    variationLabel: 'Österreichisches Deutsch (Alpenländisch & Wienerisch)',
    defaultHostA: 'Florian',
    defaultHostB: 'Sophie',
    region: 'Europe'
  },
  {
    id: 'de-CH',
    countryCode: 'CH',
    countryName: 'Schweiz',
    flag: '🇨🇭',
    langCode: 'de-CH',
    langPrefix: 'de',
    langName: 'Deutsch (Schweiz)',
    variationLabel: 'Schweizer Hochdeutsch (Helvetismen)',
    defaultHostA: 'Beat',
    defaultHostB: 'Maya',
    region: 'Europe'
  },
  {
    id: 'en-GB',
    countryCode: 'GB',
    countryName: 'Großbritannien',
    flag: '🇬🇧',
    langCode: 'en-GB',
    langPrefix: 'en',
    langName: 'English (UK)',
    variationLabel: 'British English (BBC / RP Standard)',
    defaultHostA: 'Oliver',
    defaultHostB: 'Emma',
    region: 'Europe'
  },
  {
    id: 'en-GB-SCO',
    countryCode: 'GB-SCT',
    countryName: 'Schottland (UK)',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    langCode: 'en-GB',
    langPrefix: 'en',
    langName: 'English (Scotland)',
    variationLabel: 'Scottish English (Edinburgh / Glasgow)',
    defaultHostA: 'Callum',
    defaultHostB: 'Isla',
    region: 'Europe'
  },
  {
    id: 'fr-FR',
    countryCode: 'FR',
    countryName: 'Frankreich',
    flag: '🇫🇷',
    langCode: 'fr-FR',
    langPrefix: 'fr',
    langName: 'Français',
    variationLabel: 'Français Métropolitain (Parisien)',
    defaultHostA: 'Julien',
    defaultHostB: 'Camille',
    region: 'Europe'
  },
  {
    id: 'fr-BE',
    countryCode: 'BE',
    countryName: 'Belgien (EU-Zentrum)',
    flag: '🇧🇪',
    langCode: 'fr-BE',
    langPrefix: 'fr',
    langName: 'Français (Belgique)',
    variationLabel: 'Français de Belgique (Bruxellois)',
    defaultHostA: 'Lucas',
    defaultHostB: 'Élodie',
    region: 'Europe'
  },
  {
    id: 'it-IT',
    countryCode: 'IT',
    countryName: 'Italien',
    flag: '🇮🇹',
    langCode: 'it-IT',
    langPrefix: 'it',
    langName: 'Italiano',
    variationLabel: 'Italiano Standard (Nazionale)',
    defaultHostA: 'Marco',
    defaultHostB: 'Giulia',
    region: 'Europe'
  },
  {
    id: 'it-IT-MI',
    countryCode: 'IT-MI',
    countryName: 'Italien (Mailand / Nord)',
    flag: '🇮🇹',
    langCode: 'it-IT',
    langPrefix: 'it',
    langName: 'Italiano (Settentrionale)',
    variationLabel: 'Milano Business & Finanza',
    defaultHostA: 'Andrea',
    defaultHostB: 'Chiara',
    region: 'Europe'
  },
  {
    id: 'es-ES',
    countryCode: 'ES',
    countryName: 'Spanien',
    flag: '🇪🇸',
    langCode: 'es-ES',
    langPrefix: 'es',
    langName: 'Español (España)',
    variationLabel: 'Castellano Peninsular',
    defaultHostA: 'Carlos',
    defaultHostB: 'Elena',
    region: 'Europe'
  },
  {
    id: 'nl-NL',
    countryCode: 'NL',
    countryName: 'Niederlande (EU G20)',
    flag: '🇳🇱',
    langCode: 'nl-NL',
    langPrefix: 'nl',
    langName: 'Nederlands',
    variationLabel: 'Algemeen Beschaafd Nederlands',
    defaultHostA: 'Daan',
    defaultHostB: 'Sanne',
    region: 'Europe'
  },
  {
    id: 'pl-PL',
    countryCode: 'PL',
    countryName: 'Polen (EU G20)',
    flag: '🇵🇱',
    langCode: 'pl-PL',
    langPrefix: 'pl',
    langName: 'Polski',
    variationLabel: 'Język polski standardowy',
    defaultHostA: 'Jakub',
    defaultHostB: 'Zuzanna',
    region: 'Europe'
  },
  {
    id: 'sv-SE',
    countryCode: 'SE',
    countryName: 'Schweden (EU G20)',
    flag: '🇸🇪',
    langCode: 'sv-SE',
    langPrefix: 'sv',
    langName: 'Svenska',
    variationLabel: 'Rikssvenska (Standard)',
    defaultHostA: 'Elias',
    defaultHostB: 'Astrid',
    region: 'Europe'
  },
  {
    id: 'ru-RU',
    countryCode: 'RU',
    countryName: 'Russland',
    flag: '🇷🇺',
    langCode: 'ru-RU',
    langPrefix: 'ru',
    langName: 'Русский',
    variationLabel: 'Русский литературный',
    defaultHostA: 'Дмитрий',
    defaultHostB: 'Анна',
    region: 'Europe'
  },
  {
    id: 'tr-TR',
    countryCode: 'TR',
    countryName: 'Türkei',
    flag: '🇹🇷',
    langCode: 'tr-TR',
    langPrefix: 'tr',
    langName: 'Türkçe',
    variationLabel: 'İstanbul Türkçesi (Medya Dili)',
    defaultHostA: 'Emre',
    defaultHostB: 'Zeynep',
    region: 'Europe'
  },

  // =================== AMERIKA ===================
  {
    id: 'en-US',
    countryCode: 'US',
    countryName: 'Vereinigte Staaten',
    flag: '🇺🇸',
    langCode: 'en-US',
    langPrefix: 'en',
    langName: 'English (US)',
    variationLabel: 'General American (Standard)',
    defaultHostA: 'Michael',
    defaultHostB: 'Sarah',
    region: 'Americas'
  },
  {
    id: 'en-US-NY',
    countryCode: 'US-NY',
    countryName: 'USA (New York & East Coast)',
    flag: '🇺🇸',
    langCode: 'en-US',
    langPrefix: 'en',
    langName: 'English (US East Coast)',
    variationLabel: 'New York Media & Finance Style',
    defaultHostA: 'Daniel',
    defaultHostB: 'Rachel',
    region: 'Americas'
  },
  {
    id: 'en-US-CA',
    countryCode: 'US-CA',
    countryName: 'USA (Silicon Valley & West Coast)',
    flag: '🇺🇸',
    langCode: 'en-US',
    langPrefix: 'en',
    langName: 'English (US West Coast)',
    variationLabel: 'Silicon Valley Tech & Startup Style',
    defaultHostA: 'Tyler',
    defaultHostB: 'Jessica',
    region: 'Americas'
  },
  {
    id: 'en-CA',
    countryCode: 'CA',
    countryName: 'Kanada',
    flag: '🇨🇦',
    langCode: 'en-CA',
    langPrefix: 'en',
    langName: 'English (Canada)',
    variationLabel: 'Canadian English (Standard)',
    defaultHostA: 'Ethan',
    defaultHostB: 'Olivia',
    region: 'Americas'
  },
  {
    id: 'fr-CA',
    countryCode: 'CA-QC',
    countryName: 'Kanada (Québec)',
    flag: '🇨🇦',
    langCode: 'fr-CA',
    langPrefix: 'fr',
    langName: 'Français Canadien',
    variationLabel: 'Québécois (Montréal / Ville de Québec)',
    defaultHostA: 'Jean-Pierre',
    defaultHostB: 'Marie',
    region: 'Americas'
  },
  {
    id: 'es-MX',
    countryCode: 'MX',
    countryName: 'Mexiko',
    flag: '🇲🇽',
    langCode: 'es-MX',
    langPrefix: 'es',
    langName: 'Español (México)',
    variationLabel: 'Español Mexicano (Latinoamericano)',
    defaultHostA: 'Mateo',
    defaultHostB: 'Sofía',
    region: 'Americas'
  },
  {
    id: 'es-AR',
    countryCode: 'AR',
    countryName: 'Argentinien',
    flag: '🇦🇷',
    langCode: 'es-AR',
    langPrefix: 'es',
    langName: 'Español (Argentina)',
    variationLabel: 'Español Rioplatense (Buenos Aires)',
    defaultHostA: 'Lucas',
    defaultHostB: 'Martina',
    region: 'Americas'
  },
  {
    id: 'es-CO',
    countryCode: 'CO',
    countryName: 'Kolumbien',
    flag: '🇨🇴',
    langCode: 'es-CO',
    langPrefix: 'es',
    langName: 'Español (Colombia)',
    variationLabel: 'Español Bogotano (Neutro)',
    defaultHostA: 'Santiago',
    defaultHostB: 'Valentina',
    region: 'Americas'
  },
  {
    id: 'pt-BR',
    countryCode: 'BR',
    countryName: 'Brasilien',
    flag: '🇧🇷',
    langCode: 'pt-BR',
    langPrefix: 'pt',
    langName: 'Português (Brasil)',
    variationLabel: 'Português Brasileiro (Paulista / Carioca)',
    defaultHostA: 'Lucas',
    defaultHostB: 'Mariana',
    region: 'Americas'
  },
  {
    id: 'pt-PT',
    countryCode: 'PT',
    countryName: 'Portugal (EU)',
    flag: '🇵🇹',
    langCode: 'pt-PT',
    langPrefix: 'pt',
    langName: 'Português (Portugal)',
    variationLabel: 'Português Europeu (Lisboa)',
    defaultHostA: 'Rodrigo',
    defaultHostB: 'Inês',
    region: 'Americas'
  },

  // =================== ASIEN-PAZIFIK ===================
  {
    id: 'ja-JP',
    countryCode: 'JP',
    countryName: 'Japan',
    flag: '🇯🇵',
    langCode: 'ja-JP',
    langPrefix: 'ja',
    langName: '日本語',
    variationLabel: '標準日本語 (Tokyo Standard)',
    defaultHostA: 'Kenji',
    defaultHostB: 'Yuka',
    region: 'Asia-Pacific'
  },
  {
    id: 'ja-JP-KS',
    countryCode: 'JP-KS',
    countryName: 'Japan (Kansai)',
    flag: '🇯🇵',
    langCode: 'ja-JP',
    langPrefix: 'ja',
    langName: '日本語 (関西トーク)',
    variationLabel: '関西弁スタイル (Osaka / Kyoto Dialog)',
    defaultHostA: 'Daiki',
    defaultHostB: 'Haruka',
    region: 'Asia-Pacific'
  },
  {
    id: 'zh-CN',
    countryCode: 'CN',
    countryName: 'China (Festland)',
    flag: '🇨🇳',
    langCode: 'zh-CN',
    langPrefix: 'zh',
    langName: '中文 (Mandarin)',
    variationLabel: '普通话 (Vereinfacht / Beijing)',
    defaultHostA: 'Wei',
    defaultHostB: 'Jing',
    region: 'Asia-Pacific'
  },
  {
    id: 'zh-TW',
    countryCode: 'TW',
    countryName: 'Taiwan',
    flag: '🇹🇼',
    langCode: 'zh-TW',
    langPrefix: 'zh',
    langName: '中文 (台灣國語)',
    variationLabel: '臺灣華語 (Traditionell)',
    defaultHostA: 'Bo-Han',
    defaultHostB: 'Ting-Yu',
    region: 'Asia-Pacific'
  },
  {
    id: 'hi-IN',
    countryCode: 'IN',
    countryName: 'Indien',
    flag: '🇮🇳',
    langCode: 'hi-IN',
    langPrefix: 'hi',
    langName: 'हिन्दी (Hindi)',
    variationLabel: 'मानक हिन्दी (Standard Hindi)',
    defaultHostA: 'Aarav',
    defaultHostB: 'Ananya',
    region: 'Asia-Pacific'
  },
  {
    id: 'en-IN',
    countryCode: 'IN-EN',
    countryName: 'Indien (Englisch)',
    flag: '🇮🇳',
    langCode: 'en-IN',
    langPrefix: 'en',
    langName: 'English (India)',
    variationLabel: 'Indian English (Business & Tech Hub)',
    defaultHostA: 'Rohan',
    defaultHostB: 'Priya',
    region: 'Asia-Pacific'
  },
  {
    id: 'ko-KR',
    countryCode: 'KR',
    countryName: 'Südkorea',
    flag: '🇰🇷',
    langCode: 'ko-KR',
    langPrefix: 'ko',
    langName: '한국어',
    variationLabel: '서울 표준어 (Seoul Standard)',
    defaultHostA: 'Min-jun',
    defaultHostB: 'Seo-yeon',
    region: 'Asia-Pacific'
  },
  {
    id: 'id-ID',
    countryCode: 'ID',
    countryName: 'Indonesien',
    flag: '🇮🇩',
    langCode: 'id-ID',
    langPrefix: 'id',
    langName: 'Bahasa Indonesia',
    variationLabel: 'Bahasa Baku (Jakarta Standard)',
    defaultHostA: 'Budi',
    defaultHostB: 'Siti',
    region: 'Asia-Pacific'
  },
  {
    id: 'en-AU',
    countryCode: 'AU',
    countryName: 'Australien',
    flag: '🇦🇺',
    langCode: 'en-AU',
    langPrefix: 'en',
    langName: 'English (Australia)',
    variationLabel: 'Australian English (Aussie Casual & Dynamic)',
    defaultHostA: 'Liam',
    defaultHostB: 'Chloe',
    region: 'Asia-Pacific'
  },
  {
    id: 'en-SG',
    countryCode: 'SG',
    countryName: 'Singapur (G20 Partner)',
    flag: '🇸🇬',
    langCode: 'en-SG',
    langPrefix: 'en',
    langName: 'English (Singapore)',
    variationLabel: 'Singapore Standard English (Global Commerce)',
    defaultHostA: 'Aaron',
    defaultHostB: 'Cheryl',
    region: 'Asia-Pacific'
  },

  // =================== NAHOST & AFRIKA ===================
  {
    id: 'ar-SA',
    countryCode: 'SA',
    countryName: 'Saudi-Arabien',
    flag: '🇸🇦',
    langCode: 'ar-SA',
    langPrefix: 'ar',
    langName: 'العربية (Saudi-Arabien)',
    variationLabel: 'الفصحى الحديثة مع لمسة خليجية (Gulf MSA)',
    defaultHostA: 'Tariq',
    defaultHostB: 'Layla',
    region: 'Middle East & Africa'
  },
  {
    id: 'ar-AE',
    countryCode: 'AE',
    countryName: 'Vereinigte Arabische Emirate',
    flag: '🇦🇪',
    langCode: 'ar-AE',
    langPrefix: 'ar',
    langName: 'العربية (VAE)',
    variationLabel: 'العربية الدولية وبيئة الأعمال (Dubai Tech Style)',
    defaultHostA: 'Zayed',
    defaultHostB: 'Maryam',
    region: 'Middle East & Africa'
  },
  {
    id: 'ar-EG',
    countryCode: 'EG',
    countryName: 'Ägypten (AU / G20 Gast)',
    flag: '🇪🇬',
    langCode: 'ar-EG',
    langPrefix: 'ar',
    langName: 'العربية (مصر)',
    variationLabel: 'اللهجة المصرية الإعلامية (Kairo Media Standard)',
    defaultHostA: 'Omar',
    defaultHostB: 'Nour',
    region: 'Middle East & Africa'
  },
  {
    id: 'en-ZA',
    countryCode: 'ZA',
    countryName: 'Südafrika',
    flag: '🇿🇦',
    langCode: 'en-ZA',
    langPrefix: 'en',
    langName: 'English (South Africa)',
    variationLabel: 'South African English (Johannesburg / Cape Town)',
    defaultHostA: 'Thabo',
    defaultHostB: 'Nandi',
    region: 'Middle East & Africa'
  },
  {
    id: 'en-NG',
    countryCode: 'NG',
    countryName: 'Nigeria (Afrikanische Union G20)',
    flag: '🇳🇬',
    langCode: 'en-NG',
    langPrefix: 'en',
    langName: 'English (Nigeria)',
    variationLabel: 'Nigerian English (Lagos Media & Innovation)',
    defaultHostA: 'Emeka',
    defaultHostB: 'Chioma',
    region: 'Middle East & Africa'
  }
];

export function getG20CountryById(id: string): G20Country {
  return G20_COUNTRIES.find((c) => c.id === id) || G20_COUNTRIES[0];
}

export function getG20CountryByLangPrefix(langPrefix: string): G20Country {
  const prefix = langPrefix.toLowerCase().slice(0, 2);
  return G20_COUNTRIES.find((c) => c.langPrefix === prefix) || G20_COUNTRIES[0];
}

export function searchG20Countries(query: string, region: string = 'all'): G20Country[] {
  return G20_COUNTRIES.filter((country) => {
    if (region !== 'all' && country.region !== region) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      country.countryName.toLowerCase().includes(q) ||
      country.langName.toLowerCase().includes(q) ||
      country.variationLabel.toLowerCase().includes(q) ||
      country.countryCode.toLowerCase().includes(q)
    );
  });
}
