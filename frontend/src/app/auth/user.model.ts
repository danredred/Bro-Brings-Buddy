export class User {
  constructor(
    public username: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    private _permission: 'ADMIN' | 'MEMBER' | 'PEASANT'
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
  get isAdmin(){
    return this._permission === 'ADMIN';
  }
  get isMember(){
    return this._permission === 'MEMBER'
  }
}
