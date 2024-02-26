import { Partner, User } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user: User; // 가드로 막아놔서 무조건 User,partner 있어.
      partner: Partner;
    }
  }
}
