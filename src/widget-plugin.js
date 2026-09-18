import { Capacitor, registerPlugin } from '@capacitor/core';

const NativeWidget = registerPlugin('MissaoWidget');

export async function syncWidget(payload) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await NativeWidget.saveState(payload);
  } catch (error) {
    console.warn('Widget sync indisponível:', error);
  }
}
