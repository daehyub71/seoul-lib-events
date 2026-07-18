import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest globals를 끄고 쓰므로 RTL 자동 cleanup이 등록되지 않는다 → 명시 등록
afterEach(cleanup);
