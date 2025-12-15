// user_service/tests/utils/createJWT.test.js

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const jwt = require("jsonwebtoken");

// Ajusta el path si tu test vive exactamente en: user_service/tests/utils/createJWT.test.js
const { generateJWT } = require("../../utils/createJWT");

describe("utils/createJWT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  test("genera token cuando jwt.sign funciona (callback u opción sync)", async () => {
    jwt.sign.mockImplementation((payload, secret, optsOrCb, maybeCb) => {
      const cb = typeof optsOrCb === "function" ? optsOrCb : maybeCb;
      if (typeof cb === "function") cb(null, "TOKEN_OK");
      return "TOKEN_OK";
    });

    const payload = { userId: 1, email: "a@test.com", role: "Student" };
    const token = await Promise.resolve(generateJWT(payload));

    expect(token).toBe("TOKEN_OK");
    expect(jwt.sign).toHaveBeenCalled();
  });

  test("rechaza cuando jwt.sign manda error", async () => {
    jwt.sign.mockImplementation((payload, secret, optsOrCb, maybeCb) => {
        const cb = typeof optsOrCb === "function" ? optsOrCb : maybeCb;
        if (typeof cb === "function") cb(new Error("SIGN_FAIL"));
        return undefined;
    });

    await expect(Promise.resolve(generateJWT({ a: 1 }))).rejects.toThrow(
        "Unable to generate token"
    );
    });

});
