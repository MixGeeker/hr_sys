import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

/**
 * 全局守卫：在请求通过 JWT 守卫后，将 request.user 写入 CLS 上下文
 * 作用：让服务层可通过 ClsService 获取当前操作用户（用于 createdBy/updatedBy/deletedBy 自动填充）
 */
@Injectable()
export class ClsUserGuard implements CanActivate {
  constructor(private readonly cls: ClsService) {}

  /**
   * 将当前请求上的用户对象写入 CLS。
   * @param context 执行上下文
   * @returns 始终返回 true，保证不影响后续流程
   */
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req && req.user) {
      this.cls.set('user', req.user);
    }
    return true;
  }
}
