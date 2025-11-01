// testRegisterUserModule.ts
import { registerUser } from "../controllers/user.controller.js";

// Self-contained test module
async function runRegisterUserTest() {
  // Fake request data
  const req: any = {
    body: {
      fName: "snk",
      lName: "ktri",
      email: `snkk@gmail.com`, // unique
      password: "Password123",
    },
    file: undefined, // or { path: "./dummy-profile.jpg" } to test upload
  };

  // Fake response object
  const res: any = {
    status: (code: number) => res,
    json: (data: any) => {
      console.log("RegisterUser Output:", data);
      return data;
    },
  };

  // Dummy next function
  const next: any = () => {};

  // Call the function
  await registerUser(req, res, next);
}

// Run the module
runRegisterUserTest();
