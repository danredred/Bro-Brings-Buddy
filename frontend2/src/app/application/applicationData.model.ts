export interface ApplicationData {
  id: number;
  submitter: string;
  voted: string[];
  type: 'TOADMIN' | 'TOMEMBER';
  closed: boolean;
  about: string;
  created: Date;
}
