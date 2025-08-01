// Services
export { AIService } from './services/ai.service'

// Components
export { AIAssistant } from './components/AIAssistant'

// Hooks
export { useAIChat } from './hooks/useAIChat'

// Types
export type {
  ChatMessage,
  AIModel,
  AIProvider,
  ChatRole,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIAnalysisType,
  AICapability,
  CreateChatRequest,
  UpdateChatRequest
} from './types/ai.types'