import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Threadflank — Try anything. Wear everything.",
  description: "Build your digital twin, fill your virtual wardrobe, and AI try-on any outfit from any store before you buy it.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              document.documentElement.setAttribute('data-theme', 'dark');
            } catch (e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function clean(node) {
                  if (!node || !node.removeAttribute || !node.attributes) return;
                  for (var i = node.attributes.length - 1; i >= 0; i--) {
                    var name = node.attributes[i].name;
                    if (name && (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0)) {
                      node.removeAttribute(name);
                    }
                  }
                }
                clean(document.documentElement);
                clean(document.body);
                var observer = new MutationObserver(function(mutations) {
                  for (var m = 0; m < mutations.length; m++) {
                    var mutation = mutations[m];
                    if (mutation.type === 'attributes') {
                      var name = mutation.attributeName;
                      if (name && (name.indexOf('bis_') === 0 || name.indexOf('__processed_') === 0)) {
                        mutation.target.removeAttribute(name);
                      }
                    } else if (mutation.type === 'childList') {
                      for (var n = 0; n < mutation.addedNodes.length; n++) {
                        var node = mutation.addedNodes[n];
                        if (node.nodeType === 1) {
                          clean(node);
                          var children = node.getElementsByTagName('*');
                          for (var c = 0; c < children.length; c++) {
                            clean(children[c]);
                          }
                        }
                      }
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true
                });
              })();
            `
          }}
        />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
