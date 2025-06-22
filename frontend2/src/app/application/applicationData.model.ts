export interface ApplicationData {
  id: number;
  submitter: string;
  approvers: string[];
  type: 'TOADMIN' | 'TOMEMBER';
  closed: boolean;
  about: string;
  created: Date;
}
