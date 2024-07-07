import { Controller, Get, Post, Inject, Body, Req } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto';
import { catchError } from 'rxjs';


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

  @Get('verify')
  verifyUser(@Req() req){ // recibimos el token generado por el authService en el login
    console.log(req.headers);
    return this.client.send('auth.verify.user', {})
  }
}
