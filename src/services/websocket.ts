/**
 * WebSocket Service - Gerenciamento de conexão em tempo real para Chat
 * 
 * Funcionalidades:
 * - Conexão WebSocket com autenticação JWT
 * - Envio e recebimento de mensagens
 * - Indicadores de digitação
 * - Status online/offline
 * - Notificações de leitura
 * - Reconexão automática
 */

import { WS_BASE_URL } from './api';

// ============================================================================
// TIPOS
// ============================================================================

export interface ChatMessage {
  type: 'chat_message';
  content: string;
  recipient_id: number;
  sender_id?: number;
  sender_name?: string;
  timestamp?: string;
}

export interface TypingIndicator {
  type: 'typing';
  user_id: number;
  user_name: string;
  is_typing: boolean;
}

export interface ReadReceipt {
  type: 'read_receipt';
  message_id: number;
  user_id: number;
}

export interface OnlineUsers {
  type: 'online_users';
  users: Array<{
    user_id: number;
    user_name: string;
    role: string;
  }>;
}

export interface PingPong {
  type: 'ping' | 'pong';
}

export interface GetOnlineUsers {
  type: 'get_online_users';
}

export type WebSocketMessage = 
  | ChatMessage 
  | TypingIndicator 
  | ReadReceipt 
  | OnlineUsers 
  | PingPong
  | GetOnlineUsers;

export interface WebSocketCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onReadReceipt?: (receipt: ReadReceipt) => void;
  onOnlineUsers?: (users: OnlineUsers) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

// ============================================================================
// WEBSOCKET SERVICE
// ============================================================================

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private isManualClose: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  /**
   * Conecta ao WebSocket do chat
   */
  connect(token: string, callbacks: WebSocketCallbacks = {}): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('⚠️ WebSocket já está conectado');
      return;
    }

    this.callbacks = callbacks;
    this.isManualClose = false;

    const wsUrl = `${WS_BASE_URL}/ws/chat?token=${token}`;
    
    console.log('🔌 Conectando ao WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      // Event: Conexão aberta
      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado!');
        this.reconnectAttempts = 0;
        
        // Iniciar ping/pong
        this.startPingPong();
        
        // Callback de conexão
        if (this.callbacks.onConnect) {
          this.callbacks.onConnect();
        }

        // Solicitar lista de usuários online
        this.send({
          type: 'get_online_users',
        });
      };

      // Event: Mensagem recebida
      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Erro ao parsear mensagem:', error);
        }
      };

      // Event: Erro
      this.ws.onerror = (error: Event) => {
        console.error('❌ Erro no WebSocket:', error);
        
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      };

      // Event: Conexão fechada
      this.ws.onclose = (event: CloseEvent) => {
        console.log('🔌 WebSocket desconectado:', event.code, event.reason);
        
        this.stopPingPong();
        
        if (this.callbacks.onDisconnect) {
          this.callbacks.onDisconnect();
        }

        // Tentar reconectar automaticamente (se não foi fechamento manual)
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(token);
        }
      };

    } catch (error) {
      console.error('❌ Erro ao criar WebSocket:', error);
    }
  }

  /**
   * Desconecta do WebSocket
   */
  disconnect(): void {
    this.isManualClose = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopPingPong();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    console.log('🔌 WebSocket desconectado manualmente');
  }

  /**
   * Envia mensagem pelo WebSocket
   */
  send(message: Partial<WebSocketMessage>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket não está conectado');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
    }
  }

  /**
   * Envia mensagem de chat
   */
  sendMessage(content: string, recipientId: number): void {
    this.send({
      type: 'chat_message',
      content,
      recipient_id: recipientId,
    });
  }

  /**
   * Envia indicador de digitação
   */
  sendTyping(recipientId: number, isTyping: boolean): void {
    this.send({
      type: 'typing',
      user_id: recipientId,
      user_name: '',
      is_typing: isTyping,
    } as TypingIndicator);
  }

  /**
   * Envia confirmação de leitura
   */
  sendReadReceipt(messageId: number): void {
    this.send({
      type: 'read_receipt',
      message_id: messageId,
    });
  }

  /**
   * Solicita lista de usuários online
   */
  getOnlineUsers(): void {
    this.send({
      type: 'get_online_users',
    });
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================

  /**
   * Trata mensagens recebidas
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'chat_message':
        console.log('💬 Nova mensagem:', message);
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(message);
        }
        break;

      case 'typing':
        console.log('⌨️ Indicador de digitação:', message);
        if (this.callbacks.onTyping) {
          this.callbacks.onTyping(message);
        }
        break;

      case 'read_receipt':
        console.log('✓✓ Mensagem lida:', message);
        if (this.callbacks.onReadReceipt) {
          this.callbacks.onReadReceipt(message);
        }
        break;

      case 'online_users':
        console.log('👥 Usuários online:', message);
        if (this.callbacks.onOnlineUsers) {
          this.callbacks.onOnlineUsers(message);
        }
        break;

      case 'pong':
        // Resposta ao ping - conexão ativa
        break;

      default:
        console.log('📨 Mensagem desconhecida:', message);
    }
  }

  /**
   * Inicia sistema de ping/pong para manter conexão ativa
   */
  private startPingPong(): void {
    this.pingInterval = window.setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30 segundos
  }

  /**
   * Para sistema de ping/pong
   */
  private stopPingPong(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Agenda reconexão automática
   */
  private scheduleReconnect(token: string): void {
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Tentando reconectar em ${delay / 1000}s (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = window.setTimeout(() => {
      console.log('🔄 Reconectando...');
      this.connect(token, this.callbacks);
    }, delay);
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

const webSocketService = new WebSocketService();

export default webSocketService;
