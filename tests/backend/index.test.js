describe("Server startup (index.js)", () => {
  test("index.js can be required without crashing", () => {
    expect(() => {
      require("../../index");
    }).not.toThrow();
  });
});
