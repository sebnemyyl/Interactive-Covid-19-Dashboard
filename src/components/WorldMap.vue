<template>
  <div>
    <div class="text-center">Click on the country to select.</div>
    <div class="text-center">
      The selected countries highlight the line charts.
    </div>
    <svg ref="world-map" />
  </div>
</template>
<script>

import worldMap from "../helpers/worldMap.json?url";
import * as d3 from "d3";
import * as topojson from "topojson";

export default {
  props: {
    selectedCountries: Array,
    allowedCountries: Array,
    highlightedCountry: String,
    xAxisVariable: String,
    data: Array,
  },
  
  
  mounted() {
    // Code used from https://bl.ocks.org/d3noob/5c6eab54c8ca51929734b6f5cca2b231

    // Create a tooltip div
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "country-tooltip")
      .style("display", "none");

    this.renderMap();
  },
  methods: {
    renderMap() {
      var width = (window.innerWidth+300) / 3;
      var height = 400;
      var paddingLeft = 80;
      var paddingBottom = 50;
      // Define a projection for the map
      var projection = d3
        .geoMercator()
        .center([0, 0])
        .scale(120)
        .rotate([0, 0]);

      // Select svg element and gives it our width and heights
      var svg = d3
        .select(this.$refs["world-map"])
        .html("")
        .attr("width", width)
        .attr("height", height);

      // Define min and max for both axes to be used when creating the scales
      var minX = 0;
      var maxX = d3.max(this.data, (d) => d[this.xAxisVariable]) || 0;
      var lowColor = "#f9f9f9";
      var highColor = "#850037";

      var colormap = d3
        .scaleLinear()
        .domain([minX, maxX])
        .range([lowColor, highColor]);


      var pathGenerator = d3.geoPath().projection(projection);

      var g = svg.append("g");

      d3.json(worldMap).then((topology) => {

        g.selectAll("path")
          .data(topojson.feature(topology, topology.objects.countries).features)
          .enter()
          .append("path")
          .attr("d", pathGenerator)
          .attr("class", "country-path")
          .attr("fill", (d) => {

            const countryData = this.data.find((c) => c.id === d.properties.id);

            if (
              countryData === undefined ||
              countryData[this.xAxisVariable] === undefined
            )
              return "#ccc";

            // Use the dynamic variable and the colormap scale
            return colormap(countryData[this.xAxisVariable]);
          })
          .style("cursor", "pointer")
          // Give each path a css id of the country id
          .attr("id", (d) => d.properties.id)
          .attr("highlight", (d) =>
            this.highlightedCountry === d.properties.id ? "true" : "false"
          )
          .attr("active", (d) =>
            this.selectedCountries.includes(d.properties.id) ? "true" : "false"
          )
          .on("click", (d) => {
            if (this.allowedCountries.includes(d.properties.id))
              this.$emit("clickCountry", d.properties.id);
          })
          .on("mouseenter", (d) => {
            if (!this.allowedCountries.includes(d.properties.id)) return;

            this.$emit("mouseenterCountry", d.properties.id);

            const countryData = this.data.find((c) => c.id === d.properties.id);
            const value =
              countryData !== undefined
                ? (countryData[this.xAxisVariable] || 0).toFixed(2)
                : "";
            // Show the tooltip and add the country name
            this.tooltip
              .style("display", "block")
              .html(
                `<div>
                ${d.properties.admin}
                <div>
                ${this.xAxisVariable}: ${value}
                </div>
              </div>`
              )
              .style("left", d3.event.pageX + 10 + "px")
              .style("top", d3.event.pageY - 30 + "px");
          })
          .on("mouseleave", () => {
            this.$emit("mouseleaveCountry");

            // Hide the tooltip
            this.tooltip
              .style("display", "none")
              .style("left", "0px")
              .style("top", "0px");
          });

       
      });

      // Add zoom and pan functionality on the map
      var zoom = d3
        .zoom()
        .scaleExtent([1, 5])
        .on("zoom", function () {
          g.attr("transform", d3.event.transform);
        });
      svg.call(zoom);
    },
  },
  watch: {
    xAxisVariable(val) {
      this.renderMap();
    },
    // Watching selected countries to see when the selection changes
    selectedCountries(selectedCountries) {
      var svg = d3.select(this.$refs["world-map"]);

      // Reset all active countries to unactive
      svg.selectAll("path[active='true']").attr("active", "false");

      // Make active only the countires that are now selected
      selectedCountries.forEach((id) => {
        svg.select("#" + id).attr("active", "true");
      });
    },
    // Watching highlightedCountry to see when the highlighted country changes
    highlightedCountry(country) {
      var svg = d3.select(this.$refs["world-map"]);

      // Reset the previous highlighted country
      svg.selectAll("path[highlight='true']").attr("highlight", "false");

      // Ignore when no country
      if (country === "") return;

      // Highlight the right country
      svg
        .select("#" + country)
        .attr("highlight", "true")
        .raise();
    },
  },
};
</script>
<style>
.country-path {
  stroke: rgb(0, 72, 155);
  stroke-width: 0.5px;
}
.country-path[highlight="true"] {
  stroke-width: 1.5px;
  fill: rgb(255, 248, 154) !important;
}
.country-path[active="true"] {
  fill: rgb(80, 170, 255) !important;
}
.text-center {
  text-align: center;
}
</style>
