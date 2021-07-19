<template>
  <div>
     <div class="text-center">
      The time based covid-19 statistics
    </div>
    <svg ref="line-graph" />
  </div>
</template>
<script>
import * as d3 from "d3";
export default {
  props: {
    selectedCountries: Array,
    highlightedCountry: String,
    yAxisVariable: String,
    data: Array,
  },
  mounted() {
    // Create a tooltip div and add it on `this`
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "country-tooltip")
      .style("display", "none");

    // Render the graph in the beginning
    this.renderGraph();
  },
  methods: {
    renderGraph() {
      // Control width, height, and margins
      var width = window.innerWidth / 2;
      var height = 400;
      var paddingLeft = 80;
      var paddingBottom = 50;

      // Select the svg element and give it width / height
      var svg = d3
        .select(this.$refs["line-graph"])
        .html("")
        .attr("width", width)
        .attr("height", height);

      // Render lines for the countries that were selected
      var filteredData = this.data.filter((country) =>
        this.selectedCountries.includes(country.id)
      );

      // The min and max of the dynamic variable for the y axis
      let minX = new Date();
      let maxX = new Date(0);
      let minY = Infinity;
      let maxY = -Infinity;
      filteredData.forEach((country) => {
        country.data.forEach((d) => {
          // Update min and max dates
          var date = new Date(d.date);
          if (date < minX) minX = date;
          if (date > maxX) maxX = date;

          // Update min and max y variable
          var yVar = d[this.yAxisVariable];
          if (yVar < minY) minY = yVar;
          if (yVar > maxY) maxY = yVar;
        });
      });

      var xScale = d3
        .scaleTime()
        .domain([minX, maxX])
        .range([paddingLeft, width - 10]);
      var yScale = d3
        .scaleLinear()
        .domain([minY, maxY])
        .range([height - paddingBottom, 10]);

      var timeFormatter = d3.timeFormat("%b-%Y");

      var xAxis = d3
        .axisBottom()
        .scale(xScale)
        // Format each tick with the time formatter
        .tickFormat((d) => timeFormatter(d));

      var yAxis = d3.axisLeft().scale(yScale).ticks(6);

 
      var lineGenerator = d3
        .line()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d[this.yAxisVariable]));

      var lines = filteredData.map((d) => ({

        data: lineGenerator(
          d.data.filter(
            (c) => c.date !== undefined && c[this.yAxisVariable] !== undefined
          )
        ),
        id: d.id,
        location: d.location,
      }));

      svg
        .append("g")
        .selectAll("path")
        .data(lines)
        .enter()
        .append("path")
        .attr("class", "country-line")
        .attr("id", (d) => d.id)
        .attr("d", (d) => d.data)
        .attr("highlight", (d) =>
          this.highlightedCountry === d.id ? "true" : "false"
        )
        .on("mouseenter", (d) => {
          this.$emit("mouseenterCountry", d.id);

          // Show the tooltip and add the country name
          this.tooltip
            .style("display", "block")
            .html(d.location)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY - 5 + "px");
        })
        .on("mouseleave", () => {
          this.$emit("mouseleaveCountry");

          // Hide the tooltip
          this.tooltip
            .style("display", "none")
            .style("left", "0px")
            .style("top", "0px");
        });

      //x axis
      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - paddingBottom) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      //y axis
      svg
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + paddingLeft + ", 0)")
        .call(yAxis);
    },
  },
  watch: {
    selectedCountries() {
      this.renderGraph();
    },
    yAxisVariable() {
      this.renderGraph();
    },
    highlightedCountry(country) {
      var svg = d3.select(this.$refs["line-graph"]);

      // Reset the previous highlighted country
      svg
        .selectAll(".country-line[highlight='true']")
        .attr("highlight", "false");

      // Ignore when no country
      if (country === "") return;

      // Highlight th right country
      svg
        .select("#" + country)
        .attr("highlight", "true")
        .raise();
    },
  },
};
</script>
<style>
.country-line {
  stroke: rgb(0, 72, 155);
  stroke-width: 2px;
  fill: none;
}
.country-line[highlight="true"] {
  stroke: rgb(224, 209, 0);
  stroke-width: 2px;
}
</style>
