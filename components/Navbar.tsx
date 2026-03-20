"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import * as storage from "@/services/storage";

export default function Navbar({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();
  const [profile, setProfileState] = useState(() => storage.getProfile());
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  function openModal() {
    setEditName(profile.displayName);
    setEditBio(profile.bio);
    setShowModal(true);
  }

  function saveProfile() {
    const updated = {
      displayName: editName,
      bio: editBio,
      avatarUrl: profile.avatarUrl,
    };
    storage.setProfile(updated);
    setProfileState(updated);
    setShowModal(false);
  }

  return (
    <>
      <header className="flex h-12 flex-none items-center justify-between border-b border-cn-border bg-cn-sidebar px-4">
        <button
          onClick={onMenuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text lg:hidden"
          title="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-cn-text"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          <div className="h-4 w-px bg-cn-border mx-1" />

          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-cn-hover"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-cn-border bg-cn-s2">
              <svg className="h-4 w-4 text-cn-text3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <span className="hidden text-xs font-medium text-cn-text sm:inline">{profile.displayName || "Profile"}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-cn-text3 transition hover:bg-cn-hover hover:text-red-400"
            title="Sign out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-cn-border bg-cn-s1 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-sm font-semibold text-cn-text">Edit Profile</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-cn-text2">Display Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-cn-border bg-cn-bg px-3 py-2 text-sm text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-cn-text2">Bio</label>
                <input
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="A short bio"
                  className="w-full rounded-lg border border-cn-border bg-cn-bg px-3 py-2 text-sm text-cn-text placeholder-cn-text3 outline-none focus:border-orange-500/50"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-cn-border py-2 text-sm text-cn-text2 transition hover:bg-cn-hover"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition hover:bg-orange-400"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
