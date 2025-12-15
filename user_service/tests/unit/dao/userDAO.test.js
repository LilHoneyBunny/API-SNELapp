// user_service/tests/unit/dao/userDAO.test.js

const { mockPool, mockDbConnection, resetDbMocks } = require("../../mocks/db");

jest.mock("../../../database/pool", () => require("../../mocks/db").mockPool);

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcrypt = require("bcryptjs");

const userDAO = require("../../../database/dao/userDAO");

describe("userDAO", () => {
  beforeEach(() => {
    resetDbMocks();
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("crea usuario Student y hace commit", async () => {
      bcrypt.hash.mockResolvedValue("hashed_pw");

      mockDbConnection.execute
        .mockResolvedValueOnce([{ insertId: 10 }]) // INSERT User
        .mockResolvedValueOnce([{}]); // INSERT Student

      const result = await userDAO.createUser({
        userName: "Ana",
        paternalSurname: "López",
        maternalSurname: "Pérez",
        email: "ana@test.com",
        userPassword: "plain",
        userType: "Student",
        verificationCode: "999999",
        isVerified: false,
        levelId: 2,
        average: 9.5,
      });

      expect(mockPool.getConnection).toHaveBeenCalledTimes(1);
      expect(mockDbConnection.beginTransaction).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith("plain", 10);

      // 2 executes: User + Student
      expect(mockDbConnection.execute).toHaveBeenCalledTimes(2);
      expect(mockDbConnection.commit).toHaveBeenCalledTimes(1);
      expect(mockDbConnection.rollback).not.toHaveBeenCalled();

      expect(mockDbConnection.release).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true, userId: 10 });
    });

    test("crea usuario Instructor y hace commit", async () => {
      bcrypt.hash.mockResolvedValue("hashed_pw");

      mockDbConnection.execute
        .mockResolvedValueOnce([{ insertId: 20 }]) // INSERT User
        .mockResolvedValueOnce([{}]); // INSERT Instructor

      const result = await userDAO.createUser({
        userName: "Dr",
        paternalSurname: "Strange",
        maternalSurname: "Marvel",
        email: "doc@test.com",
        userPassword: "plain",
        userType: "Instructor",
        titleName: "Dr.",
        biography: "Bio",
        verificationCode: "111111",
        isVerified: false,
      });

      expect(mockDbConnection.beginTransaction).toHaveBeenCalled();
      expect(mockDbConnection.execute).toHaveBeenCalledTimes(2);
      expect(mockDbConnection.commit).toHaveBeenCalled();
      expect(mockDbConnection.release).toHaveBeenCalled();

      expect(result).toEqual({ success: true, userId: 20 });
    });

    test("si hay error, hace rollback y relanza", async () => {
      bcrypt.hash.mockResolvedValue("hashed_pw");
      mockDbConnection.execute.mockRejectedValueOnce(new Error("DB FAIL"));

      await expect(
        userDAO.createUser({
          userName: "Ana",
          paternalSurname: "López",
          maternalSurname: "Pérez",
          email: "ana@test.com",
          userPassword: "plain",
          userType: "Student",
          verificationCode: "999999",
          isVerified: false,
        })
      ).rejects.toThrow("DB FAIL");

      expect(mockDbConnection.rollback).toHaveBeenCalledTimes(1);
      expect(mockDbConnection.commit).not.toHaveBeenCalled();
      expect(mockDbConnection.release).toHaveBeenCalledTimes(1);
    });
  });

  describe("findUserByEmail", () => {
    test("regresa email si existe", async () => {
      mockPool.execute.mockResolvedValueOnce([[{ email: "x@test.com" }]]);
      const email = await userDAO.findUserByEmail("x@test.com");
      expect(email).toBe("x@test.com");
    });

    test("regresa null si no existe", async () => {
      mockPool.execute.mockResolvedValueOnce([[]]);
      const email = await userDAO.findUserByEmail("no@test.com");
      expect(email).toBeNull();
    });
  });

  describe("findUserByEmailJSON", () => {
    test("regresa usuario y convierte isVerified a boolean", async () => {
      mockPool.execute.mockResolvedValueOnce([[{ email: "a@test.com", isVerified: 1 }]]);
      const user = await userDAO.findUserByEmailJSON("a@test.com");
      expect(user.email).toBe("a@test.com");
      expect(user.isVerified).toBe(true);
    });

    test("regresa null si no hay filas", async () => {
      mockPool.execute.mockResolvedValueOnce([[]]);
      const user = await userDAO.findUserByEmailJSON("a@test.com");
      expect(user).toBeNull();
    });
  });

  describe("login", () => {
    test("regresa null si no existe usuario", async () => {
      mockDbConnection.execute.mockResolvedValueOnce([[]]);
      const out = await userDAO.login("x@test.com", "pw");
      expect(out).toBeNull();
      expect(mockDbConnection.release).toHaveBeenCalled();
    });

    test("regresa null si password incorrecto", async () => {
      mockDbConnection.execute.mockResolvedValueOnce([
        [{ userId: 1, userName: "A", paternalSurname: "B", maternalSurname: "C", email: "x@test.com", userPassword: "HASH", userType: "Student" }],
      ]);
      bcrypt.compare.mockResolvedValue(false);

      const out = await userDAO.login("x@test.com", "pw");
      expect(out).toBeNull();
      expect(mockDbConnection.release).toHaveBeenCalled();
    });

    test("regresa objeto de sesión si password correcto", async () => {
      mockDbConnection.execute.mockResolvedValueOnce([
        [{ userId: 1, userName: "A", paternalSurname: "B", maternalSurname: "C", email: "x@test.com", userPassword: "HASH", userType: "Student" }],
      ]);
      bcrypt.compare.mockResolvedValue(true);

      const out = await userDAO.login("x@test.com", "pw");
      expect(out).toEqual({
        userId: 1,
        email: "x@test.com",
        role: "Student",
        name: "A",
        paternalSurname: "B",
        maternalSurname: "C",
      });
      expect(mockDbConnection.release).toHaveBeenCalled();
    });
  });

  describe("findUser", () => {
    test("regresa null si no existe", async () => {
      mockPool.execute.mockResolvedValueOnce([[]]);
      const out = await userDAO.findUser("no@test.com");
      expect(out).toBeNull();
    });

    test("convierte isVerified a boolean", async () => {
      mockPool.execute.mockResolvedValueOnce([[{ email: "a@test.com", isVerified: 0 }]]);
      const out = await userDAO.findUser("a@test.com");
      expect(out.isVerified).toBe(false);
    });
  });

  describe("updateUserVerification", () => {
    test("resuelve result si query ok", async () => {
      mockPool.query.mockImplementation((sql, params, cb) => cb(null, { affectedRows: 1 }));

      await expect(userDAO.updateUserVerification("a@test.com")).resolves.toEqual({ affectedRows: 1 });
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    test("rechaza si query falla", async () => {
      mockPool.query.mockImplementation((sql, params, cb) => cb(new Error("QFAIL")));

      await expect(userDAO.updateUserVerification("a@test.com")).rejects.toThrow("QFAIL");
    });
  });

  describe("getStudentsByIds", () => {
    test("regresa [] si ids vacío", async () => {
      const out = await userDAO.getStudentsByIds([]);
      expect(out).toEqual([]);
    });

    test("regresa filas si todo ok", async () => {
      mockDbConnection.execute.mockResolvedValueOnce([[{ studentId: 1, name: "A B C", average: 9.9 }]]);
      const out = await userDAO.getStudentsByIds([1]);
      expect(out).toEqual([{ studentId: 1, name: "A B C", average: 9.9 }]);
      expect(mockDbConnection.release).toHaveBeenCalled();
    });

    test("si falla, regresa fallback Desconocido", async () => {
      mockDbConnection.execute.mockRejectedValueOnce(new Error("DBFAIL"));
      const out = await userDAO.getStudentsByIds([1, 2]);
      expect(out).toEqual([
        { studentId: 1, name: "Desconocido" },
        { studentId: 2, name: "Desconocido" },
      ]);
      expect(mockDbConnection.release).toHaveBeenCalled();
    });
  });

  describe("updateUserBasicProfile", () => {
    test("si no hay campos, no ejecuta UPDATE y regresa affectedRows 0", async () => {
      const out = await userDAO.updateUserBasicProfile(1, {});
      expect(out).toEqual({ affectedRows: 0 });
      expect(mockDbConnection.execute).not.toHaveBeenCalled();
      expect(mockDbConnection.release).toHaveBeenCalled();
    });

    test("con campos, ejecuta UPDATE y regresa result", async () => {
      mockDbConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const out = await userDAO.updateUserBasicProfile(1, {
        userName: "Nuevo",
        profileImageUrl: "/avatars/a.jpg",
      });

      expect(mockDbConnection.execute).toHaveBeenCalledTimes(1);
      expect(out).toEqual({ affectedRows: 1 });
      expect(mockDbConnection.release).toHaveBeenCalled();
    });
  });
});
