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

module.exports = { getStudentNames };