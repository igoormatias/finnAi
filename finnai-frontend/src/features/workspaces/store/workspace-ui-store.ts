import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspacePrivacyPrefs = {
  hideBalanceFromViewers: boolean;
  allowDataExport: boolean;
};

const DEFAULT_PRIVACY: WorkspacePrivacyPrefs = {
  hideBalanceFromViewers: true,
  allowDataExport: false,
};

type WorkspaceUiState = {
  lastWorkspaceSlug: string | null;
  privacyBySlug: Record<string, WorkspacePrivacyPrefs>;
  setLastWorkspaceSlug: (slug: string) => void;
  getPrivacy: (slug: string) => WorkspacePrivacyPrefs;
  setPrivacy: (slug: string, prefs: Partial<WorkspacePrivacyPrefs>) => void;
};

export const useWorkspaceUiStore = create<WorkspaceUiState>()(
  persist(
    (set, get) => ({
      lastWorkspaceSlug: null,
      privacyBySlug: {},
      setLastWorkspaceSlug(slug) {
        set({ lastWorkspaceSlug: slug });
      },
      getPrivacy(slug) {
        return get().privacyBySlug[slug] ?? DEFAULT_PRIVACY;
      },
      setPrivacy(slug, prefs) {
        set((state) => ({
          privacyBySlug: {
            ...state.privacyBySlug,
            [slug]: { ...DEFAULT_PRIVACY, ...state.privacyBySlug[slug], ...prefs },
          },
        }));
      },
    }),
    { name: "finnai-workspace-ui" }
  )
);
