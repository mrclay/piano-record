import React from "react";
import { render } from "@testing-library/react";
import Keyboard from "./ui/Keyboard";

test("renders learn react link", () => {
  const { getByText } = render(<Keyboard activeKeys={{}} />);
  const linkElement = getByText(/Wanna capture/i);
  expect(linkElement).toBeInTheDocument();
});
