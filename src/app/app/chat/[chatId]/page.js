"use client";

import ChatView from "@/components/ChatView";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useParams } from "next/navigation";

export default function ChatPage() {
    const { user, session } = useAuth();
    const { settings, getGeminiConfig, getWebsocketUrl } = useSettings();
    const params = useParams(); // Next.js hook to get { chatId: '...' }
    const chatId = params.chatId;

    // The key prop is essential to force a re-mount when the chatId changes,
    // which resets the component's internal state (like message history).
    return (
        <ChatView
            key={chatId}
            chatId={chatId}
            user={user}
            session={session}
            settings={settings}
            getGeminiConfig={getGeminiConfig}
            getWebsocketUrl={getWebsocketUrl}
            onConnectionChange={() => {}} // This can be managed by a global state/context if needed elsewhere
        />
    );
}
