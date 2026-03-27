[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/auth

# validators/auth

## Type Aliases

### ForgotPasswordInput

```ts
type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
```

Defined in: [lib/validators/auth.ts:63](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L63)

***

### LoginInput

```ts
type LoginInput = z.infer<typeof LoginSchema>;
```

Defined in: [lib/validators/auth.ts:40](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L40)

***

### RegisterInput

```ts
type RegisterInput = z.infer<typeof RegisterSchema>;
```

Defined in: [lib/validators/auth.ts:55](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L55)

***

### ResetPasswordInput

```ts
type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
```

Defined in: [lib/validators/auth.ts:77](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L77)

## Variables

### ForgotPasswordSchema

```ts
const ForgotPasswordSchema: ZodObject<{
  email: ZodString;
}, $strip>;
```

Defined in: [lib/validators/auth.ts:59](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L59)

***

### LoginSchema

```ts
const LoginSchema: ZodObject<{
  email: ZodString;
  password: ZodString;
}, $strip>;
```

Defined in: [lib/validators/auth.ts:35](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L35)

***

### RegisterSchema

```ts
const RegisterSchema: ZodObject<{
  confirm_password: ZodString;
  email: ZodString;
  password: ZodString;
}, $strip>;
```

Defined in: [lib/validators/auth.ts:44](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L44)

***

### ResetPasswordSchema

```ts
const ResetPasswordSchema: ZodObject<{
  confirm_password: ZodString;
  password: ZodString;
}, $strip>;
```

Defined in: [lib/validators/auth.ts:67](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/auth.ts#L67)
