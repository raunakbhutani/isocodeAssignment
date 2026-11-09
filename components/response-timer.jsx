"use client";

import { useEffect, useState } from "react";

export default function ResponseTimer({ receivedAt }) {
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    function updateElapsedTime() {
      setMinutes(Math.max(0, Math.floor((Date.now() - new Date(receivedAt).getTime()) / 60000)));
    }

    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 60000);
    return () => clearInterval(intervalId);
  }, [receivedAt]);

  return <>{minutes === null ? "Calculating response time..." : `${minutes} min since receipt`}</>;
}
