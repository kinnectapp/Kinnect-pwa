import React from "react";
 import { Button } from "@/components/ui/button";
import { useRegisterSW } from "virtual:pwa-register/react";

export const PWAUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log("SW registered", r);
    },
    onRegisterError(error: any) {
      console.error("SW registration error", error);
    },
  });

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (needRefresh ) {
      setVisible(true);
    }
  }, [needRefresh]);

  const close = () => {
    setVisible(false);
    setNeedRefresh(false);
  };

  const refresh = () => {
    // true = immediately reload after update
    updateServiceWorker(true);
  };

  if (!visible) return null;

  // if you only care about "new version", ignore offlineReady and just check needRefresh
  const isUpdate = needRefresh; 

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex max-w-[400px] items-center gap-3 rounded-full bg-[#2A0040] px-4 py-2 text-white shadow-lg">
        <span className="text-[13px]">
          {isUpdate
            ? "A new version of Kinnect is available."
            : "Kinnect is ready to work offline."}
        </span>

        <div className="flex items-center gap-2">
          {isUpdate && (
            <Button
              size="sm"
              variant="default"
              className="h-8 px-4 text-[13px]"
              onClick={refresh}
            >
              Refresh
            </Button>
          )}
          <button
            type="button"
            onClick={close}
            className="text-[11px] font-medium text-[#F973D1]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
