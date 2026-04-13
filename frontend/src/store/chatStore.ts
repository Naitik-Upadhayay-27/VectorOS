import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types'

export interface EditLogEntry {
  timestamp: string
  summary: string
}

interface ChatState {
  messages: ChatMessage[]
  editLog: EditLogEntry[]
  isOpen: boolean
  isTyping: boolean
  pendingTrigger: string | null
  addMessage: (msg: Omit<ChatMessage, 'timestamp'> & { id?: string }) => void
  addEditLogEntry: (summary: string) => void
  setTyping: (v: boolean) => void
  toggleChat: () => void
  clearMessages: () => void
  triggerMessage: (text: string) => void
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
      pendingTrigger: null,

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: msg.id ?? crypto.randomUUID(), timestamp: new Date().toISOString() },
          ],
        })),

      addEditLogEntry: (summary) =>
        set((state) => ({
          editLog: [...state.editLog, { timestamp: new Date().toISOString(), summary }],
        })),

      setTyping: (v) => set({ isTyping: v }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      clearMessages: () => set({ messages: [welcomeMessage], editLog: [] }),
      triggerMessage: (text) => set({ isOpen: true, pendingTrigger: text }),
      clearTrigger: () => set({ pendingTrigger: null }),
    }),
    {
      name: 'jobos-chat',
      partialize: (state) => ({
        messages: state.messages,
        editLog: state.editLog,
        isOpen: state.isOpen,
      }),
    }
  )
)

