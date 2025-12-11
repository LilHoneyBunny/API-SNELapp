const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const getStudentsInfoFromUserService = async (studentIds) => {
    if (!studentIds || studentIds.length === 0) return [];

    const url = `http://localhost:3000/minao_systems/users?ids=${studentIds.join(',')}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`);
        const data = await res.json();
        return data.students; 
    } catch (err) {
        console.error("Error getting students info from user service:", err);
        return studentIds.map(id => ({ studentId: id, name: "Desconocido", average: 0 }));
    }
};

const getInstructorInfoFromUserService = async (instructorId) => {
    if (!instructorId || instructorId.length === 0) return [];

    const url = `http://localhost:3000/minao_systems/instructors?ids=${instructorId.join(',')}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error fetching users: ${res.statusText}`);
        const data = await res.json();
        return data.instructor;
    } catch (err) {
        console.error("Error getting students info from user service:", err);
        return instructorId.map(id => ({ instructorId: id, name: "Desconocido", email: " " }));
    }
};

module.exports = { getStudentsInfoFromUserService, getInstructorInfoFromUserService};