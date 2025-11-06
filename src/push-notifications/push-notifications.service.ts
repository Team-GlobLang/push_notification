import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationDto } from './notification.dto';

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  private readonly logger = new Logger('Noty_Service');
  constructor(private readonly prismaService: PrismaService) {}

  private app: admin.app.App;

  async onModuleInit() {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    this.logger.log('Firebase Admin initialized successfully');
  }

  async registerToken(data: { token: string; app: string }) {
    const { token, app } = data;
    try {
      const device = await this.prismaService.deviceToken.upsert({
        where: { token, app },
        update: {},
        create: { token, app },
      });
      return { success: true, device };
    } catch (error) {
      this.logger.error('Error registrando token', error);
      return { success: false, message: 'No se pudo registrar el token' };
    }
  }

  async notifyUsers(notification: NotificationDto) {
    this.logger.log(
      'Enviando notificaciones a Usuarios',
      notification.notification.title,
    );

    const devices = await this.prismaService.deviceToken.findMany({
      where: { app: 'GLOB' },
    });
    const tokens = devices.map((d) => d.token);
    if (!tokens.length) return;

    const messaging = admin.messaging() as admin.messaging.Messaging;

    if (!tokens.length) {
      this.logger.warn('No hay tokens para enviar notificación a usuarios');
      return;
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: notification.notification,
      data: notification.data || {},
    });

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        this.logger.warn(`❌ Error con token ${tokens[idx]}: ${resp.error}`);
      }
    });

    this.logger.log(`✅ Notificación enviada a ${tokens.length} usuarios`);
  }

  async notifyModerators(notification: NotificationDto) {
    this.logger.log(
      'Enviando notificaciones a Moderadores',
      notification.notification.title,
    );

    const devices = await this.prismaService.deviceToken.findMany({
      where: { app: 'MOD' },
    });

    const tokens = devices.map((d) => d.token);

    if (!tokens.length) {
      this.logger.warn('No hay tokens para enviar notificación a moderadores');
      return;
    }

    const messaging = admin.messaging() as admin.messaging.Messaging;

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: notification.notification,
      data: notification.data || {},
    });

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        this.logger.warn(`❌ Error con token ${tokens[idx]}: ${resp.error}`);
      }
    });

    this.logger.log(`✅ Notificación enviada a ${tokens.length} moderadores`);
  }
}
