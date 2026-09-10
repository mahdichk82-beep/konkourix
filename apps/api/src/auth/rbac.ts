import { ApiError } from '../errors/api-error.js'
import type { AuthRole } from './access-token.js'
import type { AuthService } from './auth-service.js'
import type { AuthenticatedRequest } from '../plugins/authentication.js'
import { authenticateRequest } from '../plugins/authentication.js'

export const requireAuth = (auth: AuthService) => authenticateRequest(auth)

export const requireRoles = (...allowedRoles: AuthRole[]) =>
  async (request: AuthenticatedRequest): Promise<void> => {
    if (!request.user) {
      throw new ApiError(401, 'TOKEN_MISSING', 'Authentication is required')
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ApiError(403, 'ROLE_FORBIDDEN', 'Insufficient role permissions')
    }
  }

export const requireRole = (role: AuthRole) => requireRoles(role)
