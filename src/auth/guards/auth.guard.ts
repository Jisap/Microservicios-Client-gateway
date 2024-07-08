import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { NATS_SERVICE } from '../../../../payments-ms/src/config/services';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ){}

  async canActivate(context: ExecutionContext): Promise<boolean> { // Atrapa la petición al server y obtiene de los params el user y el token
    
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try { 
 
      const { user, token: newToken } = await firstValueFrom( // Una vez identificados 
        this.client.send('auth.verify.user', token)           // verifica el token con un microservicio de autenticación.  
      )

      request['user'] = user;                                 // Asigna el usuario y el token a la solicitud.
      request['token'] = newToken;

    } catch {
      throw new UnauthorizedException();
    }
    return true;                                              // Devuelve true para que continue el flujo de ejecución
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}