<template>
  <div>
    <div class="center">
      <!-- Selection of variables -->
      
      <columns-dropdown
        message="Select variable for the first line graph"
        :columns="timebasedColumns"
        :initial="firstLineGraph"
        @selected="firstLineGraph = $event"
      />
      <columns-dropdown
        message="Select variable for the second line graph"
        :columns="timebasedColumns"
        :initial="secondLineGraph"
        @selected="secondLineGraph = $event"
      />
    
    </div>

    <!-- Visualizations -->
    <div v-if="dataLoaded">
      <div class="center">
        <world-map
          :data="data"
          :allowedCountries="allowedCountries"
          :selectedCountries="selectedCountries"
          :highlightedCountry="highlightedCountry"
          @clickCountry="toggleCountrySelection"
          @mouseenterCountry="highlightCountry"
          @mouseleaveCountry="unhighlightCountry"
        />
      </div>
      
      <div class="center">
        <line-graph
          :selectedCountries="selectedCountries"
          :highlightedCountry="highlightedCountry"
          :yAxisVariable="firstLineGraph"
          :data="data"
          @mouseenterCountry="highlightCountry"
          @mouseleaveCountry="unhighlightCountry"
        />
         <line-graph
          :selectedCountries="selectedCountries"
          :highlightedCountry="highlightedCountry"
          :yAxisVariable="secondLineGraph"
          :data="data"
          @mouseenterCountry="highlightCountry"
          @mouseleaveCountry="unhighlightCountry"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { fetchData } from "./helpers/fetchData";
import WorldMap from "./components/WorldMap.vue";
import ColumnsDropdown from "./components/ColumnsDropdown.vue";
import * as d3 from "d3";
import LineGraph from "./components/LineGraph.vue";
export default {
  components: { WorldMap, ColumnsDropdown, LineGraph },
  data() {
    return {
      data: [],
      // Store which countries we have information on and can be selected from the map
      allowedCountries: [],
      dataLoaded: false,
      selectedCountries: [],
      // currently highlighted country
      highlightedCountry: "",
      firstLineGraph: "new_vaccinations",
      // the variable to use for second line graph
      secondLineGraph: "people_vaccinated",
            // the variable to use for second line graph
      // The columns that can be selected
      columns: [
       "population_density",
        "median_age",
        "aged_65_older",
        "aged_70_older",
        "gdp_per_capita",
        "extreme_poverty",
        "human_development_index",
        "life_expectancy",
        "cardiovasc_death_rate",
        "diabetes_prevalence",
        "female_smokers",
        "male_smokers",
        "handwashing_facilities",
        "hospital_beds_per_thousand",
        "population",
      ],
      // Columns that can be used for the line graphs
  
      timebasedColumns: [
        "new_vaccinations",
        "new_vaccinations_smoothed",
        "new_vaccinations_smoothed_per_million",
        "people_fully_vaccinated",
        "people_fully_vaccinated_per_hundred",
        "people_vaccinated",
        "people_vaccinated_per_hundred",
        "total_vaccinations_per_hundred",
        "new_tests",
        "total_tests",
        "total_tests_per_thousand",
        "new_tests_per_thousand",
        "new_tests_smoothed",
        "new_tests_smoothed_per_thousand",
        "total_cases",
        "new_cases",
        "new_cases_smoothed",
        "total_deaths",
        "new_deaths",
        "new_deaths_smoothed",
        "total_cases_per_million",
        "new_cases_per_million",
        "new_cases_smoothed_per_million",
        "total_deaths_per_million",
        "new_deaths_per_million",
        "new_deaths_smoothed_per_million",
      ],
    
    };
  },
  created() {
    fetchData().then((d) => {
   
      var countriesIds = Object.keys(d).filter(
        // Ignore data for country that has its id starting with OWID
        (id) => !id.includes("OWID")
      );

      this.allowedCountries = countriesIds;
      var countriesData = [];

      countriesIds.forEach((id) => {
        // Push each countries' data to create the array and create the id of the countries
        var data = d[id];
        data.id = id;

        this.columns.forEach((c) => {
          // Take the average of country's data in case of missing values
          if (data[c] === undefined) {

            data[c] = d3.mean(data.data, (d) => d[c]);
          }
        });
        countriesData.push(data);
      });
      this.data = countriesData;
      this.dataLoaded = true;
    });
  },
  methods: {
    toggleCountrySelection(country) {
      // If the country is already selected we want to remove it from the selection
      if (this.selectedCountries.includes(country))
        this.selectedCountries = this.selectedCountries.filter(
          (c) => c !== country
        );
      // If a country is not selected we add it to the selection
      else this.selectedCountries = [...this.selectedCountries, country];
    },
    // Sets the highlighted country
    highlightCountry(country) {
      this.highlightedCountry = country;
    },
    // Resets the highlighted country as an empty string
    unhighlightCountry() {
      this.highlightedCountry = "";
    },
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}

.flex {
  display: flex;
}

.country-tooltip {
  position: absolute;
  text-align: center;
  padding: 5px 15px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
}
.center {
  display: flex;
  justify-content: center;
}
</style>
