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
  send: (command: string, payload?: any, callback?: (result: any) => void) => void;
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

export interface AnatomyPart {
  objectId: string;
  name: string;
  description: string;
  available: boolean;
  shown: boolean;
  selected: boolean;
  parent: string;
  children: AnatomyPart[];
  group?: string;
}

