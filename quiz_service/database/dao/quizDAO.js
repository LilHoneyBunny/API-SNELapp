const connection = require("../pool");

const createQuiz = async (quiz) => {
      const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();

        const totalWeighing = quiz.questions.reduce((sum, q) => {
            return sum + (q.points ?? 1);
        }, 0);

        const [quizResult] = await dbConnection.execute(
            `INSERT INTO Quiz (title, description, numberQuestion, weighing, cursoId, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                quiz.title,
                quiz.description ?? 'Añada una descripción',
                quiz.questions.length,
                totalWeighing,
                quiz.cursoId,
                quiz.status ?? 'Activo' 
            ]
        );

        const quizId = quizResult.insertId;

        for (const question of quiz.questions) {
            const [questionResult] = await dbConnection.execute(
                `INSERT INTO Question (quizId, questionText, points)
                 VALUES (?, ?, ?)`,
                [quizId, question.text, question.points ?? 1]
            );

            const questionId = questionResult.insertId;

            for (const option of question.options) {
                await dbConnection.execute(
                    `INSERT INTO OptionAnswer (questionId, optionText, isCorrect)
                     VALUES (?, ?, ?)`,
                    [questionId, option.text, option.isCorrect ? 1 : 0]
                );
            }
        }

        await dbConnection.commit();
        return { success: true, quizId, totalWeighing };

    } catch (error) {
        await dbConnection.rollback();
        console.error("Quiz creating error:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const updateQuiz = async (quizId, details) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();

        const { title, description, questions } = details;
        const fields = [];
        const values = [];

        if (title) {
            fields.push("title = ?");
            values.push(title);
        }
        if (description) {
            fields.push("description = ?");
            values.push(description);
        }

        if (fields.length > 0) {
            values.push(quizId);
            const query = `UPDATE Quiz SET ${fields.join(", ")} WHERE quizId = ?`;
            await dbConnection.execute(query, values);
        }

        if (questions && questions.length > 0) {
            for (const question of questions) {
                if (question.questionId) {
                    if (question.text) {
                        await dbConnection.execute(
                            `UPDATE Question SET questionText = ? WHERE questionId = ?`,
                            [question.text, question.questionId]
                        );
                    }

                    if (question.options && question.options.length > 0) {
                        for (const option of question.options) {
                            if (option.optionId) {
                                await dbConnection.execute(
                                    `UPDATE OptionAnswer SET optionText = ?, isCorrect = ? WHERE optionId = ?`,
                                    [option.text, option.isCorrect ? 1 : 0, option.optionId]
                                );
                            }
                        }
                    }
                }
            }
        }

        await dbConnection.commit();
        return { success: true };
    } catch (error) {
        await dbConnection.rollback();
        console.error("Error updating quiz:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getQuizForUpdate = async (quizId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [quizRows] = await dbConnection.execute(
            `SELECT quizId, title, description, creationDate, numberQuestion, weighing, status
             FROM Quiz
             WHERE quizId = ?`,
            [quizId]
        );

        if (quizRows.length === 0) return null;
        const quiz = quizRows[0];

        const [questions] = await dbConnection.execute(
            `SELECT questionId, questionText, points
             FROM Question
             WHERE quizId = ?`,
            [quizId]
        );

        for (let q of questions) {
            const [options] = await dbConnection.execute(
                `SELECT optionId, optionText, isCorrect
                 FROM OptionAnswer
                 WHERE questionId = ?`,
                [q.questionId]
            );

            q.options = options;
        }

        quiz.questions = questions;

        return quiz;

    } catch (error) {
        console.error("Error fetching quiz for update:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const deleteQuiz = async (quizId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [result] = await dbConnection.execute(
            `DELETE FROM Quiz WHERE quizId = ?`,
            [quizId]
        );
        return result;
    } catch (error) {
        console.error("Error deleting quiz:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getAllQuiz = async (cursoId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT quizId, title, description, creationDate, numberQuestion 
             FROM Quiz WHERE cursoId = ?`,
            [cursoId]
        );
        return rows; 
    } catch (error) {
        console.error("Error fetching quizzes by course:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getQuizByTitle = async (title) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT quizId, title, description, creationDate, numberQuestion 
             FROM Quiz 
             WHERE title LIKE ? COLLATE utf8_general_ci`,
            [`%${title}%`]
        );
        return rows;
    } catch (error) {
        console.error("Error fetching quiz by Title:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getQuizByDateCreation = async (date) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT quizId, title, description, creationDate, numberQuestion 
             FROM Quiz 
             WHERE creationDate = ?`,
            [date]
        );
        return rows;
    } catch (error) {
        console.error("Error fetching quiz by Date:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};

const getQuizById = async (quizId) => {
    const dbConnection = await connection.getConnection();
    try{
        const [quizRows] = await dbConnection.execute(
                `SELECT quizId, title, description, creationDate, numberQuestion, weighing
                FROM Quiz WHERE quizId = ?`,
                [quizId]
            );
        if (quizRows.length === 0) return null;
        const quiz = quizRows[0];

        const [questions] = await dbConnection.execute(
            `SELECT questionId, questionText FROM Question WHERE quizId = ?`,
            [quizId]
        );

        for (let q of questions) {
            const [options] = await dbConnection.execute(
                `SELECT optionId, optionText, isCorrect FROM OptionAnswer WHERE questionId = ?`,
                [q.questionId]
            );
            q.options = options;
        }

        quiz.questions = questions;
        return quiz;
    }catch(error){
        console.error("Error fetching quiz by ID:", error);
        throw error;
    }finally{
        dbConnection.release();
    }
};

const submitQuizAnswers = async (answers, quizId, studentUserId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [questions] = await dbConnection.execute(
            `SELECT questionId, points FROM Question WHERE quizId = ?`,
            [quizId]
        );
        if (questions.length === 0) throw new Error("No questions found for this quiz");

        const [quizData] = await dbConnection.execute(
            `SELECT cursoId FROM Quiz WHERE quizId = ?`,
            [quizId]
        );
        const cursoId = quizData[0]?.cursoId;
        if (!cursoId) throw new Error("Course not found for this quiz");

        const [attempts] = await dbConnection.execute(
            `SELECT COUNT(*) AS count FROM Score WHERE quizId = ? AND studentUserId = ?`,
            [quizId, studentUserId]
        );
        const attemptNumber = attempts[0].count + 1;

        for (const ans of answers) {
            const [correctRow] = await dbConnection.execute(
                `SELECT isCorrect FROM OptionAnswer WHERE optionId = ?`,
                [ans.optionId]
            );
            const isCorrect = correctRow[0]?.isCorrect ? 1 : 0;

            await dbConnection.execute(
                `INSERT INTO StudentResponse (quizId, studentUserId, questionId, optionId, isCorrect, attemptNumber)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [quizId, studentUserId, ans.questionId, ans.optionId, isCorrect, attemptNumber]
            );
        }

        const [responses] = await dbConnection.execute(
            `SELECT questionId, isCorrect FROM StudentResponse
             WHERE quizId = ? AND studentUserId = ? AND attemptNumber = ?`,
            [quizId, studentUserId, attemptNumber]
        );

        let score = 0;
        for (const resp of responses) {
            if (resp.isCorrect) {
                const q = questions.find(q => q.questionId === resp.questionId);
                score += q?.points || 0;
            }
        }

        await dbConnection.execute(
            `INSERT INTO Score (quizId, cursoId, studentUserId, score, attemptNumber)
             VALUES (?, ?, ?, ?, ?)`,
            [quizId, cursoId, studentUserId, score, attemptNumber]
        );

        await dbConnection.execute(
            `UPDATE Quiz SET status = 'Inactivo' WHERE quizId = ?`,
            [quizId]
        );

        return { success: true, score, attemptNumber };

    } catch (err) {
        console.error("Error submitQuizAndScore DAO:", err);
        throw err;
    } finally {
        dbConnection.release();
    }
};

const getQuizResponsesList = async (quizId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT studentUserId, MAX(attemptNumber) AS latestAttempt, MAX(score) AS latestScore
             FROM Score WHERE quizId = ? GROUP BY studentUserId`,
            [quizId]
        );
        return rows;
    } catch (err) {
        throw err;
    } finally {
        dbConnection.release();
    }
};

const getQuizResult = async (quizId, studentUserId, attemptNumber) => {
    const dbConnection = await connection.getConnection();
    try {
        const [quizRows] = await dbConnection.execute(
            `SELECT quizId, title, weighing FROM Quiz WHERE quizId = ?`, [quizId]
        );
        if (!quizRows.length) throw new Error("Quiz no encontrado");
        const quiz = quizRows[0];

        const [questionsRows] = await dbConnection.execute(
            `SELECT question.questionId, question.questionText, question.points,
                    option_answer.optionId, option_answer.optionText, option_answer.isCorrect,
                    response.optionId AS selectedOptionId, 
                    CASE WHEN response.isCorrect = 1 THEN question.points ELSE 0 END AS earnedPoints
             FROM Question question
             JOIN OptionAnswer option_answer ON option_answer.questionId = question.questionId
             LEFT JOIN StudentResponse response 
               ON response.questionId = question.questionId AND response.quizId = ? AND response.studentUserId = ? AND response.attemptNumber = ?
             WHERE question.quizId = ?
             ORDER BY question.questionId, option_answer.optionId`,
             [quizId, studentUserId, attemptNumber, quizId]
        );

        const questionsMap = {};
        questionsRows.forEach(row => {
            if (!questionsMap[row.questionId]) {
                questionsMap[row.questionId] = {
                    questionId: row.questionId,
                    questionText: row.questionText,
                    points: row.points,
                    options: [],
                    selectedOptionId: row.selectedOptionId,
                    earnedPoints: row.earnedPoints
                };
            }
            questionsMap[row.questionId].options.push({
                optionId: row.optionId,
                optionText: row.optionText,
                isCorrect: row.isCorrect
            });
        });

        const scoreObtained = Object.values(questionsMap).reduce((sum, q) => sum + q.earnedPoints, 0);

        return {
            quizId: quiz.quizId,
            title: quiz.title,
            totalWeighing: quiz.weighing,
            scoreObtained,
            questions: Object.values(questionsMap)
        };

    } finally {
        dbConnection.release();
    }
};

const getQuizForStudent = async (quizId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [quizRows] = await dbConnection.execute(
            `SELECT quizId, title, description, creationDate, numberQuestion, weighing, status
             FROM Quiz
             WHERE quizId = ?`,
            [quizId]
        );

        if (quizRows.length === 0) return null;
        const quiz = quizRows[0];

        const [questions] = await dbConnection.execute(
            `SELECT questionId, questionText, points
             FROM Question
             WHERE quizId = ?`,
            [quizId]
        );

        for (let q of questions) {
            const [options] = await dbConnection.execute(
                `SELECT optionId, optionText
                 FROM OptionAnswer
                 WHERE questionId = ?`,
                [q.questionId]
            );

            q.options = options;
        }

        quiz.questions = questions;

        return quiz;

    } catch (error) {
        console.error("Error fetching quiz for student:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};



const getStudentsAttempts = async (quizId, studentUserId) => {
    const dbConnection = await connection.getConnection();
    try {
        const [rows] = await dbConnection.execute(
            `SELECT *
             FROM StudentResponse
             WHERE quizId = ? AND studentUserId = ?
             ORDER BY attemptNumber ASC, questionId ASC`,
            [quizId, studentUserId]
        );

        return rows;

    } catch (error) {
        console.error("Error fetching student attempts:", error);
        throw error;
    } finally {
        dbConnection.release();
    }
};


module.exports = {createQuiz, getQuizForUpdate, updateQuiz, deleteQuiz, getAllQuiz, getQuizByTitle, 
    getQuizByDateCreation, getQuizById, submitQuizAnswers, getQuizResult, getQuizResponsesList, getQuizForStudent, getStudentsAttempts };