import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KikiChat from "../../assets/images/kiki-chat.png";

type KinnectAiWidgetProps = {
  visibleRoutes?: string[];
};

type WidgetCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type WidgetPosition = {
  x: number;
  y: number;
};

const STORAGE_KEY = "kinnect-ai-widget-corner";
const EDGE_GAP = 16;
const TOP_GAP = 96;
const BOTTOM_GAP = 96;
const WIDGET_WIDTH = 116;
const WIDGET_HEIGHT = 104;

const routeMatches = (pathname: string, visibleRoutes: string[]) =>
  visibleRoutes.some((route) =>
    route === "/app" ? pathname === route : pathname.startsWith(route),
  );

const getSavedCorner = (): WidgetCorner => {
  if (typeof window === "undefined") return "bottom-right";

  const savedCorner = window.localStorage.getItem(STORAGE_KEY);
  return savedCorner === "top-left" ||
    savedCorner === "top-right" ||
    savedCorner === "bottom-left" ||
    savedCorner === "bottom-right"
    ? savedCorner
    : "bottom-right";
};

const getCornerPosition = (corner: WidgetCorner): WidgetPosition => {
  if (typeof window === "undefined") {
    return { x: EDGE_GAP, y: BOTTOM_GAP };
  }

  const maxX = window.innerWidth - WIDGET_WIDTH - EDGE_GAP;
  const maxY = window.innerHeight - WIDGET_HEIGHT - BOTTOM_GAP;

  return {
    x: corner.endsWith("right") ? Math.max(EDGE_GAP, maxX) : EDGE_GAP,
    y: corner.startsWith("bottom") ? Math.max(TOP_GAP, maxY) : TOP_GAP,
  };
};

const getNearestCorner = ({ x, y }: WidgetPosition): WidgetCorner => {
  const horizontal = x + WIDGET_WIDTH / 2 < window.innerWidth / 2 ? "left" : "right";
  const vertical = y + WIDGET_HEIGHT / 2 < window.innerHeight / 2 ? "top" : "bottom";

  return `${vertical}-${horizontal}` as WidgetCorner;
};

const clampPosition = ({ x, y }: WidgetPosition): WidgetPosition => ({
  x: Math.min(Math.max(EDGE_GAP, x), window.innerWidth - WIDGET_WIDTH - EDGE_GAP),
  y: Math.min(Math.max(TOP_GAP, y), window.innerHeight - WIDGET_HEIGHT - BOTTOM_GAP),
});

export const KinnectAiWidget: React.FC<KinnectAiWidgetProps> = ({
  visibleRoutes = ["/app", "/app/community"],
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCorner = useMemo(getSavedCorner, []);
  const [corner, setCorner] = useState<WidgetCorner>(initialCorner);
  const [position, setPosition] = useState<WidgetPosition>(() =>
    getCornerPosition(initialCorner),
  );
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef(position);
  const dragState = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    didMove: boolean;
  } | null>(null);

  const isVisible = useMemo(
    () => routeMatches(location.pathname, visibleRoutes),
    [location.pathname, visibleRoutes],
  );

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(getCornerPosition(corner));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [corner]);

  if (!isVisible) {
    return null;
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    dragState.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      startX: event.clientX,
      startY: event.clientY,
      didMove: false,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
    if (distance > 6) {
      state.didMove = true;
    }

    const nextPosition = clampPosition({
      x: event.clientX - state.offsetX,
      y: event.clientY - state.offsetY,
    });

    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;

    const nextCorner = getNearestCorner(positionRef.current);
    setCorner(nextCorner);
    setPosition(getCornerPosition(nextCorner));
    window.localStorage.setItem(STORAGE_KEY, nextCorner);
    setIsDragging(false);
  };

  const handleClick = () => {
    if (dragState.current?.didMove) {
      dragState.current = null;
      return;
    }

    dragState.current = null;
    navigate("/app/kinnect-ai");
  };

  const isRightAligned = corner.endsWith("right");

  return (
    <div
      className={`fixed z-[1000] flex w-[116px] touch-none select-none flex-col gap-2 ${
        isRightAligned ? "items-end" : "items-start"
      }`}
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? "none" : "left 180ms ease, top 180ms ease",
      }}
    >
      <div className="rounded-full border border-[#EADCF5] bg-white px-3 py-2 text-xs font-medium text-[#5B2C8C] shadow-sm">
        <span className="inline-flex items-center gap-2">Chat with Kiki</span>
      </div>

      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="flex h-fit w-fit cursor-grab items-center justify-center overflow-clip rounded-full border shadow-[0_14px_30px_rgba(85,40,141,0.35)] active:cursor-grabbing"
        aria-label="Open Kiki"
      >
       <img src={KikiChat} alt="Kiki Chat" className="h-14 w-14 object-cover" />  
        {/* <MessageCircle size={22} /> */}
      </button>
    </div>
  );
};
