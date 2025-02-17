import { afterEach } from "vitest";
import { cleanup } from "@testing-library/vue";
import { config } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import "vuetify/styles";

const vuetify = createVuetify();

config.global.plugins = [vuetify];

config.global.mocks = {
  $style: {},
};

afterEach(() => {
  cleanup();
});
