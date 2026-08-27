import React, { useState } from 'react';
import {
  Mic,
  AudioWaveform,
  Library,
  FolderHeart,
  History,
  ShieldAlert,
  Sparkles,
  User,
  ChevronDown,
  Plus,
  Check,
  Zap,
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentTab: 'library' | 'my_voices' | 'tts' | 'history' | 'admin';
  onSelectTab: (tab: 'library' | 'my_voices' | 'tts' | 'history' | 'admin') => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  onOpenCloneModal: () => void;
  myVoicesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenCloneModal,
  myVoicesCount,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems: { id: 'library' | 'my_voices' | 'tts' | 'history' | 'admin'; label: string; icon: any; count?: number; badge?: string }[] = [
    { id: 'library', label: 'Voice Library', icon: Library },
    { id: 'my_voices', label: 'My Voices', icon: FolderHeart, count: myVoicesCount },
    { id: 'tts', label: 'Text to Speech', icon: Mic, badge: 'Main' },
    { id: 'history', label: 'Generation History', icon: History },
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldAlert, badge: currentUser.role === 'admin' ? 'Admin' : 'Manage' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <div
            id="brand-logo-btn"
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1c1c1c] via-[#262626] to-[#171717] border border-[#333333] text-amber-400 flex items-center justify-center shadow-md group-hover:border-amber-500/40 transition-all">
              <AudioWaveform className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-white text-base tracking-tight">
                  VoiceNova
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#1c1917] text-amber-400 border border-amber-800/40">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-[#737373] font-medium">
                AI Voice Cloning & TTS
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-white bg-[#1a1a1a] border border-[#2e2e2e] shadow-xs'
                      : 'text-[#8e8e8e] hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-[#737373]'}`} />
                  <span>{item.label}</span>

                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#262626] text-amber-400 border border-[#383838]">
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      item.badge === 'Admin'
                        ? 'bg-[#261f10] text-amber-300 border border-amber-800/50'
                        : 'bg-[#1f1f1f] text-[#a3a3a3] border border-[#2e2e2e]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Quick Clone Voice Button */}
          <button
            id="nav-clone-voice-btn"
            type="button"
            onClick={onOpenCloneModal}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl shadow-md shadow-amber-950/40 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clone Voice</span>
          </button>

          {/* User Account Switcher Dropdown */}
          <div className="relative">
            <button
              id="user-menu-btn"
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-[#2a2a2a] bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#383838] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#333333] text-amber-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-[#e5e5e5] leading-none">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#737373] capitalize">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-3.5 py-2 border-b border-[#222222]">
                  <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                    Current Active Account
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">
                    {currentUser.email}
                  </p>
                  <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-[#261f10] text-amber-300 border border-amber-800/50'
                      : 'bg-[#1a1a1a] text-[#a3a3a3] border border-[#2e2e2e]'
                  }`}>
                    {currentUser.role === 'admin' ? '🛡️ Administrator' : 'Standard User'}
                  </span>
                </div>

                <div className="px-3.5 py-2">
                  <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                    Switch Test Account
                  </p>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-[#222222] text-amber-400 font-semibold border border-[#333333]'
                            : 'text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate">{u.name}</div>
                          <div className="text-[10px] text-[#737373]">{u.role}</div>
                        </div>
                        {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex items-center justify-around border-t border-[#222222] px-2 py-1.5 bg-[#0d0d0d] overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'text-amber-400'
                  : 'text-[#737373]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
