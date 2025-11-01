import { signIn } from "../controllers/user.controller.js";

async function runSignInTest() {
  const req: any = {
    body: {
      email: `snk@gmail.com`,
      password: "Password123",
    },
    headers: {},
  };

  const res: any = {
  status: (code: number) => res,
  json: (data: any) => {
    console.log("signIn Output:", data);
    return data;
  },
  cookie: (name: string, value: any, options?: any) => {
    console.log(`Cookie set: ${name}=${value}`);
    return res; // allow chaining
  },
};

  const next: any = (err?: any) => { if(err) console.error("Next Error:", err); };

  await signIn(req, res, next);
}

runSignInTest();
