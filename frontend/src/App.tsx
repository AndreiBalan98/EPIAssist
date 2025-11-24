/**
 * Root application component.
 */
import { useState, useEffect } from 'react';
import { SplashScreen } from '@components/SplashScreen';
import { Home } from './pages/Home';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 1.5s
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <Home />
    </>
  );
}

export default App;