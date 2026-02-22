/**
 * Simple Rule-Based Parser (Non-AI)
 * This tries to find basic info using Regex patterns.
 */
export const ruleBasedCVParse = (text: string, currentJson: string) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Basic Patterns
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+62|0)[0-9-]{9,15}/);

  // Try to find Name (Usually the first non-empty line)
  const potentialName = lines[0] && lines[0].length < 50 ? lines[0] : "-";

  try {
    const json = JSON.parse(currentJson);

    // Update basic fields if they exist in the current JSON structure
    const processValue = (key: string, value: any): any => {
      if (typeof value === "string") {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("name")) return potentialName;
        if (lowerKey.includes("email") && emailMatch) return emailMatch[0];
        if (lowerKey.includes("phone") && phoneMatch) return phoneMatch[0];
        return value;
      }
      if (Array.isArray(value)) {
        return value.map((item) =>
          typeof item === "object" && item !== null ? processObject(item) : item
        );
      }
      if (typeof value === "object" && value !== null) {
        return processObject(value);
      }
      return value;
    };

    const processObject = (obj: any): any => {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = processValue(key, obj[key]);
      }
      return newObj;
    };

    return processObject(json);
  } catch (err) {
    console.error("Local parsing error:", err);
    return null;
  }
};
