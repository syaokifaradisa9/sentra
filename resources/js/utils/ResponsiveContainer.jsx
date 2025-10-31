import { useEffect, useState } from "react";

export default function ResponsiveContainer({ mobile, desktop }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkViewport = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkViewport();

        window.addEventListener("resize", checkViewport);

        return () => window.removeEventListener("resize", checkViewport);
    }, []);

    return isMobile ? mobile : desktop;
}
