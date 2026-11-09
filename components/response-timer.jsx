"use client";

import { useEffect, useState } from "react";

export default function ResponseTimer({ receivedAt, firstRespondedAt }) {
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    function updateElapsedTime() {
      setMinutes(Math.max(0, Math.floor((Date.now() - new Date(receivedAt).getTime()) / 60000)));
    }

    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 60000);
    return () => clearInterval(intervalId);
  }, [receivedAt]);

  if (firstRespondedAt) return <>Responded within {Math.max(0, Math.floor((new Date(firstRespondedAt).getTime() - new Date(receivedAt).getTime()) / 60000))} min</>;
  if (minutes === null) return <>Calculating response time...</>;
  if (minutes >= 5) return <>Response target exceeded · {minutes} min</>;
  return <>Target: 5 min · {5 - minutes} min remaining</>;
}
