import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function configureNotifications() {
  if (!Capacitor.isNativePlatform()) return false;
  let perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') return false;

  await LocalNotifications.cancel({
    notifications: [101, 102, 103, 104, 105, 106, 107, 108].map(id => ({ id }))
  }).catch(() => {});

  const notifications = [
    { id: 101, title: 'MISSÃO 30-60', body: '05:00. A cidade ainda dorme. Você não.', h: 5, m: 0 },
    { id: 102, title: 'HIDRATAÇÃO', body: 'Primeira garrafa. 800 ml. Começa agora.', h: 7, m: 30 },
    { id: 103, title: 'SEM DESCULPA', body: 'Já devia estar na segunda garrafa.', h: 9, m: 20 },
    { id: 104, title: 'MENTE', body: '10 páginas. Dale Carnegie não vai se ler sozinho.', h: 12, m: 5 },
    { id: 105, title: 'HIDRATAÇÃO', body: 'Terceira garrafa. Proteja a ofensiva.', h: 14, m: 10 },
    { id: 106, title: 'TROCA DE PERSONAGEM', body: '17:00. O expediente acabou. Agora começa sua vida.', h: 17, m: 5 },
    { id: 107, title: 'CORPO', body: 'Treino. A barriga não negocia a própria saída.', h: 19, m: 0 },
    { id: 108, title: 'CORTEX+', body: '60 minutos. Sua empresa não vai construir a si mesma.', h: 20, m: 30 }
  ].map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    schedule: { on: { hour: n.h, minute: n.m }, allowWhileIdle: true },
    isExactNotification: false,
    extra: { source: 'mission' }
  }));

  await LocalNotifications.schedule({ notifications });
  return true;
}
