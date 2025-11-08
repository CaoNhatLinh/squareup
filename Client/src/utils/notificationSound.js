// Simple notification beep generator
// This creates a short beep sound as a fallback when notification.mp3 is not available

export const generateNotificationBeep = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configure the beep sound
  oscillator.type = 'sine'; // Smooth sine wave
  oscillator.frequency.value = 800; // 800 Hz frequency
  
  // Set volume
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  // Play the beep
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);

  return audioContext;
};

// Function to play notification sound with fallback
export const playNotificationSound = async (audioElement) => {
  try {
    // Try to play the audio file first
    await audioElement.play();
  } catch (error) {
    console.warn('Failed to play notification.mp3, using fallback beep:', error);
    // Use fallback beep if audio file fails
    try {
      generateNotificationBeep();
    } catch (beepError) {
      console.warn('Failed to generate beep sound:', beepError);
    }
  }
};
