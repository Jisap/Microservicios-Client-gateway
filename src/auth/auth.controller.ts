import { Controller, Get, Post, Inject, Body, Req, UseGuards } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from './guards';


@Controller('auth')
export class AuthController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto){
    return this.client.send('auth.register.user', registerUserDto)
      .pipe(
        catchError(error => {
          throw new RpcException(error)
        })
      )
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto){
    return this.client.send('auth.login.user', loginUserDto)
      .pipe(
        catchError(error => {
          throw new RpcException(error)
        })
      )
  }

  @UseGuards(AuthGuard) // obtiene el usuario y el token de los headers, generado por el authService en el login
  @Get('verify')
  verifyUser(@Req() req){ // recibimos el token y se pasa a la función del auth-ms
  
    return this.client.send('auth.verify.user', {}) // Si no estuviera presente el token lanzaría error y no pasaría al "auth.verify.user"
  }
}
