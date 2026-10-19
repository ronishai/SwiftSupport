import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import type { Priority } from '@swift-support/shared';

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export class CreateTicketDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsNotEmpty() email: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsString() @IsNotEmpty() floor: string;
  @IsString() @IsNotEmpty() room: string;
  @IsEnum(PRIORITIES) priority: Priority;
  @IsString() @IsNotEmpty() category: string;
}
