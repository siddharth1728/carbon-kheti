import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.dosa.carbonkheti',
  appName: 'Carbon Kheti',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false, // Strict release hygiene - cleartext disabled in production
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a3c2a',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
};

export default config;
