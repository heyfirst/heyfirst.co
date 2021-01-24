import React from "react"

const font =
  "https://fonts.googleapis.com/css2?family=Lora:ital@0;1&family=Sarabun:ital,wght@0,400;0,600;1,400;1,600&display=swap"
// Lora 400, Sarabun 400,600

const HTML: React.FC = (props: any) => (
  <html {...props.htmlAttributes}>
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preload" href={font} as="fetch" crossOrigin="anonymous" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          !function(e,n,t){"use strict";var o="${font}",r="__3perf_googleFonts_c1b81";function c(e){(n.head||n.body).appendChild(e)}function a(){var e=n.createElement("link");e.href=o,e.rel="stylesheet",c(e)}function f(e){if(!n.getElementById(r)){var t=n.createElement("style");t.id=r,c(t)}n.getElementById(r).innerHTML=e}e.FontFace&&e.FontFace.prototype.hasOwnProperty("display")?(t[r]&&f(t[r]),fetch(o).then(function(e){return e.text()}).then(function(e){return e.replace(/@font-face {/g,"@font-face{font-display:swap;")}).then(function(e){return t[r]=e}).then(f).catch(a)):a()}(window,document,localStorage);
          `,
        }}
      />
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-3TZ47KP0Q7"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3TZ47KP0Q7');`,
        }}
      />
      {props.headComponents}
    </head>
    <body {...props.bodyAttributes}>
      {props.preBodyComponents}
      <div
        key={`body`}
        id="___gatsby"
        dangerouslySetInnerHTML={{ __html: props.body }}
      />
      {props.postBodyComponents}
    </body>
  </html>
)

export default HTML
