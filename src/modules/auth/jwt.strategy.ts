import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { JwtPayload } from '../../interfaces/jwt-payload.interfcae';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    // private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtSecret,
      ignoreExpiration: false,
    });
  }

  // async validate(payload: JwtPayload) {
  //   try {
  //     const response = await this.usersService.findByEmailOrPhone(
  //       payload.email,
  //     );

  //     const user = response?.toJSON();

  //     if (!user) {
  //       throw new UnauthorizedException('User not found');
  //     }

  //     const userData = {
  //       id: user.user_id,
  //       userId: user.user_id,
  //       email: user.email,
  //       role: user.role,
  //       first_name: user.first_name,
  //       last_name: user.last_name,
  //       is_client: user.is_client,
  //       accountId: payload.accountId,
  //     };

  //     return userData;
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }
}
