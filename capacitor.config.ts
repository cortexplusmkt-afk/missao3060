import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cortexplus.missao3060',
  appName: 'MISSÃO 30-60',
  webDir: 'dist',
  backgroundColor: '#03070a',
  android: {
    allowMixedContent: false,
    backgroundColor: '#03070a'
  }
};

export default config;
