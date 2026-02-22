import { useState, useEffect } from 'react';

const blockedSites = [
  'youtube.com',
  'instagram.com',
  'facebook.com',
  'x.com',
  'twitter.com',
  'whatsapp.com',
];

export function useSiteBlocker(isActive: boolean) {
  const [blockedSiteDetected, setBlockedSiteDetected] = useState(false);
  const [blockedSiteName, setBlockedSiteName] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setBlockedSiteDetected(false);
      return;
    }

    // Check if user tries to navigate to blocked sites
    // Note: This is a simulation - actual blocking requires browser extension
    const checkInterval = setInterval(() => {
      // Simulate blocked site detection (very rare in this context)
      const isBlocked = Math.random() > 0.99;
      if (isBlocked) {
        const site = blockedSites[Math.floor(Math.random() * blockedSites.length)];
        setBlockedSiteName(site);
        setBlockedSiteDetected(true);
        setRemainingTime(1500); // 25 minutes
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isActive]);

  return {
    blockedSiteDetected,
    blockedSiteName,
    remainingTime,
  };
}
