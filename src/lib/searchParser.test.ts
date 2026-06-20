import { describe, it, expect } from "vitest";
import { parseCoordinates } from "./searchParser";

describe("parseCoordinates", () => {
  it("should parse valid coordinates with comma and space separator", () => {
    const result = parseCoordinates("45.0, 9.0");
    expect(result).toEqual({ lat: 45.0, lon: 9.0 });
  });

  it("should parse valid coordinates with comma only", () => {
    const result = parseCoordinates("45.0,9.0");
    expect(result).toEqual({ lat: 45.0, lon: 9.0 });
  });

  it("should parse valid coordinates with space only", () => {
    const result = parseCoordinates("45.0 9.0");
    expect(result).toEqual({ lat: 45.0, lon: 9.0 });
  });

  it("should parse coordinates with leading/trailing whitespaces", () => {
    const result = parseCoordinates("  -12.34 , 56.78  ");
    expect(result).toEqual({ lat: -12.34, lon: 56.78 });
  });

  it("should return null for out of bounds latitude", () => {
    expect(parseCoordinates("91.0, 9.0")).toBeNull();
    expect(parseCoordinates("-90.1, 9.0")).toBeNull();
  });

  it("should return null for out of bounds longitude", () => {
    expect(parseCoordinates("45.0, 181.0")).toBeNull();
    expect(parseCoordinates("45.0, -180.1")).toBeNull();
  });

  it("should return null for non-numeric input", () => {
    expect(parseCoordinates("abc, def")).toBeNull();
    expect(parseCoordinates("45.0, abc")).toBeNull();
  });

  it("should return null for incomplete input", () => {
    expect(parseCoordinates("45.0")).toBeNull();
    expect(parseCoordinates("")).toBeNull();
  });

  it("should return null for too many parts", () => {
    expect(parseCoordinates("45.0, 9.0, 12.0")).toBeNull();
  });
});
