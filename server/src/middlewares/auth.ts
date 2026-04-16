import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        platform: string;
      };
    }
  }
}

/**
 * JWT 认证中间件
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 从 Header 获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: '未提供认证令牌',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: '无效或过期的令牌',
      });
      return;
    }

    // 将用户信息挂载到 req 对象
    req.user = payload;
    next();
  } catch (error) {
    logger.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
    });
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  } catch (error) {
    // 可选认证，忽略错误
    next();
  }
};
