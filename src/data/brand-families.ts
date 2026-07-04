// dominios del mismo dueño: mencionar una marca hermana en un dominio de la
// familia es legítimo (p. ej. "Gmail" en google.com)
export const BRAND_FAMILIES: readonly (readonly string[])[] = [
  ['google.com', 'youtube.com', 'gmail.com', 'googlemail.com', 'android.com', 'goo.gl'],
  ['microsoft.com', 'office.com', 'live.com', 'outlook.com', 'hotmail.com', 'msn.com', 'bing.com', 'skype.com', 'xbox.com'],
  ['facebook.com', 'instagram.com', 'whatsapp.com', 'messenger.com', 'meta.com', 'fb.com'],
  ['apple.com', 'icloud.com', 'me.com'],
  ['amazon.com', 'primevideo.com', 'aws.amazon.com'],
];
