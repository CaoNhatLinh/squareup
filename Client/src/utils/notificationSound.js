export const generateNotificationBeep = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine'; // Smooth sine wave
  oscillator.frequency.value = 800; // 800 Hz frequency
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);

  return audioContext;
};

export const playNotificationSound = async (audioElement) => {
  try {
    await audioElement.play();
  } catch (error) {
    console.warn('Failed to play notification.mp3, using fallback beep:', error);
    try {
      generateNotificationBeep();
    } catch (beepError) {
      console.warn('Failed to generate beep sound:', beepError);
    }
  }
};
