import React from "react";
import { Button } from "@/components/ui/button";
import { useRegisterSW } from "virtual:pwa-register/react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const INSTALL_MODAL_DISMISSED_KEY = "kinnect-install-modal-dismissed";

const isRunningStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone,
  );

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: unknown) {
      console.log("SW registered", registration);
    },
    onRegisterError(error: unknown) {
      console.error("SW registration error", error);
    },
  });

  const [showUpdatePrompt, setShowUpdatePrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = React.useState(false);
  const [isInstalling, setIsInstalling] = React.useState(false);

  React.useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  React.useEffect(() => {
    if (isRunningStandalone()) {
      return;
    }

    const dismissed = sessionStorage.getItem(INSTALL_MODAL_DISMISSED_KEY);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (dismissed === "true") {
        return;
      }

      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowInstallModal(true);
    };

    const handleAppInstalled = () => {
      sessionStorage.removeItem(INSTALL_MODAL_DISMISSED_KEY);
      setDeferredPrompt(null);
      setShowInstallModal(false);
      setIsInstalling(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissInstallModal = () => {
    sessionStorage.setItem(INSTALL_MODAL_DISMISSED_KEY, "true");
    setShowInstallModal(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setIsInstalling(false);

    if (outcome === "accepted") {
      setShowInstallModal(false);
      sessionStorage.removeItem(INSTALL_MODAL_DISMISSED_KEY);
      return;
    }

    sessionStorage.setItem(INSTALL_MODAL_DISMISSED_KEY, "true");
    setShowInstallModal(false);
  };

  const closeUpdatePrompt = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  const refreshApp = () => {
    updateServiceWorker(true);
  };

  return (
    <>
      {showInstallModal && deferredPrompt && (
        
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="flex max-w-[400px] items-center gap-3 rounded-full bg-[#2A0040] px-4 py-2 text-white shadow-lg">
            <span className="text-[13px]">
              Install Kinnect on your device.
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-4 text-[13px]"
                onClick={handleInstall}
                disabled={isInstalling}
              >
                {isInstalling ? "Downloading..." : "Install"}
              </Button>
              <button
                type="button"
                 onClick={dismissInstallModal}
                disabled={isInstalling}
                className="text-[11px] font-medium text-[#F973D1]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="flex max-w-[400px] items-center gap-3 rounded-full bg-[#2A0040] px-4 py-2 text-white shadow-lg">
            <span className="text-[13px]">
              A new version of Kinnect is available.
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-4 text-[13px]"
                onClick={refreshApp}
              >
                Refresh
              </Button>
              <button
                type="button"
                onClick={closeUpdatePrompt}
                className="text-[11px] font-medium text-[#F973D1]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
