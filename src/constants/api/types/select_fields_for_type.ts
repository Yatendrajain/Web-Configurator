export type SelectedFieldsFor<C extends object> = {
  [K in keyof C]?: C[K];
};
