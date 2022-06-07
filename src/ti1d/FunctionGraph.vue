<template lang="pug">
div(ref="graph-container")
</template>

<script lang="ts">
import Vue from "vue";
import Chart from "chart.js";
import Color = require("color");
import math from "mathjs-expression-parser";

function ensureLength<T>(arr: T[], length: number, newElement: () => T) {
  while (arr.length < length) arr.push(newElement());
  while (arr.length > length) arr.pop();
}

export default Vue.extend({
  props: ["f", "x", "n", "symmetric", "legend"],
  data() {
    const canvas = document.createElement("canvas");

    return {
      canvas,
      chart: new Chart(canvas, {
        type: "line",
        data: {
          datasets: [],
        },
        options: {
          tooltips: {
            enabled: false,
          },
          legend: {
            display: true,
          },
          elements: {
            point: {
              radius: 0,
              hoverRadius: 0,
              hitRadius: 0,
            },
          },
          scales: {
            xAxes: [
              {
                type: "linear",
                position: "bottom",
              },
            ],
          },
        },
      }),
    };
  },
  mounted() {
    const container = this.$refs["graph-container"];
    container.appendChild(this.canvas);
    this.updateCanvas();
  },
  computed: {
    xValues() {
      const n = this.n || 50;
      const values = [0];
      for (let i = 0.5; i + 1 < n; ++i) values.push((i + Math.random()) / n);
      values.push(1);
      return values;
    },
    xmin() {
      return this.symmetric ? -this.xmax : math.eval(this.x[0]);
    },
    xmax() {
      return math.eval(this.x[1]);
    },
    fs() {
      if (Array.isArray(this.f)) return this.f;
      return [this.f];
    },
  },
  watch: {
    f() {
      this.updateCanvas();
    },
    x() {
      this.updateCanvas();
    },
    n() {
      this.updateCanvas();
    },
    symmetric() {
      this.updateCanvas();
    },
  },
  methods: {
    updateCanvas() {
      const xmin = this.xmin;
      const xmax = this.xmax;
      this.chart.options.scales.xAxes[0].ticks.min = xmin;
      this.chart.options.scales.xAxes[0].ticks.max = xmax;

      this.chart.options.legend.display = !!this.legend;

      ensureLength(this.chart.data.datasets, this.fs.length, () => ({
        label: "",
        data: [],
        fill: false,
      }));

      this.fs.forEach((f: (x: number) => number, k: number) => {
        const dataset = this.chart.data.datasets[k];
        dataset.borderColor = Color.hsv(
          1.61803398875 * (k + 0.5) * 100,
          100,
          80
        ).string();
        dataset.label = this.legend[k];

        const data = dataset.data;
        ensureLength(data, this.xValues.length, () => ({}));

        this.xValues.forEach((t: number, i: number) => {
          const x = xmin + (xmax - xmin) * t;
          data[i].x = x;
          data[i].y = f(this.symmetric ? Math.abs(x) : x);
        });
      });

      this.chart.update();
    },
  },
});
</script>