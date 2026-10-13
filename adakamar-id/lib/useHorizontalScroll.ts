import { useRef, useState, useEffect, useCallback } from "react";

export function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Check initially and on next frame (after DOM layout)
    checkScroll();
    const frameId = requestAnimationFrame(checkScroll);

    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    const onWheel = (e: WheelEvent) => {
      // Map vertical wheel to horizontal scroll if overflowing
      if (e.deltaY !== 0 && !e.shiftKey) {
        if (el.scrollWidth > el.clientWidth) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScroll();
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      el.removeEventListener("wheel", onWheel);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right", amount = 280) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    hasMovedRef.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.25;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
      setIsDragging(true);
      el.scrollLeft = scrollLeftRef.current - walk;
      checkScroll();
    }
  };

  const onMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      setIsDragging(false);
      hasMovedRef.current = false;
    }, 50);
    checkScroll();
  };

  const onMouseLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      setIsDragging(false);
      hasMovedRef.current = false;
      checkScroll();
    }
  };

  return {
    scrollRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    hasMovedRef,
    scroll,
    checkScroll,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };
}
