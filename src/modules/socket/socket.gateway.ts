

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable } from '@nestjs/common';
import { NotificationService } from '@modules/notification/notification.service';
import { Feature } from '@/common/enums/feature.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(@Inject(NotificationService) private notificationService: NotificationService) {}

  private clients = new Map<string, Set<string>>(); // userId -> Set of socketIds

  afterInit(server: Server) {
    console.log('WebSocket Server Initialized');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const limit = parseInt(client.handshake.query.limit as string) || 2;
    const offset = parseInt(client.handshake.query.offset as string) || 0; 
  
    if (!userId) return;
  
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)?.add(client.id);
  
    client.join(userId);
  
    if (offset === 0) {
      const { notifications, hasMore } = await this.notificationService.getUserNotifications(userId, limit, offset);
      client.emit('existing-notifications', { notifications, hasMore });
    }
  
    client.on('load-more-notifications', async ({ userId, limit, offset }) => {
      console.log(`Fetching more notifications for user: ${userId}, offset: ${offset}, limit: ${limit}`);
  
      // Fetch more notifications based on the new offset
      const { notifications, hasMore } = await this.notificationService.getUserNotifications(userId, limit, offset);
  
      console.log('More notifications sent:', notifications.length, 'Has more:', hasMore);
  
      client.emit('existing-notifications', { notifications, hasMore });
    });
  }
  
  
  


  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.clients) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.clients.delete(userId);
        }
        console.log(`User ${userId} disconnected with socket ID: ${client.id}`);
        break;
      }
    }
  }

  async emitNotification(data: { feature: Feature, message: string; recipients: string[] }) {
    const notification = await this.notificationService.createNotification(data.feature, data.message, data.recipients);

    if (!this.server) {
      console.warn('WebSocket server is not initialized.');
      return;
    }
  
    data.recipients.forEach((recipient) => {
      if (this.clients.has(recipient)) {
        this.server.to(recipient).emit('new-notification', notification);
        console.log(`Notification sent to ${recipient}`);
      } else {
        console.warn(`Recipient ${recipient} is not connected.`);
      }
    });
  }


  emitVehicleUploadProgress(data: {
    jobId: string;
    totalVehicles: number;
    processedCount: number;
    errorCount: number;
    progress: number;
    currentBatch: number;
    totalBatches: number;
  }) {
    this.server.emit('vehicleUploadProgress', data);
  }

  emitVehicleUploadError(data: {
    jobId: string;
    error: string;
    batchIndex?: number;
    fatal?: boolean;
  }) {
    this.server.emit('vehicleUploadError', data);
  }

  emitVehicleUploadComplete(data: {
    jobId: string;
    processedCount: number;
    errorCount: number;
    errors?: any[];
    completedAt?: string;
  }) {
    this.server.emit('vehicleUploadComplete', data);
  }
}

