'use client'
import Script from 'next/script'

export default function LiveChat() {
  return (
    <Script
      id="crisp-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.$crisp = [];
          window.CRISP_WEBSITE_ID = "votre-crisp-id";
          (function() {
            var d = document;
            var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js";
            s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `,
      }}
    />
  )
}
