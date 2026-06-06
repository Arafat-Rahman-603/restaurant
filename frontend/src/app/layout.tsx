import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Takeout Dhanmondi — Premium Fast Food Delivery",
    template: "%s | Takeout Dhanmondi",
  },
  description:
    "Order the best burgers, fried chicken, combos and more from Takeout Dhanmondi. Fast delivery to your doorstep in Dhanmondi and surrounding areas.",
  keywords: ["takeout", "dhanmondi", "burger", "fried chicken", "food delivery", "fast food", "bangladesh"],
  authors: [{ name: "Takeout Dhanmondi" }],
  openGraph: {
    type: "website",
    siteName: "Takeout Dhanmondi",
    title: "Takeout Dhanmondi — Premium Fast Food Delivery",
    description: "Order the best fast food in Dhanmondi. Fresh, hot and delivered fast.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid #2A2A2A',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#FF6B00', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#E63946', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
