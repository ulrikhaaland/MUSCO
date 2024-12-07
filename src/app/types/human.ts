export interface HumanAPIOptions {
  camera?: {
    position?: {
      x?: number;
      y?: number;
      z?: number;
    };
  };
}

export interface HumanAPI {
  on: (event: string, callback: (event: any) => void) => void;
  send: (command: string, payload?: any) => void;
}

export interface HumanAPIConstructor {
  new (elementId: string, options?: HumanAPIOptions): HumanAPI;
}

// Extend the Window interface to include HumanAPI
declare global {
  interface Window {
    HumanAPI: HumanAPIConstructor;
  }
} 