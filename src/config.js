const config = {
  storageKeys: {
    userService: 'car-service-current-user-data',
    memoization: 'car-service-cache-initialized',
  },
  catalogsTable: {
    rowsPerPage: 10,
  },
  pagination: {
    relativePageLinks: 3,
  },
  adminDashboard: {
    defaultFiltersRange: 'today',
    shownUsersPerPage: 5,
    carts: {
      profitChartConfig:/**@type {import('chart.js').ChartConfiguration<'pie', number[], string>}*/({
        type: 'pie',
        data: {
          labels: [], // Must be populated dynamically
          datasets: [{
            data: [], // Must be populated dynamically
            label: 'Печалба',
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(201, 203, 207, 1)',
            ],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Печалба на потребителите',
            },
            tooltip: {
              callbacks: {},  // Must be populated dynamically
            },
          },
        },
      }),
      repairsChartConfig: /**@type {import('chart.js').ChartConfiguration<'bar', number[], string>}*/({
        type: 'bar',
        data: {
          labels: [], // Must be populated dynamically
          datasets: [{
            data: [], // Must be populated dynamically
            label: 'Ремонти',
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(201, 203, 207, 1)',
            ],
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Брой ремонти на потребителите',
            },
          },
          scales: {
            y: {
              ticks: {
                stepSize: 1
              },
              title: {
                display: true,
                text: 'Брой ремонти',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Потребители',
              },
            },
          },
        },
      }),
    }
  }
};

export default config;