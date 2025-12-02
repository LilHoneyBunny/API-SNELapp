const bcrypt = require('bcryptjs');
const connection = require("../pool");

const createUser = async (user) => {
    const dbConnection = await connection.getConnection();
    try{
        await dbConnection.beginTransaction();
        const hashedPassword = await bcrypt.hash(user.userPassword, 10);

        const [userResult] = await dbConnection.execute(
            `INSERT INTO User (userName, paternalSurname, maternalSurname, email, userPassword, userType, verificationCode, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.userName, user.paternalSurname, user.maternalSurname, user.email, hashedPassword, user.userType, user.verificationCode, user.isVerified]
        );

        const userId = userResult.insertId;

        const titleMap = {
            'Dr.': 1,
            'Mtro.': 2,
            'Lic.': 3,
            'Ing.': 4,
            'Prof.': 5
        };


        if (user.userType === 'Student') {
            await dbConnection.execute(
                `INSERT INTO Student (studentId, levelId, average) VALUES (?, ?, ?)`,
                [userId, user.levelId ?? 1, user.average ?? 0.00]
            );
        } else if (user.userType === 'Instructor') {
            const titleId = titleMap[user.titleName] || 3; 
            await dbConnection.execute(
                `INSERT INTO Instructor (instructorId, titleId, biography) VALUES (?, ?, ?)`,
                [userId, titleId, user.biography ?? null]
            );
        }

        await dbConnection.commit();

        return { success: true, userId };

    }catch(error){
        await dbConnection.rollback();
        console.error("User creating error:", error);
        throw error;
    }
}

const findUserByEmail = async (email) => {
    const query = 'SELECT email FROM User WHERE email = ?';
    let idResult = null;
       try {
        const [rows] = await (await connection).execute(query, [email]);

        if (rows.length > 0) {
            idResult = rows[0].email;
        }

    } catch (error) {
        console.error("Find user by email error:", error);
        throw error;
    }

    return idResult;
}

const login = async (email, userPassword) => {
    const dbConnection = await connection.getConnection();
    const query = `
        SELECT userId, userName, paternalSurname, maternalSurname, email, userPassword, userType
        FROM User
        WHERE email = ? 
        `;
    let loginResult = null;

    try{
        const [rows] = await (await dbConnection).execute(query, [email]);

        if(rows.length > 0){
            const user = rows[0];
            const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);

            if (!isPasswordValid) {
                return null; 
            }

            loginResult = {
                userId: user.userId, 
                email: user.email,
                role: user.userType,
                name: user.userName,
                paternalSurname: user.paternalSurname,
                maternalSurname: user.maternalSurname
            };
        } 
    }catch(error){
        console.error("Login error:", error);
        throw error;
    }
    return loginResult;
};

const findUser = async (email) => {
    const query = 'SELECT * FROM User WHERE email = ?';
    try {
        const [rows] = await (await connection).execute(query, [email]);
        if (rows.length === 0) return null;

        const user = rows[0];
        user.isVerified = Boolean(user.isVerified);
        return user;
    } catch (error) {
        console.error("Find user by email error:", error);
        throw error;
    }
}

const updateUserVerification = (email) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE User 
      SET isVerified = TRUE, verificationCode = NULL
      WHERE email = ?;
    `;
    connection.query(query, [email], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {createUser, findUserByEmail, login, findUser, updateUserVerification};