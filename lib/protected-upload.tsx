"use client";

import { useEffect, useState } from "react";
import type { ComponentProps, ImgHTMLAttributes } from "react";
import api from "@/lib/axios";
import configuration from "@/config/configuration";
import { AvatarImage } from "@/components/ui/avatar";

function uploadPath(url?: string | null): string | null {
  if (!url) return null;
  const backend = configuration().backendUrl || window.location.origin;
  try {
    const parsed = new URL(url, backend);
    if (parsed.origin !== new URL(backend, window.location.origin).origin) return null;
    if (!/^\/uploads\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(parsed.pathname)) return null;
    return parsed.pathname;
  } catch {
    return null;
  }
}

export function useProtectedUploadUrl(url?: string | null): string | undefined {
  const [resolved, setResolved] = useState<string>();

  useEffect(() => {
    const path = uploadPath(url);
    if (!path) {
      setResolved(url || undefined);
      return;
    }
    let active = true;
    let objectUrl: string | undefined;
    setResolved(undefined);
    void api.get<Blob>(path, { responseType: "blob" }).then(({ data }) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(data);
      setResolved(objectUrl);
    }).catch(() => {
      if (active) setResolved(undefined);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return resolved;
}

export function ProtectedUploadImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const resolved = useProtectedUploadUrl(typeof src === "string" ? src : undefined);
  return <img {...props} src={resolved} />;
}

export function ProtectedUploadAvatarImage({ src, ...props }: ComponentProps<typeof AvatarImage>) {
  const resolved = useProtectedUploadUrl(typeof src === "string" ? src : undefined);
  return <AvatarImage {...props} src={resolved} />;
}

export async function openProtectedUpload(url: string): Promise<void> {
  const path = uploadPath(url);
  if (!path) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const tab = window.open("about:blank", "_blank");
  if (tab) tab.opener = null;
  try {
    const { data } = await api.get<Blob>(path, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(data);
    if (/^(application\/pdf|image\/(png|jpeg|gif|webp))$/.test(data.type)) {
      if (tab) tab.location.href = objectUrl;
      else window.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5 * 60 * 1000);
    } else {
      tab?.close();
      const download = document.createElement("a");
      download.href = objectUrl;
      download.download = path.slice(path.lastIndexOf("/") + 1);
      download.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000);
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
}
