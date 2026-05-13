import React from "react";
import ReactApexChart from "react-apexcharts";

export default function RadarChart({ scores, labels }) {
  const options = {
    chart: { type: "radar", toolbar: { show: false }, background: "transparent" },
    xaxis: { 
      categories: labels || ["Setor A", "Setor B", "Setor C", "Setor D", "Setor E"],
      labels: {
        style: {
          colors: ["#1b4332"],
          fontSize: "11px",
          fontWeight: 600,
        }
      }
    },
    yaxis: { min: 0, max: 100, show: false },
    fill: { opacity: 0.3, colors: ["#52b788"] },
    stroke: { colors: ["#1b4332"], width: 2 },
    markers: { colors: ["#1b4332"], size: 4 },
    plotOptions: { radar: { polygons: { strokeColors: "#e8f5e9", connectorColors: "#e8f5e9" } } },
    tooltip: { y: { formatter: (v) => `${v}%` } },
    legend: { show: false },
  };
  const series = [{ name: "Conformidade", data: scores }];
  return <ReactApexChart options={options} series={series} type="radar" height={320} />;
}
