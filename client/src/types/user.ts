export interface RegisterForm {
    fName: string;
    lName: string;
    email: string;
    password: string;
    profile?: File;
}

export interface LoginFrom {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  profile?: string;
  [key: string]: any;
}
