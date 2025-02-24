import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [forwardRef(() => NotificationModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
