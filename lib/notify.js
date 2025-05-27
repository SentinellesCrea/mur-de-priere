export function playNotificationSound() {
  const audio = new Audio("/sounds/notification.wav");
  audio.volume = 1; // volume max
  audio.play().catch(() => {
    // Certains navigateurs bloquent autoplay sans interaction utilisateur
  });
}

export function vibrateMobile(duration = 150) {
  if (typeof window !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration); // 150ms par défaut
  }
}
