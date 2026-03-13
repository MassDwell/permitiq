import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MeritLayer - AI-Powered Construction Compliance",
  description:
    "Never miss a permit deadline again. AI-powered document intelligence for construction compliance.",
  keywords: [
    "construction permits",
    "compliance management",
    "permit tracking",
    "deadline management",
    "document intelligence",
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MeritLayer',
  },
  openGraph: {
    title: "MeritLayer - AI-Powered Construction Compliance",
    description: "Never miss a permit deadline again. AI-powered document intelligence for construction compliance in Greater Boston.",
    url: "https://meritlayer.ai",
    siteName: "MeritLayer",
    images: [
      {
        url: "https://meritlayer.ai/logo-mark.jpg",
        width: 1200,
        height: 630,
        alt: "MeritLayer - AI Permit & Compliance Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeritLayer - AI-Powered Construction Compliance",
    description: "Never miss a permit deadline again. AI-powered document intelligence for construction compliance.",
    images: ["https://meritlayer.ai/logo-mark.jpg"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#14B8A6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorBackground: '#0A0F1E',
          colorInputBackground: '#111827',
          colorInputText: '#F9FAFB',
          colorText: '#F9FAFB',
          colorTextSecondary: '#9CA3AF',
          colorPrimary: '#14B8A6',
          colorDanger: '#EF4444',
          borderRadius: '0.5rem',
        },
        elements: {
          card: 'bg-[#111827] border border-white/10 shadow-2xl',
          headerTitle: 'text-white',
          socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
          formFieldInput: 'bg-[#111827] border-white/10 text-white',
          footerActionLink: 'text-teal-400',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${jakarta.variable} font-sans antialiased`} style={{ background: '#080D1A', color: '#F1F5F9' }}>
          <TRPCProvider>
            {children}
            <Toaster />
            <PWARegister />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
