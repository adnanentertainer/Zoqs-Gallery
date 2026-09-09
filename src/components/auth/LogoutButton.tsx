"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useAuth } from "@/context/AuthContext";

interface LogoutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onBeforeLogout?: () => void;
}

export function LogoutButton({
  onBeforeLogout,
  onClick,
  ...props
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    onBeforeLogout?.();
    await signOut();
    router.push("/");
  }

  return <button type="button" onClick={handleClick} {...props} />;
}
