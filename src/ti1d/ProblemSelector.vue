<template lang="pug">
div
  .modal-backdrop.show(v-show="value")
  .modal(:style="`display:${value ? 'block' : 'none'}`")
    .modal-dialog
      .modal-content
        .modal-header
          h4.modal-title Select an example problem
        .modal-body
          a.btn.btn-link(
            v-for="problem of problems",
            @click.prevent="selectProblem(problem)",
            href="#"
          ) {{ problem.name }}
        .modal-footer
          button.btn.btn-link(@click.prevent="hideModal()") Cancel
</template>

<script lang="ts">
import Vue from "vue";

type Problem = {
  name: string;
  symmetric?: boolean;
  p: string;
  q: string;
  w: string;
  x: [string, string];
  ymin: [string, string];
  ymax: [string, string];
  tolerance: string;
};

const dirichlet = {
  ymin: ["1", "0"],
  ymax: ["1", "0"],
};

const schrodinger = {
  p: "1",
  w: "1",
};

const problems: Problem[] = [
  <Problem>{
    name: "Airy",
    q: "x",
    x: ["0", "20"],
    tolerance: "1e-6",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Coffey Evans",
    symmetric: true,
    q: "-2*20*cos(2*x)+20^2*sin(2*x)^2",
    x: ["-pi/2", "pi/2"],
    tolerance: "1e-8",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Bessel",
    q: ".25/x^2",
    x: ["0", "1"],
    tolerance: "1e-6",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Hydrogen",
    q: "-1/x+2/x^2",
    x: ["0", "200"],
    tolerance: "1e-6",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Marletta",
    q: "3*(x-31)/(4*(x+1)*(x+4)^2)",
    x: ["0", "12"],
    tolerance: "1e-6",
    ymin: ["5", "8"],
    ymax: ["1", "0"],
    ...schrodinger,
  },
  <Problem>{
    name: "Mathieu",
    q: "2*cos(2*x)",
    x: ["0", "pi"],
    tolerance: "1e-5",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Quartic Anharm. Osc.",
    symmetric: true,
    q: "x^4+x^2",
    x: ["-7", "7"],
    tolerance: "1e-6",
    ...dirichlet,
    ...schrodinger,
  },
  <Problem>{
    name: "Klotter",
    p: "1",
    q: "3 / (4 * x^2)",
    w: "64 * pi^2 / (9 * x ^6)",
    x: ["8/7", "8"],
    tolerance: "1e-6",
    ...dirichlet,
  },
];

export default Vue.extend({
  props: ["value", "problem"],
  data() {
    return { problems };
  },
  methods: {
    hideModal() {
      this.$emit("input", false);
    },
    selectProblem(problem: Problem) {
      // Non reactive copy
      problem = JSON.parse(JSON.stringify(problem));
      this.problem.symmetric = !!problem.symmetric;
      this.problem.p = problem.p;
      this.problem.q = problem.q;
      this.problem.w = problem.w;
      this.problem.x = problem.x.map((s) => "" + s);
      this.problem.ymin = problem.ymin;
      this.problem.ymax = problem.ymax;
      this.problem.tolerance = problem.tolerance;
      this.hideModal();
      this.$emit("problem-updated");
    },
  },
});
</script>