/**
 * Initialize the visualization when the window loads
 */
function init() {
  // Load data from CSV file
  loadData();
}

/**
 * Load data from CSV file and call the chart function
 */
function loadData() {
  d3.csv("wombats.csv").then((data) => {
    console.log(data);
    const wombatSightings = data;
    barChart(wombatSightings);
  });
}

/**
 * Create a bar chart with the provided data
 *
 * @param {Array<Object>} data - The wombat sightings data
 */
function barChart(data) {
  // Chart dimensions
  const margin = { top: 30, right: 30, bottom: 40, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // X scale
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.id))
    .range([0, width])
    .padding(0.1);

  // Y scale
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.wombats)])
    .range([height, 0]);

  // Color scale based on data values
  const colorScale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => +d.wombats), d3.max(data, (d) => +d.wombats)])
    .range(["darkblue", "blue"]);

  // Create bars
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.id))
    .attr("y", (d) => y(+d.wombats))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(+d.wombats))
    .attr("fill", (d) => colorScale(+d.wombats));

  // Add X axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  svg.append("g").call(d3.axisLeft(y));

  // Add Y axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 15)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .text("Number of Wombats");
}

// Set the init function to run when the window loads
window.onload = init;