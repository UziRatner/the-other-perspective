/**
 * Device ID management for anonymous user identification.
 * Stored in localStorage, persists across sessions on same browser.
 */

const DEVICE_ID_KEY = "the_other_perspective_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // crypto.randomUUID() requires HTTPS on mobile browsers, so use fallback
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

export function clearDeviceId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEVICE_ID_KEY);
  }
}
