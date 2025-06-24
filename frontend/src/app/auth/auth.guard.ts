import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { expand } from 'rxjs';



@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(protected authService: AuthService, private router: Router) {}
  protected altUrl = ['/auth'];
  protected checkPermission = (()=>true)
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    const isAuth = !!this.authService.userData()?.token;
    if (isAuth) {
      if(!this.checkPermission()){
        return this.router.createUrlTree(this.altUrl);
      }
      return true;
    }
    return this.router.createUrlTree(['/auth']);
  }
}

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard extends AuthGuard {
  protected override altUrl: string[] = ['/Home'];
  protected override checkPermission: () => boolean = () => this.authService.userData()!.isAdmin;
}

@Injectable({ providedIn: 'root' })
export class MiniGameAuthGuard extends AuthGuard {
  protected override altUrl: string[] = ['/peasant-game'];
  protected override checkPermission: () => boolean = () =>
    this.authService.userData()!.isMember ||
    this.authService.userData()!.isAdmin;
}
