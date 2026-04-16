import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface JwtPayload {
  uid: string;
  platform: string;
}

/**
 * 生成 JWT Token
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * 验证 JWT Token
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * 密码加密
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * 密码验证
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
