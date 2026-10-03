import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// @ts-ignore
import { User, Role } from '@prisma/client';
import prisma from '../config/prisma';
import config from '../config';
import { AppError } from '../middleware/errorHandler';

const generateToken = (userId: string, role: string): string => {
  return (jwt.sign as any)({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const register = async (data: any) => {
  const { name, email, password } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const token = generateToken(user.id, user.role);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const login = async (data: any) => {
  const { email, password } = data;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user.id, user.role);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
};

export const updateProfile = async (userId: string, data: any) => {
  const { name, email, password } = data;

  const updateData: any = {};
  if (name) updateData.name = name;
  
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      throw new AppError('Email already in use', 400);
    }
    updateData.email = email;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(password, salt);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
};
