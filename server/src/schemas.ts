import { z } from 'zod';

/**
 * VALIDATION SCHEMAS com Zod
 * 
 * Define schemas para validação de entrada em todas as rotas
 * Usado para sanitizar e validar dados do frontend/cliente
 */

// Schema para login
export const LoginSchema = z.object({
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(200, 'Senha muito longa'),
});

// Schema para participante
export const ParticipantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  age: z
    .number()
    .int()
    .min(0, 'Idade deve ser positiva')
    .max(150, 'Idade inválida')
    .nullable()
    .optional(),
  isChild: z.boolean(),
});

// Schema para RSVP
export const RSVPSchema = z.object({
  responsibleName: z
    .string()
    .trim()
    .min(2, 'Nome do responsável deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  confirmation: z.enum(['sim', 'nao']),
  totalPeople: z
    .number()
    .int()
    .positive('Total de pessoas deve ser número positivo')
    .max(50, 'Máximo 50 participantes por confirmação'),
  participants: z
    .array(ParticipantSchema)
    .min(0)
    .max(50, 'Máximo 50 participantes'),
});

// Schema para email (forgot password)
export const EmailSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(200, 'Email muito longo'),
});

// Schema para reset password
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  newPassword: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(200, 'Senha muito longa')
    .refine(
      (pwd) => /[A-Z]/.test(pwd),
      'Senha deve conter letra maiúscula'
    )
    .refine(
      (pwd) => /[a-z]/.test(pwd),
      'Senha deve conter letra minúscula'
    )
    .refine(
      (pwd) => /[0-9]/.test(pwd),
      'Senha deve conter número'
    )
    .refine(
      (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      'Senha deve conter caractere especial'
    ),
});

/**
 * Helper para validar com tratamento de erros
 * Retorna dados validados ou lança erro com mensagem clara
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(messages);
    }
    throw error;
  }
}