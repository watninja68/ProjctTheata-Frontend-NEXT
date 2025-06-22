"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaCrown,
  FaTrash,
  FaEdit,
  FaSpinner,
  FaCommentDots,
} from "react-icons/fa";
import ChatService from "../services/chatService";
import { useAuth } from "../hooks/useAuth";
import "./ChatList.css";

const ChatList = ({ 
  onChatSelect, 
  selectedChatId, 
  chats = [], 
  loading = false, 
  error = null,
  onChatsUpdate 
}) => {
  const { user } = useAuth();
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleDeleteChat = async (idOfChatToDelete, event) => {
    event.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      await ChatService.deleteChat(idOfChatToDelete, user.id);
      const remainingChats = chats.filter((c) => c.id !== idOfChatToDelete);
      onChatsUpdate(remainingChats);
      
      if (selectedChatId === idOfChatToDelete) {
        onChatSelect(remainingChats.length > 0 ? remainingChats[0] : null);
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      alert(`Failed to delete chat: ${err.message}`);
    }
  };

  const handleUpdateChat = async (chatId, event) => {
    event.stopPropagation();
    if (!editTitle.trim()) {
        setEditingChatId(null);
        return;
    }
    try {
      await ChatService.updateChat(chatId, { title: editTitle, user_id: user.id });
      const updatedChats = chats.map(c => 
        c.id === chatId ? {...c, title: editTitle} : c
      );
      onChatsUpdate(updatedChats);
      setEditingChatId(null);
    } catch (err) {
      console.error("Failed to update chat:", err);
      alert(`Failed to update chat: ${err.message}`);
    }
  };

  const startEditing = (chat, event) => {
    event.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };
  
  const handleEditKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
        handleUpdateChat(chatId, e);
    } else if (e.key === 'Escape') {
        setEditingChatId(null);
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="chat-list-loading">
          <FaSpinner className="fa-spin" />
          <span>Loading conversations...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="chat-list-error">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (chats.length === 0) {
      return (
        <div className="empty-chat-list">
          <FaCommentDots size={30} />
          <p>No chats yet.</p>
          <p>Click the '+' button to start a new conversation.</p>
        </div>
      );
    }

    return chats.map((chat) => (
      <div
        key={chat.id}
        className={`chat-item ${selectedChatId === chat.id ? "selected" : ""}`}
        onClick={() => onChatSelect(chat)}
      >
        <div className="chat-item-header">
          {editingChatId === chat.id ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={(e) => handleUpdateChat(chat.id, e)}
              onKeyDown={(e) => handleEditKeyDown(e, chat.id)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="edit-chat-input"
            />
          ) : (
            <>
              {chat.user_role === "owner" && <FaCrown className="owner-icon" title="You are the owner of this chat" />}
              <h4 className="chat-title">{chat.title}</h4>
            </>
          )}

          <div className="chat-item-actions">
            <button className="chat-action-btn" onClick={(e) => startEditing(chat, e)} title="Rename chat">
              <FaEdit />
            </button>
            {chat.user_role === "owner" && (
              <button className="chat-action-btn delete-btn" onClick={(e) => handleDeleteChat(chat.id, e)} title="Delete chat">
                <FaTrash />
              </button>
            )}
          </div>
        </div>

        <div className="chat-item-footer">
          <div className="last-message-preview">
            {chat.last_message ? (
              <span>{chat.last_message.speaker}: {chat.last_message.text}</span>
            ) : (
              <span>No messages yet</span>
            )}
          </div>
          <div className="last-message-time">
            {formatLastMessageTime(chat.updated_at)}
          </div>
        </div>
      </div>
    ));
  };
  
  return renderContent();
};

export default ChatList;