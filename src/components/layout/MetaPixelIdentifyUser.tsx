"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { setAdvancedMatchingUserData } from "@/lib/metaPixel";

// Renders nothing -- as soon as a signed-in user's email/phone are known,
// feeds them to the pixel so every event tracked from here on (not just
// Purchase, which already does this itself in metaPixel.ts) carries advanced
// matching data. Guest checkouts still only get matched at Purchase, since
// that's the only point a guest's identity is known.
export function MetaPixelIdentifyUser() {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    setAdvancedMatchingUserData({
      email: user.email,
      phone: profile?.phone ?? undefined,
    });
  }, [user?.email, profile?.phone]);

  return null;
}
