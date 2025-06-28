// ✅ /src/components/LiveChat.js (live chat Crisp gratuit, bonus support)
'use client';

import { useEffect } from 'react';

export default function LiveChat() {
  useEffect(() => {
    if (window.$crisp) return;
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "YOUR_CRISP_ID";
    const d = document;
    const s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    d.getElementsByTagName("head")[0].appendChild(s);
  }, []);
  return null;
}
