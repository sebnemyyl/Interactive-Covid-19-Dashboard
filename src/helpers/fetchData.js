/**
 * Fetches covid data asynchronously and returns a promise with the json
 */
export function fetchData() {
  return fetch(
    "https://covid.ourworldindata.org/data/owid-covid-data.json"
  ).then((r) => r.json());
}
