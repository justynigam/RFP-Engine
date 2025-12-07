'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

// Mock user data
const users = [
  { email: 'user@example.com', password: 'password123' },
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});


export async function login(data: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { email, password } = validatedFields.data;

  // In a real app, you'd check this against a database
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // In a real app, you'd create a session here.
  // For this demo, we just redirect.
  redirect('/dashboard');
}

export async function signup(data: z.infer<typeof signupSchema>) {
  const validatedFields = signupSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error('Invalid fields');
  }

  const { email, password } = validatedFields.data;

  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }

  // In a real app, you'd hash the password and save to DB
  users.push({ email, password });
  
  // No redirect on signup, let the form handle showing a success message
  return { success: true };
}

export async function logout() {
    // In a real app, destroy session
    redirect('/');
}
