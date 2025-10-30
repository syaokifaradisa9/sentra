import React from "react";

function PDFViewer({ base64Data }) {
    const blob = new Blob(
        [Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))],
        {
            type: "application/pdf",
        }
    );
    const url = URL.createObjectURL(blob);
    return (
        <div className="relative w-full h-full">
            <embed
                src={url}
                type="application/pdf"
                className="w-full rounded-lg shadow-lg h-[calc(100vh)]"
            />
        </div>
    );
}

export default React.memo(PDFViewer);
