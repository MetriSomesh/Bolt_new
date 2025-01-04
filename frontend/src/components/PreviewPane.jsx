import React, { useEffect, useState } from "react";

export function PreviewPane({ files, webContainer }) {
  // Add default styling and viewport meta tag
  const [url, setUrl] = useState("");
  async function main() {
    const installProcess = await webContainer.spawn("npm", ["install"]);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      })
    );

    await webContainer.spawn("npm", ["run", "dev"]);
    webContainer.on("server-ready", (port, url) => {
      console.log("PORT: ", port);
      console.log("URL: ", url);
      setUrl(url);
    });
  }
  useEffect(() => {
    main();
  }, []);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
// import React, { useEffect, useState } from "react";

// export function PreviewPane({ files, webContainer }) {
//   const [isPreviewReady, setIsPreviewReady] = useState(false);

//   async function main() {
//     try {
//       // Install dependencies
//       const installProcess = await webContainer.spawn("npm", ["install"]);

//       await new Promise((resolve, reject) => {
//         const writer = new WritableStream({
//           write(data) {
//             console.log(data);
//           },
//           close() {
//             resolve();
//           },
//           abort(err) {
//             reject(err);
//           },
//         });

//         installProcess.output.pipeTo(writer);
//       });

//       // Start development server
//       await webContainer.spawn("npm", ["run", "dev"]);

//       webContainer.on("server-ready", (port, url) => {
//         console.log("PORT: ", port);
//         console.log("URL: ", url);
//         setIsPreviewReady(true);
//       });
//     } catch (error) {
//       console.error("Error setting up preview:", error);
//     }
//   }

//   useEffect(() => {
//     main();
//   }, []);

//   if (!isPreviewReady) {
//     return (
//       <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-400">
//         <div className="text-center">
//           <p>Loading preview...</p>
//           <p className="text-sm mt-2">Setting up development environment</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full w-full">
//       <iframe
//         src="http://localhost:5173"
//         className="w-full h-full border-none"
//         title="Preview"
//       />
//     </div>
//   );
// }
