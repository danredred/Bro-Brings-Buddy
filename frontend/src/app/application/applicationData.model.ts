export interface UserData {
  username: string;
}

export interface ApplicationData {
  id: number;
  submitterUser: UserData;
  approvingUsers: UserData[];
  type: 'TOADMIN' | 'TOMEMBER';
  status: 'PENDING' | 'CLOSED' | 'APPROVED';
  aboutUser: UserData;
  created: Date;
}
