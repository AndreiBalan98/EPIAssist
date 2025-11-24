/**
 * Splash screen - shows for 1s then fades out.
 */
import { useEffect, useState } from 'react';

export const SplashScreen = () => {
  const [opacity, setOpacity] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Wait 1s then start fade
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, 1000);

    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 1500); // 1s wait + 0.5s fade

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500"
      style={{ opacity }}
    >
      <h1 className="text-black">
        <span className="text-5xl md:text-8xl font-bold">EPI</span>{' '}
        <span className="text-5xl md:text-8xl font-normal italic">Assist</span>
      </h1>
    </div>
  );
};