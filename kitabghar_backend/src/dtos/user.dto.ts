export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AdminCreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

export interface AdminUpdateUserDTO {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  avatar?: string;  
}