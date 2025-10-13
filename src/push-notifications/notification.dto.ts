import { IsString, IsOptional, IsObject } from 'class-validator';

class NotificationBody {
  @IsString()
  title: string;

  @IsString()
  body: string;
}


export class NotificationDto {
  @IsObject()
  notification: NotificationBody;

  @IsObject()
  @IsOptional()
  data?: {
    [key: string]: string;
  };
}

