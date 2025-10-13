import { Controller } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationDto } from './notification.dto';

@Controller()
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @MessagePattern('register_new_token')
  async registerToken(@Payload() data: { token: string; app: string }) {
    return this.pushNotificationsService.registerToken(data);
  }

  @EventPattern('notify.moderators')
  async handleNotifyModerators(@Payload() payload: NotificationDto) {
    await this.pushNotificationsService.notifyModerators(payload);
  }

  @EventPattern('notify.users')
  async handleNotifyUsers(@Payload() payload: NotificationDto) {
    await this.pushNotificationsService.notifyUsers(payload);
  }
}
