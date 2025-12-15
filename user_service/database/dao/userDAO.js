const bcrypt = require('bcryptjs');
const connection = require("../pool");

const createUser = async (user) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();
        const hashedPassword = await bcrypt.hash(user.userPassword, 10);

        const [userResult] = await dbConnection.execute(
            `INSERT INTO User (userName, paternalSurname, maternalSurname, email, userPassword, userType, verificationCode, isVerified) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user.userName,
                user.paternalSurname,
                user.maternalSurname,
                user.email,
                hashedPassword,
                user.userType,
                user.verificationCode,
                user.isVerified
            ]
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

    } catch (error) {
        await dbConnection.rollback();
        console.error("User creating error:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const findUserByEmail = async (email) => {
    const query = 'SELECT email FROM User WHERE email = ?';
    try {
        const [rows] = await connection.execute(query, [email]);
        return rows.length > 0 ? rows[0].email : null;
    } catch (error) {
        console.error("Find user by email error:", error);
        throw error;
    }
};

const findUserByEmailJSON = async (email) => {
    const query = 'SELECT * FROM User WHERE email = ?';
    try {
        const [rows] = await connection.execute(query, [email]);

        if (rows.length === 0) return null;

        const user = rows[0];

        // Conversión de campos importantes si fuera necesario
        user.isVerified = Boolean(user.isVerified);

        return user; // Regresa todo el JSON del usuario
    } catch (error) {
        console.error("findUserByEmailJSON error:", error);
        throw error;
    }
};



const login = async (email, userPassword) => {
    const dbConnection = await connection.getConnection();
    const query = `
        SELECT userId, userName, paternalSurname, maternalSurname, email, userPassword, userType
        FROM User
        WHERE email = ? 
    `;

    try {
        const [rows] = await dbConnection.execute(query, [email]);

        if (rows.length === 0) return null;

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(userPassword, user.userPassword);

        if (!isPasswordValid) return null;

        return {
            userId: user.userId,
            email: user.email,
            role: user.userType,
            name: user.userName,
            paternalSurname: user.paternalSurname,
            maternalSurname: user.maternalSurname
        };

    } catch (error) {
        console.error("Login error:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const findUser = async (email) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) return null;

        const user = rows[0];
        user.isVerified = Boolean(user.isVerified);
        return user;

    } catch (error) {
        console.error("Find user error:", error);
        throw error;
    }
};

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

async function updateUserBasicProfile(
    userId,
    { userName, paternalSurname, maternalSurname, profileImageUrl }
) {
    const db = await connection.getConnection();

    try {
        const fields = [];
        const values = [];

        if (userName !== undefined) {
            fields.push("userName = ?");
            values.push(userName);
        }

        if (paternalSurname !== undefined) {
            fields.push("paternalSurname = ?");
            values.push(paternalSurname);
        }

        if (maternalSurname !== undefined) {
            fields.push("maternalSurname = ?");
            values.push(maternalSurname);
        }

        if (profileImageUrl !== undefined) {
            fields.push("profileImageUrl = ?");
            values.push(profileImageUrl);
        }

        if (fields.length === 0) return { affectedRows: 0 };

        const sql = `
            UPDATE User
            SET ${fields.join(", ")}
            WHERE userId = ?
        `;

        values.push(userId);

        const [result] = await db.execute(sql, values);
        return result;

    } finally {
        db.release();
    }
}



const getStudentsByIds = async (studentIds) => {
    const dbConnection = await connection.getConnection();
    try {
        if (!studentIds || studentIds.length === 0) return [];

        const placeholders = studentIds.map(() => '?').join(',');
        const [rows] = await dbConnection.execute(
            `SELECT s.studentId, CONCAT(u.userName, ' ', u.paternalSurname, ' ', u.maternalSurname) AS name, s.average
             FROM Student s
             JOIN User u ON s.studentId = u.userId
             WHERE s.studentId IN (${placeholders})`,
            studentIds
        );

        return rows;

    } catch (err) {
        console.error("Error in getStudentsByIds DAO:", err);
        return studentIds.map(id => ({ studentId: id, name: "Desconocido" }));
    } finally {
        dbConnection.release();
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    login,
    findUser,
    updateUserVerification,
    getStudentsByIds,
    updateUserBasicProfile,
    findUserByEmailJSON
};
