'use client';
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export default function DashboardPage() {
  const [placementData, setPlacementData] = useState({
    totalPlaced: 0,
    totalCompanies: 0,
    placementTypes: {
      intern: 0,
      fte: 0,
      both: 0,
    },
    salaryRanges: [],
    companyVisits: [],
    loading: true,
    error: null as string | null,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');
  const currentYear = new Date().getFullYear(); // Get the current year
  const [selectedYear, setSelectedYear] = useState<number>(currentYear); // Default to the current year

  // Calculate the latest five years dynamically
  const latestFiveYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch data from the backend
  useEffect(() => {
    async function fetchPlacementStats() {
      try {
        setPlacementData((prev) => ({ ...prev, loading: true }));

        const response = await fetch(`/api/dashboard?year=${selectedYear}`);
        if (!response.ok) {
          throw new Error('Failed to fetch placement data');
        }

        const data = await response.json();
        setPlacementData({
          ...data,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching placement data:', error);
        setPlacementData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    }

    fetchPlacementStats();
  }, [selectedYear]); // Re-fetch data when the selected year changes

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-purple-100 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Year Selector */}
        <div className="flex justify-end mb-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {latestFiveYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Welcome Banner */}
        <div className="bg-white shadow-xl rounded-3xl p-8 text-center">
          <h1 className="text-3xl font-bold text-purple-700">Welcome, demo@iiitn.ac.in!</h1>
          <p className="text-gray-700">You're viewing data for the <strong>{selectedYear+1}</strong> batch.</p>
        </div>

        {/* Loading or Error States */}
        {placementData.loading && (
          <div className="bg-white shadow-xl rounded-3xl p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading placement data...</p>
          </div>
        )}

        {placementData.error && (
          <div className="bg-white shadow-xl rounded-3xl p-8 text-center border border-red-300">
            <p className="text-red-600">Error: {placementData.error}</p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        {!placementData.loading && !placementData.error && (
          <div className="bg-white shadow-xl rounded-3xl p-6">
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-4 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`pb-4 px-4 font-medium text-sm ${
                  activeTab === 'charts'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Charts
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-indigo-600 text-center">Placement Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <StatCard label="Total Placed Students" value={placementData.totalPlaced} />
                  <StatCard label="Companies Visited" value={placementData.totalCompanies} />
                  <StatCard label="FTE Offers" value={placementData.placementTypes.fte} />
                  <StatCard label="Internships" value={placementData.placementTypes.intern} />
                  <StatCard label="Both Intern & FTE" value={placementData.placementTypes.both} />
                </div>
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold text-indigo-600 text-center">Placement Analytics</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Placement Types</h3>
                    <div className="h-64">
                      <PieChartComponent
                        labels={['Internship', 'Full Time', 'Both']}
                        data={[
                          placementData.placementTypes.intern,
                          placementData.placementTypes.fte,
                          placementData.placementTypes.both,
                        ]}
                      />
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Salary Distribution</h3>
                    <div className="h-64">
                      <BarChartComponent
                        labels={placementData.salaryRanges?.map((item: any) => item.range)}
                        data={placementData.salaryRanges?.map((item: any) => item.count)}
                      />
                    </div>
                  </div>

                  {/* Line Chart */}
                  <div className="bg-white rounded-xl p-6 shadow border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Company Visits by Month</h3>
                    <div className="h-64">
                      <LineChartComponent
                        labels={placementData.companyVisits?.map((item: any) => item.month)}
                        data={placementData.companyVisits?.map((item: any) => item.count)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-indigo-600">{value}</p>
    </div>
  );
}

function PieChartComponent({ labels, data }: { labels: string[]; data: number[] }) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [
              {
                data,
                backgroundColor: ['#8884d8', '#82ca9d', '#ffc658'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data]);

  return <canvas ref={chartRef} />;
}

function BarChartComponent({ labels, data }: { labels: string[]; data: number[] }) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Number of Students',
                data,
                backgroundColor: '#8884d8',
                borderColor: '#7771c7',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data]);

  return <canvas ref={chartRef} />;
}

function LineChartComponent({ labels, data }: { labels: string[]; data: number[] }) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Companies Visited',
                data,
                fill: false,
                backgroundColor: 'rgba(136, 132, 216, 0.2)',
                borderColor: '#8884d8',
                tension: 0.3,
                pointBackgroundColor: '#8884d8',
                pointRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, data]);

  return <canvas ref={chartRef} />;
}