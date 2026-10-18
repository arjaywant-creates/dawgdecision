import type { ReactNode } from "react";

import { toast as herouiToast } from "@heroui/react";

type ToastMethodOptions = Parameters<typeof herouiToast.success>[1];
type ToastDefaultOptions = Parameters<typeof herouiToast>[1];

function buildMethodOptions(
  idRef: { id: string },
  options?: ToastMethodOptions,
): ToastMethodOptions {
  return {
    timeout: 2000,
    actionProps: {
      children: "Dismiss",
      onPress: () => {
        if (idRef.id) {
          herouiToast.close(idRef.id);
        }
      },
      variant: "tertiary",
    },
    ...options,
  };
}

function buildDefaultOptions(
  idRef: { id: string },
  options?: ToastDefaultOptions,
): ToastDefaultOptions {
  return {
    timeout: 2000,
    actionProps: {
      children: "Dismiss",
      onPress: () => {
        if (idRef.id) {
          herouiToast.close(idRef.id);
        }
      },
      variant: "tertiary",
    },
    ...options,
  };
}

/**
 * Standardized application toast helper.
 * Automatically injects a 3000ms timeout and a HeroUI tertiary Dismiss button.
 */
export const toast = {
  success: (message: ReactNode, options?: ToastMethodOptions): string => {
    const idRef = { id: "" };
    const opts = buildMethodOptions(idRef, options);

    idRef.id = herouiToast.success(message, opts);

    return idRef.id;
  },

  danger: (message: ReactNode, options?: ToastMethodOptions): string => {
    const idRef = { id: "" };
    const opts = buildMethodOptions(idRef, options);

    idRef.id = herouiToast.danger(message, opts);

    return idRef.id;
  },

  info: (message: ReactNode, options?: ToastMethodOptions): string => {
    const idRef = { id: "" };
    const opts = buildMethodOptions(idRef, options);

    idRef.id = herouiToast.info(message, opts);

    return idRef.id;
  },

  warning: (message: ReactNode, options?: ToastMethodOptions): string => {
    const idRef = { id: "" };
    const opts = buildMethodOptions(idRef, options);

    idRef.id = herouiToast.warning(message, opts);

    return idRef.id;
  },

  show: (message: ReactNode, options?: ToastDefaultOptions): string => {
    const idRef = { id: "" };
    const opts = buildDefaultOptions(idRef, options);

    idRef.id = herouiToast(message, opts);

    return idRef.id;
  },

  close: (key: string) => herouiToast.close(key),
  clear: () => herouiToast.clear(),
  pauseAll: () => herouiToast.pauseAll(),
  resumeAll: () => herouiToast.resumeAll(),
};
