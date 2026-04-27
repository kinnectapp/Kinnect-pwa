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

const getNavigator = () =>
  window.navigator as Navigator & {
    standalone?: boolean;
  };

const isRunningStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  Boolean(getNavigator().standalone);

const isIosSafari = () => {
  const navigator = getNavigator();
  const userAgent = navigator.userAgent;
  const isIosDevice =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariBrowser =
    /Safari/i.test(userAgent) &&
    !/CriOS|Chrome|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);

  return isIosDevice && isSafariBrowser;
};

type InstallPromptType = "android" | "ios" | null;

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
  const [installPromptType, setInstallPromptType] =
    React.useState<InstallPromptType>(null);
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

    if (dismissed !== "true" && isIosSafari()) {
      setInstallPromptType("ios");
      setShowInstallModal(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (sessionStorage.getItem(INSTALL_MODAL_DISMISSED_KEY) === "true") {
        return;
      }

      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallPromptType("android");
      setShowInstallModal(true);
    };

    const handleAppInstalled = () => {
      sessionStorage.removeItem(INSTALL_MODAL_DISMISSED_KEY);
      setDeferredPrompt(null);
      setInstallPromptType(null);
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
    setInstallPromptType(null);
    setShowInstallModal(false);
  };

  const handleInstall = async () => {
    if (installPromptType !== "android" || !deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setInstallPromptType(null);
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
      {showInstallModal && installPromptType === "android" && deferredPrompt && (
        <div className="fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)]">
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
                {isInstalling ? "Installing..." : "Install"}
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

      {showInstallModal && installPromptType === "ios" && (
        <div className="fixed inset-x-0 z-50 px-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)]">
          <div className="mx-auto max-w-[420px] rounded-3xl bg-[#2A0040] px-5 py-4 text-white shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Add Kinnect to Home Screen</p>
                <p className="mt-1 text-[13px] leading-5 text-white/80">
                  Tap the{" "}
                  <span className="inline-flex items-center gap-0.5 align-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline h-4 w-4 text-white"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </span>{" "}
                  <span className="font-semibold text-white">Share</span> button at the bottom of
                  your screen, then choose{" "}
                  <span className="font-semibold text-white">"Add to Home Screen"</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissInstallModal}
                className="mt-0.5 shrink-0 text-[11px] font-medium text-[#F973D1]"
              >
                Dismiss
              </button>
            </div>
          </div>
          {/* Arrow pointing down toward Safari's toolbar share button */}
          <div className="flex justify-center mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#2A0040"
              className="h-5 w-5 drop-shadow"
            >
              <path d="M12 20L2 6h20L12 20z" />
            </svg>
          </div>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)]">
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
