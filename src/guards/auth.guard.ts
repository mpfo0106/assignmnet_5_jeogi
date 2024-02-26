import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { AccountType } from 'src/domains/accounts/accounts.type';
import { PrismaService } from './../db/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountTypeInDecorator = this.reflector.getAllAndOverride<
      'user' | 'partner'
    >('accountType', [context.getHandler(), context.getClass()]);

    if (!accountTypeInDecorator) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = this.extractTokenFromHeader(request);
    if (!accessToken) throw new UnauthorizedException();

    try {
      const secret = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
      const { sub: id, accountType: accountTypeInAccessToken } = verify(
        accessToken,
        secret,
      ) as JwtPayload & { accountType: AccountType }; // 제네릭이 없어서 이렇게 타입 지정

      //accessToken 이 유효하다

      if (accountTypeInDecorator !== accountTypeInAccessToken)
        throw new Error(); // 파트너만 접근할 수 있는 라우트인데 유저 토큰이 들어왔을때

      if (accountTypeInDecorator === 'user') {
        const user = await this.prismaService.user.findUniqueOrThrow({
          where: { id },
        });
        request.user = user;
      } else {
        const partner = await this.prismaService.partner.findUniqueOrThrow({
          where: { id },
        });
        request.partner = partner;
      }
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []; // 만약에 null 이면 빈 배열
    return type === 'Bearer' ? token : undefined;
  }
}
