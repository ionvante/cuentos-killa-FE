export interface ConfigItem<T = any> {
  categoryId: number;
  id2: number;
  label: string;
  data: T;
  sensitive: boolean;
}
export interface ThemeConfig {
  opcion: string;
}