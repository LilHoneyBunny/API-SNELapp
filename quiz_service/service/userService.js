const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getStudentNames = async (studentIds) => {
    if (!studentIds || studentIds.length === 0) return [];

    const url = `http://localhost:3000/minao_systems/users?ids=${studentIds.join(',')}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`);
        const data = await res.json();
        return data.students;
    } catch (err) {
        return studentIds.map(id => ({ studentId: id, name: "Desconocido" }));
    }
};

const updateStudentAverageInUserService = async (studentId, average) => {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const url = `http://localhost:3000/minao_systems/students/${studentId}/average`;

    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ average })
        });

        if (!res.ok) throw new Error(`Failed to update average: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error("Error updating student average in user service:", err);
        return null;
    }
};

const getStudentInfo = async (studentId) => {
    try {
        const res = await fetch(`http://localhost:3000/minao_systems/students/${studentId}`);
        if (!res.ok) throw new Error(`Error fetching student: ${res.statusText}`);
        const data = await res.json();
        return data.result[0]; 
    } catch (err) {
        console.error(err);
        return { studentId, userName: "Desconocido", paternalSurname: "", maternalSurname: "", average: 0 };
    }
};

const getInstructorInfo = async (instructorId) => {
    try {
        const res = await fetch(`http://localhost:3000/minao_systems/instructors/${instructorId}`);
        if (!res.ok) throw new Error(`Error fetching instructor: ${res.statusText}`);
        const data = await res.json();
        return data.result[0]; 
    } catch (err) {
        console.error(err);
        return { instructorId, userName: "Desconocido" };
    }
};

const getCourseInfo = async (courseId) => {
    try {
        const res = await fetch(`http://localhost:8000/minao_systems/courses/${courseId}`);
        if (!res.ok) throw new Error(`Error fetching course: ${res.statusText}`);
        const data = await res.json();
        return data.result[0]; 
    } catch (err) {
        console.error(err);
        return { courseId, name: "Desconocido" };
    }
};

const getStudentsInCourse = async (courseId) => {
    try {
        const res = await fetch(`http://localhost:3000/minao_systems/students/${courseId}/students/average`);
        if (!res.ok) throw new Error(`Error fetching students in course: ${res.statusText}`);
        const data = await res.json();
        return data.students; 
    } catch (err) {
        console.error(err);
        return [];
    }
};
module.exports = { getStudentNames, updateStudentAverageInUserService, getStudentInfo, getInstructorInfo, 
    getCourseInfo, getStudentsInCourse};