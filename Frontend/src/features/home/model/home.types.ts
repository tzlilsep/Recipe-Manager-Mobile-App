// src/features/home/model/home.types.ts
export type HomeNavPage = 'shopping' | 'recipes' | 'planty';

export interface HomeProps {
  onNavigate: (page: HomeNavPage) => void;
  onLogout: () => void;
}
