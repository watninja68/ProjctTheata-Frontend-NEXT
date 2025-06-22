"use client";

import { useAuth } from "@/hooks/useAuth";
import { FaPlus } from "react-icons/fa";

export default function AppRootPage() {
    const { user } = useAuth();

    // The creation logic is now in the layout, so this button would call a function passed via context or props.
    // For now, we'll keep it simple. The button in the ChatList is the primary way.
    const getUserDisplayName = () => {
        if (!user) return "Guest";
        return user.user_metadata?.full_name || user.email || "User";
    };

    return (
        <div className="chat-area">
            <div className="chat-history">
                <div className="connect-prompt-container" style={{ margin: 'auto' }}>
                    <h3>Welcome, {getUserDisplayName()}!</h3>
                    <p>Select a chat from the sidebar or create a new one.</p>
                </div>
            </div>
        </div>
    );
}
