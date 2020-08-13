<template lang="pug">
  div
    .modal-backdrop.show(v-show="value")
    .modal(
        :style="`display:${value?'block':'none'}`")
      .modal-dialog
        .modal-content
          .modal-header
            h4.modal-title Select an example problem
          .modal-body
            a.btn.btn-link(
              v-for="problem of problems",
              @click.prevent="selectProblem(problem)",
              href="#",) {{problem.name}}
          .modal-footer
            button.btn.btn-link(@click.prevent="hideModal()") Cancel
</template>

<script lang="ts">
import Vue from "vue";
import Problem from "./Problem";

type ProblemStatement = {
  name: string;
  xSymmetric: boolean;
  potential: string;
  x: [string, string];
  y: [string, string];
  tolerance: string;
};

const problems: ProblemStatement[] = [
  {
    name: "Ixaru",
    xSymmetric: true,
    potential: "(1+x^2)*(1+y^2)",
    x: ["-5.5", "5.5"],
    y: ["-5.5", "5.5"],
    tolerance: "1e-6"
  },
  {
    name: "Hénon-Heiles",
    xSymmetric: true,
    potential: "(x^2 + y^2) + 1/sqrt(20)*y*(x^2 - y^2/3)",
    x: ["-6", "6"],
    y: ["-6", "6"],
    tolerance: "1e-6"
  },
  {
    name: "Coupled 6° anharmonic oscillators",
    xSymmetric: true,
    potential: "(x^2 + y^2) + 1/sqrt(20)*y*(x^2 - y^2/3)",
    x: ["-6", "6"],
    y: ["-6", "6"],
    tolerance: "1e-6"
  }
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
    selectProblem(ps: ProblemStatement) {
      // Non reactive copy
      ps = JSON.parse(JSON.stringify(ps));
      const problem = this.problem as Problem;
      problem.potential = ps.potential;
      problem.xSymmetric = ps.xSymmetric;
      problem.x = ps.x;
      problem.y = ps.y;
      problem.tolerance = ps.tolerance;
      this.hideModal();
      this.$emit("problem-updated");
    }
  }
});
</script>