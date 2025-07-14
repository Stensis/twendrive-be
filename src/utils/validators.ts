import * as yup from 'yup';

export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export const registerSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  userName: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain an uppercase letter")
    .matches(/[a-z]/, "Must contain a lowercase letter")
    .matches(/[0-9]/, "Must contain a number")
    .matches(/[@$!%*?&#]/, "Must contain a special character")
    .required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required(),
  role: yup.string().required(),
});
