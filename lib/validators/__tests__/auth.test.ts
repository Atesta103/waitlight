import { describe, it, expect } from "vitest"
import {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
} from "../auth"

// ---------------------------------------------------------------------------
// LoginSchema
// ---------------------------------------------------------------------------
describe("LoginSchema", () => {
    it("accepts a valid email and password", () => {
        expect(
            LoginSchema.safeParse({ email: "test@example.com", password: "secret" }).success,
        ).toBe(true)
    })

    it("rejects an invalid email", () => {
        expect(
            LoginSchema.safeParse({ email: "not-an-email", password: "secret" }).success,
        ).toBe(false)
    })

    it("rejects an empty email", () => {
        expect(
            LoginSchema.safeParse({ email: "", password: "secret" }).success,
        ).toBe(false)
    })

    it("rejects an empty password", () => {
        expect(
            LoginSchema.safeParse({ email: "test@example.com", password: "" }).success,
        ).toBe(false)
    })

    it("rejects missing email field", () => {
        expect(
            LoginSchema.safeParse({ password: "secret" }).success,
        ).toBe(false)
    })

    it("rejects missing password field", () => {
        expect(
            LoginSchema.safeParse({ email: "test@example.com" }).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// RegisterSchema
// ---------------------------------------------------------------------------
describe("RegisterSchema", () => {
    const validPassword = "Password1!"

    it("accepts matching email, password, and confirm_password", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: validPassword,
                confirm_password: validPassword,
            }).success,
        ).toBe(true)
    })

    it("rejects when passwords do not match", () => {
        const result = RegisterSchema.safeParse({
            email: "user@example.com",
            password: validPassword,
            confirm_password: "Different1!",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a password shorter than 8 characters", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: "Ab1!",
                confirm_password: "Ab1!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without an uppercase letter", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: "password1!",
                confirm_password: "password1!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without a lowercase letter", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: "PASSWORD1!",
                confirm_password: "PASSWORD1!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without a digit", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: "Password!",
                confirm_password: "Password!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without a special character", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: "Password1",
                confirm_password: "Password1",
            }).success,
        ).toBe(false)
    })

    it("rejects an invalid email", () => {
        expect(
            RegisterSchema.safeParse({
                email: "bad-email",
                password: validPassword,
                confirm_password: validPassword,
            }).success,
        ).toBe(false)
    })

    it("rejects empty confirm_password", () => {
        expect(
            RegisterSchema.safeParse({
                email: "user@example.com",
                password: validPassword,
                confirm_password: "",
            }).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// ForgotPasswordSchema
// ---------------------------------------------------------------------------
describe("ForgotPasswordSchema", () => {
    it("accepts a valid email", () => {
        expect(
            ForgotPasswordSchema.safeParse({ email: "user@example.com" }).success,
        ).toBe(true)
    })

    it("rejects an invalid email", () => {
        expect(
            ForgotPasswordSchema.safeParse({ email: "not-an-email" }).success,
        ).toBe(false)
    })

    it("rejects an empty email", () => {
        expect(
            ForgotPasswordSchema.safeParse({ email: "" }).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// ResetPasswordSchema
// ---------------------------------------------------------------------------
describe("ResetPasswordSchema", () => {
    const validPassword = "Password1!"

    it("accepts matching password and confirm_password", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: validPassword,
                confirm_password: validPassword,
            }).success,
        ).toBe(true)
    })

    it("rejects when passwords do not match", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: validPassword,
                confirm_password: "Other1!X",
            }).success,
        ).toBe(false)
    })

    it("rejects a password shorter than 8 characters", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: "Ab1!",
                confirm_password: "Ab1!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without uppercase", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: "password1!",
                confirm_password: "password1!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without a digit", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: "Password!",
                confirm_password: "Password!",
            }).success,
        ).toBe(false)
    })

    it("rejects a password without a special character", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: "Password1",
                confirm_password: "Password1",
            }).success,
        ).toBe(false)
    })

    it("rejects empty confirm_password", () => {
        expect(
            ResetPasswordSchema.safeParse({
                password: validPassword,
                confirm_password: "",
            }).success,
        ).toBe(false)
    })
})
