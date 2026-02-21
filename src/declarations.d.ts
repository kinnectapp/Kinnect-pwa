declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "virtual:pwa-register/react";

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
          ux_mode?: "popup" | "redirect";
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        prompt: (callback?: (notification: unknown) => void) => void;
      };
    };
  };
}
