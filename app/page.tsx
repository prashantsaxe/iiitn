import { useEffect, useState } from "react";

export default function Land() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient ? "Hi, this is root page" : "Sign InSend Magic Link"}
    </div>
  );
}
