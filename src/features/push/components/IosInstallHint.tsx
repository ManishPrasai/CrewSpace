"use client";

import { useEffect, useState } from "react";

// iOS only delivers web push to a PWA that's been added to the home
// screen (Safari 16.4+) - there's no permission prompt otherwise, it
// just silently doesn't work. navigator.standalone is iOS Safari's own
// non-standard flag for "launched from the home screen".
export function IosInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    setShow(isIos && !isStandalone);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      To get notifications on iPhone, first add Crewspace to your home screen: tap the Share icon, then
      &quot;Add to Home Screen&quot;.
    </p>
  );
}
