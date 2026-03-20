"use client";

import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as drive from "@/services/drive";
import type { ConnectedAccount, FileMetadata } from "@/types";

function getAccountForFile(
  accounts: ConnectedAccount[],
  accountEmail: string,
): ConnectedAccount | null {
  return accounts.find((a) => a.email === accountEmail) ?? null;
}

export function useDrive() {
  const { accounts, refreshAccountToken } = useAuth();

  const getToken = useCallback(
    async (accountEmail: string): Promise<string> => {
      const account = getAccountForFile(accounts, accountEmail);
      if (!account) throw new Error(`Account ${accountEmail} not found`);

      if (Date.now() >= account.tokenExpiry) {
        const newToken = await refreshAccountToken(accountEmail);
        if (!newToken) throw new Error("Token refresh failed. Please re-authenticate.");
        return newToken;
      }

      return account.accessToken;
    },
    [accounts, refreshAccountToken],
  );

  const renameFile = useCallback(
    async (file: FileMetadata, newName: string) => {
      const token = await getToken(file.accountEmail);
      await drive.renameFile(token, file.driveFileId, newName);
    },
    [getToken],
  );

  const moveFile = useCallback(
    async (
      file: FileMetadata,
      newParentId: string,
      oldParentId?: string,
    ) => {
      const token = await getToken(file.accountEmail);
      await drive.moveFile(
        token,
        file.driveFileId,
        newParentId,
        oldParentId,
      );
    },
    [getToken],
  );

  const trashFile = useCallback(
    async (file: FileMetadata) => {
      const token = await getToken(file.accountEmail);
      await drive.trashFile(token, file.driveFileId);
    },
    [getToken],
  );

  const restoreFile = useCallback(
    async (file: FileMetadata) => {
      const token = await getToken(file.accountEmail);
      await drive.restoreFile(token, file.driveFileId);
    },
    [getToken],
  );

  const deleteFile = useCallback(
    async (file: FileMetadata) => {
      const token = await getToken(file.accountEmail);
      await drive.deleteFile(token, file.driveFileId);
    },
    [getToken],
  );

  const shareFile = useCallback(
    async (file: FileMetadata): Promise<string> => {
      const token = await getToken(file.accountEmail);
      return drive.shareFile(token, file.driveFileId);
    },
    [getToken],
  );

  const unshareFile = useCallback(
    async (file: FileMetadata) => {
      const token = await getToken(file.accountEmail);
      await drive.unshareFile(token, file.driveFileId);
    },
    [getToken],
  );

  const getDownloadUrl = useCallback(
    async (file: FileMetadata): Promise<string> => {
      const token = await getToken(file.accountEmail);
      return drive.getDownloadUrl(token, file.driveFileId);
    },
    [getToken],
  );

  const uploadFile = useCallback(
    async (
      file: File,
      parentId?: string,
      onProgress?: (percent: number) => void,
    ) => {
      const bestAccount = drive.pickBestAccount(accounts);
      if (!bestAccount) throw new Error("No accounts with available storage");

      const token = await getToken(bestAccount.email);
      return drive.uploadFile(token, file, parentId, onProgress);
    },
    [accounts, getToken],
  );

  return {
    renameFile,
    moveFile,
    trashFile,
    restoreFile,
    deleteFile,
    shareFile,
    unshareFile,
    getDownloadUrl,
    uploadFile,
    getToken,
    accounts,
  };
}
