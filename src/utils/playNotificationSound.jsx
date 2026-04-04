export default (audioRef) => {
  if (audioRef.current) {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      console.warn("Notification blocked by browser until user interaction.");
    });
  }
};
  