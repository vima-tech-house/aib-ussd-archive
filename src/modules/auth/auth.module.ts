import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { UserModule } from '../users/user.module';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from 'common/guards/roles.guard';
import { ConfigModule } from 'config/config.module';
import { ConfigService } from 'config/config.service';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { EmailService } from '@/utils/email-template.handler';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    // UserModule,
  ],
  controllers: [],
  providers: [JwtStrategy, RolesGuard, ResponseHelper, EmailService],
  exports: [ResponseHelper, EmailService, JwtStrategy, PassportModule],
})
export class AuthModule {}
