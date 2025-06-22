"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaStroopwafel, FaCog, FaSignOutAlt, FaUserCircle, FaSun, FaMoon,
  FaBars, FaAngleDoubleLeft
} from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import ChatList from "@/components/ChatList";
import SettingsDialog from "@/components/SettingsDialog";
import BackgroundTaskManager from "@/components/BackgroundTaskManager";
import TutorModePanel from "@/components/TutorModePanel";
import Collapsible from "@/components/Collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import ChatService from "@/services/chatService";

export default function AppLayout({ children }) {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const { 
    settings, 
    isSettingsOpen, 
    openSettings, 
    closeSettings, 
    theme, 
    toggleTheme 
  } = useSettings();
  const router = useRouter();
  const pathname = usePathname();

  // Extract chatId from pathname if it exists
  const chatId = pathname.includes('/app/chat/') ? pathname.split('/').pop() : null;

  // State management
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState(null);
  const [isTutorModeOpen, setIsTutorModeOpen] = useState(false);
  const [getWhiteboardFrame, setGetWhiteboardFrame] = useState(null);

  // Refs
  const profileMenuRef = useRef(null);

  // Load chats
  const loadChats = useCallback(async () => {
    if (!user) {
      setChatsLoading(false);
      return;
    }
    
    try {
      setChatsLoading(true);
      setChatsError(null);
      const response = await ChatService.getChats(user.id);
      const fetchedChats = response.chats || [];
      setChats(fetchedChats);
    } catch (err) {
      console.error("Failed to load chats:", err);
      setChatsError(err.message);
    } finally {
      setChatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    const path = chat ? `/app/chat/${chat.id}` : '/app';
    router.push(path);
  };

  // Handle chat creation
  const handleCreateChat = async () => {
    if (!user) return;
    
    try {
      const chatData = {
        title: `New Chat ${new Date().toLocaleString()}`,
        user_id: user.id,
      };
      
      const response = await ChatService.createChat(chatData);
      const newChat = response.chat;
      
      // Update chats list
      setChats(prev => [newChat, ...prev]);
      
      // Navigate to new chat
      router.push(`/app/chat/${newChat.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert(`Failed to create chat: ${error.message}`);
    }
  };

  // Handle profile menu
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return user.user_metadata?.full_name || user.email || "User";
  };

  // Tutor mode handlers
  const handleOpenTutorMode = () => {
    setIsTutorModeOpen(true);
  };

  const handleCloseTutorMode = () => {
    setIsTutorModeOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-section">
            <FaStroopwafel size={24} />
            <span>Project Theta</span>
          </div>
        </div>
        
        <div className="header-right">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          
          <button
            onClick={openSettings}
            className="settings-btn"
            title="Open Settings"
          >
            <FaCog />
          </button>
          
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              onClick={toggleProfileMenu}
              className="profile-menu-btn"
              title="Profile Menu"
            >
              <FaUserCircle />
            </button>
            
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-item">
                  <FaUserCircle />
                  <span>{getUserDisplayName()}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="profile-dropdown-item danger"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className={`conversation-history-sidebar ${isLeftSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="chat-list-header">
            <h4>Conversations</h4>
            <button 
              onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
              className="sidebar-toggle-btn" 
              title={isLeftSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isLeftSidebarCollapsed ? <FaBars size={20} /> : <FaAngleDoubleLeft size={24} />}
            </button>
          </div>

          <hr className="sidebar-separator" />

          <button onClick={handleCreateChat} className="new-conversation-btn" disabled={chatsLoading}>
            <IoIosAdd size={20} style={{ marginRight: '0.7rem' }} />
            <span>New Conversation</span>
          </button>

          <div className="conv-history-list">
            <ChatList
              selectedChatId={chatId}
              onCreateChat={handleCreateChat}
              onChatSelect={handleSelectChat}
              isCollapsed={isLeftSidebarCollapsed}
              toggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
              chats={chats}
              loading={chatsLoading}
              error={chatsError}
              onChatsUpdate={setChats}
            />
          </div>

          {/* Collapsible sections in sidebar */}
          <div style={{ padding: '1rem' }}>
            <Collapsible title="Background Agent" startOpen={false}>
              <BackgroundTaskManager />
            </Collapsible>
          </div>
        </div>

        <div className="center-and-right-content">
          {children}
        </div>
      </main>

      <footer className="app-footer" />

      {/* Modals and Dialogs */}
      {isSettingsOpen && (
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          initialSettings={settings}
          onSave={() => {}} // Handled by useSettings
          thresholds={{}}
        />
      )}

      {isTutorModeOpen && (
        <TutorModePanel
          isVisible={isTutorModeOpen}
          onClose={handleCloseTutorMode}
          getWhiteboardFrame={setGetWhiteboardFrame}
        />
      )}
    </div>
  );
}