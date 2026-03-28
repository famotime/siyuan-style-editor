import type { PaintChannel } from "@/style-editor-runtime";
import type { StyleTarget } from "@/lib/style-profile";

import {
  onBeforeUnmount,
  ref,
} from "vue";

export interface TargetOrbChannelSwatch {
  background: string;
  isEmpty: boolean;
}

export interface TargetOrbRef {
  channel: PaintChannel;
  target: StyleTarget;
}

interface DragOrbState extends TargetOrbRef {
  x: number;
  y: number;
}

export interface FloatingOrbPreview {
  background: string;
  isEmpty: boolean;
  x: number;
  y: number;
}

interface UseTargetOrbDragSessionOptions {
  dragThreshold?: number;
  getChannelSwatch: (target: StyleTarget, channel: PaintChannel) => TargetOrbChannelSwatch;
  onActivateChannel: (payload: { channel: PaintChannel; event: MouseEvent; target: StyleTarget }) => void;
  onSwapChannelValue: (source: TargetOrbRef, target: TargetOrbRef) => void;
}

const DEFAULT_DRAG_THRESHOLD = 6;

export function useTargetOrbDragSession(options: UseTargetOrbDragSessionOptions) {
  const dragOrbState = ref<DragOrbState | null>(null);
  const dragHoverState = ref<TargetOrbRef | null>(null);
  const floatingOrbPreview = ref<FloatingOrbPreview | null>(null);
  const suppressOrbClickUntil = ref(0);

  function isSameOrb(left: TargetOrbRef | null, right: TargetOrbRef | null) {
    return left?.target === right?.target && left?.channel === right?.channel;
  }

  function clearDragInteraction() {
    dragOrbState.value = null;
    dragHoverState.value = null;
    floatingOrbPreview.value = null;
  }

  function handleWindowMouseMove(event: MouseEvent) {
    if (!dragOrbState.value) {
      return;
    }

    const deltaX = event.clientX - dragOrbState.value.x;
    const deltaY = event.clientY - dragOrbState.value.y;
    const hasExceededThreshold = Math.hypot(deltaX, deltaY) >= (options.dragThreshold ?? DEFAULT_DRAG_THRESHOLD);

    if (!floatingOrbPreview.value && !hasExceededThreshold) {
      return;
    }

    if (!floatingOrbPreview.value) {
      const sourceSwatch = options.getChannelSwatch(dragOrbState.value.target, dragOrbState.value.channel);
      floatingOrbPreview.value = {
        background: sourceSwatch.background,
        isEmpty: sourceSwatch.isEmpty,
        x: event.clientX,
        y: event.clientY,
      };
      return;
    }

    floatingOrbPreview.value = {
      ...floatingOrbPreview.value,
      x: event.clientX,
      y: event.clientY,
    };
  }

  function stopWindowTracking() {
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  }

  function handleWindowMouseUp() {
    if (
      dragOrbState.value
      && floatingOrbPreview.value
      && dragHoverState.value
      && !isSameOrb(dragOrbState.value, dragHoverState.value)
    ) {
      options.onSwapChannelValue(
        {
          channel: dragOrbState.value.channel,
          target: dragOrbState.value.target,
        },
        dragHoverState.value,
      );
      suppressOrbClickUntil.value = Date.now() + 250;
    }

    stopWindowTracking();
    clearDragInteraction();
  }

  function handleOrbMouseDown(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    stopWindowTracking();
    dragOrbState.value = {
      channel,
      target,
      x: event.clientX,
      y: event.clientY,
    };
    dragHoverState.value = null;
    floatingOrbPreview.value = null;
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  }

  function handleOrbMouseEnter(target: StyleTarget, channel: PaintChannel) {
    if (!floatingOrbPreview.value) {
      return;
    }

    dragHoverState.value = {
      channel,
      target,
    };
  }

  function handleOrbMouseLeave(target: StyleTarget, channel: PaintChannel) {
    if (isSameOrb(dragHoverState.value, { channel, target })) {
      dragHoverState.value = null;
    }
  }

  function handleOrbClick(target: StyleTarget, channel: PaintChannel, event: MouseEvent) {
    if (Date.now() < suppressOrbClickUntil.value) {
      return;
    }

    options.onActivateChannel({
      channel,
      event,
      target,
    });
  }

  function isDragSourceOrb(target: StyleTarget, channel: PaintChannel) {
    return Boolean(floatingOrbPreview.value) && isSameOrb(dragOrbState.value, { channel, target });
  }

  function isDropTargetOrb(target: StyleTarget, channel: PaintChannel) {
    return Boolean(floatingOrbPreview.value)
      && isSameOrb(dragHoverState.value, { channel, target })
      && !isSameOrb(dragOrbState.value, { channel, target });
  }

  onBeforeUnmount(() => {
    stopWindowTracking();
  });

  return {
    floatingOrbPreview,
    handleOrbClick,
    handleOrbMouseDown,
    handleOrbMouseEnter,
    handleOrbMouseLeave,
    isDragSourceOrb,
    isDropTargetOrb,
  };
}
