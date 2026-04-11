import { z } from "zod"

// ─── Organizations ──────────────────────────────────────────────────────
export const organizationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  wave_number: z.string().optional(),
  om_number: z.string().optional(),
  address: z.string().optional(),
})

// ─── Auth ────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirm_password: z.string(),
  property_count: z.number().min(1).max(200).optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
})

// ─── Properties ─────────────────────────────────────────────────────────
export const propertySchema = z.object({
  name: z.string().min(2, "Le nom du bien est requis"),
  type: z.enum(["appartement", "villa", "bureau", "local"]),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().default("Dakar"),
  notes: z.string().optional(),
})

// ─── Units ──────────────────────────────────────────────────────────────
export const unitSchema = z.object({
  unit_number: z.string().min(1, "Le numéro d'unité est requis"),
  type: z.enum(["studio", "f1", "f2", "f3", "f4", "commerce"]),
  floor: z.number().int().optional(),
  surface_m2: z.number().positive().optional(),
  rent_fcfa: z.number().int().positive("Le loyer doit être positif"),
  status: z.enum(["vacant", "rented", "maintenance"]).default("vacant"),
})

// ─── Tenants ────────────────────────────────────────────────────────────
export const tenantSchema = z.object({
  first_name: z.string().min(2, "Le prénom est requis"),
  last_name: z.string().min(2, "Le nom est requis"),
  whatsapp: z.string().min(9, "Le numéro WhatsApp est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  id_document_type: z.string().optional(),
  id_document_number: z.string().optional(),
  employer: z.string().optional(),
})

// ─── Leases ─────────────────────────────────────────────────────────────
export const leaseSchema = z.object({
  unit_id: z.string().uuid("Sélectionnez une unité"),
  tenant_id: z.string().uuid("Sélectionnez un locataire"),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().min(1, "La date de fin est requise"),
  rent_fcfa: z.number().int().positive("Le loyer doit être positif"),
  due_day: z.number().int().min(1).max(31, "Le jour d'échéance doit être entre 1 et 31"),
  deposit_fcfa: z.number().int().min(0).default(0),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "La date de fin doit être après la date de début",
  path: ["end_date"],
})

// ─── Payments ───────────────────────────────────────────────────────────
export const paymentSchema = z.object({
  rent_schedule_id: z.string().uuid("Sélectionnez une échéance"),
  amount_fcfa: z.number().int().positive("Le montant doit être positif"),
  method: z.enum(["wave", "orange_money", "cash"]),
  reference: z.string().optional(),
})

// ─── Expenses ───────────────────────────────────────────────────────────
export const expenseSchema = z.object({
  property_id: z.string().uuid("Sélectionnez un bien"),
  category: z.string().min(1, "La catégorie est requise"),
  amount_fcfa: z.number().int().positive("Le montant doit être positif"),
  description: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
})

// ─── Types exports ──────────────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type UnitInput = z.infer<typeof unitSchema>
export type TenantInput = z.infer<typeof tenantSchema>
export type LeaseInput = z.infer<typeof leaseSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
