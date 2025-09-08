import React from 'react';
import './FakeDashboardBackground.css';
import { Pie, Bar, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, LineController, BarController, PieController, DoughnutController, RadarController, PolarAreaController } from 'chart.js';

ChartJS.register( ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, LineController, BarController, PieController, DoughnutController, RadarController, PolarAreaController );

const fakePieData1 = {
    datasets: [{ data: [300, 50, 100], backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(54, 162, 235, 0.5)'] }],
};
const fakePieData2 = {
    datasets: [{ data: [120, 150, 80], backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)'] }],
};
const fakeBarData = {
    labels: ['', '', '', '', ''],
    datasets: [{ data: [150, 75, 100, 50, 125], backgroundColor: 'rgba(255, 99, 132, 0.5)' }],
};
const fakeLineData = {
    labels: ['', '', '', '', '', '', ''],
    datasets: [{ data: [65, 59, 80, 81, 56, 55, 40], borderColor: 'rgba(54, 162, 235, 0.5)', fill: true, backgroundColor: 'rgba(54, 162, 235, 0.1)' }],
};
const fakeRadarData = {
    labels: ['Comida', 'Transporte', 'Lazer', 'Casa', 'Outros'],
    datasets: [{ data: [8, 6, 9, 7, 5], borderColor: 'rgba(153, 102, 255, 0.5)', backgroundColor: 'rgba(153, 102, 255, 0.1)' }],
};
const fakePolarData = {
    labels: ['Vermelho', 'Verde', 'Amarelo', 'Azul'],
    datasets: [{ data: [11, 16, 7, 3], backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(54, 162, 235, 0.5)'] }],
};

const chartOptions = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    maintainAspectRatio: false,
    responsive: true,
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } }
};

function FakeDashboardBackground() {
    return (
        <div className="fake-dashboard-background">
            <div className="chart-grid">
                <div className="fake-chart-container"><Pie data={fakePieData1} options={chartOptions} /></div>
                <div className="fake-chart-container"><Bar data={fakeBarData} options={chartOptions} /></div>
                <div className="fake-chart-container"><Line data={fakeLineData} options={chartOptions} /></div>
                <div className="fake-chart-container"><Radar data={fakeRadarData} options={chartOptions} /></div>
                <div className="fake-chart-container"><Doughnut data={fakePieData2} options={chartOptions} /></div>
                <div className="fake-chart-container"><PolarArea data={fakePolarData} options={chartOptions} /></div>
            </div>
        </div>
    );
}

export default FakeDashboardBackground;