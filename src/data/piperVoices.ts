/**
 * Piper-Stimmen-Katalog (erzeugt aus den Stimmen-Metadaten des Piper-Projekts).
 *
 * "modern" = Stimme nutzt den aktuellen Phonemsatz (>= 140 Zeichen). Stimmen der
 * ersten Generation (genau 130 Einträge) passen nicht zur heutigen Aussprache-
 * Laufzeit: sie werden in der Oberfläche nur auf Wunsch angezeigt und vor dem
 * Einsatz geprüft (Selbsttest nach dem Laden).
 *
 * Modelle: Piper (MIT). Sie werden erst beim Klick auf "Auf dieses Gerät laden" geholt.
 */

export type PiperQuality = 'x_low' | 'low' | 'medium' | 'high';

export interface PiperVoice {
  id: string;
  path: string;
  lang: string;
  langName: string;
  stimmName: string;
  quality: PiperQuality;
  sprecher: number;
  mb: number;
  phoneme: number;
  espeak: string;
  modern: boolean;
}

export const PIPER_VOICES: PiperVoice[] = [
  { id: "ar_JO-kareem-low", path: "ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx", lang: "ar_JO", langName: "Arabic", stimmName: "kareem", quality: "low", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "ar", modern: true },
  { id: "ar_JO-kareem-medium", path: "ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx", lang: "ar_JO", langName: "Arabic", stimmName: "kareem", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "ar", modern: true },
  { id: "ca_ES-upc_ona-x_low", path: "ca/ca_ES/upc_ona/x_low/ca_ES-upc_ona-x_low.onnx", lang: "ca_ES", langName: "Catalan", stimmName: "upc_ona", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "ca", modern: false },
  { id: "ca_ES-upc_pau-x_low", path: "ca/ca_ES/upc_pau/x_low/ca_ES-upc_pau-x_low.onnx", lang: "ca_ES", langName: "Catalan", stimmName: "upc_pau", quality: "x_low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "ca", modern: false },
  { id: "ca_ES-upc_ona-medium", path: "ca/ca_ES/upc_ona/medium/ca_ES-upc_ona-medium.onnx", lang: "ca_ES", langName: "Catalan", stimmName: "upc_ona", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "ca", modern: true },
  { id: "cs_CZ-jirka-low", path: "cs/cs_CZ/jirka/low/cs_CZ-jirka-low.onnx", lang: "cs_CZ", langName: "Czech", stimmName: "jirka", quality: "low", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "cs", modern: true },
  { id: "cs_CZ-jirka-medium", path: "cs/cs_CZ/jirka/medium/cs_CZ-jirka-medium.onnx", lang: "cs_CZ", langName: "Czech", stimmName: "jirka", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "cs", modern: true },
  { id: "cy_GB-gwryw_gogleddol-medium", path: "cy/cy_GB/gwryw_gogleddol/medium/cy_GB-gwryw_gogleddol-medium.onnx", lang: "cy_GB", langName: "Welsh", stimmName: "gwryw_gogleddol", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "cy", modern: true },
  { id: "da_DK-talesyntese-medium", path: "da/da_DK/talesyntese/medium/da_DK-talesyntese-medium.onnx", lang: "da_DK", langName: "Danish", stimmName: "talesyntese", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "da", modern: true },
  { id: "de_DE-eva_k-x_low", path: "de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx", lang: "de_DE", langName: "German", stimmName: "eva_k", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-karlsson-low", path: "de/de_DE/karlsson/low/de_DE-karlsson-low.onnx", lang: "de_DE", langName: "German", stimmName: "karlsson", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-kerstin-low", path: "de/de_DE/kerstin/low/de_DE-kerstin-low.onnx", lang: "de_DE", langName: "German", stimmName: "kerstin", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-pavoque-low", path: "de/de_DE/pavoque/low/de_DE-pavoque-low.onnx", lang: "de_DE", langName: "German", stimmName: "pavoque", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-ramona-low", path: "de/de_DE/ramona/low/de_DE-ramona-low.onnx", lang: "de_DE", langName: "German", stimmName: "ramona", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-thorsten-low", path: "de/de_DE/thorsten/low/de_DE-thorsten-low.onnx", lang: "de_DE", langName: "German", stimmName: "thorsten", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "de", modern: false },
  { id: "de_DE-thorsten-medium", path: "de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx", lang: "de_DE", langName: "German", stimmName: "thorsten", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "de", modern: true },
  { id: "de_DE-thorsten_emotional-medium", path: "de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium.onnx", lang: "de_DE", langName: "German", stimmName: "thorsten_emotional", quality: "medium", sprecher: 8, mb: 73.2, phoneme: 154, espeak: "de", modern: true },
  { id: "de_DE-mls-medium", path: "de/de_DE/mls/medium/de_DE-mls-medium.onnx", lang: "de_DE", langName: "German", stimmName: "mls", quality: "medium", sprecher: 236, mb: 73.4, phoneme: 159, espeak: "de", modern: true },
  { id: "de_DE-thorsten-high", path: "de/de_DE/thorsten/high/de_DE-thorsten-high.onnx", lang: "de_DE", langName: "German", stimmName: "thorsten", quality: "high", sprecher: 1, mb: 108.6, phoneme: 154, espeak: "de", modern: true },
  { id: "el_GR-rapunzelina-low", path: "el/el_GR/rapunzelina/low/el_GR-rapunzelina-low.onnx", lang: "el_GR", langName: "Greek", stimmName: "rapunzelina", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "el", modern: false },
  { id: "en_GB-alan-low", path: "en/en_GB/alan/low/en_GB-alan-low.onnx", lang: "en_GB", langName: "English", stimmName: "alan", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-gb-x-rp", modern: false },
  { id: "en_GB-southern_english_female-low", path: "en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx", lang: "en_GB", langName: "English", stimmName: "southern_english_female", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-gb-x-rp", modern: false },
  { id: "en_GB-alan-medium", path: "en/en_GB/alan/medium/en_GB-alan-medium.onnx", lang: "en_GB", langName: "English", stimmName: "alan", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-alba-medium", path: "en/en_GB/alba/medium/en_GB-alba-medium.onnx", lang: "en_GB", langName: "English", stimmName: "alba", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-jenny_dioco-medium", path: "en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx", lang: "en_GB", langName: "English", stimmName: "jenny_dioco", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-northern_english_male-medium", path: "en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx", lang: "en_GB", langName: "English", stimmName: "northern_english_male", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-cori-medium", path: "en/en_GB/cori/medium/en_GB-cori-medium.onnx", lang: "en_GB", langName: "English", stimmName: "cori", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_GB-aru-medium", path: "en/en_GB/aru/medium/en_GB-aru-medium.onnx", lang: "en_GB", langName: "English", stimmName: "aru", quality: "medium", sprecher: 12, mb: 73.2, phoneme: 154, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-semaine-medium", path: "en/en_GB/semaine/medium/en_GB-semaine-medium.onnx", lang: "en_GB", langName: "English", stimmName: "semaine", quality: "medium", sprecher: 4, mb: 73.2, phoneme: 157, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-vctk-medium", path: "en/en_GB/vctk/medium/en_GB-vctk-medium.onnx", lang: "en_GB", langName: "English", stimmName: "vctk", quality: "medium", sprecher: 109, mb: 73.4, phoneme: 154, espeak: "en-gb-x-rp", modern: true },
  { id: "en_GB-cori-high", path: "en/en_GB/cori/high/en_GB-cori-high.onnx", lang: "en_GB", langName: "English", stimmName: "cori", quality: "high", sprecher: 1, mb: 108.9, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-amy-low", path: "en/en_US/amy/low/en_US-amy-low.onnx", lang: "en_US", langName: "English", stimmName: "amy", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-us", modern: false },
  { id: "en_US-danny-low", path: "en/en_US/danny/low/en_US-danny-low.onnx", lang: "en_US", langName: "English", stimmName: "danny", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-us", modern: false },
  { id: "en_US-kathleen-low", path: "en/en_US/kathleen/low/en_US-kathleen-low.onnx", lang: "en_US", langName: "English", stimmName: "kathleen", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-us", modern: false },
  { id: "en_US-ryan-low", path: "en/en_US/ryan/low/en_US-ryan-low.onnx", lang: "en_US", langName: "English", stimmName: "ryan", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "en-us", modern: false },
  { id: "en_US-amy-medium", path: "en/en_US/amy/medium/en_US-amy-medium.onnx", lang: "en_US", langName: "English", stimmName: "amy", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-hfc_female-medium", path: "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx", lang: "en_US", langName: "English", stimmName: "hfc_female", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "en-us", modern: true },
  { id: "en_US-hfc_male-medium", path: "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx", lang: "en_US", langName: "English", stimmName: "hfc_male", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "en-us", modern: true },
  { id: "en_US-joe-medium", path: "en/en_US/joe/medium/en_US-joe-medium.onnx", lang: "en_US", langName: "English", stimmName: "joe", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 151, espeak: "en-us", modern: true },
  { id: "en_US-kusal-medium", path: "en/en_US/kusal/medium/en_US-kusal-medium.onnx", lang: "en_US", langName: "English", stimmName: "kusal", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-lessac-low", path: "en/en_US/lessac/low/en_US-lessac-low.onnx", lang: "en_US", langName: "English", stimmName: "lessac", quality: "low", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-lessac-medium", path: "en/en_US/lessac/medium/en_US-lessac-medium.onnx", lang: "en_US", langName: "English", stimmName: "lessac", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-ryan-medium", path: "en/en_US/ryan/medium/en_US-ryan-medium.onnx", lang: "en_US", langName: "English", stimmName: "ryan", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-kristin-medium", path: "en/en_US/kristin/medium/en_US-kristin-medium.onnx", lang: "en_US", langName: "English", stimmName: "kristin", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-ljspeech-medium", path: "en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx", lang: "en_US", langName: "English", stimmName: "ljspeech", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-bryce-medium", path: "en/en_US/bryce/medium/en_US-bryce-medium.onnx", lang: "en_US", langName: "English", stimmName: "bryce", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-john-medium", path: "en/en_US/john/medium/en_US-john-medium.onnx", lang: "en_US", langName: "English", stimmName: "john", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-norman-medium", path: "en/en_US/norman/medium/en_US-norman-medium.onnx", lang: "en_US", langName: "English", stimmName: "norman", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-arctic-medium", path: "en/en_US/arctic/medium/en_US-arctic-medium.onnx", lang: "en_US", langName: "English", stimmName: "arctic", quality: "medium", sprecher: 18, mb: 73.2, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-l2arctic-medium", path: "en/en_US/l2arctic/medium/en_US-l2arctic-medium.onnx", lang: "en_US", langName: "English", stimmName: "l2arctic", quality: "medium", sprecher: 24, mb: 73.2, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-libritts_r-medium", path: "en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx", lang: "en_US", langName: "English", stimmName: "libritts_r", quality: "medium", sprecher: 904, mb: 74.9, phoneme: 159, espeak: "en-us", modern: true },
  { id: "en_US-lessac-high", path: "en/en_US/lessac/high/en_US-lessac-high.onnx", lang: "en_US", langName: "English", stimmName: "lessac", quality: "high", sprecher: 1, mb: 108.6, phoneme: 154, espeak: "en-us", modern: true },
  { id: "en_US-ljspeech-high", path: "en/en_US/ljspeech/high/en_US-ljspeech-high.onnx", lang: "en_US", langName: "English", stimmName: "ljspeech", quality: "high", sprecher: 1, mb: 108.9, phoneme: 157, espeak: "en", modern: true },
  { id: "en_US-ryan-high", path: "en/en_US/ryan/high/en_US-ryan-high.onnx", lang: "en_US", langName: "English", stimmName: "ryan", quality: "high", sprecher: 1, mb: 115.2, phoneme: 130, espeak: "en-us", modern: false },
  { id: "en_US-libritts-high", path: "en/en_US/libritts/high/en_US-libritts-high.onnx", lang: "en_US", langName: "English", stimmName: "libritts", quality: "high", sprecher: 904, mb: 130.3, phoneme: 130, espeak: "en-us", modern: false },
  { id: "es_ES-carlfm-x_low", path: "es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx", lang: "es_ES", langName: "Spanish", stimmName: "carlfm", quality: "x_low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "es", modern: false },
  { id: "es_ES-mls_10246-low", path: "es/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx", lang: "es_ES", langName: "Spanish", stimmName: "mls_10246", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "es", modern: false },
  { id: "es_ES-mls_9972-low", path: "es/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx", lang: "es_ES", langName: "Spanish", stimmName: "mls_9972", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "es", modern: false },
  { id: "es_ES-davefx-medium", path: "es/es_ES/davefx/medium/es_ES-davefx-medium.onnx", lang: "es_ES", langName: "Spanish", stimmName: "davefx", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "es", modern: true },
  { id: "es_ES-sharvard-medium", path: "es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx", lang: "es_ES", langName: "Spanish", stimmName: "sharvard", quality: "medium", sprecher: 2, mb: 73.2, phoneme: 154, espeak: "es", modern: true },
  { id: "es_MX-claude-high", path: "es/es_MX/claude/high/es_MX-claude-high.onnx", lang: "es_MX", langName: "Spanish", stimmName: "claude", quality: "high", sprecher: 1, mb: 60.2, phoneme: 157, espeak: "es-419", modern: true },
  { id: "es_MX-ald-medium", path: "es/es_MX/ald/medium/es_MX-ald-medium.onnx", lang: "es_MX", langName: "Spanish", stimmName: "ald", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "es-419", modern: true },
  { id: "fa_IR-gyro-medium", path: "fa/fa_IR/gyro/medium/fa_IR-gyro-medium.onnx", lang: "fa_IR", langName: "Farsi", stimmName: "gyro", quality: "medium", sprecher: 1, mb: 60.2, phoneme: 157, espeak: "fa", modern: true },
  { id: "fa_IR-amir-medium", path: "fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx", lang: "fa_IR", langName: "Farsi", stimmName: "amir", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "fa", modern: true },
  { id: "fi_FI-harri-medium", path: "fi/fi_FI/harri/medium/fi_FI-harri-medium.onnx", lang: "fi_FI", langName: "Finnish", stimmName: "harri", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "fi", modern: true },
  { id: "fi_FI-harri-low", path: "fi/fi_FI/harri/low/fi_FI-harri-low.onnx", lang: "fi_FI", langName: "Finnish", stimmName: "harri", quality: "low", sprecher: 1, mb: 66.6, phoneme: 130, espeak: "fi", modern: false },
  { id: "fr_FR-siwis-low", path: "fr/fr_FR/siwis/low/fr_FR-siwis-low.onnx", lang: "fr_FR", langName: "French", stimmName: "siwis", quality: "low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "fr", modern: false },
  { id: "fr_FR-gilles-low", path: "fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx", lang: "fr_FR", langName: "French", stimmName: "gilles", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "fr", modern: false },
  { id: "fr_FR-mls_1840-low", path: "fr/fr_FR/mls_1840/low/fr_FR-mls_1840-low.onnx", lang: "fr_FR", langName: "French", stimmName: "mls_1840", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "fr", modern: false },
  { id: "fr_FR-siwis-medium", path: "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx", lang: "fr_FR", langName: "French", stimmName: "siwis", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "fr", modern: true },
  { id: "fr_FR-tom-medium", path: "fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx", lang: "fr_FR", langName: "French", stimmName: "tom", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 157, espeak: "fr", modern: true },
  { id: "fr_FR-mls-medium", path: "fr/fr_FR/mls/medium/fr_FR-mls-medium.onnx", lang: "fr_FR", langName: "French", stimmName: "mls", quality: "medium", sprecher: 125, mb: 73.2, phoneme: 159, espeak: "fr", modern: true },
  { id: "fr_FR-upmc-medium", path: "fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx", lang: "fr_FR", langName: "French", stimmName: "upmc", quality: "medium", sprecher: 2, mb: 73.2, phoneme: 157, espeak: "fr", modern: true },
  { id: "hu_HU-anna-medium", path: "hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx", lang: "hu_HU", langName: "Hungarian", stimmName: "anna", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "hu", modern: true },
  { id: "hu_HU-berta-medium", path: "hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx", lang: "hu_HU", langName: "Hungarian", stimmName: "berta", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 157, espeak: "hu", modern: true },
  { id: "hu_HU-imre-medium", path: "hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx", lang: "hu_HU", langName: "Hungarian", stimmName: "imre", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 159, espeak: "hu", modern: true },
  { id: "is_IS-bui-medium", path: "is/is_IS/bui/medium/is_IS-bui-medium.onnx", lang: "is_IS", langName: "Icelandic", stimmName: "bui", quality: "medium", sprecher: 1, mb: 73.0, phoneme: 130, espeak: "is", modern: false },
  { id: "is_IS-salka-medium", path: "is/is_IS/salka/medium/is_IS-salka-medium.onnx", lang: "is_IS", langName: "Icelandic", stimmName: "salka", quality: "medium", sprecher: 1, mb: 73.0, phoneme: 130, espeak: "is", modern: false },
  { id: "is_IS-steinn-medium", path: "is/is_IS/steinn/medium/is_IS-steinn-medium.onnx", lang: "is_IS", langName: "Icelandic", stimmName: "steinn", quality: "medium", sprecher: 1, mb: 73.0, phoneme: 130, espeak: "is", modern: false },
  { id: "is_IS-ugla-medium", path: "is/is_IS/ugla/medium/is_IS-ugla-medium.onnx", lang: "is_IS", langName: "Icelandic", stimmName: "ugla", quality: "medium", sprecher: 1, mb: 73.0, phoneme: 130, espeak: "is", modern: false },
  { id: "it_IT-riccardo-x_low", path: "it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx", lang: "it_IT", langName: "Italian", stimmName: "riccardo", quality: "x_low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "it", modern: false },
  { id: "it_IT-paola-medium", path: "it/it_IT/paola/medium/it_IT-paola-medium.onnx", lang: "it_IT", langName: "Italian", stimmName: "paola", quality: "medium", sprecher: 1, mb: 60.6, phoneme: 154, espeak: "it", modern: true },
  { id: "ka_GE-natia-medium", path: "ka/ka_GE/natia/medium/ka_GE-natia-medium.onnx", lang: "ka_GE", langName: "Georgian", stimmName: "natia", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "ka", modern: true },
  { id: "kk_KZ-iseke-x_low", path: "kk/kk_KZ/iseke/x_low/kk_KZ-iseke-x_low.onnx", lang: "kk_KZ", langName: "Kazakh", stimmName: "iseke", quality: "x_low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "kk", modern: false },
  { id: "kk_KZ-raya-x_low", path: "kk/kk_KZ/raya/x_low/kk_KZ-raya-x_low.onnx", lang: "kk_KZ", langName: "Kazakh", stimmName: "raya", quality: "x_low", sprecher: 1, mb: 26.8, phoneme: 130, espeak: "kk", modern: false },
  { id: "kk_KZ-issai-high", path: "kk/kk_KZ/issai/high/kk_KZ-issai-high.onnx", lang: "kk_KZ", langName: "Kazakh", stimmName: "issai", quality: "high", sprecher: 6, mb: 121.9, phoneme: 130, espeak: "kk", modern: false },
  { id: "lb_LU-marylux-medium", path: "lb/lb_LU/marylux/medium/lb_LU-marylux-medium.onnx", lang: "lb_LU", langName: "Luxembourgish", stimmName: "marylux", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 157, espeak: "lb", modern: true },
  { id: "ne_NP-google-x_low", path: "ne/ne_NP/google/x_low/ne_NP-google-x_low.onnx", lang: "ne_NP", langName: "Nepali", stimmName: "google", quality: "x_low", sprecher: 18, mb: 26.4, phoneme: 130, espeak: "ne", modern: false },
  { id: "ne_NP-google-medium", path: "ne/ne_NP/google/medium/ne_NP-google-medium.onnx", lang: "ne_NP", langName: "Nepali", stimmName: "google", quality: "medium", sprecher: 18, mb: 73.2, phoneme: 154, espeak: "ne", modern: true },
  { id: "nl_BE-nathalie-x_low", path: "nl/nl_BE/nathalie/x_low/nl_BE-nathalie-x_low.onnx", lang: "nl_BE", langName: "Dutch", stimmName: "nathalie", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "nl", modern: false },
  { id: "nl_BE-rdh-x_low", path: "nl/nl_BE/rdh/x_low/nl_BE-rdh-x_low.onnx", lang: "nl_BE", langName: "Dutch", stimmName: "rdh", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "nl", modern: false },
  { id: "nl_BE-rdh-medium", path: "nl/nl_BE/rdh/medium/nl_BE-rdh-medium.onnx", lang: "nl_BE", langName: "Dutch", stimmName: "rdh", quality: "medium", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "nl", modern: false },
  { id: "nl_BE-nathalie-medium", path: "nl/nl_BE/nathalie/medium/nl_BE-nathalie-medium.onnx", lang: "nl_BE", langName: "Dutch", stimmName: "nathalie", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "nl", modern: true },
  { id: "nl_NL-mls_5809-low", path: "nl/nl_NL/mls_5809/low/nl_NL-mls_5809-low.onnx", lang: "nl_NL", langName: "Dutch", stimmName: "mls_5809", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "nl", modern: false },
  { id: "nl_NL-mls_7432-low", path: "nl/nl_NL/mls_7432/low/nl_NL-mls_7432-low.onnx", lang: "nl_NL", langName: "Dutch", stimmName: "mls_7432", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "nl", modern: false },
  { id: "nl_NL-mls-medium", path: "nl/nl_NL/mls/medium/nl_NL-mls-medium.onnx", lang: "nl_NL", langName: "Dutch", stimmName: "mls", quality: "medium", sprecher: 52, mb: 73.0, phoneme: 159, espeak: "nl", modern: true },
  { id: "no_NO-talesyntese-medium", path: "no/no_NO/talesyntese/medium/no_NO-talesyntese-medium.onnx", lang: "no_NO", langName: "Norwegian", stimmName: "talesyntese", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "nb", modern: true },
  { id: "pl_PL-mls_6892-low", path: "pl/pl_PL/mls_6892/low/pl_PL-mls_6892-low.onnx", lang: "pl_PL", langName: "Polish", stimmName: "mls_6892", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "pl", modern: false },
  { id: "pl_PL-darkman-medium", path: "pl/pl_PL/darkman/medium/pl_PL-darkman-medium.onnx", lang: "pl_PL", langName: "Polish", stimmName: "darkman", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "pl", modern: true },
  { id: "pl_PL-gosia-medium", path: "pl/pl_PL/gosia/medium/pl_PL-gosia-medium.onnx", lang: "pl_PL", langName: "Polish", stimmName: "gosia", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "pl", modern: true },
  { id: "pl_PL-mc_speech-medium", path: "pl/pl_PL/mc_speech/medium/pl_PL-mc_speech-medium.onnx", lang: "pl_PL", langName: "Polish", stimmName: "mc_speech", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 157, espeak: "pl", modern: true },
  { id: "pt_BR-edresson-low", path: "pt/pt_BR/edresson/low/pt_BR-edresson-low.onnx", lang: "pt_BR", langName: "Portuguese", stimmName: "edresson", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "pt-br", modern: false },
  { id: "pt_BR-faber-medium", path: "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx", lang: "pt_BR", langName: "Portuguese", stimmName: "faber", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "pt-br", modern: true },
  { id: "ro_RO-mihai-medium", path: "ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx", lang: "ro_RO", langName: "Romanian", stimmName: "mihai", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "ro", modern: true },
  { id: "ru_RU-denis-medium", path: "ru/ru_RU/denis/medium/ru_RU-denis-medium.onnx", lang: "ru_RU", langName: "Russian", stimmName: "denis", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "ru", modern: true },
  { id: "ru_RU-dmitri-medium", path: "ru/ru_RU/dmitri/medium/ru_RU-dmitri-medium.onnx", lang: "ru_RU", langName: "Russian", stimmName: "dmitri", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "ru", modern: true },
  { id: "ru_RU-irina-medium", path: "ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx", lang: "ru_RU", langName: "Russian", stimmName: "irina", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 151, espeak: "ru", modern: true },
  { id: "ru_RU-ruslan-medium", path: "ru/ru_RU/ruslan/medium/ru_RU-ruslan-medium.onnx", lang: "ru_RU", langName: "Russian", stimmName: "ruslan", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "ru", modern: true },
  { id: "sk_SK-lili-medium", path: "sk/sk_SK/lili/medium/sk_SK-lili-medium.onnx", lang: "sk_SK", langName: "Slovak", stimmName: "lili", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 157, espeak: "sk", modern: true },
  { id: "sl_SI-artur-medium", path: "sl/sl_SI/artur/medium/sl_SI-artur-medium.onnx", lang: "sl_SI", langName: "Slovenian", stimmName: "artur", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 157, espeak: "sl", modern: true },
  { id: "sr_RS-serbski_institut-medium", path: "sr/sr_RS/serbski_institut/medium/sr_RS-serbski_institut-medium.onnx", lang: "sr_RS", langName: "Serbian", stimmName: "serbski_institut", quality: "medium", sprecher: 2, mb: 73.2, phoneme: 157, espeak: "sr", modern: true },
  { id: "sv_SE-nst-medium", path: "sv/sv_SE/nst/medium/sv_SE-nst-medium.onnx", lang: "sv_SE", langName: "Swedish", stimmName: "nst", quality: "medium", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "sv", modern: false },
  { id: "sw_CD-lanfrica-medium", path: "sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx", lang: "sw_CD", langName: "Swahili", stimmName: "lanfrica", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "sw", modern: true },
  { id: "tr_TR-dfki-medium", path: "tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx", lang: "tr_TR", langName: "Turkish", stimmName: "dfki", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "tr", modern: true },
  { id: "uk_UA-lada-x_low", path: "uk/uk_UA/lada/x_low/uk_UA-lada-x_low.onnx", lang: "uk_UA", langName: "Ukrainian", stimmName: "lada", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "uk", modern: false },
  { id: "uk_UA-ukrainian_tts-medium", path: "uk/uk_UA/ukrainian_tts/medium/uk_UA-ukrainian_tts-medium.onnx", lang: "uk_UA", langName: "Ukrainian", stimmName: "ukrainian_tts", quality: "medium", sprecher: 3, mb: 73.2, phoneme: 49, espeak: "uk", modern: false },
  { id: "vi_VN-vivos-x_low", path: "vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx", lang: "vi_VN", langName: "Vietnamese", stimmName: "vivos", quality: "x_low", sprecher: 65, mb: 26.5, phoneme: 130, espeak: "vi", modern: false },
  { id: "vi_VN-25hours_single-low", path: "vi/vi_VN/25hours_single/low/vi_VN-25hours_single-low.onnx", lang: "vi_VN", langName: "Vietnamese", stimmName: "25hours_single", quality: "low", sprecher: 1, mb: 60.2, phoneme: 130, espeak: "vi", modern: false },
  { id: "vi_VN-vais1000-medium", path: "vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx", lang: "vi_VN", langName: "Vietnamese", stimmName: "vais1000", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 154, espeak: "vi", modern: true },
  { id: "zh_CN-huayan-x_low", path: "zh/zh_CN/huayan/x_low/zh_CN-huayan-x_low.onnx", lang: "zh_CN", langName: "Chinese", stimmName: "huayan", quality: "x_low", sprecher: 1, mb: 19.7, phoneme: 130, espeak: "cmn", modern: false },
  { id: "zh_CN-huayan-medium", path: "zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx", lang: "zh_CN", langName: "Chinese", stimmName: "huayan", quality: "medium", sprecher: 1, mb: 60.3, phoneme: 152, espeak: "cmn", modern: true },];

export function voicesFuerSprache(langPrefix: string): PiperVoice[] {
  const p = (langPrefix || 'de').toLowerCase().slice(0, 2);
  const treffer = PIPER_VOICES.filter((v) => v.lang.toLowerCase().startsWith(p));
  return (treffer.length > 0 ? treffer : PIPER_VOICES.filter((v) => v.lang.startsWith('en'))).slice().sort((a, b) => a.mb - b.mb);
}

export function voiceById(id: string): PiperVoice | undefined {
  return PIPER_VOICES.find((v) => v.id === id);
}

export function alleSprachen(): { lang: string; langName: string; anzahl: number; modern: number }[] {
  const m = new Map<string, { lang: string; langName: string; anzahl: number; modern: number }>();
  for (const v of PIPER_VOICES) {
    const e = m.get(v.lang) || { lang: v.lang, langName: v.langName, anzahl: 0, modern: 0 };
    e.anzahl += 1;
    if (v.modern) e.modern += 1;
    m.set(v.lang, e);
  }
  return [...m.values()].sort((a, b) => a.langName.localeCompare(b.langName));
}

/** Empfehlung je Sprache: günstige und beste moderne Stimme */
export function empfehlungen(langPrefix: string): { leicht?: PiperVoice; beste?: PiperVoice } {
  const moderne = voicesFuerSprache(langPrefix).filter((v) => v.modern);
  if (moderne.length === 0) return {};
  const sortiert = [...moderne].sort((a, b) => a.mb - b.mb);
  const beste = [...moderne].filter((v) => v.quality === 'medium' || v.quality === 'high').sort((a, b) => b.mb - a.mb)[0];
  return { leicht: sortiert[0], beste: beste || sortiert[sortiert.length - 1] };
}
