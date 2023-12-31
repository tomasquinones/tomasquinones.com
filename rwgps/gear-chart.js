const ctx = document.getElementById('goal-chart');

        // Goal Line Generator
        let goalDistance = 500;
        let goal = [];
        for (let g = 1; g < 32; g++) {
            goal.push(goalDistance);
        }

        // Goal Track Generator
        let stayOnTrack = [];
        for (let i = 8; i < goalDistance; i = i + (goalDistance / 30)) {
            stayOnTrack.push(i);
        }

        // Days of Month X-axis
        let daysOfMonth = [];
        for (let d = 1; d < 31; d++) {
            daysOfMonth.push(d);
        }

        // Defining the line-mixed chart that is the main goal
        // Currently the data is hard coded just to get a chart on the page 20231225
        const mixedChart = new Chart(ctx, {
            data: {
                datasets: [{
                    type: 'line',
                    label: 'Stay On Track!',
                    data: stayOnTrack,
                    pointRadius: 0,

                }, {
                    type: 'line',
                    label: 'Cumulative Miles',
                    data: [5, 8, 12, 16, 24, 36, 36, 44, 60, 84, 95, 108],
                    fill: true,
                    pointRadius: 5,
                    hoverBorderWidth: 10,
                }, {
                    type: 'line',
                    label: '250 mile Goal',
                    data: goal,
                    pointRadius: 0,
                }
                ],
                labels: daysOfMonth
            }
        });


// Gear used on the Goal, Each slice should be distance % per gear
        const GEAR = document.getElementById('gear-chart');
        const GEARDATA = [20, 40, 15, 35, 8, 38];
        const gearConfig = {
            type: 'pie',
            data: {
                labels: ["Gravel Bike", "Road Bike", "Folding Bike", "Touring Bike", "Running", "Full Squish"],
                datasets: [{
                    // label: "online tutorial subjects",
                    data: GEARDATA,
                    backgroundColor: ['yellow', 'aqua', 'pink', 'lightgreen', 'gold', 'lightblue'],
                }],
            },
            hoverBorderWidth: 10,
            options: {
                responsive: true,
            },
        };

        const pieChart = new Chart(GEAR, gearConfig);