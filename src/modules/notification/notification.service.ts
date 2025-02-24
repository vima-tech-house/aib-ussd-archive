import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from '@database/models/notification.model';
import { SocketGateway } from '@modules/socket/socket.gateway';
import { Op } from 'sequelize';
import { Feature } from '@/common/enums/feature.enum';
import { differenceInMinutes, differenceInHours, differenceInDays, formatDistanceToNow, format } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private readonly notificationModel: typeof Notification, 

    @Inject(forwardRef(() => SocketGateway)) 
    private readonly socketGateway: SocketGateway
  ) {}

  async createNotification(feature: Feature, message: string, recipients: string | string[]) {
    if (!Array.isArray(recipients)) {
      recipients = [recipients]; 
    }

    const timestamp = new Date();

    const notification = await this.notificationModel.create({ 
      feature,
      message,
      recipients, 
      timestamp,
    });

    const timeAgo = this.formatTimeAgo(notification.timestamp);
    const notificationWithTimeAge = {
      ...notification.toJSON(),
      timeAgo,
    }

  
    if (this.socketGateway.server) {
      recipients.forEach((recipient) => {
        this.socketGateway.server.to(recipient).emit('new-notification', notificationWithTimeAge);
      });
    } else {
      console.warn('WebSocket server is not initialized yet.');
    }
  
    return notificationWithTimeAge;
  }


  private formatTimeAgo(timestamp: Date): string {
    const now = new Date();

    const diffInMinutes = differenceInMinutes(now, timestamp);
    const diffInHours = differenceInHours(now, timestamp);
    const diffInDays = differenceInDays(now, timestamp);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return format(timestamp, 'dd-MMM-yyyy');  
    }
  }

  async getUserNotifications(userId: string, limit: number, offset: number) {
    const { count, rows: notifications } = await this.notificationModel.findAndCountAll({
      where: {
        recipients: {
          [Op.contains]: [userId], 
        },
      },
      order: [['timestamp', 'DESC']],
      limit,  // Use limit instead of take
      offset, // Use offset instead of skip
    });
  
    const hasMore = count > offset + notifications.length;
  
    return {
      notifications: notifications.map(notification => ({
        ...notification.toJSON(),
        timeAgo: this.formatTimeAgo(notification.timestamp),
      })),
      hasMore,
    };
  }
  
  
  


  
}
