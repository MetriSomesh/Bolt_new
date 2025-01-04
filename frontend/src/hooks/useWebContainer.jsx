import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

// Call only once
export function useWebContainer() {
  const [webcontainer, setWebContainer] = useState();
  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebContainer(webcontainerInstance);
  }
  useEffect(() => {
    main();
  }, []);
  return webcontainer;
}
