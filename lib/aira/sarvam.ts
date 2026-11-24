"use client";

import {
  ConversationAgent,
  BrowserAudioInterface,
  InteractionType,
  AgentState,
} from "sarvam-conv-ai-sdk/browser";

export interface SarvamConfig {
  appId: string;
  userId: string;
}

export interface TranscriptMessage {
  role: "user" | "bot";
  content: string;
}

export class SarvamVoiceAgent {
  private agent: ConversationAgent | null = null;
  private audioInterface: BrowserAudioInterface | null = null;
  private config: SarvamConfig;

  constructor(config: SarvamConfig) {
    this.config = config;
  }

  async start(callbacks: {
    onTranscript: (msg: TranscriptMessage) => void;
    onStateChange: (state: AgentState) => void;
    onError: (error: Error) => void;
  }): Promise<void> {
    try {
      this.audioInterface = new BrowserAudioInterface(16000);

      this.agent = new ConversationAgent({
        apiKey: "", // Use backend proxy
        baseUrl: "/api/sarvam/signed-url/",
        config: {
          org_id: "", // Will be passed via backend
          workspace_id: "", // Will be passed via backend
          app_id: this.config.appId,
          user_identifier: this.config.userId,
          user_identifier_type: "custom",
          interaction_type: InteractionType.CALL,
          input_sample_rate: 16000,
          output_sample_rate: 16000,
        },
        audioInterface: this.audioInterface,
        transcriptCallback: async (msg: any) => {
          callbacks.onTranscript({
            role: msg.role === "user" ? "user" : "bot",
            content: msg.content,
          });
        },
        stateCallback: (state: AgentState) => {
          callbacks.onStateChange(state);
        },
        endCallback: async () => {
          await this.cleanup();
        },
      });

      await this.agent.start();
      await this.agent.waitForConnect(10);
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.agent) {
      await this.agent.stop();
    }
    await this.cleanup();
  }

  async cleanup(): Promise<void> {
    if (this.agent) {
      this.agent = null;
    }
    if (this.audioInterface) {
      this.audioInterface = null;
    }
  }

  isConnected(): boolean {
    return this.agent?.isConnected() ?? false;
  }

  mute(): void {
    this.agent?.mute();
  }

  unmute(): void {
    this.agent?.unmute();
  }

  isMuted(): boolean {
    return this.agent?.isMuted() ?? false;
  }

  getState(): AgentState | null {
    return this.agent?.getState() ?? null;
  }
}
