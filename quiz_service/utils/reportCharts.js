const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const width = 800;
const height = 400;

const chartCanvas = new ChartJSNodeCanvas({ width, height });

async function createPerformanceChart(quizzes) {
    const labels = quizzes.map(q => q.title);
    const scores = quizzes.map(q => q.score);

    const config = {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Calificación",
                    data: scores,
                    borderWidth: 3,
                    borderColor: "#0074D9",
                    backgroundColor: "rgba(0, 116, 217, 0.2)",
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            plugins: {
                title: { display: true, text: "Evolución del Desempeño", font: { size: 20 } }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    };

    const image = await chartCanvas.renderToDataURL(config);
    return image;
}

async function createCorrectIncorrectChart(quizzes) {
    const correct = quizzes.reduce((acc, q) => acc + (q.correct || 0), 0);
    const incorrect = quizzes.reduce((acc, q) => acc + (q.incorrect || 0), 0);

    const config = {
        type: "pie",
        data: {
            labels: ["Correctas", "Incorrectas"],
            datasets: [
                {
                    data: [correct, incorrect],
                    backgroundColor: ["#3C507D", "#D5B893"]
                }
            ]
        },
        options: {
            plugins: {
                title: { display: true, text: "Correctas vs Incorrectas", font: { size: 20 } }
            }
        }
    };

    return await chartCanvas.renderToDataURL(config);
}

async function createCourseDistributionChart(students) {
    const scores = students.map(s => s.average || 0);

    const config = {
        type: "bar",
        data: {
            labels: students.map(s => s.name),
            datasets: [
                {
                    label: "Promedio",
                    data: scores,
                    backgroundColor: "#0074D9"
                }
            ]
        },
        options: {
            plugins: {
                title: { display: true, text: "Distribución de Calificaciones", font: { size: 20 } }
            },
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    };

    return await chartCanvas.renderToDataURL(config);
}

module.exports = {createPerformanceChart, createCorrectIncorrectChart, createCourseDistributionChart};
