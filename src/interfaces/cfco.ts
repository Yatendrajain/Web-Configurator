export interface CFData {
  id: string;
  type: string;
  description: string;
  parent: string;
  comment: string;
  children: {
    id: string;
    type: string;
    description: string;
    parent: string;
    comment: string;
  }[];
}

export interface HeadCell {
  id: keyof CFData;
  label: string;
}
