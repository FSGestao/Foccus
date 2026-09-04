"use client";

import { useEffect, useRef, useState } from "react";

type MarqueeBox = { active: boolean; left: number; top: number; width: number; height: number };

const IDLE_BOX: MarqueeBox = { active: false, left: 0, top: 0, width: 0, height: 0 };

// Seleção múltipla por retângulo (Foccus.dc.html: setupMarqueeSelection) —
// clique-e-arraste no fundo da lista seleciona todo cartão com
// [data-task-id] que a área tocar. Ignora cliques que começam em
// inputs/botões/selects/links/modais/sidebar/header, pra não competir com a
// interação normal desses elementos.
export function useMarqueeSelection(setSelectedIds: (updater: (prev: string[]) => string[]) => void) {
  const [marqueeBox, setMarqueeBox] = useState<MarqueeBox>(IDLE_BOX);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  // true por ~120ms depois de soltar um arraste real — o clique sintético que
  // o navegador dispara em seguida (mousedown+mouseup no mesmo lugar) não deve
  // abrir/alternar a tarefa que ficou por baixo do cursor.
  const justFinishedRef = useRef(false);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'input, textarea, select, button, a, [role="dialog"], aside, header, .no-marquee, .modal-overlay, [data-prevent-marquee]',
        )
      ) {
        return;
      }
      if (!target.closest("main")) return;
      startRef.current = { x: e.clientX, y: e.clientY };
      draggingRef.current = false;
    }

    function onMouseMove(e: MouseEvent) {
      const start = startRef.current;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!draggingRef.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        draggingRef.current = true;
      }
      if (!draggingRef.current) return;

      const left = Math.min(start.x, e.clientX);
      const top = Math.min(start.y, e.clientY);
      const width = Math.abs(dx);
      const height = Math.abs(dy);
      const rect = { left, top, right: left + width, bottom: top + height };

      const newlySelected: string[] = [];
      document.querySelectorAll("[data-task-id]").forEach((el) => {
        const id = el.getAttribute("data-task-id");
        if (!id) return;
        const r = el.getBoundingClientRect();
        const intersects = !(r.right < rect.left || r.left > rect.right || r.bottom < rect.top || r.top > rect.bottom);
        if (intersects) newlySelected.push(id);
      });

      setMarqueeBox({ active: true, left, top, width, height });
      setSelectedIds((prev) => (e.shiftKey ? Array.from(new Set([...prev, ...newlySelected])) : newlySelected));
    }

    function onMouseUp() {
      if (draggingRef.current) {
        draggingRef.current = false;
        setMarqueeBox(IDLE_BOX);
        justFinishedRef.current = true;
        setTimeout(() => {
          justFinishedRef.current = false;
        }, 120);
      }
      startRef.current = null;
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { marqueeBox, justFinishedRef };
}
