import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { ConductoresService } from '../conductores/conductores.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private conductoresService: ConductoresService,
  ) {}

  async generateTokens(userId: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, role },
        {
          expiresIn: '30m',
          secret: this.configService.get('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, role },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(plainPassword, hashedPassword);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const { sub, role } = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens(sub, role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    // TODO: Implement user validation logic here
    const user = { id: '1', email, role: 'admin_cpo' }; // Placeholder
    const tokens = await this.generateTokens(user.id, user.role);
    return { ...tokens, user };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const conductor = await this.conductoresService.findByEmail(email);
    if (conductor && await this.verifyPassword(password, conductor.password)) {
      const { password: _, ...result } = conductor;
      return result;
    }
    return null;
  }

  async register(registerDto: any) {
    const existingConductor = await this.conductoresService.findByEmail(registerDto.email);
    if (existingConductor) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const conductor = await this.conductoresService.create({
      ...registerDto,
      password: hashedPassword,
    }, 'system'); // Using 'system' as the default auditoria user for registration

    const { password: _, ...result } = conductor;
    return result;
  }
}