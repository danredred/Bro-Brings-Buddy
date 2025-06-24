export interface ApplicationData {
  id: number;
  submitter: string;
  approvers: string[];
  type: 'TOADMIN' | 'TOMEMBER';
  status: 'PENDING' | 'CLOSED' | 'APPROVED';
  about: string;
  created: Date;
}
