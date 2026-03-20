"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SpaRedirectRestore() {
  const router = useRouter();

  useEffect(() => {
    const redirect = sessionStorage.getItem("cn_redirect");
    if (redirect) {
      sessionStorage.removeItem("cn_redirect");
      router.replace(redirect);
    }
  }, [router]);

  return null;
}
