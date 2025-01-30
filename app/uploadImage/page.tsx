"use client";

import { UploadButton, UploadDropzone } from "@/utils/uploadthisng";



export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="profilePicture"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      <UploadDropzone
        
        endpoint="profilePicture"
        onUploadAborted={() => {
          alert("Upload Aborted");
        }}
        onClientUploadComplete={(res) => {
          console.log(`onClientUploadComplete`, res);
          alert("Upload Completed");
        }}
        onUploadBegin={() => {
          console.log("upload begin");
        }}
      />
    </main>
  );
}
