import { SetMetadata } from '@nestjs/common';

// use this decorator like @Roles('ADMIN') or @Roles('USER') 
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);