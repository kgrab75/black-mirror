import { render, screen, fireEvent } from "@testing-library/react";

import App from "./App";

/* This is a test that is testing the App component. 
 * It is testing that the heading is correct. */
describe("App", () => {
    it("should have exact heading", () => {
        /* Rendering the App component. */
        render(<App />);

        /* Getting the element with the test id of "app-header-heading". */
        const mainHeading = screen.getByTestId("app-header-heading");

        /* Checking that the innerHTML of the element with the test id of "app-header-heading" is equal to
        "Add a list". */
        expect(mainHeading.innerHTML).toBe("Add a list");
    });
});