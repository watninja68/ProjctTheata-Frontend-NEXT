import { AuthProvider } from "@/hooks/useAuth";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css"; // We will create this file
import "../App.css";     // Your main app styles

// This replaces the <head> section of public/index.html
export const metadata = {
  title: "Project Theata",
  description: "Project Theata - Gemini Live Agent Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AnalyticsTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
