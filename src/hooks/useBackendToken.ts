import { useState, useEffect } from "react";
import { tokenService, DecodedToken } from "../services/tokenService.ts";

export function useBackendToken() {
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);

  useEffect(() => {
    setDecoded(tokenService.decodeToken());
  }, []);

  return decoded;
}