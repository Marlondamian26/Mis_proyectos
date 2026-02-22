export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'clave-secreta-muy-larga-y-segura',
  accessTokenExpiration: '30m',  // 30 minutos
  refreshTokenExpiration: '7d',  // 7 días
};