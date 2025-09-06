/**
 * Tests for LandmarkTooltip component
 */

import { render, screen } from "@testing-library/react";
import { LandmarkTooltip } from "./LandmarkTooltip";
import type { HexCell } from "../types";

describe("LandmarkTooltip", () => {
  const mockPosition = { x: 100, y: 50 };

  const mockHexCellWithLandmark: HexCell = {
    coordinate: { q: 0, r: 0 },
    landmark: "village",
    name: "Riverside Village",
    description: "A small farming community by the river",
    isExplored: true,
    isVisible: true,
  };

  it("renders landmark tooltip with name and description", () => {
    render(
      <LandmarkTooltip
        hexCell={mockHexCellWithLandmark}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.getByText("Riverside Village")).toBeInTheDocument();
    expect(
      screen.getByText("A small farming community by the river")
    ).toBeInTheDocument();
  });

  it("renders landmark tooltip with only name", () => {
    const hexCellWithNameOnly: HexCell = {
      ...mockHexCellWithLandmark,
      description: undefined,
    };

    render(
      <LandmarkTooltip
        hexCell={hexCellWithNameOnly}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.getByText("Riverside Village")).toBeInTheDocument();
    expect(
      screen.queryByText("A small farming community by the river")
    ).not.toBeInTheDocument();
  });

  it("renders landmark tooltip with only description", () => {
    const hexCellWithDescriptionOnly: HexCell = {
      ...mockHexCellWithLandmark,
      name: undefined,
    };

    render(
      <LandmarkTooltip
        hexCell={hexCellWithDescriptionOnly}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.queryByText("Riverside Village")).not.toBeInTheDocument();
    expect(
      screen.getByText("A small farming community by the river")
    ).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    render(
      <LandmarkTooltip
        hexCell={mockHexCellWithLandmark}
        position={mockPosition}
        isVisible={false}
      />
    );

    expect(screen.queryByText("Riverside Village")).not.toBeInTheDocument();
    expect(
      screen.queryByText("A small farming community by the river")
    ).not.toBeInTheDocument();
  });

  it("does not render when hex has no landmark", () => {
    const hexCellWithoutLandmark: HexCell = {
      ...mockHexCellWithLandmark,
      landmark: undefined,
    };

    render(
      <LandmarkTooltip
        hexCell={hexCellWithoutLandmark}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.queryByText("Riverside Village")).not.toBeInTheDocument();
    expect(
      screen.queryByText("A small farming community by the river")
    ).not.toBeInTheDocument();
  });

  it("does not render when hex has no name or description", () => {
    const hexCellWithoutContent: HexCell = {
      ...mockHexCellWithLandmark,
      name: undefined,
      description: undefined,
    };

    render(
      <LandmarkTooltip
        hexCell={hexCellWithoutContent}
        position={mockPosition}
        isVisible={true}
      />
    );

    expect(screen.queryByText("Riverside Village")).not.toBeInTheDocument();
    expect(
      screen.queryByText("A small farming community by the river")
    ).not.toBeInTheDocument();
  });

  it("applies correct positioning styles", () => {
    const { container } = render(
      <LandmarkTooltip
        hexCell={mockHexCellWithLandmark}
        position={mockPosition}
        isVisible={true}
      />
    );

    const tooltip = container.querySelector(".landmark-tooltip");
    expect(tooltip).toHaveStyle({
      left: "100px",
      top: "50px",
    });
  });
});
