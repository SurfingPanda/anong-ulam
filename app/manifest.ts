import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anong Ulam? — Budget dish generator",
    short_name: "Anong Ulam?",
    description:
      "Ilagay ang budget mo sa piso at bibigyan ka ng mga ulam na kaya ng bulsa — kasama ang listahan ng sangkap at presyo.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFBF7",
    theme_color: "#C84B31",
    lang: "fil",
    dir: "ltr",
    categories: ["food", "lifestyle", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      {
        name: "Hanap ng ₱100 ulam",
        short_name: "₱100",
        url: "/?b=100&source=pwa",
      },
      {
        name: "Hanap ng ₱300 ulam",
        short_name: "₱300",
        url: "/?b=300&source=pwa",
      },
    ],
  };
}
