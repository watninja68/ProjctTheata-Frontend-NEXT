import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";
import "./App.css";

export const metadata = {
  title: "Project Theta",
  description: "Project Theta - Gemini Live Agent Interface",
  icons: {
    icon: "/theta-logo.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <AnalyticsTracker />
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}