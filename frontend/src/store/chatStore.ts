import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types'

export interface EditLogEntry {
  timestamp: string
  summary: string // human-readable description of what was changed
}

interface ChatState {
  messages: ChatMessage[]
  editLog: EditLogEntry[]
  isOpen: boolean
  isTyping: boolean
  tokensLeft: number
  pendingTrigger: string | null          // message to auto-send next render
  addMessage: (msg: Omit<ChatMessage, 'timestamp'> & { id?: string }) => void
  addEditLogEntry: (summary: string) => void
  setTyping: (v: boolean) => void
  toggleChat: () => void
  clearMessages: () => void
  triggerMessage: (text: string) => void  // open chat + queue message for auto-send
  clearTrigger: () => void
}

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi there! I can help you improve your resume. Ask me for feedback, or improvements for specific sections.',
  timestamp: new Date().toISOString(),
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [welcomeMessage],
      editLog: [],
      isOpen: true,
      isTyping: false,
      tokensLeft: 20,
      pendingTrigger: null,

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: msg.id ?? crypto.randomUUID(), timestamp: new Date().toISOString() },
          ],
          tokensLeft: msg.role === 'user' ? state.tokensLeft - 1 : state.tokensLeft,
        })),

      addEditLogEntry: (summary) =>
        set((state) => ({
          editLog: [...state.editLog, { timestamp: new Date().toISOString(), summary }],
        })),

      setTyping: (v) => set({ isTyping: v }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      clearMessages: () => set({ messages: [welcomeMessage], editLog: [], tokensLeft: 20 }),
      triggerMessage: (text) => set({ isOpen: true, pendingTrigger: text }),
      clearTrigger: () => set({ pendingTrigger: null }),
    }),
    {
      name: 'jobos-chat',
      // Don't persist isTyping — always start as false
      partialize: (state) => ({
        messages: state.messages,
        editLog: state.editLog,
        tokensLeft: state.tokensLeft,
        isOpen: state.isOpen,
        // never persist pendingTrigger or isTyping
      }),
    }
  )
)
