import { create } from 'zustand'

export interface ATSResult {
  overallScore: number
  breakdown: {
    keywordMatch:        { score: number; found: string[];       missing: string[] }
    formatting:          { score: number; issues: string[] }
    sectionCompleteness: { score: number; present: string[];     missing: string[] }
    quantification:      { score: number; examples: string[];    suggestions: string[] }
    actionVerbs:         { score: number; weak: string[];        suggestions: string[] }
  }
  topIssues:   string[]
  quickWins:   string[]
  gapAnalysis: string
}

interface AtsState {
  result: ATSResult | null
  setResult: (r: ATSResult | null) => void
  clearResult: () => void
}

export const useAtsStore = create<AtsState>()((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}))
