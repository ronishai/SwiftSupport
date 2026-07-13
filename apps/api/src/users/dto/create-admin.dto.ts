import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import type { TeamId } from '@swift-support/shared';

export class CreateAdminDto {
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  @IsNotEmpty({ message: 'אימייל הוא שדה חובה' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'סיסמה היא שדה חובה' })
  @MinLength(8, { message: 'הסיסמה חייבת להכיל לפחות 8 תווים' })
  // Regex: 1 uppercase, 1 number, 1 special character
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/,
    {
      message: 'הסיסמה חייבת להכיל לפחות אות גדולה אחת, מספר אחד ותו מיוחד אחד',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'שם מלא הוא שדה חובה' })
  displayName: string;

  @IsString()
  @IsNotEmpty({ message: 'יש לשייך את המנהל לצוות' })
  team: TeamId;
}
