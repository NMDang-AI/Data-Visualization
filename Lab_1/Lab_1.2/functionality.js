document.addEventListener('DOMContentLoaded', function() {
    // Hide chart initially and show table
    document.getElementById('chart').style.display = 'none';
    
    // Load CSV data
    d3.csv('pet_ownership.csv').then(function(data) {
        // Process data and fix labels
        data.forEach(function(d) {
            d.pets2019 = +d.pets2019;
            d.pets2021 = +d.pets2021;
            // Fix animal names
            if (d.animal === "Dags") d.animal = "Dogs";
            if (d.animal === "Cals") d.animal = "Cats";
            if (d.animal === "Repliers") d.animal = "Reptiles";
            if (d.animal === "Small M") d.animal = "Small Mammals";
        });
        
        // Set up chart dimensions
        const margin = {top: 40, right: 120, bottom: 120, left: 60};
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Initialize scales (will be reset in updateChart)
        let x0, x1, y, xAxis, yAxis;
        
        // Button event handlers
        document.getElementById('btn2019').addEventListener('click', function() {
            updateChart(data, '2019');
        });
        
        document.getElementById('btn2021').addEventListener('click', function() {
            updateChart(data, '2021');
        });
        
        document.getElementById('btnBoth').addEventListener('click', function() {
            updateChart(data, 'both');
        });
        
        document.getElementById('btnImage').addEventListener('click', function() {
            document.getElementById('table').style.display = 'block';
            document.getElementById('chart').style.display = 'none';
        });

        // FIXED updateChart function
        function updateChart(data, year) {
            document.getElementById('table').style.display = 'none';
            document.getElementById('chart').style.display = 'block';
            
            // 1. COMPLETE RESET (fixes all transition issues)
            svg.selectAll("*").remove();
            
            // 2. RECREATE SCALES FRESH (prevents thickness/position bugs)
            x0 = d3.scaleBand()
                .range([0, width])
                .paddingInner(year === 'both' ? 0.2 : 0.4)
                .domain(data.map(d => d.animal));
            
            x1 = d3.scaleBand()
                .padding(0.1);
            
            y = d3.scaleLinear()
                .range([height, 0])
                .domain([0, 50]);
            
            // 3. REBUILD AXES (ensures clean labels)
            xAxis = d3.axisBottom(x0);
            yAxis = d3.axisLeft(y).ticks(10).tickFormat(d => d + '%');
            
            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', `translate(0,${height})`)
                .call(xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)');
            
            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis);
            
            // 4. DRAW BARS (your existing perfect logic)
            if (year === 'both') {
                x1.domain(['2019', '2021']).rangeRound([0, x0.bandwidth()]);
                
                const barGroup = svg.selectAll('.bar-group')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'bar-group')
                    .attr('transform', d => `translate(${x0(d.animal)},0)`);
                
                barGroup.selectAll('.bar')
                    .data(d => [
                        {year: '2019', value: d.pets2019},
                        {year: '2021', value: d.pets2021}
                    ])
                    .enter().append('rect')
                    .attr('class', d => `bar bar-${d.year}`)
                    .attr('x', d => x1(d.year))
                    .attr('y', d => y(d.value))
                    .attr('width', x1.bandwidth())
                    .attr('height', d => height - y(d.value))
                    .attr('rx', 3)
                    .attr('ry', 3);
                
                // Add value labels
                data.forEach(d => {
                    svg.append('text')
                        .attr('class', 'value-label')
                        .attr('x', x0(d.animal) + x1('2019') + x1.bandwidth()/2)
                        .attr('y', y(d.pets2019) - 5)
                        .text(d.pets2019 + '%');
                    
                    svg.append('text')
                        .attr('class', 'value-label')
                        .attr('x', x0(d.animal) + x1('2021') + x1.bandwidth()/2)
                        .attr('y', y(d.pets2021) - 5)
                        .text(d.pets2021 + '%');
                });
                
                // Add legend
                const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', `translate(${width - 100}, -25)`);
                
                legend.append('rect')
                    .attr('x', 0)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('fill', '#3498db');
                
                legend.append('text')
                    .attr('x', 20)
                    .attr('y', 9)
                    .text('2019');
                
                legend.append('rect')
                    .attr('x', 60)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('fill', '#e74c3c');
                
                legend.append('text')
                    .attr('x', 80)
                    .attr('y', 9)
                    .text('2021');
            } else {
                svg.selectAll('.bar')
                    .data(data)
                    .enter().append('rect')
                    .attr('class', `bar bar-${year}`)
                    .attr('x', d => x0(d.animal) + x0.bandwidth() * 0.25)
                    .attr('y', d => y(year === '2019' ? d.pets2019 : d.pets2021))
                    .attr('width', x0.bandwidth() * 0.5)
                    .attr('height', d => height - y(year === '2019' ? d.pets2019 : d.pets2021))
                    .attr('rx', 3)
                    .attr('ry', 3);
                
                svg.selectAll('.value-label')
                    .data(data)
                    .enter().append('text')
                    .attr('class', 'value-label')
                    .attr('x', d => x0(d.animal) + x0.bandwidth() * 0.5)
                    .attr('y', d => y(year === '2019' ? d.pets2019 : d.pets2021) - 5)
                    .text(d => (year === '2019' ? d.pets2019 : d.pets2021) + '%');
            }
        }
    }).catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });
});