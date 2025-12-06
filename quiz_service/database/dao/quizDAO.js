const connection = require("../pool");

 const createQuiz = async (quiz) => {
    const dbConnection = await connection.getConnection();
    try {
        await dbConnection.beginTransaction();

        const [quizResult] = await dbConnection.execute(
            `INSERT INTO Quiz (title, description, numberQuestion, weighing, cursoId) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                quiz.title,
                quiz.description ?? 'Añada una escripción',
                quiz.questions.length,
                quiz.weighing ?? 0,
                quiz.cursoId
            ]
        );

        const quizId = quizResult.insertId;

        for (const question of quiz.questions) {

            const [questionResult] = await dbConnection.execute(
                `INSERT INTO Question (quizId, questionText)
                 VALUES (?, ?)`,
                [quizId, question.text] 
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
        return { success: true, quizId };

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

module.exports = {createQuiz, updateQuiz, deleteQuiz, getAllQuiz, getQuizByTitle, getQuizByDateCreation};