import "./globals.css";
import { GeistSans } from "geist/font/sans";

const portfolioWebsiteUrl = "https://soorajrao.in?ref=remove-bg-seo";
const websiteUrl = "https://bgremover.soorajrao.in?ref=remove-bg-seo";
const appName = "Image Background Remover";
const ogImageUrl = "https://bgremover.soorajrao.in/home.png";

export const metadata = {
  title: `${appName} - Remove Background from Photos Instantly!`,
  description:
    "Effortlessly remove the background from any image in seconds. Free and fast online tool. No sign-ups, no hassle—just a clean image!",
  keywords: [
    "remove background from photo",
    "background remover online",
    "free background removal tool",
    "fast photo background tool",
    "image background eraser",
    "remove image background free",
    "instant background remover",
    "AI-powered background removal",
    "remove photo background instantly",
    "best background remover online",
    "image background tool",
    "free online background eraser",
    "background transparency tool",
    "background removal in seconds",
  ].join(", "),
  authors: [{ name: "Sooraj Rao", url: portfolioWebsiteUrl }],
  robots: "index, follow",
  openGraph: {
    title: `${appName} - Remove Background from Photos Instantly!`,
    description:
      "Need to remove the background from your images in seconds? Use our fast and free online tool—no hassle, no sign-ups required!",
    url: websiteUrl,
    siteName: appName,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "Remove Background Example",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Remove Background from Photos Instantly!`,
    description:
      "Easily remove backgrounds from your images in seconds. Try it now with the fastest and most accurate tool—free!",
    images: [ogImageUrl],
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: appName,
    description:
      "A free and fast tool to remove backgrounds from images instantly with no sign-ups required.",
    url: websiteUrl,
    image: ogImageUrl,
    author: {
      "@type": "Person",
      name: "Sooraj Rao",
      url: portfolioWebsiteUrl,
    },
    sameAs: [
      portfolioWebsiteUrl,
      "https://twitter.com/SoorajRaoo",
      "https://linkedin.com/in/sooraj-rao",
    ],
    potentialAction: {
      "@type": "Action",
      target: websiteUrl,
      actionApplication: "Remove Background from Photos",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="robots" content={metadata.robots} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Twitter Cards */}
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(metadata.structuredData),
          }}
        />
      </head>
      <body className={`${GeistSans.className}`}>
        <>
          {children}
          <footer className="w-full text-sm md:hidden text-center py-4 bg-gray-100 bg-opacity-80 backdrop-blur-sm">
            <p>
              Developed by{" "}
              <a
                href="https://soorajrao.in?ref=remove-bg"
                className="text-pink-600 hover:underline"
              >
                Sooraj
              </a>
            </p>
          </footer>
        </>
      </body>
    </html>
  );
}
