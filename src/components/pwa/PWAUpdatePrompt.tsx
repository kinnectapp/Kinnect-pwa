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
    share?: (data?: ShareData) => Promise<void>;
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
  const [isOpeningShareSheet, setIsOpeningShareSheet] = React.useState(false);

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

  const openIosShareSheet = async () => {
    const navigator = getNavigator();
    if (!navigator.share) {
      return;
    }

    setIsOpeningShareSheet(true);

    try {
      await navigator.share({
        title: "Kinnect",
        text: "Add Kinnect to your Home Screen or save it as a bookmark.",
        url: window.location.href,
      });
    } catch {
      // Ignore cancelled shares.
    } finally {
      setIsOpeningShareSheet(false);
    }
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
        <div className="fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="max-w-[420px] rounded-3xl bg-[#2A0040] px-5 py-4 text-white shadow-lg">
            <p className="text-sm font-semibold">Install Kinnect on your iPhone</p>
            <p className="mt-2 text-[13px] leading-5 text-white/85">
              In Safari, open the Share menu, then choose Add to Home Screen or
              Add Bookmark.
            </p>

            <div className="mt-4 flex justify-end items-center gap-8">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-4 text-[13px]"
                onClick={() => void openIosShareSheet()}
                disabled={isOpeningShareSheet}
              >
                {isOpeningShareSheet ? "Opening..." : "Open"}
              </Button>
             
              <button
                type="button"
                onClick={dismissInstallModal}
                className="text-[11px] font-medium text-[#F973D1]"
              >
                Got it
              </button>
            </div>
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
